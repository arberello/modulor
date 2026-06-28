"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type OnboardingState = { error?: string };

const SEX = ["m", "f"] as const;
const GOAL = ["cut", "bulk", "maintain"] as const;
const ACTIVITY = [
  "sedentary",
  "light",
  "moderate",
  "active",
  "very_active",
] as const;

export async function saveOnboarding(
  _prev: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const displayName = String(formData.get("display_name") ?? "").trim();
  const sex = String(formData.get("sex") ?? "");
  const birthDate = String(formData.get("birth_date") ?? "");
  const heightCm = Number(formData.get("height_cm"));
  const activity = String(formData.get("activity_level") ?? "");
  const goal = String(formData.get("goal") ?? "");

  if (!SEX.includes(sex as (typeof SEX)[number]))
    return { error: "Seleziona il sesso." };
  if (!birthDate || Number.isNaN(Date.parse(birthDate)))
    return { error: "Inserisci una data di nascita valida." };
  if (!Number.isFinite(heightCm) || heightCm < 100 || heightCm > 250)
    return { error: "Inserisci un'altezza valida (100–250 cm)." };
  if (!ACTIVITY.includes(activity as (typeof ACTIVITY)[number]))
    return { error: "Seleziona il livello di attività." };
  if (!GOAL.includes(goal as (typeof GOAL)[number]))
    return { error: "Seleziona un obiettivo." };

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: displayName || null,
      sex,
      birth_date: birthDate,
      height_cm: heightCm,
      activity_level: activity,
      goal,
    })
    .eq("id", user.id);

  if (error) return { error: "Non è stato possibile salvare il profilo." };

  revalidatePath("/", "layout");
  redirect("/");
}
