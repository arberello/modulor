"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { addMeasurement } from "@/app/(app)/(tabs)/actions";
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

function nowLocal() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function NumField({
  id,
  name,
  label,
  unit,
  step = "0.1",
  required = false,
  placeholder,
}: {
  id: string;
  name: string;
  label: string;
  unit?: string;
  step?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-fib1">
      <Label htmlFor={id}>
        {label}
        {unit ? <span className="text-encre-2"> ({unit})</span> : null}
      </Label>
      <Input
        id={id}
        name={name}
        type="number"
        inputMode="decimal"
        step={step}
        min="0"
        required={required}
        placeholder={placeholder}
        className="metric"
      />
    </div>
  );
}

export function AddMeasurementDrawer() {
  const [open, setOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [state, action, pending] = useActionState(addMeasurement, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // Chiude e resetta il form al salvataggio riuscito.
    /* eslint-disable react-hooks/set-state-in-effect */
    if (state.ok) {
      setOpen(false);
      formRef.current?.reset();
      setShowMore(false);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [state.ok]);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button className="w-full gap-fib1">
          <Plus className="size-4" aria-hidden />
          Aggiungi misurazione
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-md overflow-y-auto">
          <DrawerHeader className="text-left">
            <DrawerTitle className="font-display">Nuova misurazione</DrawerTitle>
            <DrawerDescription>
              Inserisci almeno il peso. Gli altri campi sono opzionali.
            </DrawerDescription>
          </DrawerHeader>

          <form
            ref={formRef}
            action={action}
            className="flex flex-col gap-fib3 px-fib4 pb-fib3"
          >
            <div className="flex flex-col gap-fib1">
              <Label htmlFor="measured_at">Data e ora</Label>
              <Input
                id="measured_at"
                name="measured_at"
                type="datetime-local"
                defaultValue={nowLocal()}
                className="metric"
              />
            </div>

            <NumField
              id="weight_kg"
              name="weight_kg"
              label="Peso"
              unit="kg"
              required
              placeholder="80.0"
            />

            <div className="grid grid-cols-2 gap-fib3">
              <NumField id="body_fat_pct" name="body_fat_pct" label="Grasso" unit="%" />
              <NumField
                id="muscle_mass_kg"
                name="muscle_mass_kg"
                label="Massa magra"
                unit="kg"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowMore((v) => !v)}
              className="self-start text-sm text-encre-2 underline-offset-2 hover:underline"
            >
              {showMore ? "Meno campi" : "Altri campi"}
            </button>

            {showMore && (
              <div className="grid grid-cols-2 gap-fib3">
                <NumField id="water_pct" name="water_pct" label="Acqua" unit="%" />
                <NumField
                  id="bone_mass_kg"
                  name="bone_mass_kg"
                  label="Massa ossea"
                  unit="kg"
                />
                <NumField
                  id="visceral_fat"
                  name="visceral_fat"
                  label="Grasso visc."
                  step="1"
                />
                <NumField
                  id="bmr_kcal"
                  name="bmr_kcal"
                  label="BMR"
                  unit="kcal"
                  step="1"
                />
              </div>
            )}

            {state.error && (
              <p role="alert" className="text-sm text-rouge">
                {state.error}
              </p>
            )}

            <DrawerFooter className="px-0">
              <Button type="submit" disabled={pending}>
                {pending ? "Salvataggio…" : "Salva misurazione"}
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
