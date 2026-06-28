// Calcoli di nutrizione: macro di un alimento per quantità, totali giornalieri,
// e target automatici da TDEE + obiettivo.

export type Macros = {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
};

export const MEALS = ["breakfast", "lunch", "dinner", "snack"] as const;
export type Meal = (typeof MEALS)[number];

export const MEAL_LABELS: Record<Meal, string> = {
  breakfast: "Colazione",
  lunch: "Pranzo",
  dinner: "Cena",
  snack: "Spuntino",
};

export type Per100 = {
  kcal_per_100: number;
  protein_per_100: number;
  carbs_per_100: number;
  fat_per_100: number;
};

/** Macro per una quantità in grammi a partire dai valori per 100 g. */
export function macrosForQuantity(food: Per100, grams: number): Macros {
  const f = grams / 100;
  return {
    kcal: food.kcal_per_100 * f,
    protein: food.protein_per_100 * f,
    carbs: food.carbs_per_100 * f,
    fat: food.fat_per_100 * f,
  };
}

export function emptyMacros(): Macros {
  return { kcal: 0, protein: 0, carbs: 0, fat: 0 };
}

export function addMacros(a: Macros, b: Macros): Macros {
  return {
    kcal: a.kcal + b.kcal,
    protein: a.protein + b.protein,
    carbs: a.carbs + b.carbs,
    fat: a.fat + b.fat,
  };
}

/**
 * Target automatici da TDEE, obiettivo e peso.
 * - kcal: cut −15%, bulk +10%, maintain =
 * - proteine: 2 g/kg
 * - grassi: 25% delle kcal
 * - carbo: resto
 */
export function autoTargets(
  tdee: number,
  goal: "cut" | "bulk" | "maintain",
  weightKg: number
): Macros {
  const factor = goal === "cut" ? 0.85 : goal === "bulk" ? 1.1 : 1;
  const kcal = Math.round((tdee * factor) / 10) * 10;
  const protein = Math.round(weightKg * 2);
  const fatKcal = kcal * 0.25;
  const fat = Math.round(fatKcal / 9);
  const remaining = kcal - protein * 4 - fat * 9;
  const carbs = Math.max(0, Math.round(remaining / 4));
  return { kcal, protein, carbs, fat };
}
