"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { deleteSession } from "@/app/(app)/(tabs)/allenamento/actions";

function Inner() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="flex items-center gap-fib1 text-sm text-encre-2 transition-colors hover:text-rouge focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rouge disabled:opacity-60"
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" aria-hidden />
      ) : (
        <Trash2 className="size-4" aria-hidden />
      )}
      {pending ? "Elimino…" : "Elimina sessione"}
    </button>
  );
}

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
      <Inner />
    </form>
  );
}
