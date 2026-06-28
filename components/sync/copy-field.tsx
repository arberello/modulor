"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export function CopyField({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard non disponibile */
    }
  };

  return (
    <div className="flex flex-col gap-fib1">
      <span className="text-xs uppercase tracking-wide text-encre-2">
        {label}
      </span>
      <div className="flex items-stretch gap-fib2">
        <code
          className={cn(
            "flex-1 rounded-md border border-ligne bg-surface px-fib3 py-fib2 font-mono text-sm",
            multiline ? "whitespace-pre-wrap break-words" : "overflow-x-auto whitespace-nowrap"
          )}
        >
          {value}
        </code>
        <button
          type="button"
          onClick={copy}
          aria-label={`Copia ${label}`}
          className="shrink-0 rounded-md border border-ligne bg-surface px-fib3 text-encre-2 transition-colors hover:text-rouge focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rouge"
        >
          {copied ? (
            <Check className="size-4 text-vert" aria-hidden />
          ) : (
            <Copy className="size-4" aria-hidden />
          )}
        </button>
      </div>
    </div>
  );
}
