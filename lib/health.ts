export type Sex = "m" | "f";
export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";

const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: "Sedentario",
  light: "Leggero",
  moderate: "Moderato",
  active: "Attivo",
  very_active: "Molto attivo",
};

export const GOAL_LABELS: Record<string, string> = {
  cut: "Definizione",
  bulk: "Massa",
  maintain: "Mantenimento",
};

export function ageFromBirthDate(birthDate: string, now: Date = new Date()): number {
  const b = new Date(birthDate);
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age;
}

export function bmi(weightKg: number, heightCm: number): number {
  const h = heightCm / 100;
  return weightKg / (h * h);
}

/** Classificazione OMS del BMI. */
export function bmiCategory(value: number): string {
  if (value < 18.5) return "Sottopeso";
  if (value < 25) return "Normopeso";
  if (value < 30) return "Sovrappeso";
  return "Obesità";
}

/** Metabolismo basale (Mifflin-St Jeor). */
export function bmrMifflinStJeor(
  sex: Sex,
  weightKg: number,
  heightCm: number,
  age: number
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === "m" ? base + 5 : base - 161;
}

/** Dispendio energetico totale = BMR × fattore di attività. */
export function tdee(bmr: number, activity: ActivityLevel): number {
  return bmr * ACTIVITY_FACTORS[activity];
}

/**
 * Media mobile su finestra di `windowDays` giorni.
 * `points` ordinati per `t` (ms epoch) crescente. Ritorna un valore per punto.
 */
export function movingAverage(
  points: { t: number; v: number }[],
  windowDays: number
): (number | null)[] {
  const windowMs = windowDays * 86_400_000;
  return points.map((p, i) => {
    const start = p.t - windowMs;
    let sum = 0;
    let count = 0;
    for (let j = i; j >= 0; j--) {
      if (points[j].t < start) break;
      sum += points[j].v;
      count++;
    }
    return count ? sum / count : null;
  });
}
