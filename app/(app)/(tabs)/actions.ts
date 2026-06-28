"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type MeasurementState = { error?: string; ok?: boolean };

function num(v: FormDataEntryValue | null): number | null {
  const s = String(v ?? "")
    .trim()
    .replace(",", ".");
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export async function addMeasurement(
  _prev: MeasurementState,
  formData: FormData
): Promise<MeasurementState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const weight = num(formData.get("weight_kg"));
  if (weight === null || weight <= 0 || weight > 500)
    return { error: "Inserisci un peso valido (kg)." };

  const measuredAtRaw = String(formData.get("measured_at") ?? "").trim();
  let measuredAt: string;
  if (measuredAtRaw) {
    const d = new Date(measuredAtRaw);
    if (Number.isNaN(d.getTime())) return { error: "Data non valida." };
    measuredAt = d.toISOString();
  } else {
    measuredAt = new Date().toISOString();
  }

  const { error } = await supabase.from("body_measurements").insert({
    user_id: user.id,
    weight_kg: weight,
    body_fat_pct: num(formData.get("body_fat_pct")),
    muscle_mass_kg: num(formData.get("muscle_mass_kg")),
    water_pct: num(formData.get("water_pct")),
    bone_mass_kg: num(formData.get("bone_mass_kg")),
    visceral_fat: num(formData.get("visceral_fat")),
    bmr_kcal: num(formData.get("bmr_kcal")),
    measured_at: measuredAt,
    source: "manual",
  });

  if (error) {
    if (error.code === "23505")
      return { error: "Esiste già una misurazione con questa data e ora." };
    return { error: "Non è stato possibile salvare la misurazione." };
  }

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteMeasurement(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // La RLS garantisce che si possano cancellare solo le righe proprie.
  await supabase.from("body_measurements").delete().eq("id", id);
  revalidatePath("/", "layout");
}
