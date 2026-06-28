import type { Metadata } from "next";
import { PromptGenerator } from "@/components/ai/prompt-generator";

export const metadata: Metadata = { title: "AI" };

export default function AiPage() {
  return (
    <div className="flex flex-col gap-fib4 p-fib4">
      <div className="flex flex-col gap-fib2">
        <h1 className="font-display text-2xl font-semibold tracking-tight">AI</h1>
        <p className="text-sm text-encre-2">
          Genera uno snapshot dei tuoi dati (profilo, peso, nutrizione,
          allenamenti) da incollare in Claude per farti proporre un piano.
          Nessun dato lascia l&apos;app finché non lo incolli tu.
        </p>
      </div>
      <PromptGenerator />
    </div>
  );
}
