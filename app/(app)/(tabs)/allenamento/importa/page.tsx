import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, Sparkles } from "lucide-react";
import { PlanImport } from "@/components/allenamento/plan-import";

export const metadata: Metadata = { title: "Importa piano" };

export default function ImportaPianoPage() {
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
          Importa piano
        </h1>
        <p className="text-sm text-encre-2">
          Incolla il JSON del piano generato dall&apos;AI. Creo il programma con
          i suoi giorni e i suoi esercizi (anche quelli nuovi), poi da ogni
          giorno potrai avviare una sessione.
        </p>
      </div>

      <Link
        href="/ai/allenamento"
        className="flex items-center gap-fib2 rounded-md border border-ligne bg-surface p-fib3 text-sm transition-colors hover:border-encre-2"
      >
        <Sparkles className="size-4 shrink-0 text-rouge" aria-hidden />
        <span className="text-encre-2">
          Non hai ancora il JSON?{" "}
          <span className="font-medium text-encre">Genera il prompt</span> per il
          piano di allenamento.
        </span>
      </Link>

      <PlanImport />
    </div>
  );
}
