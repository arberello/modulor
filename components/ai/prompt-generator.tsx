"use client";

import { useState } from "react";
import { Check, Copy, Sparkles } from "lucide-react";
import { generateAiPrompt } from "@/app/(app)/(tabs)/ai/actions";
import { Button } from "@/components/ui/button";

export function PromptGenerator() {
  const [prompt, setPrompt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await generateAiPrompt();
      if (res.error) setError(res.error);
      else setPrompt(res.prompt ?? "");
    } catch {
      setError("Generazione non riuscita. Riprova.");
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    if (!prompt) return;
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard non disponibile */
    }
  }

  return (
    <div className="flex flex-col gap-fib3">
      <Button onClick={generate} disabled={loading} className="w-full gap-fib1">
        <Sparkles className="size-4" aria-hidden />
        {loading ? "Genero…" : "Genera prompt"}
      </Button>

      {error && (
        <p role="alert" className="text-sm text-rouge">
          {error}
        </p>
      )}

      {prompt && (
        <div className="flex flex-col gap-fib2">
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={copy}
              className="gap-fib1"
            >
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
      )}
    </div>
  );
}
