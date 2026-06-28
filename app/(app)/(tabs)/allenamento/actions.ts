"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function num(v: FormDataEntryValue | null): number | null {
  const s = String(v ?? "")
    .trim()
    .replace(",", ".");
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export async function createSession(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = String(formData.get("name") ?? "").trim() || null;

  const { data, error } = await supabase
    .from("workout_sessions")
    .insert({ user_id: user.id, name })
    .select("id")
    .single();
  if (error || !data) redirect("/allenamento");

  revalidatePath("/allenamento");
  redirect(`/allenamento/${data.id}`);
}

export async function deleteSession(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await supabase.from("workout_sessions").delete().eq("id", id);
  revalidatePath("/allenamento");
  redirect("/allenamento");
}

export type SetState = { error?: string; ok?: boolean };

export async function addSet(
  _prev: SetState,
  formData: FormData
): Promise<SetState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const sessionId = String(formData.get("session_id") ?? "");
  const exerciseId = String(formData.get("exercise_id") ?? "");
  if (!sessionId) return { error: "Sessione mancante." };
  if (!exerciseId) return { error: "Seleziona un esercizio." };

  // set_index automatico = numero di set già presenti per quell'esercizio.
  const { count } = await supabase
    .from("workout_sets")
    .select("id", { count: "exact", head: true })
    .eq("session_id", sessionId)
    .eq("exercise_id", exerciseId);

  const { error } = await supabase.from("workout_sets").insert({
    session_id: sessionId,
    exercise_id: exerciseId,
    set_index: (count ?? 0) + 1,
    reps: num(formData.get("reps")),
    weight_kg: num(formData.get("weight_kg")),
    rpe: num(formData.get("rpe")),
    rest_s: num(formData.get("rest_s")),
  });
  if (error) return { error: "Non è stato possibile salvare il set." };

  revalidatePath(`/allenamento/${sessionId}`);
  return { ok: true };
}

export async function deleteSet(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const sessionId = String(formData.get("session_id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await supabase.from("workout_sets").delete().eq("id", id);
  if (sessionId) revalidatePath(`/allenamento/${sessionId}`);
}

export type ExerciseResult = {
  error?: string;
  exercise?: { id: string; name: string; muscle_group: string | null; type: string | null };
};

export async function createExercise(
  name: string,
  muscleGroup: string,
  type: string
): Promise<ExerciseResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const clean = name.trim();
  if (!clean) return { error: "Inserisci un nome." };

  const { data, error } = await supabase
    .from("exercises")
    .insert({
      user_id: user.id,
      name: clean,
      muscle_group: muscleGroup || null,
      type: type || null,
    })
    .select("id, name, muscle_group, type")
    .single();
  if (error || !data) return { error: "Non è stato possibile creare l'esercizio." };

  revalidatePath("/allenamento", "layout");
  return { exercise: data };
}
