import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AddSetDrawer } from "@/components/allenamento/add-set-drawer";
import { DeleteSessionButton } from "@/components/allenamento/delete-session-button";
import {
  SessionLogger,
  type LoggerGroup,
} from "@/components/allenamento/session-logger";

export const metadata: Metadata = { title: "Sessione" };

const dateFmt = new Intl.DateTimeFormat("it-IT", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
});

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
    .select(
      "id, set_index, reps, weight_kg, rpe, rest_s, exercise_id, completed_at, created_at"
    )
    .eq("session_id", id)
    .order("created_at", { ascending: true });

  const exIds = [...new Set((sets ?? []).map((s) => s.exercise_id))];
  const { data: exRows } = exIds.length
    ? await supabase.from("exercises").select("id, name").in("id", exIds)
    : { data: [] };
  const exName = new Map((exRows ?? []).map((e) => [e.id, e.name]));

  // Raggruppa per esercizio nell'ordine di prima comparsa.
  const groups: LoggerGroup[] = [];
  const gmap = new Map<string, LoggerGroup>();
  for (const s of sets ?? []) {
    if (!gmap.has(s.exercise_id)) {
      const g: LoggerGroup = {
        exerciseId: s.exercise_id,
        name: exName.get(s.exercise_id) ?? "Esercizio",
        sets: [],
      };
      gmap.set(s.exercise_id, g);
      groups.push(g);
    }
    gmap.get(s.exercise_id)!.sets.push({
      id: s.id,
      exerciseId: s.exercise_id,
      setIndex: s.set_index,
      reps: s.reps,
      weightKg: s.weight_kg,
      rpe: s.rpe,
      restS: s.rest_s,
      completedAt: s.completed_at,
    });
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
        <SessionLogger sessionId={id} groups={groups} />
      ) : (
        <p className="rounded-md border border-dashed border-ligne bg-surface p-fib5 text-center text-sm text-encre-2">
          Nessun set ancora. Aggiungi il primo qui sopra, oppure avvia la
          sessione da un piano.
        </p>
      )}

      <div className="pt-fib2">
        <DeleteSessionButton id={id} />
      </div>
    </div>
  );
}
