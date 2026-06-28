"use client";

import { X } from "lucide-react";
import { deleteFoodLog } from "@/app/(app)/(tabs)/cibo/actions";

export function DeleteLogButton({ id }: { id: string }) {
  return (
    <form action={deleteFoodLog}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        aria-label="Rimuovi dal diario"
        className="rounded-sm p-fib1 text-encre-2 transition-colors hover:text-rouge focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rouge"
      >
        <X className="size-4" aria-hidden />
      </button>
    </form>
  );
}
