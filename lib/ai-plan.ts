/**
 * Costanti, opzioni e label condivise per la generazione dei piani AI
 * (allenamento e nutrizione). Pure data: importabile sia dai form client
 * sia dalle Server Actions. Le label sono in italiano (voce dell'interfaccia).
 */

export type Option = { v: string; l: string };

/** Estrae l'elenco dei valori validi da una lista di opzioni. */
export function values<T extends readonly Option[]>(opts: T): string[] {
  return opts.map((o) => o.v);
}

/** Costruisce una mappa value→label da una lista di opzioni. */
export function labelMap(opts: readonly Option[]): Record<string, string> {
  return Object.fromEntries(opts.map((o) => [o.v, o.l]));
}

// ──────────────────────────────────────────────────────────
// Allenamento
// ──────────────────────────────────────────────────────────

export const EXPERIENCE: Option[] = [
  { v: "beginner", l: "Principiante" },
  { v: "intermediate", l: "Intermedio" },
  { v: "advanced", l: "Avanzato" },
];

export const TRAINING_GOAL: Option[] = [
  { v: "strength", l: "Forza" },
  { v: "hypertrophy", l: "Ipertrofia" },
  { v: "endurance", l: "Resistenza" },
  { v: "fat_loss", l: "Dimagrimento" },
  { v: "general", l: "Generale" },
];

export const FOCUS_MUSCLES: Option[] = [
  { v: "chest", l: "Petto" },
  { v: "back", l: "Schiena" },
  { v: "shoulders", l: "Spalle" },
  { v: "arms", l: "Braccia" },
  { v: "legs", l: "Gambe" },
  { v: "glutes", l: "Glutei" },
  { v: "core", l: "Core" },
  { v: "full_body", l: "Tutto il corpo" },
];

export const INTENSITY: Option[] = [
  { v: "low", l: "Bassa" },
  { v: "moderate", l: "Moderata" },
  { v: "high", l: "Alta" },
];

export const EQUIPMENT: Option[] = [
  { v: "bodyweight", l: "Corpo libero" },
  { v: "dumbbells", l: "Manubri" },
  { v: "barbell", l: "Bilanciere" },
  { v: "machines", l: "Macchine" },
  { v: "bands", l: "Elastici" },
  { v: "kettlebell", l: "Kettlebell" },
  { v: "pullup_bar", l: "Sbarra" },
  { v: "full_gym", l: "Palestra completa" },
];

export const TRAINING_STYLE: Option[] = [
  { v: "auto", l: "Decidi tu" },
  { v: "full_body", l: "Full body" },
  { v: "upper_lower", l: "Upper / Lower" },
  { v: "ppl", l: "Push / Pull / Legs" },
  { v: "split", l: "Split (1 gruppo/giorno)" },
];

export const SESSION_MINUTES: Option[] = [
  { v: "30", l: "30 min" },
  { v: "45", l: "45 min" },
  { v: "60", l: "60 min" },
  { v: "75", l: "75 min" },
  { v: "90", l: "90 min" },
];

export const DAYS_PER_WEEK: Option[] = [
  { v: "2", l: "2" },
  { v: "3", l: "3" },
  { v: "4", l: "4" },
  { v: "5", l: "5" },
  { v: "6", l: "6" },
];

export const EXPERIENCE_LABELS = labelMap(EXPERIENCE);
export const TRAINING_GOAL_LABELS = labelMap(TRAINING_GOAL);
export const FOCUS_MUSCLES_LABELS = labelMap(FOCUS_MUSCLES);
export const INTENSITY_LABELS = labelMap(INTENSITY);
export const EQUIPMENT_LABELS = labelMap(EQUIPMENT);
export const TRAINING_STYLE_LABELS = labelMap(TRAINING_STYLE);

// ──────────────────────────────────────────────────────────
// Nutrizione
// ──────────────────────────────────────────────────────────

export const DIET: Option[] = [
  { v: "omnivore", l: "Onnivoro" },
  { v: "vegetarian", l: "Vegetariano" },
  { v: "vegan", l: "Vegano" },
  { v: "pescatarian", l: "Pescetariano" },
  { v: "flexitarian", l: "Flexitariano" },
];

export const ALLERGIES: Option[] = [
  { v: "gluten", l: "Glutine" },
  { v: "lactose", l: "Lattosio" },
  { v: "nuts", l: "Frutta a guscio" },
  { v: "eggs", l: "Uova" },
  { v: "soy", l: "Soia" },
  { v: "shellfish", l: "Crostacei" },
  { v: "fish", l: "Pesce" },
];

export const COOKING_TIME: Option[] = [
  { v: "minimal", l: "Veloce (≤15 min)" },
  { v: "moderate", l: "Medio (≤40 min)" },
  { v: "elaborate", l: "Elaborato" },
];

export const BUDGET: Option[] = [
  { v: "low", l: "Contenuto" },
  { v: "medium", l: "Medio" },
  { v: "high", l: "Ampio" },
];

export const MEALS_PER_DAY: Option[] = [
  { v: "3", l: "3" },
  { v: "4", l: "4" },
  { v: "5", l: "5" },
  { v: "6", l: "6" },
];

export const DIET_LABELS = labelMap(DIET);
export const ALLERGIES_LABELS = labelMap(ALLERGIES);
export const COOKING_TIME_LABELS = labelMap(COOKING_TIME);
export const BUDGET_LABELS = labelMap(BUDGET);
