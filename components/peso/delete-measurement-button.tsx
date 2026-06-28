"use client";

import { Trash2 } from "lucide-react";
import { deleteMeasurement } from "@/app/(app)/(tabs)/actions";

export function DeleteMeasurementButton({ id }: { id: string }) {
  return (
    <form
      action={deleteMeasurement}
      onSubmit={(e) => {
        if (!confirm("Eliminare questa misurazione?")) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        aria-label="Elimina misurazione"
        className="rounded-sm p-fib1 text-encre-2 transition-colors hover:text-rouge focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rouge"
      >
        <Trash2 className="size-4" aria-hidden />
      </button>
    </form>
  );
}
