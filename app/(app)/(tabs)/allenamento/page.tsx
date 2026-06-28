import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createSession } from "./actions";
import { Button } from "@/components/ui/button";
import { ModulorBar } from "@/components/modulor-bar";

export const metadata: Metadata = { title: "Allenamento" };

const dateFmt = new Intl.DateTimeFormat("it-IT", {
  weekday: "short",
  day: "2-digit",
  month: "short",
});

export default async function AllenamentoPage() {
  const supabase = await createClient();
  const { data: sessions } = await supabase
    .from("workout_sessions")
    .select("id, name, performed_at")
    .order("performed_at", { ascending: false })
    .limit(30);

  const ids = (sessions ?? []).map((s) => s.id);
  const { data: setRows } = ids.length
    ? await supabase.from("workout_sets").select("session_id").in("session_id", ids)
    : { data: [] };
  const counts = new Map<string, number>();
  for (const r of setRows ?? [])
    counts.set(r.session_id, (counts.get(r.session_id) ?? 0) + 1);

  const hasSessions = (sessions ?? []).length > 0;

  return (
    <div className="flex flex-col gap-fib4 p-fib4">
      <h1 className="font-display text-2xl font-semibold tracking-tight">
        Allenamento
      </h1>

      <form action={createSession}>
        <Button type="submit" className="w-full gap-fib1">
          <Plus className="size-4" aria-hidden />
          Nuova sessione
        </Button>
      </form>

      {hasSessions ? (
        <ul className="flex flex-col divide-y divide-ligne overflow-hidden rounded-md border border-ligne bg-surface">
          {(sessions ?? []).map((s) => (
            <li key={s.id}>
              <Link
                href={`/allenamento/${s.id}`}
                className="flex items-center justify-between gap-fib3 px-fib3 py-fib3 transition-colors hover:bg-beton"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{s.name || "Sessione"}</span>
                  <span className="metric text-xs text-encre-2">
                    {dateFmt.format(new Date(s.performed_at))} ·{" "}
                    {counts.get(s.id) ?? 0} set
                  </span>
                </div>
                <ChevronRight className="size-4 text-encre-2" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-fib3 rounded-md border border-dashed border-ligne bg-surface p-fib6 text-center">
          <ModulorBar className="h-fib6" withNode={false} />
          <p className="max-w-xs text-sm text-encre-2">
            Nessuna sessione ancora. Inizia la prima e registra i tuoi set.
          </p>
        </div>
      )}
    </div>
  );
}
