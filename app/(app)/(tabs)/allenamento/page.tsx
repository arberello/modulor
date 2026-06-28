import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Download, Plus } from "lucide-react";
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

  const [{ data: sessions }, { data: plans }] = await Promise.all([
    supabase
      .from("workout_sessions")
      .select("id, name, performed_at")
      .order("performed_at", { ascending: false })
      .limit(30),
    supabase
      .from("training_plans")
      .select("id, name, goal, weeks, days_per_week")
      .order("created_at", { ascending: false }),
  ]);

  const ids = (sessions ?? []).map((s) => s.id);
  const { data: setRows } = ids.length
    ? await supabase.from("workout_sets").select("session_id").in("session_id", ids)
    : { data: [] };
  const counts = new Map<string, number>();
  for (const r of setRows ?? [])
    counts.set(r.session_id, (counts.get(r.session_id) ?? 0) + 1);

  const hasSessions = (sessions ?? []).length > 0;
  const hasPlans = (plans ?? []).length > 0;

  return (
    <div className="flex flex-col gap-fib4 p-fib4">
      <h1 className="font-display text-2xl font-semibold tracking-tight">
        Allenamento
      </h1>

      <div className="grid grid-cols-2 gap-fib2">
        <form action={createSession}>
          <Button type="submit" className="w-full gap-fib1">
            <Plus className="size-4" aria-hidden />
            Nuova sessione
          </Button>
        </form>
        <Button asChild variant="outline" className="w-full gap-fib1">
          <Link href="/allenamento/importa">
            <Download className="size-4" aria-hidden />
            Importa piano
          </Link>
        </Button>
      </div>

      {hasPlans && (
        <section className="flex flex-col gap-fib2">
          <h2 className="font-display text-sm font-medium text-encre-2">
            Piani
          </h2>
          <ul className="flex flex-col divide-y divide-ligne overflow-hidden rounded-md border border-ligne bg-surface">
            {(plans ?? []).map((p) => {
              const meta = [
                p.goal,
                p.weeks ? `${p.weeks} sett.` : null,
                p.days_per_week ? `${p.days_per_week} gg/sett.` : null,
              ].filter(Boolean);
              return (
                <li key={p.id}>
                  <Link
                    href={`/allenamento/piani/${p.id}`}
                    className="flex items-center justify-between gap-fib3 px-fib3 py-fib3 transition-colors hover:bg-beton"
                  >
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate font-medium">{p.name}</span>
                      {meta.length > 0 && (
                        <span className="metric text-xs text-encre-2">
                          {meta.join(" · ")}
                        </span>
                      )}
                    </div>
                    <ChevronRight
                      className="size-4 shrink-0 text-encre-2"
                      aria-hidden
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="flex flex-col gap-fib2">
        {hasPlans && (
          <h2 className="font-display text-sm font-medium text-encre-2">
            Sessioni
          </h2>
        )}
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
              Nessuna sessione ancora. Inizia la prima, o importa un piano AI e
              avvia una sessione da lì.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
