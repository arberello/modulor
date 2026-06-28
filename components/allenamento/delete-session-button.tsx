"use client";

import { Trash2 } from "lucide-react";
import { deleteSession } from "@/app/(app)/(tabs)/allenamento/actions";

export function DeleteSessionButton({ id }: { id: string }) {
  return (
    <form
      action={deleteSession}
      onSubmit={(e) => {
        if (!confirm("Eliminare la sessione e tutti i suoi set?"))
          e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="flex items-center gap-fib1 text-sm text-encre-2 transition-colors hover:text-rouge focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rouge"
      >
        <Trash2 className="size-4" aria-hidden />
        Elimina sessione
      </button>
    </form>
  );
}
