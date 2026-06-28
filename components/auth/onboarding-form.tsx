"use client";

import { useActionState } from "react";
import { saveOnboarding } from "@/app/(app)/onboarding/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const ACTIVITIES = [
  { v: "sedentary", l: "Sedentario" },
  { v: "light", l: "Leggero" },
  { v: "moderate", l: "Moderato" },
  { v: "active", l: "Attivo" },
  { v: "very_active", l: "Molto attivo" },
];

function Segmented({
  legend,
  name,
  options,
  cols,
}: {
  legend: string;
  name: string;
  options: { v: string; l: string }[];
  cols: string;
}) {
  return (
    <fieldset className="flex flex-col gap-fib2">
      <legend className="mb-fib1 text-sm font-medium">{legend}</legend>
      <div className={cn("grid gap-fib2", cols)}>
        {options.map((o) => (
          <label key={o.v} className="cursor-pointer">
            <input
              type="radio"
              name={name}
              value={o.v}
              required
              className="peer sr-only"
            />
            <span className="block rounded-md border border-ligne bg-surface px-fib2 py-fib2 text-center text-sm transition-colors peer-checked:border-rouge peer-checked:bg-rouge peer-checked:text-beton peer-focus-visible:ring-2 peer-focus-visible:ring-rouge peer-focus-visible:ring-offset-2">
              {o.l}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function OnboardingForm({ defaultName }: { defaultName: string }) {
  const [state, action, pending] = useActionState(saveOnboarding, {});

  return (
    <form action={action} className="flex flex-col gap-fib4">
      <div className="flex flex-col gap-fib1">
        <Label htmlFor="display_name">Nome</Label>
        <Input
          id="display_name"
          name="display_name"
          type="text"
          defaultValue={defaultName}
          placeholder="Come ti chiami"
        />
      </div>

      <Segmented
        legend="Sesso"
        name="sex"
        cols="grid-cols-2"
        options={[
          { v: "m", l: "Uomo" },
          { v: "f", l: "Donna" },
        ]}
      />

      <div className="grid grid-cols-1 gap-fib3 sm:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-fib1">
          <Label htmlFor="birth_date">Data di nascita</Label>
          <Input id="birth_date" name="birth_date" type="date" required />
        </div>
        <div className="flex min-w-0 flex-col gap-fib1">
          <Label htmlFor="height_cm">Altezza (cm)</Label>
          <Input
            id="height_cm"
            name="height_cm"
            type="number"
            inputMode="decimal"
            step="0.1"
            min="100"
            max="250"
            placeholder="175"
            className="metric"
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-fib1">
        <Label htmlFor="activity_level">Livello di attività</Label>
        <select
          id="activity_level"
          name="activity_level"
          required
          defaultValue=""
          className="h-9 rounded-md border border-ligne bg-surface px-fib3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-rouge"
        >
          <option value="" disabled>
            Scegli…
          </option>
          {ACTIVITIES.map((a) => (
            <option key={a.v} value={a.v}>
              {a.l}
            </option>
          ))}
        </select>
      </div>

      <Segmented
        legend="Obiettivo"
        name="goal"
        cols="grid-cols-3"
        options={[
          { v: "cut", l: "Definizione" },
          { v: "maintain", l: "Mantieni" },
          { v: "bulk", l: "Massa" },
        ]}
      />

      {state.error && (
        <p role="alert" className="text-sm text-rouge">
          {state.error}
        </p>
      )}

      <Button type="submit" className="mt-fib2 w-full" disabled={pending}>
        {pending ? "Salvataggio…" : "Salva e inizia"}
      </Button>
    </form>
  );
}
