"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Loader2, Search } from "lucide-react";
import type { OffFood } from "@/lib/openfoodfacts";
import { logFood } from "@/app/(app)/(tabs)/cibo/actions";
import {
  MEALS,
  MEAL_LABELS,
  macrosForQuantity,
  type Meal,
} from "@/lib/nutrition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { BarcodeScanner } from "@/components/cibo/barcode-scanner";

function defaultMeal(): Meal {
  const h = new Date().getHours();
  if (h < 11) return "breakfast";
  if (h < 15) return "lunch";
  if (h < 18) return "snack";
  return "dinner";
}

function FoodRow({ food, onPick }: { food: OffFood; onPick: () => void }) {
  return (
    <button
      type="button"
      onClick={onPick}
      className="flex w-full items-center justify-between gap-fib3 px-fib3 py-fib2 text-left transition-colors hover:bg-beton"
    >
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-medium">{food.name}</span>
        {food.brand && (
          <span className="truncate text-xs text-encre-2">{food.brand}</span>
        )}
      </span>
      <span className="metric shrink-0 text-sm text-encre-2">
        {Math.round(food.kcal_per_100)} kcal
      </span>
    </button>
  );
}

function LogForm({ food, onBack }: { food: OffFood; onBack: () => void }) {
  const [state, action, pending] = useActionState(logFood, {});
  const [grams, setGrams] = useState("100");
  const [meal, setMeal] = useState<Meal>(defaultMeal());

  const g = Number(grams.replace(",", ".")) || 0;
  const m = macrosForQuantity(food, g);

  return (
    <div className="flex flex-col gap-fib3">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-fib1 self-start text-sm text-encre-2 hover:text-encre"
      >
        <ChevronLeft className="size-4" aria-hidden />
        Risultati
      </button>

      <div className="flex flex-col gap-fib1 rounded-md border border-ligne bg-surface p-fib3">
        <span className="font-medium">{food.name}</span>
        {food.brand && (
          <span className="text-xs text-encre-2">{food.brand}</span>
        )}
        <span className="metric mt-fib1 text-xs text-encre-2">
          per 100 g · {Math.round(food.kcal_per_100)} kcal · P{" "}
          {food.protein_per_100} · C {food.carbs_per_100} · G {food.fat_per_100}
        </span>
      </div>

      <form action={action} className="flex flex-col gap-fib3">
        <input type="hidden" name="off_barcode" value={food.off_barcode ?? ""} />
        <input type="hidden" name="name" value={food.name} />
        <input type="hidden" name="brand" value={food.brand ?? ""} />
        <input type="hidden" name="kcal_per_100" value={food.kcal_per_100} />
        <input type="hidden" name="protein_per_100" value={food.protein_per_100} />
        <input type="hidden" name="carbs_per_100" value={food.carbs_per_100} />
        <input type="hidden" name="fat_per_100" value={food.fat_per_100} />
        <input
          type="hidden"
          name="fiber_per_100"
          value={food.fiber_per_100 ?? ""}
        />

        <div className="flex flex-col gap-fib1">
          <Label htmlFor="quantity_g">Quantità (g)</Label>
          <Input
            id="quantity_g"
            name="quantity_g"
            type="number"
            inputMode="decimal"
            step="1"
            min="1"
            className="metric"
            value={grams}
            onChange={(e) => setGrams(e.target.value)}
            required
          />
        </div>

        <fieldset className="flex flex-col gap-fib2">
          <legend className="mb-fib1 text-sm font-medium">Pasto</legend>
          <input type="hidden" name="meal" value={meal} />
          <div className="grid grid-cols-2 gap-fib2">
            {MEALS.map((mk) => (
              <button
                key={mk}
                type="button"
                onClick={() => setMeal(mk)}
                className={cn(
                  "rounded-md border px-fib2 py-fib2 text-sm transition-colors",
                  meal === mk
                    ? "border-rouge bg-rouge text-beton"
                    : "border-ligne bg-surface text-encre hover:border-encre-2"
                )}
              >
                {MEAL_LABELS[mk]}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="flex items-center justify-between rounded-md bg-bleu p-fib3 text-beton">
          <span className="text-sm opacity-80">Totale</span>
          <span className="metric text-lg font-semibold">
            {Math.round(m.kcal)} kcal
          </span>
        </div>

        {state.error && (
          <p role="alert" className="text-sm text-rouge">
            {state.error}
          </p>
        )}

        <Button type="submit" disabled={pending || g <= 0}>
          {pending ? "Aggiunta…" : "Aggiungi al diario"}
        </Button>
      </form>
    </div>
  );
}

export function FoodSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<OffFood[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<OffFood | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Ricerca testuale con debounce.
  useEffect(() => {
    const q = query.trim();
    const id = setTimeout(async () => {
      if (q.length < 2) {
        setResults([]);
        setError(null);
        return;
      }
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/foods/search?q=${encodeURIComponent(q)}`, {
          signal: ctrl.signal,
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setResults(data.results ?? []);
      } catch (e) {
        if ((e as Error).name !== "AbortError")
          setError("Ricerca non riuscita. Riprova.");
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(id);
  }, [query]);

  async function lookupBarcode(code: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/foods/barcode?code=${encodeURIComponent(code)}`
      );
      const data = await res.json();
      if (data.product) {
        setSelected(data.product as OffFood);
      } else {
        setError("Prodotto non trovato per questo barcode.");
      }
    } catch {
      setError("Lettura barcode non riuscita.");
    } finally {
      setLoading(false);
    }
  }

  if (selected) {
    return <LogForm food={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div className="flex flex-col gap-fib3">
      <div className="flex items-center gap-fib2">
        <Link
          href="/cibo"
          className="flex items-center gap-fib1 text-sm text-encre-2 hover:text-encre"
        >
          <ChevronLeft className="size-4" aria-hidden />
          Diario
        </Link>
      </div>

      <div className="flex flex-col gap-fib2">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-fib2 top-1/2 size-4 -translate-y-1/2 text-encre-2"
            aria-hidden
          />
          <Input
            type="search"
            inputMode="search"
            placeholder="Cerca un alimento…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-fib5"
            autoFocus
          />
        </div>
        <BarcodeScanner onDetected={(code) => lookupBarcode(code)} />
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-fib2 py-fib4 text-sm text-encre-2">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Cerco…
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-rouge">
          {error}
        </p>
      )}

      {!loading && results.length > 0 && (
        <ul className="flex flex-col divide-y divide-ligne overflow-hidden rounded-md border border-ligne bg-surface">
          {results.map((food, i) => (
            <li key={food.off_barcode ?? `${food.name}-${i}`}>
              <FoodRow food={food} onPick={() => setSelected(food)} />
            </li>
          ))}
        </ul>
      )}

      {!loading && query.trim().length >= 2 && results.length === 0 && !error && (
        <p className="py-fib4 text-center text-sm text-encre-2">
          Nessun risultato. Prova con un altro nome o il barcode.
        </p>
      )}
    </div>
  );
}
