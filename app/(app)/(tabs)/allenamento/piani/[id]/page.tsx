import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Play } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createSessionFromPlanWorkout } from "@/app/(app)/(tabs)/allenamento/actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { DeletePlanButton } from "@/components/allenamento/delete-plan-button";

export const metadata: Metadata = { title: "Piano" };

type PlanExercise = {
  id: string;
  plan_workout_id: string;
  exercise_id: string;
  sets: number | null;
  reps: string | null;
  target_weight_kg: number | null;
  rpe: number | null;
  rest_s: number | null;
  notes: string | null;
};

function prescription(pe: PlanExercise): string {
  const parts: string[] = [];
  const sets = pe.sets ?? null;
  if (sets != null && pe.reps) parts.push(`${sets} × ${pe.reps}`);
  else if (sets != null) parts.push(`${sets} serie`);
  else if (pe.reps) parts.push(`${pe.reps} rip`);
  if (pe.target_weight_kg != null) parts.push(`${pe.target_weight_kg} kg`);
  if (pe.rpe != null) parts.push(`RPE ${pe.rpe}`);
  if (pe.rest_s != null) parts.push(`${pe.rest_s}s rec`);
  return parts.join(" · ") || "—";
}

export default async function PlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: plan } = await supabase
    .from("training_plans")
    .select("id, name, goal, weeks, days_per_week, description, progression")
    .eq("id", id)
    .maybeSingle();
  if (!plan) notFound();

  const { data: workouts } = await supabase
    .from("plan_workouts")
    .select("id, week, order_index, day_label, focus, notes")
    .eq("plan_id", id)
    .order("week", { ascending: true, nullsFirst: true })
    .order("order_index", { ascending: true });

  const woIds = (workouts ?? []).map((w) => w.id);
  const { data: pexs } = woIds.length
    ? await supabase
        .from("plan_exercises")
        .select(
          "id, plan_workout_id, exercise_id, sets, reps, target_weight_kg, rpe, rest_s, notes"
        )
        .in("plan_workout_id", woIds)
        .order("order_index", { ascending: true })
    : { data: [] };

  const exIds = [...new Set((pexs ?? []).map((p) => p.exercise_id))];
  const { data: exRows } = exIds.length
    ? await supabase.from("exercises").select("id, name").in("id", exIds)
    : { data: [] };
  const exName = new Map((exRows ?? []).map((e) => [e.id, e.name]));

  const byWorkout = new Map<string, PlanExercise[]>();
  for (const p of pexs ?? []) {
    if (!byWorkout.has(p.plan_workout_id)) byWorkout.set(p.plan_workout_id, []);
    byWorkout.get(p.plan_workout_id)!.push(p as PlanExercise);
  }

  const meta = [
    plan.goal,
    plan.weeks ? `${plan.weeks} sett.` : null,
    plan.days_per_week ? `${plan.days_per_week} gg/sett.` : null,
  ].filter(Boolean);

  return (
    <div className="flex flex-col gap-fib4 p-fib4">
      <div className="flex flex-col gap-fib2">
        <Link
          href="/allenamento"
          className="flex items-center gap-fib1 self-start text-sm text-encre-2 hover:text-encre"
        >
          <ChevronLeft className="size-4" aria-hidden />
          Allenamento
        </Link>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          {plan.name}
        </h1>
        {meta.length > 0 && (
          <p className="metric text-sm text-encre-2">{meta.join(" · ")}</p>
        )}
      </div>

      {plan.description && (
        <p className="text-sm leading-relaxed text-encre">{plan.description}</p>
      )}

      {plan.progression && (
        <div className="rounded-md border border-ligne bg-surface p-fib3">
          <h2 className="mb-fib1 font-display text-sm font-medium">
            Progressione
          </h2>
          <p className="text-sm leading-relaxed text-encre-2">
            {plan.progression}
          </p>
        </div>
      )}

      <section className="flex flex-col gap-fib4">
        {(workouts ?? []).map((w) => {
          const list = byWorkout.get(w.id) ?? [];
          return (
            <div
              key={w.id}
              className="flex flex-col gap-fib3 rounded-md border border-ligne bg-surface p-fib3"
            >
              <div className="flex flex-col gap-fib1">
                <div className="flex items-baseline justify-between gap-fib2">
                  <h2 className="font-display text-base font-semibold">
                    {w.day_label}
                  </h2>
                  {w.week != null && (
                    <span className="metric shrink-0 text-xs text-encre-2">
                      sett. {w.week}
                    </span>
                  )}
                </div>
                {w.focus && (
                  <p className="text-xs text-encre-2">{w.focus}</p>
                )}
              </div>

              <ul className="flex flex-col divide-y divide-ligne border-y border-ligne">
                {list.map((pe) => (
                  <li key={pe.id} className="flex flex-col gap-fib1 py-fib2">
                    <span className="text-sm font-medium">
                      {exName.get(pe.exercise_id) ?? "Esercizio"}
                    </span>
                    <span className="metric text-xs text-encre-2">
                      {prescription(pe)}
                    </span>
                    {pe.notes && (
                      <span className="text-xs text-encre-2">{pe.notes}</span>
                    )}
                  </li>
                ))}
              </ul>

              {w.notes && (
                <p className="text-xs text-encre-2">{w.notes}</p>
              )}

              <form action={createSessionFromPlanWorkout}>
                <input type="hidden" name="plan_workout_id" value={w.id} />
                <SubmitButton
                  variant="outline"
                  className="w-full gap-fib1"
                  pendingLabel="Creo la sessione…"
                  icon={<Play className="size-4" aria-hidden />}
                >
                  Crea sessione da questo giorno
                </SubmitButton>
              </form>
            </div>
          );
        })}
      </section>

      <div className="pt-fib2">
        <DeletePlanButton id={plan.id} />
      </div>
    </div>
  );
}
