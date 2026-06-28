"use client";

import { useActionState, useEffect, useState } from "react";
import { Sliders } from "lucide-react";
import { saveTargets } from "@/app/(app)/(tabs)/cibo/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import type { Macros } from "@/lib/nutrition";

type Targets = {
  kcal: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
};

export function TargetsDrawer({
  current,
  suggestion,
}: {
  current: Targets;
  suggestion: Macros | null;
}) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(saveTargets, {});

  const initial = () => ({
    kcal: String(current.kcal ?? suggestion?.kcal ?? ""),
    protein_g: String(current.protein ?? suggestion?.protein ?? ""),
    carbs_g: String(current.carbs ?? suggestion?.carbs ?? ""),
    fat_g: String(current.fat ?? suggestion?.fat ?? ""),
  });
  const [vals, setVals] = useState(initial);

  useEffect(() => {
    // Chiude il drawer quando il salvataggio va a buon fine.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (state.ok) setOpen(false);
  }, [state.ok]);

  const set = (k: keyof ReturnType<typeof initial>, v: string) =>
    setVals((s) => ({ ...s, [k]: v }));

  const fields = [
    { k: "kcal" as const, label: "Kcal", unit: "kcal" },
    { k: "protein_g" as const, label: "Proteine", unit: "g" },
    { k: "carbs_g" as const, label: "Carboidrati", unit: "g" },
    { k: "fat_g" as const, label: "Grassi", unit: "g" },
  ];

  return (
    <Drawer
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) setVals(initial());
      }}
    >
      <DrawerTrigger asChild>
        <Button variant="outline" className="w-full gap-fib1">
          <Sliders className="size-4" aria-hidden />
          Modifica target
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader className="text-left">
            <DrawerTitle className="font-display">Target giornalieri</DrawerTitle>
            <DrawerDescription>
              Calcolati dal tuo TDEE e obiettivo, modificabili a mano.
            </DrawerDescription>
          </DrawerHeader>

          <form action={action} className="flex flex-col gap-fib3 px-fib4 pb-fib3">
            {suggestion && (
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  setVals({
                    kcal: String(suggestion.kcal),
                    protein_g: String(suggestion.protein),
                    carbs_g: String(suggestion.carbs),
                    fat_g: String(suggestion.fat),
                  })
                }
              >
                Calcola da TDEE ({suggestion.kcal} kcal)
              </Button>
            )}

            <div className="grid grid-cols-2 gap-fib3">
              {fields.map((f) => (
                <div key={f.k} className="flex flex-col gap-fib1">
                  <Label htmlFor={f.k}>
                    {f.label}
                    <span className="text-encre-2"> ({f.unit})</span>
                  </Label>
                  <Input
                    id={f.k}
                    name={f.k}
                    type="number"
                    inputMode="numeric"
                    min="0"
                    className="metric"
                    value={vals[f.k]}
                    onChange={(e) => set(f.k, e.target.value)}
                    required={f.k === "kcal"}
                  />
                </div>
              ))}
            </div>

            {state.error && (
              <p role="alert" className="text-sm text-rouge">
                {state.error}
              </p>
            )}

            <DrawerFooter className="px-0">
              <Button type="submit" disabled={pending}>
                {pending ? "Salvataggio…" : "Salva target"}
              </Button>
              <DrawerClose asChild>
                <Button type="button" variant="outline">
                  Annulla
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
