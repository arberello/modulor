/**
 * Contratto JSON del piano di allenamento generato dall'AI.
 * Lo stesso schema è descritto nel prompt (`TRAINING_PLAN_SCHEMA_DOC`) e
 * validato qui da `parseTrainingPlanJson`. Pure data: nessuna dipendenza da
 * Supabase o React, così serve sia al prompt sia alla Server Action di import.
 */

export const EXERCISE_TYPES = ["strength", "calisthenics", "cardio"] as const;
export type ExerciseType = (typeof EXERCISE_TYPES)[number];

/** Gruppi muscolari coerenti con la libreria esistente (italiano). */
export const MUSCLE_GROUPS = [
  "petto",
  "schiena",
  "spalle",
  "braccia",
  "gambe",
  "glutei",
  "core",
  "cardio",
] as const;

export type ParsedExercise = {
  name: string;
  muscleGroup: string | null;
  type: ExerciseType | null;
  sets: number | null;
  reps: string | null;
  targetWeightKg: number | null;
  rpe: number | null;
  restS: number | null;
  notes: string | null;
};

export type ParsedWorkout = {
  dayLabel: string;
  focus: string | null;
  week: number | null;
  notes: string | null;
  exercises: ParsedExercise[];
};

export type ParsedPlan = {
  name: string;
  goal: string | null;
  weeks: number | null;
  daysPerWeek: number | null;
  description: string | null;
  progression: string | null;
  workouts: ParsedWorkout[];
  raw: unknown;
};

/** Errore di validazione con messaggio leggibile (voce dell'interfaccia, IT). */
export class PlanParseError extends Error {}

// ── coercizioni ──────────────────────────────────────────────

function toStr(v: unknown): string | null {
  if (typeof v === "string") {
    const t = v.trim();
    return t ? t : null;
  }
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  return null;
}

function toNum(v: unknown): number | null {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string") {
    const n = Number(v.trim().replace(",", "."));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function toInt(v: unknown): number | null {
  const n = toNum(v);
  return n == null ? null : Math.round(n);
}

function clampType(v: unknown): ExerciseType | null {
  const s = toStr(v)?.toLowerCase();
  return s && (EXERCISE_TYPES as readonly string[]).includes(s)
    ? (s as ExerciseType)
    : null;
}

function pick(obj: Record<string, unknown>, keys: string[]): unknown {
  for (const k of keys) if (obj[k] != null) return obj[k];
  return undefined;
}

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Estrae l'oggetto JSON da un testo che può avere fence ``` o prosa intorno. */
function extractJson(input: string): string {
  let s = input.trim();
  // Rimuovi eventuale fence ```json ... ``` o ``` ... ```
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) s = fence[1].trim();
  // Se resta prosa, isola dal primo { all'ultimo }
  if (s[0] !== "{") {
    const start = s.indexOf("{");
    const end = s.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) s = s.slice(start, end + 1);
  }
  return s;
}

// ── parser principale ────────────────────────────────────────

export function parseTrainingPlanJson(input: string): ParsedPlan {
  if (!input || !input.trim())
    throw new PlanParseError("Incolla il JSON del piano generato dall'AI.");

  let data: unknown;
  try {
    data = JSON.parse(extractJson(input));
  } catch {
    throw new PlanParseError(
      "JSON non valido. Copia l'intero blocco generato dall'AI, senza testo extra."
    );
  }

  if (!isObj(data)) throw new PlanParseError("Il JSON deve essere un oggetto.");

  const planObj = isObj(data.plan) ? data.plan : data;
  const name = toStr(pick(planObj, ["name", "nome", "title", "titolo"]));
  if (!name)
    throw new PlanParseError("Manca il nome del piano ('plan.name').");

  const workoutsRaw = pick(data, ["workouts", "allenamenti", "giorni", "days"]);
  if (!Array.isArray(workoutsRaw) || workoutsRaw.length === 0)
    throw new PlanParseError(
      "Il piano non contiene allenamenti ('workouts' vuoto)."
    );

  const workouts: ParsedWorkout[] = workoutsRaw.map((w, wi) => {
    if (!isObj(w))
      throw new PlanParseError(`workouts[${wi}] non è un oggetto.`);

    const dayLabel = toStr(
      pick(w, ["day_label", "dayLabel", "day", "giorno", "label", "name"])
    );
    if (!dayLabel)
      throw new PlanParseError(`workouts[${wi}]: manca 'day_label'.`);

    const exRaw = pick(w, ["exercises", "esercizi"]);
    if (!Array.isArray(exRaw) || exRaw.length === 0)
      throw new PlanParseError(
        `workouts[${wi}] ("${dayLabel}") non ha esercizi.`
      );

    const exercises: ParsedExercise[] = exRaw.map((e, ei) => {
      if (!isObj(e))
        throw new PlanParseError(`workouts[${wi}].exercises[${ei}] non valido.`);
      const exName = toStr(pick(e, ["name", "nome", "exercise", "esercizio"]));
      if (!exName)
        throw new PlanParseError(
          `workouts[${wi}].exercises[${ei}]: manca il nome dell'esercizio.`
        );
      return {
        name: exName,
        muscleGroup: toStr(pick(e, ["muscle_group", "muscleGroup", "gruppo"])),
        type: clampType(pick(e, ["type", "tipo"])),
        sets: toInt(pick(e, ["sets", "serie"])),
        reps: toStr(pick(e, ["reps", "ripetizioni", "rep"])),
        targetWeightKg: toNum(
          pick(e, ["target_weight_kg", "targetWeightKg", "weight_kg", "peso"])
        ),
        rpe: toNum(pick(e, ["rpe", "RPE"])),
        restS: toInt(pick(e, ["rest_s", "restS", "rest", "recupero"])),
        notes: toStr(pick(e, ["notes", "note"])),
      };
    });

    return {
      dayLabel,
      focus: toStr(pick(w, ["focus", "target"])),
      week: toInt(pick(w, ["week", "settimana"])),
      notes: toStr(pick(w, ["notes", "note"])),
      exercises,
    };
  });

  return {
    name,
    goal: toStr(pick(planObj, ["goal", "obiettivo"])),
    weeks: toInt(pick(planObj, ["weeks", "settimane", "duration_weeks"])),
    daysPerWeek: toInt(
      pick(planObj, ["days_per_week", "daysPerWeek", "giorni_settimana"])
    ),
    description: toStr(pick(planObj, ["description", "descrizione", "summary"])),
    progression: toStr(pick(planObj, ["progression", "progressione"])),
    workouts,
    raw: data,
  };
}

/** Numero totale di esercizi pianificati (per riepiloghi UI). */
export function countPlanExercises(plan: ParsedPlan): number {
  return plan.workouts.reduce((n, w) => n + w.exercises.length, 0);
}

/**
 * Documentazione dello schema da inserire nel prompt AI, così l'output di
 * Claude è esattamente ciò che `parseTrainingPlanJson` sa importare.
 */
export const TRAINING_PLAN_SCHEMA_DOC = `Rispondi con UN SOLO blocco JSON valido (nient'altro: niente testo prima o dopo, niente markdown). Struttura ESATTA:

{
  "plan": {
    "name": "string — nome del piano",
    "goal": "string — obiettivo (es. ipertrofia)",
    "weeks": 4,                 // durata del mesociclo in settimane (intero)
    "days_per_week": 4,         // intero
    "description": "string — sintesi/razionale del piano",
    "progression": "string — come progredire settimana per settimana"
  },
  "workouts": [                 // un elemento per ogni giorno di allenamento
    {
      "day_label": "Giorno A — Upper",
      "focus": "petto, schiena, spalle",
      "week": null,             // null = ricorrente ogni settimana; oppure 1..weeks
      "notes": "riscaldamento e indicazioni del giorno",
      "exercises": [
        {
          "name": "Panca piana con bilanciere",
          "muscle_group": "petto",        // uno tra: petto, schiena, spalle, braccia, gambe, glutei, core, cardio
          "type": "strength",             // uno tra: strength, calisthenics, cardio
          "sets": 4,                       // intero
          "reps": "6-8",                   // stringa: numero o range
          "target_weight_kg": 60,          // numero, opzionale (null se a corpo libero)
          "rpe": 8,                        // numero, opzionale
          "rest_s": 120,                   // secondi di recupero, intero opzionale
          "notes": "tempo 2-0-1"           // opzionale
        }
      ]
    }
  ]
}

Regole tassative:
- Includi OGNI esercizio che usi, anche quelli nuovi, sempre con "muscle_group" e "type" così l'app li crea in libreria.
- Usa i valori italiani indicati per "muscle_group" e i valori ammessi per "type".
- Numeri come numeri (non "60 kg"). "reps" è una stringa. Campi non applicabili = null, non ometterli quando indicato.
- Nessun commento nel JSON finale (gli // qui sopra sono solo esplicativi).`;
