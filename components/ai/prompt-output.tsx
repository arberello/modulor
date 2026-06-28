"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Blocco di output del prompt generato, con pulsante "Copia". */
export function PromptOutput({ prompt }: { prompt: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard non disponibile */
    }
  }

  return (
    <div className="flex flex-col gap-fib2">
      <div className="flex items-center justify-between">
        <p className="text-sm text-encre-2">
          Incolla questo prompt in Claude per ricevere il piano.
        </p>
        <Button variant="outline" size="sm" onClick={copy} className="gap-fib1">
          {copied ? (
            <Check className="size-4 text-vert" aria-hidden />
          ) : (
            <Copy className="size-4" aria-hidden />
          )}
          {copied ? "Copiato" : "Copia"}
        </Button>
      </div>
      <pre className="max-h-[60vh] overflow-auto whitespace-pre-wrap rounded-md border border-ligne bg-surface p-fib3 font-mono text-xs leading-relaxed text-encre">
        {prompt}
      </pre>
    </div>
  );
}
