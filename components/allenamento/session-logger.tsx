"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Check, Loader2, Pause, Play, RotateCcw, X } from "lucide-react";
import { deleteSet, logSet } from "@/app/(app)/(tabs)/allenamento/actions";
import { cn } from "@/lib/utils";

export type LoggerSet = {
  id: string;
  exerciseId: string;
  setIndex: number | null;
  reps: number | null;
  weightKg: number | null;
  rpe: number | null;
  restS: number | null;
  completedAt: string | null;
};

export type LoggerGroup = {
  exerciseId: string;
  name: string;
  sets: LoggerSet[];
};

type Local = {
  reps: string;
  weight: string;
  rpe: string;
  completed: boolean;
  restS: number | null;
};

const DEFAULT_REST = 90;
const numOrNull = (s: string) => {
  const n = Number(s.trim().replace(",", "."));
  return s.trim() && Number.isFinite(n) ? n : null;
};
const timeFmt = new Intl.DateTimeFormat("it-IT", {
  hour: "2-digit",
  minute: "2-digit",
});

/** Feedback fine-recupero: vibrazione + beep, best-effort. */
function notifyRestDone() {
  try {
    navigator.vibrate?.([200, 80, 200]);
  } catch {
    /* no-op */
  }
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
    osc.onended = () => ctx.close();
  } catch {
    /* audio non disponibile */
  }
}

function mmss(s: number) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

export function SessionLogger({
  sessionId,
  groups,
}: {
  sessionId: string;
  groups: LoggerGroup[];
}) {
  const allSets = groups.flatMap((g) => g.sets);

  // Stato locale per set, seminato dai dati server.
  const [vals, setVals] = useState<Record<string, Local>>(() =>
    Object.fromEntries(
      allSets.map((s) => [
        s.id,
        {
          reps: s.reps?.toString() ?? "",
          weight: s.weightKg?.toString() ?? "",
          rpe: s.rpe?.toString() ?? "",
          completed: s.completedAt != null,
          restS: s.restS,
        },
      ])
    )
  );

  // Riallinea quando il server aggiunge/rimuove set (add-set / delete-set),
  // preservando le modifiche in corso sui set già presenti.
  const ids = allSets.map((s) => s.id).join(",");
  useEffect(() => {
    // Riconcilia con i dati server (aggiunta/rimozione set). È una
    // sincronizzazione intenzionale verso uno stato esterno.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVals((prev) => {
      const next: Record<string, Local> = {};
      for (const s of allSets) {
        next[s.id] = prev[s.id] ?? {
          reps: s.reps?.toString() ?? "",
          weight: s.weightKg?.toString() ?? "",
          rpe: s.rpe?.toString() ?? "",
          completed: s.completedAt != null,
          restS: s.restS,
        };
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids]);

  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const setField = (id: string, k: keyof Local, v: string) =>
    setVals((s) => ({ ...s, [id]: { ...s[id], [k]: v } }));

  function persist(id: string, completed: boolean) {
    const v = vals[id];
    if (!v) return;
    setPendingId(id);
    startTransition(async () => {
      await logSet({
        sessionId,
        setId: id,
        reps: numOrNull(v.reps),
        weightKg: numOrNull(v.weight),
        rpe: numOrNull(v.rpe),
        completed,
      });
      setPendingId(null);
    });
  }

  // ── Timer di recupero ────────────────────────────────────
  const [timer, setTimer] = useState<{
    total: number;
    remaining: number;
    running: boolean;
  } | null>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    if (!timer?.running) return;
    const iv = setInterval(() => {
      setTimer((t) => {
        if (!t || !t.running) return t;
        const r = t.remaining - 1;
        if (r <= 0) {
          if (!doneRef.current) {
            doneRef.current = true;
            notifyRestDone();
          }
          return { ...t, remaining: 0, running: false };
        }
        return { ...t, remaining: r };
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [timer?.running]);

  function startTimer(seconds: number) {
    doneRef.current = false;
    setTimer({ total: seconds, remaining: seconds, running: true });
  }

  function toggleDone(id: string) {
    const cur = vals[id]?.completed ?? false;
    const next = !cur;
    setVals((s) => ({ ...s, [id]: { ...s[id], completed: next } }));
    persist(id, next);
    if (next) startTimer(vals[id]?.restS ?? DEFAULT_REST);
  }

  const total = allSets.length;
  const done = Object.values(vals).filter((v) => v.completed).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-fib4">
      {/* Avanzamento */}
      <div className="flex flex-col gap-fib1">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Avanzamento</span>
          <span className="metric text-encre-2">
            {done}/{total} set
          </span>
        </div>
        <div className="h-fib1 overflow-hidden rounded-full bg-ligne">
          <div
            className="h-full rounded-full bg-rouge transition-[width] duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Gruppi di esercizi */}
      {groups.map((g) => (
        <div key={g.exerciseId} className="flex flex-col gap-fib2">
          <h2 className="font-display text-base font-medium">{g.name}</h2>
          <ul className="flex flex-col divide-y divide-ligne overflow-hidden rounded-md border border-ligne bg-surface">
            {g.sets.map((s) => {
              const v = vals[s.id];
              if (!v) return null;
              const completedAt = v.completed
                ? s.completedAt ?? new Date().toISOString()
                : null;
              return (
                <li
                  key={s.id}
                  className={cn(
                    "flex items-center gap-fib2 px-fib3 py-fib2 transition-colors",
                    v.completed && "bg-vert/10"
                  )}
                >
                  <span className="metric w-fib4 shrink-0 text-xs text-encre-2">
                    #{s.setIndex ?? "·"}
                  </span>

                  <label className="flex min-w-0 flex-1 items-center gap-fib1">
                    <input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      aria-label="Ripetizioni"
                      value={v.reps}
                      onChange={(e) => setField(s.id, "reps", e.target.value)}
                      onBlur={() => persist(s.id, v.completed)}
                      className="metric w-full min-w-0 rounded-md border border-ligne bg-beton px-fib2 py-fib1 text-center text-sm outline-none focus-visible:ring-2 focus-visible:ring-rouge"
                    />
                    <span className="text-xs text-encre-2">rip</span>
                  </label>

                  <label className="flex min-w-0 flex-1 items-center gap-fib1">
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.5"
                      min="0"
                      aria-label="Peso in kg"
                      value={v.weight}
                      onChange={(e) => setField(s.id, "weight", e.target.value)}
                      onBlur={() => persist(s.id, v.completed)}
                      className="metric w-full min-w-0 rounded-md border border-ligne bg-beton px-fib2 py-fib1 text-center text-sm outline-none focus-visible:ring-2 focus-visible:ring-rouge"
                    />
                    <span className="text-xs text-encre-2">kg</span>
                  </label>

                  {completedAt && (
                    <span className="metric hidden shrink-0 text-xs text-encre-2 sm:inline">
                      {timeFmt.format(new Date(completedAt))}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => toggleDone(s.id)}
                    aria-label={v.completed ? "Annulla set" : "Segna fatto"}
                    aria-pressed={v.completed}
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rouge",
                      v.completed
                        ? "border-vert bg-vert text-beton"
                        : "border-ligne bg-beton text-encre-2 hover:border-vert hover:text-vert"
                    )}
                  >
                    {pendingId === s.id ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                    ) : (
                      <Check className="size-4" aria-hidden />
                    )}
                  </button>

                  <form action={deleteSet}>
                    <input type="hidden" name="id" value={s.id} />
                    <input type="hidden" name="session_id" value={sessionId} />
                    <button
                      type="submit"
                      aria-label="Elimina set"
                      className="flex size-8 shrink-0 items-center justify-center rounded-md text-encre-2 transition-colors hover:text-rouge focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rouge"
                    >
                      <X className="size-4" aria-hidden />
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      {/* Timer di recupero — sticky sopra la bottom nav */}
      {timer && (
        <div className="sticky bottom-fib4 z-10 mt-fib2">
          <div
            className={cn(
              "mx-auto flex max-w-md items-center justify-between gap-fib3 rounded-md border px-fib3 py-fib2 shadow-sm",
              timer.remaining === 0
                ? "border-vert bg-vert text-beton"
                : "border-ligne bg-surface"
            )}
          >
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wide opacity-80">
                {timer.remaining === 0 ? "Recupero finito" : "Recupero"}
              </span>
              <span className="metric text-2xl font-semibold tabular-nums">
                {mmss(timer.remaining)}
              </span>
            </div>
            <div className="flex items-center gap-fib1">
              <button
                type="button"
                onClick={() =>
                  setTimer((t) =>
                    t ? { ...t, remaining: t.remaining + 15 } : t
                  )
                }
                className="rounded-md border border-current/30 px-fib2 py-fib1 text-xs font-medium"
              >
                +15s
              </button>
              <button
                type="button"
                aria-label={timer.running ? "Pausa" : "Riprendi"}
                onClick={() =>
                  setTimer((t) =>
                    t
                      ? {
                          ...t,
                          running: t.remaining > 0 ? !t.running : false,
                        }
                      : t
                  )
                }
                className="flex size-8 items-center justify-center rounded-md border border-current/30"
              >
                {timer.running ? (
                  <Pause className="size-4" aria-hidden />
                ) : (
                  <Play className="size-4" aria-hidden />
                )}
              </button>
              <button
                type="button"
                aria-label="Riavvia recupero"
                onClick={() => startTimer(timer.total)}
                className="flex size-8 items-center justify-center rounded-md border border-current/30"
              >
                <RotateCcw className="size-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => setTimer(null)}
                className="rounded-md border border-current/30 px-fib2 py-fib1 text-xs font-medium"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
