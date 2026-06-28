"use client";

import { useActionState } from "react";
import { Sparkles } from "lucide-react";
import {
  generateNutritionPrompt,
  type PromptState,
} from "@/app/(app)/(tabs)/ai/actions";
import { Button } from "@/components/ui/button";
import { Segmented, ChipMulti, TextareaField } from "@/components/ai/fields";
import { PromptOutput } from "@/components/ai/prompt-output";
import {
  DIET,
  ALLERGIES,
  COOKING_TIME,
  BUDGET,
  MEALS_PER_DAY,
} from "@/lib/ai-plan";

export type NutritionDefaults = {
  diet: string | null;
  meals_per_day: number | null;
  allergies: string[];
  dislikes: string | null;
  preferences: string | null;
  cooking_time: string | null;
  budget: string | null;
  notes: string | null;
} | null;

export function NutritionIntake({ defaults }: { defaults: NutritionDefaults }) {
  const [state, action, pending] = useActionState<PromptState, FormData>(
    generateNutritionPrompt,
    {}
  );
  const dft = defaults;

  return (
    <div className="flex flex-col gap-fib5">
      <form action={action} className="flex flex-col gap-fib4">
        <Segmented
          legend="Regime alimentare"
          name="diet"
          cols="grid-cols-2 sm:grid-cols-3"
          options={DIET}
          defaultValue={dft?.diet}
          required
        />

        <Segmented
          legend="Pasti al giorno"
          name="meals_per_day"
          cols="grid-cols-4"
          options={MEALS_PER_DAY}
          defaultValue={dft?.meals_per_day ? String(dft.meals_per_day) : null}
          required
        />

        <ChipMulti
          legend="Allergie e intolleranze"
          hint="opzionale"
          name="allergies"
          options={ALLERGIES}
          defaultValues={dft?.allergies ?? []}
        />

        <TextareaField
          label="Alimenti da evitare"
          name="dislikes"
          defaultValue={dft?.dislikes}
          placeholder="Es. funghi, frattaglie, piccante…"
        />

        <TextareaField
          label="Alimenti o cucine preferite"
          name="preferences"
          defaultValue={dft?.preferences}
          placeholder="Es. cucina mediterranea, legumi, pesce azzurro…"
        />

        <Segmented
          legend="Tempo per cucinare"
          name="cooking_time"
          cols="grid-cols-3"
          options={COOKING_TIME}
          defaultValue={dft?.cooking_time}
          required
        />

        <Segmented
          legend="Budget"
          name="budget"
          cols="grid-cols-3"
          options={BUDGET}
          defaultValue={dft?.budget}
        />

        <TextareaField
          label="Note per il nutrizionista"
          name="notes"
          defaultValue={dft?.notes}
          placeholder="Es. salto la colazione, pranzo fuori casa…"
        />

        {state.error && (
          <p role="alert" className="text-sm text-rouge">
            {state.error}
          </p>
        )}

        <Button type="submit" disabled={pending} className="w-full gap-fib1">
          <Sparkles className="size-4" aria-hidden />
          {pending ? "Genero il prompt…" : "Salva e genera prompt"}
        </Button>
      </form>

      {state.prompt && <PromptOutput prompt={state.prompt} />}
    </div>
  );
}
