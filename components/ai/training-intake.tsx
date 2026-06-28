"use client";

import { useActionState } from "react";
import { Sparkles } from "lucide-react";
import {
  generateTrainingPrompt,
  type PromptState,
} from "@/app/(app)/(tabs)/ai/actions";
import { Button } from "@/components/ui/button";
import { Segmented, ChipMulti, TextareaField } from "@/components/ai/fields";
import { PromptOutput } from "@/components/ai/prompt-output";
import {
  EXPERIENCE,
  TRAINING_GOAL,
  FOCUS_MUSCLES,
  INTENSITY,
  EQUIPMENT,
  TRAINING_STYLE,
  SESSION_MINUTES,
  DAYS_PER_WEEK,
} from "@/lib/ai-plan";

export type TrainingDefaults = {
  experience: string | null;
  training_goal: string | null;
  focus_muscles: string[];
  days_per_week: number | null;
  session_minutes: number | null;
  intensity: string | null;
  equipment: string[];
  training_style: string | null;
  limitations: string | null;
  notes: string | null;
} | null;

export function TrainingIntake({ defaults }: { defaults: TrainingDefaults }) {
  const [state, action, pending] = useActionState<PromptState, FormData>(
    generateTrainingPrompt,
    {}
  );
  const dft = defaults;

  return (
    <div className="flex flex-col gap-fib5">
      <form action={action} className="flex flex-col gap-fib4">
        <Segmented
          legend="Esperienza"
          name="experience"
          cols="grid-cols-3"
          options={EXPERIENCE}
          defaultValue={dft?.experience}
          required
        />

        <Segmented
          legend="Obiettivo dell'allenamento"
          name="training_goal"
          cols="grid-cols-2 sm:grid-cols-3"
          options={TRAINING_GOAL}
          defaultValue={dft?.training_goal}
          required
        />

        <ChipMulti
          legend="Zone muscolari in focus"
          hint="opzionale, scegline una o più"
          name="focus_muscles"
          options={FOCUS_MUSCLES}
          defaultValues={dft?.focus_muscles ?? []}
        />

        <Segmented
          legend="Giorni a settimana"
          name="days_per_week"
          cols="grid-cols-5"
          options={DAYS_PER_WEEK}
          defaultValue={dft?.days_per_week ? String(dft.days_per_week) : null}
          required
        />

        <Segmented
          legend="Durata per sessione"
          name="session_minutes"
          cols="grid-cols-5"
          options={SESSION_MINUTES}
          defaultValue={
            dft?.session_minutes ? String(dft.session_minutes) : null
          }
          required
        />

        <Segmented
          legend="Intensità desiderata"
          name="intensity"
          cols="grid-cols-3"
          options={INTENSITY}
          defaultValue={dft?.intensity}
          required
        />

        <ChipMulti
          legend="Attrezzatura disponibile"
          name="equipment"
          options={EQUIPMENT}
          defaultValues={dft?.equipment ?? []}
        />

        <Segmented
          legend="Struttura preferita"
          name="training_style"
          cols="grid-cols-2 sm:grid-cols-3"
          options={TRAINING_STYLE}
          defaultValue={dft?.training_style ?? "auto"}
        />

        <TextareaField
          label="Limitazioni o infortuni"
          name="limitations"
          defaultValue={dft?.limitations}
          placeholder="Es. fastidio alla spalla destra, ernia lombare…"
        />

        <TextareaField
          label="Note per il coach"
          name="notes"
          defaultValue={dft?.notes}
          placeholder="Es. preferisco esercizi multiarticolari, poco cardio…"
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
