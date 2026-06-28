"use client";

import { Trash2 } from "lucide-react";
import { deletePlan } from "@/app/(app)/(tabs)/allenamento/actions";

export function DeletePlanButton({ id }: { id: string }) {
  return (
    <form
      action={deletePlan}
      onSubmit={(e) => {
        if (!confirm("Eliminare il piano e tutti i suoi allenamenti pianificati?"))
          e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="flex items-center gap-fib1 text-sm text-encre-2 transition-colors hover:text-rouge focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rouge"
      >
        <Trash2 className="size-4" aria-hidden />
        Elimina piano
      </button>
    </form>
  );
}
