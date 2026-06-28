"use client";

import { useActionState } from "react";
import { Download } from "lucide-react";
import {
  importTrainingPlan,
  type ImportPlanState,
} from "@/app/(app)/(tabs)/allenamento/actions";
import { Button } from "@/components/ui/button";

export function PlanImport() {
  const [state, action, pending] = useActionState<ImportPlanState, FormData>(
    importTrainingPlan,
    {}
  );

  return (
    <form action={action} className="flex flex-col gap-fib3">
      <div className="flex flex-col gap-fib1">
        <label htmlFor="json" className="text-sm font-medium">
          JSON del piano
        </label>
        <textarea
          id="json"
          name="json"
          rows={12}
          required
          placeholder='Incolla qui il JSON generato da Claude (inizia con { "plan": … })'
          className="w-full rounded-md border border-ligne bg-surface px-fib3 py-fib2 font-mono text-xs leading-relaxed outline-none transition-colors placeholder:text-encre-2 focus-visible:ring-2 focus-visible:ring-rouge"
        />
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-rouge">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full gap-fib1">
        <Download className="size-4" aria-hidden />
        {pending ? "Importo…" : "Importa piano"}
      </Button>
    </form>
  );
}
