"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MEALS, type Meal } from "@/lib/nutrition";

export type LogState = { error?: string };
export type TargetsState = { error?: string; ok?: boolean };

function num(v: FormDataEntryValue | null): number | null {
  const s = String(v ?? "")
    .trim()
    .replace(",", ".");
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export async function logFood(
  _prev: LogState,
  formData: FormData
): Promise<LogState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const meal = String(formData.get("meal") ?? "");
  if (!MEALS.includes(meal as Meal)) return { error: "Seleziona un pasto." };

  const grams = num(formData.get("quantity_g"));
  if (grams === null || grams <= 0 || grams > 5000)
    return { error: "Inserisci una quantità valida (g)." };

  let foodId = String(formData.get("food_id") ?? "").trim() || null;

  // Nessun food_id → arriva da Open Food Facts: salva (cache) in `foods`.
  if (!foodId) {
    const name = String(formData.get("name") ?? "").trim();
    if (!name) return { error: "Alimento mancante." };
    const off_barcode = String(formData.get("off_barcode") ?? "").trim() || null;
    const brand = String(formData.get("brand") ?? "").trim() || null;

    // Dedup: riusa l'alimento se già in cache (per barcode).
    if (off_barcode) {
      const { data: existing } = await supabase
        .from("foods")
        .select("id")
        .eq("user_id", user.id)
        .eq("off_barcode", off_barcode)
        .maybeSingle();
      if (existing) foodId = existing.id;
    }

    if (!foodId) {
      const { data: inserted, error } = await supabase
        .from("foods")
        .insert({
          user_id: user.id,
          off_barcode,
          name,
          brand,
          kcal_per_100: num(formData.get("kcal_per_100")) ?? 0,
          protein_per_100: num(formData.get("protein_per_100")) ?? 0,
          carbs_per_100: num(formData.get("carbs_per_100")) ?? 0,
          fat_per_100: num(formData.get("fat_per_100")) ?? 0,
          fiber_per_100: num(formData.get("fiber_per_100")),
        })
        .select("id")
        .single();
      if (error || !inserted)
        return { error: "Non è stato possibile salvare l'alimento." };
      foodId = inserted.id;
    }
  }

  const { error: logErr } = await supabase.from("food_logs").insert({
    user_id: user.id,
    meal,
    food_id: foodId,
    quantity_g: grams,
  });
  if (logErr) return { error: "Non è stato possibile registrare il pasto." };

  revalidatePath("/cibo");
  redirect("/cibo");
}

export async function deleteFoodLog(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await supabase.from("food_logs").delete().eq("id", id);
  revalidatePath("/cibo");
}

export async function saveTargets(
  _prev: TargetsState,
  formData: FormData
): Promise<TargetsState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const kcal = num(formData.get("kcal"));
  const protein = num(formData.get("protein_g"));
  const carbs = num(formData.get("carbs_g"));
  const fat = num(formData.get("fat_g"));

  if (kcal === null || kcal <= 0) return { error: "Inserisci le kcal obiettivo." };

  const { error } = await supabase.from("nutrition_targets").upsert(
    {
      user_id: user.id,
      kcal,
      protein_g: protein,
      carbs_g: carbs,
      fat_g: fat,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );
  if (error) return { error: "Non è stato possibile salvare i target." };

  revalidatePath("/cibo");
  return { ok: true };
}
