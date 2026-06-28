"use client";

import { cn } from "@/lib/utils";
import type { Option } from "@/lib/ai-plan";

/** Selettore singolo a pulsanti (radio) — stile Modulor. */
export function Segmented({
  legend,
  name,
  options,
  cols,
  defaultValue,
  required,
}: {
  legend: string;
  name: string;
  options: Option[];
  cols: string;
  defaultValue?: string | null;
  required?: boolean;
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
              defaultChecked={defaultValue === o.v}
              required={required}
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

/** Selettore multiplo a chip (checkbox) — invia più valori con lo stesso name. */
export function ChipMulti({
  legend,
  name,
  options,
  defaultValues = [],
  hint,
}: {
  legend: string;
  name: string;
  options: Option[];
  defaultValues?: string[];
  hint?: string;
}) {
  return (
    <fieldset className="flex flex-col gap-fib2">
      <legend className="mb-fib1 text-sm font-medium">
        {legend}
        {hint && <span className="ml-fib1 text-encre-2">· {hint}</span>}
      </legend>
      <div className="flex flex-wrap gap-fib2">
        {options.map((o) => (
          <label key={o.v} className="cursor-pointer">
            <input
              type="checkbox"
              name={name}
              value={o.v}
              defaultChecked={defaultValues.includes(o.v)}
              className="peer sr-only"
            />
            <span className="block rounded-md border border-ligne bg-surface px-fib3 py-fib2 text-sm transition-colors peer-checked:border-rouge peer-checked:bg-rouge peer-checked:text-beton peer-focus-visible:ring-2 peer-focus-visible:ring-rouge peer-focus-visible:ring-offset-2">
              {o.l}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Area di testo con label, coerente con gli Input del progetto. */
export function TextareaField({
  label,
  name,
  defaultValue,
  placeholder,
  rows = 2,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div className="flex flex-col gap-fib1">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className="w-full rounded-md border border-ligne bg-surface px-fib3 py-fib2 text-sm outline-none transition-colors placeholder:text-encre-2 focus-visible:ring-2 focus-visible:ring-rouge"
      />
    </div>
  );
}
