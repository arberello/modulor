"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  ACTIVITY_LABELS,
  GOAL_LABELS,
  ageFromBirthDate,
  bmi,
  bmiCategory,
  bmrMifflinStJeor,
  movingAverage,
  tdee as calcTdee,
  type ActivityLevel,
  type Sex,
} from "@/lib/health";
import {
  macrosForQuantity,
  emptyMacros,
  addMacros,
  autoTargets,
} from "@/lib/nutrition";
import {
  values,
  EXPERIENCE,
  TRAINING_GOAL,
  FOCUS_MUSCLES,
  INTENSITY,
  EQUIPMENT,
  TRAINING_STYLE,
  DIET,
  ALLERGIES,
  COOKING_TIME,
  BUDGET,
  EXPERIENCE_LABELS,
  TRAINING_GOAL_LABELS,
  FOCUS_MUSCLES_LABELS,
  INTENSITY_LABELS,
  EQUIPMENT_LABELS,
  TRAINING_STYLE_LABELS,
  DIET_LABELS,
  ALLERGIES_LABELS,
  COOKING_TIME_LABELS,
  BUDGET_LABELS,
} from "@/lib/ai-plan";
import { TRAINING_PLAN_SCHEMA_DOC } from "@/lib/training-plan";

export type PromptState = { prompt?: string; error?: string };

const d = new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "short" });
const r1 = (n: number) => Math.round(n * 10) / 10;

/** Profilo + composizione corporea + stima energetica, condiviso dai due piani. */
type Snapshot = {
  lines: string[];
  weightNow: number | null;
  bmrVal: number | null;
  tdeeVal: number | null;
  goal: string | null;
};

async function loadSnapshot(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<Snapshot | null> {
  const since60 = new Date(Date.now() - 60 * 86_400_000).toISOString();
  const [{ data: profile }, { data: measurements }] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, sex, birth_date, height_cm, goal, activity_level")
      .eq("id", userId)
      .single(),
    supabase
      .from("body_measurements")
      .select("measured_at, weight_kg, body_fat_pct, muscle_mass_kg")
      .gte("measured_at", since60)
      .order("measured_at", { ascending: true }),
  ]);

  if (!profile) return null;

  const ms = measurements ?? [];
  const latest = ms.at(-1);
  const heightCm = profile.height_cm ? Number(profile.height_cm) : null;
  const weightNow = latest ? Number(latest.weight_kg) : null;
  const age = profile.birth_date ? ageFromBirthDate(profile.birth_date) : null;

  const lines: string[] = [];
  lines.push("## Profilo");
  lines.push(
    `- Sesso: ${profile.sex === "m" ? "uomo" : profile.sex === "f" ? "donna" : "n/d"}` +
      (age != null ? `, età: ${age} anni` : "") +
      (heightCm ? `, altezza: ${heightCm} cm` : "")
  );
  if (profile.goal)
    lines.push(
      `- Obiettivo corporeo: ${GOAL_LABELS[profile.goal] ?? profile.goal}`
    );
  if (profile.activity_level)
    lines.push(
      `- Livello di attività quotidiana: ${
        ACTIVITY_LABELS[profile.activity_level as ActivityLevel] ??
        profile.activity_level
      }`
    );

  let bmrVal: number | null = null;
  let tdeeVal: number | null = null;

  if (weightNow != null) {
    const bits = [`${r1(weightNow)} kg`];
    if (latest?.body_fat_pct != null)
      bits.push(`${r1(Number(latest.body_fat_pct))}% grasso`);
    if (latest?.muscle_mass_kg != null)
      bits.push(`${r1(Number(latest.muscle_mass_kg))} kg massa muscolare`);
    lines.push(`- Composizione attuale: ${bits.join(", ")}`);
    if (heightCm) {
      const b = bmi(weightNow, heightCm);
      lines.push(`- BMI: ${r1(b)} (${bmiCategory(b)})`);
    }
    // Trend peso ultimi ~14 giorni
    const ma = movingAverage(
      ms.map((m) => ({
        t: new Date(m.measured_at).getTime(),
        v: Number(m.weight_kg),
      })),
      7
    );
    const maNow = ma.at(-1);
    const cutoff = Date.now() - 14 * 86_400_000;
    const before = ms.find((m) => new Date(m.measured_at).getTime() >= cutoff);
    if (before && latest) {
      const delta = Number(latest.weight_kg) - Number(before.weight_kg);
      lines.push(
        `- Trend ~14 giorni: ${delta > 0 ? "+" : ""}${r1(delta)} kg` +
          (maNow != null ? ` (media mobile 7gg: ${r1(maNow)} kg)` : "")
      );
    }
  } else {
    lines.push("- Composizione: nessuna misurazione recente.");
  }

  if (
    weightNow != null &&
    heightCm &&
    profile.sex &&
    age != null &&
    profile.activity_level
  ) {
    bmrVal = bmrMifflinStJeor(profile.sex as Sex, weightNow, heightCm, age);
    tdeeVal = calcTdee(bmrVal, profile.activity_level as ActivityLevel);
    lines.push(
      `- BMR stimato: ${Math.round(bmrVal)} kcal · TDEE stimato: ${Math.round(
        tdeeVal
      )} kcal (Mifflin-St Jeor)`
    );
  }

  return { lines, weightNow, bmrVal, tdeeVal, goal: profile.goal };
}

// ──────────────────────────────────────────────────────────
// Piano di allenamento
// ──────────────────────────────────────────────────────────

export async function generateTrainingPrompt(
  _prev: PromptState,
  formData: FormData
): Promise<PromptState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // --- Lettura e validazione intake ---
  const experience = String(formData.get("experience") ?? "");
  const trainingGoal = String(formData.get("training_goal") ?? "");
  const intensity = String(formData.get("intensity") ?? "");
  const trainingStyle = String(formData.get("training_style") ?? "auto");
  const daysPerWeek = Number(formData.get("days_per_week"));
  const sessionMinutes = Number(formData.get("session_minutes"));
  const focusMuscles = formData
    .getAll("focus_muscles")
    .map(String)
    .filter((v) => values(FOCUS_MUSCLES).includes(v));
  const equipment = formData
    .getAll("equipment")
    .map(String)
    .filter((v) => values(EQUIPMENT).includes(v));
  const limitations = String(formData.get("limitations") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!values(EXPERIENCE).includes(experience))
    return { error: "Seleziona il tuo livello di esperienza." };
  if (!values(TRAINING_GOAL).includes(trainingGoal))
    return { error: "Seleziona l'obiettivo dell'allenamento." };
  if (!Number.isInteger(daysPerWeek) || daysPerWeek < 1 || daysPerWeek > 7)
    return { error: "Indica quanti giorni a settimana ti alleni." };
  if (!Number.isInteger(sessionMinutes) || sessionMinutes < 15)
    return { error: "Indica la durata di una sessione." };
  if (!values(INTENSITY).includes(intensity))
    return { error: "Seleziona l'intensità desiderata." };
  if (equipment.length === 0)
    return { error: "Seleziona almeno un'attrezzatura disponibile." };

  const style = values(TRAINING_STYLE).includes(trainingStyle)
    ? trainingStyle
    : "auto";

  // --- Persisti le preferenze (l'onboarding rimane prefillato) ---
  const { error: saveErr } = await supabase.from("training_preferences").upsert(
    {
      user_id: user.id,
      experience,
      training_goal: trainingGoal,
      focus_muscles: focusMuscles,
      days_per_week: daysPerWeek,
      session_minutes: sessionMinutes,
      intensity,
      equipment,
      training_style: style,
      limitations: limitations || null,
      notes: notes || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );
  if (saveErr) return { error: "Non è stato possibile salvare le preferenze." };

  // --- Snapshot atleta ---
  const snap = await loadSnapshot(supabase, user.id);
  if (!snap) return { error: "Profilo non trovato." };

  // --- Storico sessioni recenti ---
  const { data: sessions } = await supabase
    .from("workout_sessions")
    .select("id, name, performed_at, notes")
    .order("performed_at", { ascending: false })
    .limit(6);
  const sessIds = (sessions ?? []).map((s) => s.id);
  const { data: sets } = sessIds.length
    ? await supabase
        .from("workout_sets")
        .select("session_id, exercise_id, reps, weight_kg, rpe")
        .in("session_id", sessIds)
    : { data: [] };
  const setExIds = [...new Set((sets ?? []).map((s) => s.exercise_id))];
  const { data: exRows } = setExIds.length
    ? await supabase
        .from("exercises")
        .select("id, name, muscle_group")
        .in("id", setExIds)
    : { data: [] };
  const exName = new Map((exRows ?? []).map((e) => [e.id, e.name]));

  // --- Costruzione prompt ---
  const L: string[] = [];
  L.push(
    "# RUOLO",
    "Sei un preparatore atletico e strength coach. Progetta un PIANO DI ALLENAMENTO settimanale periodizzato, calibrato sui dati reali qui sotto. Usa lo storico per tarare carichi e progressioni, rispetta ASSOLUTAMENTE i vincoli (giorni, durata, attrezzatura, limitazioni) e non inventare dati che non possiedi.",
    ""
  );

  L.push("# DATI ATLETA", ...snap.lines, "");

  L.push("## Preferenze e vincoli (intake)");
  L.push(`- Esperienza: ${EXPERIENCE_LABELS[experience]}`);
  L.push(`- Obiettivo allenamento: ${TRAINING_GOAL_LABELS[trainingGoal]}`);
  L.push(
    `- Zone muscolari in focus: ${
      focusMuscles.length
        ? focusMuscles.map((m) => FOCUS_MUSCLES_LABELS[m]).join(", ")
        : "equilibrato su tutto il corpo"
    }`
  );
  L.push(`- Frequenza: ${daysPerWeek} giorni/settimana`);
  L.push(`- Durata per sessione: ~${sessionMinutes} minuti`);
  L.push(`- Intensità desiderata: ${INTENSITY_LABELS[intensity]}`);
  L.push(
    `- Attrezzatura disponibile: ${equipment
      .map((e) => EQUIPMENT_LABELS[e])
      .join(", ")}`
  );
  L.push(`- Struttura preferita: ${TRAINING_STYLE_LABELS[style]}`);
  if (limitations) L.push(`- Limitazioni / infortuni: ${limitations}`);
  if (notes) L.push(`- Note: ${notes}`);
  L.push("");

  L.push("## Storico allenamenti (ultime sessioni)");
  if ((sessions ?? []).length === 0) {
    L.push(
      "- Nessuna sessione registrata. Imposta carichi prudenti e progressivi adatti al livello dichiarato."
    );
  } else {
    for (const s of sessions ?? []) {
      const sSets = (sets ?? []).filter((x) => x.session_id === s.id);
      const byEx = new Map<
        string,
        { reps: number | null; weight: number | null; rpe: number | null }[]
      >();
      for (const x of sSets) {
        if (!byEx.has(x.exercise_id)) byEx.set(x.exercise_id, []);
        byEx
          .get(x.exercise_id)!
          .push({ reps: x.reps, weight: x.weight_kg, rpe: x.rpe });
      }
      const exParts = [...byEx.entries()].map(([exId, arr]) => {
        const name = exName.get(exId) ?? "Esercizio";
        const detail = arr
          .map(
            (a) =>
              `${a.reps ?? "?"}×${
                a.weight != null ? `${a.weight}kg` : "cl"
              }${a.rpe != null ? `@RPE${a.rpe}` : ""}`
          )
          .join(", ");
        return `${name} (${detail})`;
      });
      L.push(
        `- ${d.format(new Date(s.performed_at))}${
          s.name ? ` — ${s.name}` : ""
        }: ${exParts.length ? exParts.join("; ") : "nessun set registrato"}`
      );
    }
  }
  L.push("");

  L.push(
    "# OUTPUT RICHIESTO",
    "Progetta un mesociclo coerente con i dati e i vincoli sopra (rispetta giorni/settimana, durata, attrezzatura e limitazioni; usa lo storico per tarare i carichi).",
    "L'output verrà IMPORTATO automaticamente da un'app: deve essere SOLO il JSON, senza testo prima o dopo.",
    "",
    TRAINING_PLAN_SCHEMA_DOC
  );

  return { prompt: L.join("\n") };
}

// ──────────────────────────────────────────────────────────
// Piano alimentare
// ──────────────────────────────────────────────────────────

export async function generateNutritionPrompt(
  _prev: PromptState,
  formData: FormData
): Promise<PromptState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // --- Lettura e validazione intake ---
  const diet = String(formData.get("diet") ?? "");
  const cookingTime = String(formData.get("cooking_time") ?? "");
  const budget = String(formData.get("budget") ?? "");
  const mealsPerDay = Number(formData.get("meals_per_day"));
  const allergies = formData
    .getAll("allergies")
    .map(String)
    .filter((v) => values(ALLERGIES).includes(v));
  const dislikes = String(formData.get("dislikes") ?? "").trim();
  const preferences = String(formData.get("preferences") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!values(DIET).includes(diet))
    return { error: "Seleziona il regime alimentare." };
  if (!Number.isInteger(mealsPerDay) || mealsPerDay < 1 || mealsPerDay > 8)
    return { error: "Indica quanti pasti al giorno preferisci." };
  if (!values(COOKING_TIME).includes(cookingTime))
    return { error: "Seleziona quanto tempo vuoi dedicare alla cucina." };

  const budgetVal = values(BUDGET).includes(budget) ? budget : null;

  // --- Persisti le preferenze ---
  const { error: saveErr } = await supabase
    .from("nutrition_preferences")
    .upsert(
      {
        user_id: user.id,
        diet,
        meals_per_day: mealsPerDay,
        allergies,
        dislikes: dislikes || null,
        preferences: preferences || null,
        cooking_time: cookingTime,
        budget: budgetVal,
        notes: notes || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
  if (saveErr) return { error: "Non è stato possibile salvare le preferenze." };

  // --- Snapshot atleta + fabbisogno ---
  const snap = await loadSnapshot(supabase, user.id);
  if (!snap) return { error: "Profilo non trovato." };

  // --- Target attuali + consumo reale ultimi 14 giorni ---
  const since14 = new Date(Date.now() - 14 * 86_400_000).toISOString();
  const [{ data: targets }, { data: logs }] = await Promise.all([
    supabase
      .from("nutrition_targets")
      .select("kcal, protein_g, carbs_g, fat_g")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("food_logs")
      .select("quantity_g, logged_at, food_id")
      .gte("logged_at", since14),
  ]);

  const foodIds = [...new Set((logs ?? []).map((l) => l.food_id))];
  const { data: foods } = foodIds.length
    ? await supabase
        .from("foods")
        .select("id, kcal_per_100, protein_per_100, carbs_per_100, fat_per_100")
        .in("id", foodIds)
    : { data: [] };
  const foodMap = new Map((foods ?? []).map((f) => [f.id, f]));

  let total = emptyMacros();
  const days = new Set<string>();
  for (const l of logs ?? []) {
    const f = foodMap.get(l.food_id);
    if (!f) continue;
    total = addMacros(total, macrosForQuantity(f, Number(l.quantity_g)));
    days.add(l.logged_at.slice(0, 10));
  }
  const nDays = days.size;

  // --- Costruzione prompt ---
  const L: string[] = [];
  L.push(
    "# RUOLO",
    "Sei un nutrizionista sportivo. Costruisci un PIANO ALIMENTARE settimanale personalizzato sui dati reali qui sotto. Rispetta in modo ASSOLUTO il regime alimentare e le allergie dichiarate, centra le calorie e i macronutrienti target (tolleranza ±5%) e proponi cibi reali e reperibili. Non inventare valori nutrizionali implausibili.",
    ""
  );

  L.push("# DATI SOGGETTO", ...snap.lines, "");

  // Target: usa quelli salvati, altrimenti suggerisci da TDEE+obiettivo
  L.push("## Fabbisogno e target");
  if (targets?.kcal) {
    L.push(
      `- Target attuali impostati: ${Math.round(targets.kcal)} kcal · ${
        targets.protein_g ? Math.round(targets.protein_g) : "—"
      } g proteine · ${
        targets.carbs_g ? Math.round(targets.carbs_g) : "—"
      } g carboidrati · ${targets.fat_g ? Math.round(targets.fat_g) : "—"} g grassi`
    );
  } else if (snap.tdeeVal && snap.weightNow && snap.goal) {
    const sugg = autoTargets(
      snap.tdeeVal,
      snap.goal as "cut" | "bulk" | "maintain",
      snap.weightNow
    );
    L.push(
      `- Nessun target impostato. Suggerimento da TDEE + obiettivo: ${sugg.kcal} kcal · ${sugg.protein} g proteine · ${sugg.carbs} g carboidrati · ${sugg.fat} g grassi. Valida o correggi tu questi numeri.`
    );
  } else {
    L.push(
      "- Target non disponibili: calcola tu kcal e macro a partire dal profilo e dall'obiettivo, mostrando il ragionamento."
    );
  }
  if (nDays === 0) {
    L.push("- Consumo reale: nessun pasto registrato nelle ultime 2 settimane.");
  } else {
    L.push(
      `- Consumo reale medio (su ${nDays} giorni con dati): ${Math.round(
        total.kcal / nDays
      )} kcal · ${Math.round(total.protein / nDays)} g proteine · ${Math.round(
        total.carbs / nDays
      )} g carboidrati · ${Math.round(total.fat / nDays)} g grassi`
    );
  }
  L.push("");

  L.push("## Preferenze alimentari (intake)");
  L.push(`- Regime alimentare: ${DIET_LABELS[diet]}`);
  L.push(`- Pasti al giorno: ${mealsPerDay}`);
  L.push(
    `- Allergie / intolleranze: ${
      allergies.length
        ? allergies.map((a) => ALLERGIES_LABELS[a]).join(", ")
        : "nessuna dichiarata"
    }`
  );
  if (dislikes) L.push(`- Alimenti da evitare: ${dislikes}`);
  if (preferences) L.push(`- Alimenti / cucine preferite: ${preferences}`);
  L.push(`- Tempo per cucinare: ${COOKING_TIME_LABELS[cookingTime]}`);
  if (budgetVal) L.push(`- Budget: ${BUDGET_LABELS[budgetVal]}`);
  if (notes) L.push(`- Note: ${notes}`);
  L.push("");

  L.push(
    "# OUTPUT RICHIESTO (rispetta ESATTAMENTE questa struttura)",
    "Rispondi in italiano, con tabelle Markdown e numeri sempre espliciti (grammi, kcal, P/C/G).",
    "",
    "## 1. Sintesi",
    "Calorie e macro target finali, ripartizione per pasto, razionale rispetto all'obiettivo.",
    "",
    "## 2. Giornata tipo",
    `Per OGNI pasto (${mealsPerDay} pasti) usa questo formato:`,
    "### <Pasto> — <kcal> kcal",
    "| Alimento | Quantità (g) | kcal | Proteine (g) | Carbo (g) | Grassi (g) |",
    "|---|---|---|---|---|---|",
    "Chiudi con una riga **Totale giornaliero** e confrontala con il target.",
    "",
    "## 3. Variazione settimanale",
    "Per ogni pasto fornisci 2-3 alternative equivalenti per macro (rotazione su 7 giorni), così la dieta non è monotona.",
    "",
    "## 4. Lista della spesa settimanale",
    "Raggruppata per categoria (proteine, carboidrati, verdura/frutta, grassi, dispensa), con quantità indicative.",
    "",
    "## 5. Note pratiche",
    "Timing dei pasti, idratazione, eventuale integrazione, sostituzioni rapide, adattamento ai giorni di allenamento.",
    "",
    "## 6. Dati mancanti",
    'Elenca i dati che ti servirebbero per affinare il piano. Se non manca nulla, scrivi "nessuno".'
  );

  return { prompt: L.join("\n") };
}
