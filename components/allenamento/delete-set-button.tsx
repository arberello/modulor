"use client";

import { X } from "lucide-react";
import { deleteSet } from "@/app/(app)/(tabs)/allenamento/actions";

export function DeleteSetButton({
  id,
  sessionId,
}: {
  id: string;
  sessionId: string;
}) {
  return (
    <form action={deleteSet}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="session_id" value={sessionId} />
      <button
        type="submit"
        aria-label="Elimina set"
        className="rounded-sm p-fib1 text-encre-2 transition-colors hover:text-rouge focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rouge"
      >
        <X className="size-4" aria-hidden />
      </button>
    </form>
  );
}
