"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  ACTIVITY_LABELS,
  GOAL_LABELS,
  ageFromBirthDate,
  bmrMifflinStJeor,
  movingAverage,
  tdee as calcTdee,
  type ActivityLevel,
  type Sex,
} from "@/lib/health";
import { macrosForQuantity, emptyMacros, addMacros } from "@/lib/nutrition";

export type PromptState = { prompt?: string; error?: string };

const d = new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "short" });
const r1 = (n: number) => Math.round(n * 10) / 10;

export async function generateAiPrompt(): Promise<PromptState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const now = new Date();
  const since14 = new Date(now.getTime() - 14 * 86_400_000).toISOString();
  const since60 = new Date(now.getTime() - 60 * 86_400_000).toISOString();

  const [{ data: profile }, { data: targets }, { data: measurements }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("display_name, sex, birth_date, height_cm, goal, activity_level")
        .eq("id", user.id)
        .single(),
      supabase
        .from("nutrition_targets")
        .select("kcal, protein_g, carbs_g, fat_g")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("body_measurements")
        .select("measured_at, weight_kg, body_fat_pct, muscle_mass_kg")
        .gte("measured_at", since60)
        .order("measured_at", { ascending: true }),
    ]);

  if (!profile) return { error: "Profilo non trovato." };

  const lines: string[] = [];
  lines.push(
    "Sei il mio coach di salute, nutrizione e allenamento. Di seguito i miei dati aggiornati. Analizzali e proponi (o aggiorna) un piano di allenamento e nutrizione coerente con il mio obiettivo."
  );
  lines.push("");

  // --- Profilo ---
  const heightCm = profile.height_cm ? Number(profile.height_cm) : null;
  const ms = measurements ?? [];
  const latest = ms.at(-1);
  const weightNow = latest ? Number(latest.weight_kg) : null;
  const age = profile.birth_date ? ageFromBirthDate(profile.birth_date) : null;

  lines.push("## Profilo");
  lines.push(
    `- Sesso: ${profile.sex === "m" ? "uomo" : profile.sex === "f" ? "donna" : "n/d"}` +
      (age != null ? `, età: ${age}` : "") +
      (heightCm ? `, altezza: ${heightCm} cm` : "")
  );
  if (profile.goal)
    lines.push(`- Obiettivo: ${GOAL_LABELS[profile.goal] ?? profile.goal}`);
  if (profile.activity_level)
    lines.push(
      `- Livello di attività: ${ACTIVITY_LABELS[profile.activity_level as ActivityLevel] ?? profile.activity_level}`
    );
  if (weightNow && heightCm && profile.sex && age != null && profile.activity_level) {
    const bmr = bmrMifflinStJeor(profile.sex as Sex, weightNow, heightCm, age);
    const t = calcTdee(bmr, profile.activity_level as ActivityLevel);
    lines.push(`- BMR stimato: ${Math.round(bmr)} kcal · TDEE stimato: ${Math.round(t)} kcal`);
  }
  lines.push("");

  // --- Peso & composizione ---
  lines.push("## Peso e composizione");
  if (ms.length === 0) {
    lines.push("- Nessuna misurazione registrata.");
  } else {
    const recent = ms.slice(-8);
    for (const m of recent) {
      const bits = [`${r1(Number(m.weight_kg))} kg`];
      if (m.body_fat_pct != null) bits.push(`${r1(Number(m.body_fat_pct))}% grasso`);
      if (m.muscle_mass_kg != null)
        bits.push(`${r1(Number(m.muscle_mass_kg))} kg massa`);
      lines.push(`- ${d.format(new Date(m.measured_at))}: ${bits.join(", ")}`);
    }
    const ma = movingAverage(
      ms.map((m) => ({ t: new Date(m.measured_at).getTime(), v: Number(m.weight_kg) })),
      7
    );
    const maNow = ma.at(-1);
    if (maNow != null) lines.push(`- Media mobile 7 giorni: ${r1(maNow)} kg`);
    const cutoff = now.getTime() - 14 * 86_400_000;
    const before = ms.find((m) => new Date(m.measured_at).getTime() >= cutoff);
    if (before && latest) {
      const delta = Number(latest.weight_kg) - Number(before.weight_kg);
      lines.push(
        `- Variazione ultimi ~14 giorni: ${delta > 0 ? "+" : ""}${r1(delta)} kg`
      );
    }
  }
  lines.push("");

  // --- Nutrizione (ultimi 14 giorni) ---
  lines.push("## Nutrizione (ultimi 14 giorni)");
  const { data: logs } = await supabase
    .from("food_logs")
    .select("quantity_g, logged_at, food_id")
    .gte("logged_at", since14);
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
  if (nDays === 0) {
    lines.push("- Nessun pasto registrato nelle ultime 2 settimane.");
  } else {
    lines.push(
      `- Media giornaliera (su ${nDays} giorni con dati): ${Math.round(
        total.kcal / nDays
      )} kcal, ${Math.round(total.protein / nDays)} g proteine, ${Math.round(
        total.carbs / nDays
      )} g carbo, ${Math.round(total.fat / nDays)} g grassi`
    );
  }
  if (targets?.kcal)
    lines.push(
      `- Target attuali: ${Math.round(targets.kcal)} kcal, ${
        targets.protein_g ? Math.round(targets.protein_g) : "—"
      } g proteine, ${targets.carbs_g ? Math.round(targets.carbs_g) : "—"} g carbo, ${
        targets.fat_g ? Math.round(targets.fat_g) : "—"
      } g grassi`
    );
  lines.push("");

  // --- Allenamento (ultime sessioni) ---
  lines.push("## Allenamento (ultime sessioni)");
  const { data: sessions } = await supabase
    .from("workout_sessions")
    .select("id, name, performed_at")
    .order("performed_at", { ascending: false })
    .limit(5);

  const sessIds = (sessions ?? []).map((s) => s.id);
  const { data: sets } = sessIds.length
    ? await supabase
        .from("workout_sets")
        .select("session_id, exercise_id, reps, weight_kg")
        .in("session_id", sessIds)
    : { data: [] };
  const setExIds = [...new Set((sets ?? []).map((s) => s.exercise_id))];
  const { data: exRows } = setExIds.length
    ? await supabase.from("exercises").select("id, name").in("id", setExIds)
    : { data: [] };
  const exName = new Map((exRows ?? []).map((e) => [e.id, e.name]));

  if ((sessions ?? []).length === 0) {
    lines.push("- Nessuna sessione registrata.");
  } else {
    for (const s of sessions ?? []) {
      const sSets = (sets ?? []).filter((x) => x.session_id === s.id);
      // raggruppa per esercizio
      const byEx = new Map<string, { reps: number | null; weight: number | null }[]>();
      for (const x of sSets) {
        if (!byEx.has(x.exercise_id)) byEx.set(x.exercise_id, []);
        byEx.get(x.exercise_id)!.push({ reps: x.reps, weight: x.weight_kg });
      }
      const exParts = [...byEx.entries()].map(([exId, arr]) => {
        const name = exName.get(exId) ?? "Esercizio";
        const detail = arr
          .map((a) => `${a.reps ?? "?"}×${a.weight != null ? `${a.weight}kg` : "cl"}`)
          .join(", ");
        return `${name} (${detail})`;
      });
      lines.push(
        `- ${d.format(new Date(s.performed_at))}${s.name ? ` — ${s.name}` : ""}: ${
          exParts.length ? exParts.join("; ") : "nessun set"
        }`
      );
    }
  }
  lines.push("");

  // --- Richiesta ---
  lines.push("## Cosa ti chiedo");
  lines.push(
    "1. Valuta se kcal e macro sono coerenti con il mio obiettivo e suggerisci aggiustamenti numerici."
  );
  lines.push(
    "2. Proponi un programma di allenamento per la prossima settimana (esercizi, serie, ripetizioni, progressioni)."
  );
  lines.push("3. Segnala eventuali rischi o squilibri nei dati.");

  return { prompt: lines.join("\n") };
}
