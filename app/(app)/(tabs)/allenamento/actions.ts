"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  parseTrainingPlanJson,
  PlanParseError,
  type ParsedPlan,
} from "@/lib/training-plan";

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

// ──────────────────────────────────────────────────────────
// Import piano AI → training_plans / plan_workouts / plan_exercises
// ──────────────────────────────────────────────────────────

const norm = (s: string) => s.trim().toLowerCase();

export type ImportPlanState = { error?: string };

export async function importTrainingPlan(
  _prev: ImportPlanState,
  formData: FormData
): Promise<ImportPlanState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 1. Parse + validazione (l'unico punto che può lanciare)
  let plan: ParsedPlan;
  try {
    plan = parseTrainingPlanJson(String(formData.get("json") ?? ""));
  } catch (e) {
    return {
      error: e instanceof PlanParseError ? e.message : "JSON non valido.",
    };
  }

  // 2. Risolvi/crea gli esercizi (dedup per nome, case-insensitive)
  const wanted = new Map<
    string,
    { name: string; muscleGroup: string | null; type: string | null }
  >();
  for (const w of plan.workouts)
    for (const ex of w.exercises)
      if (!wanted.has(norm(ex.name)))
        wanted.set(norm(ex.name), {
          name: ex.name,
          muscleGroup: ex.muscleGroup,
          type: ex.type,
        });

  // Esercizi già visibili (propri + libreria condivisa)
  const { data: existing } = await supabase
    .from("exercises")
    .select("id, name");
  const idByName = new Map<string, string>();
  for (const e of existing ?? []) idByName.set(norm(e.name), e.id);

  // Crea quelli mancanti in un colpo solo
  const toCreate = [...wanted.values()].filter((e) => !idByName.has(norm(e.name)));
  if (toCreate.length) {
    const { data: created, error: exErr } = await supabase
      .from("exercises")
      .insert(
        toCreate.map((e) => ({
          user_id: user.id,
          name: e.name,
          muscle_group: e.muscleGroup,
          type: e.type,
        }))
      )
      .select("id, name");
    if (exErr || !created)
      return { error: "Non è stato possibile creare gli esercizi nuovi." };
    for (const e of created) idByName.set(norm(e.name), e.id);
  }

  // 3. Inserisci il piano
  const { data: planRow, error: planErr } = await supabase
    .from("training_plans")
    .insert({
      user_id: user.id,
      name: plan.name,
      goal: plan.goal,
      weeks: plan.weeks,
      days_per_week: plan.daysPerWeek,
      description: plan.description,
      progression: plan.progression,
      source: "ai_import",
      raw: plan.raw as never,
    })
    .select("id")
    .single();
  if (planErr || !planRow)
    return { error: "Non è stato possibile salvare il piano." };

  // 4. Giorni + esercizi pianificati
  for (let wi = 0; wi < plan.workouts.length; wi++) {
    const w = plan.workouts[wi];
    const { data: woRow, error: woErr } = await supabase
      .from("plan_workouts")
      .insert({
        plan_id: planRow.id,
        week: w.week,
        order_index: wi,
        day_label: w.dayLabel,
        focus: w.focus,
        notes: w.notes,
      })
      .select("id")
      .single();
    if (woErr || !woRow) return { error: "Errore nel salvare un allenamento." };

    const rows = w.exercises
      .map((ex, ei) => {
        const exId = idByName.get(norm(ex.name));
        if (!exId) return null;
        return {
          plan_workout_id: woRow.id,
          exercise_id: exId,
          order_index: ei,
          sets: ex.sets,
          reps: ex.reps,
          target_weight_kg: ex.targetWeightKg,
          rpe: ex.rpe,
          rest_s: ex.restS,
          notes: ex.notes,
        };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);
    if (rows.length) {
      const { error: peErr } = await supabase.from("plan_exercises").insert(rows);
      if (peErr) return { error: "Errore nel salvare gli esercizi del piano." };
    }
  }

  revalidatePath("/allenamento");
  redirect(`/allenamento/piani/${planRow.id}`);
}

export async function deletePlan(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await supabase.from("training_plans").delete().eq("id", id);
  revalidatePath("/allenamento");
  redirect("/allenamento");
}

/** Primo intero in una stringa di reps ("8-12" → 8); null se assente. */
function firstInt(reps: string | null): number | null {
  if (!reps) return null;
  const m = reps.match(/\d+/);
  return m ? Number(m[0]) : null;
}

/** Istanzia una sessione reale da un giorno del piano, precompilando i set. */
export async function createSessionFromPlanWorkout(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const planWorkoutId = String(formData.get("plan_workout_id") ?? "");
  if (!planWorkoutId) redirect("/allenamento");

  const { data: workout } = await supabase
    .from("plan_workouts")
    .select("id, day_label, focus, notes, plan_id")
    .eq("id", planWorkoutId)
    .maybeSingle();
  if (!workout) redirect("/allenamento");

  const { data: planExs } = await supabase
    .from("plan_exercises")
    .select("exercise_id, sets, reps, target_weight_kg, rpe, rest_s")
    .eq("plan_workout_id", planWorkoutId)
    .order("order_index", { ascending: true });

  const { data: session, error: sErr } = await supabase
    .from("workout_sessions")
    .insert({
      user_id: user.id,
      name: workout.day_label,
      notes: workout.focus,
    })
    .select("id")
    .single();
  if (sErr || !session) redirect("/allenamento");

  const sets: {
    session_id: string;
    exercise_id: string;
    set_index: number;
    reps: number | null;
    weight_kg: number | null;
    rpe: number | null;
    rest_s: number | null;
  }[] = [];
  for (const pe of planExs ?? []) {
    const n = pe.sets && pe.sets > 0 ? pe.sets : 1;
    const reps = firstInt(pe.reps);
    for (let i = 1; i <= n; i++)
      sets.push({
        session_id: session.id,
        exercise_id: pe.exercise_id,
        set_index: i,
        reps,
        weight_kg: pe.target_weight_kg,
        rpe: pe.rpe,
        rest_s: pe.rest_s,
      });
  }
  if (sets.length) await supabase.from("workout_sets").insert(sets);

  revalidatePath(`/allenamento/${session.id}`);
  redirect(`/allenamento/${session.id}`);
}
