import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AddSetDrawer } from "@/components/allenamento/add-set-drawer";
import { DeleteSetButton } from "@/components/allenamento/delete-set-button";
import { DeleteSessionButton } from "@/components/allenamento/delete-session-button";

export const metadata: Metadata = { title: "Sessione" };

const dateFmt = new Intl.DateTimeFormat("it-IT", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
});

type SetRow = {
  id: string;
  set_index: number | null;
  reps: number | null;
  weight_kg: number | null;
  rpe: number | null;
  rest_s: number | null;
  exercise_id: string;
};

function setSummary(s: SetRow): string {
  const parts: string[] = [];
  if (s.reps != null) parts.push(`${s.reps} rip`);
  if (s.weight_kg != null) parts.push(`${s.weight_kg} kg`);
  if (s.rpe != null) parts.push(`RPE ${s.rpe}`);
  if (s.rest_s != null) parts.push(`${s.rest_s}s rec`);
  return parts.join(" · ") || "—";
}

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: session } = await supabase
    .from("workout_sessions")
    .select("id, name, performed_at")
    .eq("id", id)
    .maybeSingle();
  if (!session) notFound();

  const { data: sets } = await supabase
    .from("workout_sets")
    .select("id, set_index, reps, weight_kg, rpe, rest_s, exercise_id, created_at")
    .eq("session_id", id)
    .order("created_at", { ascending: true });

  const exIds = [...new Set((sets ?? []).map((s) => s.exercise_id))];
  const { data: exRows } = exIds.length
    ? await supabase.from("exercises").select("id, name").in("id", exIds)
    : { data: [] };
  const exName = new Map((exRows ?? []).map((e) => [e.id, e.name]));

  // Raggruppa per esercizio nell'ordine di prima comparsa.
  const groups: { exerciseId: string; name: string; sets: SetRow[] }[] = [];
  const gmap = new Map<string, (typeof groups)[number]>();
  for (const s of sets ?? []) {
    if (!gmap.has(s.exercise_id)) {
      const g = {
        exerciseId: s.exercise_id,
        name: exName.get(s.exercise_id) ?? "Esercizio",
        sets: [],
      };
      gmap.set(s.exercise_id, g);
      groups.push(g);
    }
    gmap.get(s.exercise_id)!.sets.push(s as SetRow);
  }

  const { data: library } = await supabase
    .from("exercises")
    .select("id, name, muscle_group, type")
    .order("name", { ascending: true });

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
          {session.name || "Sessione"}
        </h1>
        <p className="metric text-sm text-encre-2">
          {dateFmt.format(new Date(session.performed_at))}
        </p>
      </div>

      <AddSetDrawer sessionId={id} exercises={library ?? []} />

      {groups.length > 0 ? (
        <section className="flex flex-col gap-fib3">
          {groups.map((g) => (
            <div key={g.exerciseId} className="flex flex-col gap-fib1">
              <h2 className="font-display text-base font-medium">{g.name}</h2>
              <ul className="flex flex-col divide-y divide-ligne overflow-hidden rounded-md border border-ligne bg-surface">
                {g.sets.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between gap-fib3 px-fib3 py-fib2"
                  >
                    <span className="metric text-sm">
                      <span className="text-encre-2">#{s.set_index}</span>{" "}
                      {setSummary(s)}
                    </span>
                    <DeleteSetButton id={s.id} sessionId={id} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      ) : (
        <p className="rounded-md border border-dashed border-ligne bg-surface p-fib5 text-center text-sm text-encre-2">
          Nessun set ancora. Aggiungi il primo qui sopra.
        </p>
      )}

      <div className="pt-fib2">
        <DeleteSessionButton id={id} />
      </div>
    </div>
  );
}
