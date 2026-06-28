"use client";

import { useActionState, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { addSet, createExercise } from "@/app/(app)/(tabs)/allenamento/actions";
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

type Ex = {
  id: string;
  name: string;
  muscle_group: string | null;
  type: string | null;
};

const TYPE_GROUPS: { key: string; label: string }[] = [
  { key: "strength", label: "Pesi" },
  { key: "calisthenics", label: "Corpo libero" },
  { key: "cardio", label: "Cardio" },
  { key: "other", label: "Altro" },
];

export function AddSetDrawer({
  sessionId,
  exercises,
}: {
  sessionId: string;
  exercises: Ex[];
}) {
  const [open, setOpen] = useState(false);
  const [list, setList] = useState<Ex[]>(exercises);
  const [exerciseId, setExerciseId] = useState("");
  const [vals, setVals] = useState({ reps: "", weight_kg: "", rpe: "", rest_s: "" });
  const [added, setAdded] = useState(0);

  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("strength");
  const [createErr, setCreateErr] = useState<string | null>(null);
  const [createPending, setCreatePending] = useState(false);

  const [state, action, pending] = useActionState(addSet, {});

  useEffect(() => {
    // Su ogni salvataggio riuscito: pulisci i numeri, tieni l'esercizio.
    /* eslint-disable react-hooks/set-state-in-effect */
    if (state.ok) {
      setVals({ reps: "", weight_kg: "", rpe: "", rest_s: "" });
      setAdded((n) => n + 1);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [state]);

  const set = (k: keyof typeof vals, v: string) =>
    setVals((s) => ({ ...s, [k]: v }));

  async function handleCreate() {
    setCreateErr(null);
    setCreatePending(true);
    const res = await createExercise(newName, "", newType);
    setCreatePending(false);
    if (res.error || !res.exercise) {
      setCreateErr(res.error ?? "Errore");
      return;
    }
    setList((l) => [...l, res.exercise!]);
    setExerciseId(res.exercise.id);
    setNewName("");
    setCreating(false);
  }

  const grouped = TYPE_GROUPS.map((g) => ({
    ...g,
    items: list.filter((e) =>
      g.key === "other" ? !["strength", "calisthenics", "cardio"].includes(e.type ?? "") : e.type === g.key
    ),
  })).filter((g) => g.items.length > 0);

  return (
    <Drawer
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) setAdded(0);
      }}
    >
      <DrawerTrigger asChild>
        <Button className="w-full gap-fib1">
          <Plus className="size-4" aria-hidden />
          Aggiungi set
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-md overflow-y-auto">
          <DrawerHeader className="text-left">
            <DrawerTitle className="font-display">Aggiungi set</DrawerTitle>
            <DrawerDescription>
              Scegli l&apos;esercizio e registra il set. Resta aperto per
              aggiungerne altri.
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex flex-col gap-fib3 px-fib4 pb-fib3">
            <div className="flex flex-col gap-fib1">
              <Label htmlFor="exercise_select">Esercizio</Label>
              <select
                id="exercise_select"
                value={exerciseId}
                onChange={(e) => setExerciseId(e.target.value)}
                className="h-9 rounded-md border border-ligne bg-surface px-fib3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-rouge"
              >
                <option value="" disabled>
                  Scegli…
                </option>
                {grouped.map((g) => (
                  <optgroup key={g.key} label={g.label}>
                    {g.items.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              {!creating ? (
                <button
                  type="button"
                  onClick={() => setCreating(true)}
                  className="self-start text-xs text-encre-2 underline-offset-2 hover:underline"
                >
                  + Nuovo esercizio
                </button>
              ) : (
                <div className="mt-fib1 flex flex-col gap-fib2 rounded-md border border-ligne bg-beton p-fib2">
                  <Input
                    placeholder="Nome esercizio"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="h-9 rounded-md border border-ligne bg-surface px-fib3 text-sm"
                  >
                    <option value="strength">Pesi</option>
                    <option value="calisthenics">Corpo libero</option>
                    <option value="cardio">Cardio</option>
                  </select>
                  {createErr && (
                    <p className="text-xs text-rouge">{createErr}</p>
                  )}
                  <div className="flex gap-fib2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleCreate}
                      disabled={createPending || !newName.trim()}
                    >
                      {createPending ? "Creo…" : "Crea"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setCreating(false)}
                    >
                      Annulla
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <form action={action} className="flex flex-col gap-fib3">
              <input type="hidden" name="session_id" value={sessionId} />
              <input type="hidden" name="exercise_id" value={exerciseId} />

              <div className="grid grid-cols-2 gap-fib3">
                <div className="flex flex-col gap-fib1">
                  <Label htmlFor="reps">Ripetizioni</Label>
                  <Input
                    id="reps"
                    name="reps"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    className="metric"
                    value={vals.reps}
                    onChange={(e) => set("reps", e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-fib1">
                  <Label htmlFor="weight_kg">Peso (kg)</Label>
                  <Input
                    id="weight_kg"
                    name="weight_kg"
                    type="number"
                    inputMode="decimal"
                    step="0.5"
                    min="0"
                    className="metric"
                    value={vals.weight_kg}
                    onChange={(e) => set("weight_kg", e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-fib1">
                  <Label htmlFor="rpe">RPE</Label>
                  <Input
                    id="rpe"
                    name="rpe"
                    type="number"
                    inputMode="decimal"
                    step="0.5"
                    min="0"
                    max="10"
                    className="metric"
                    value={vals.rpe}
                    onChange={(e) => set("rpe", e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-fib1">
                  <Label htmlFor="rest_s">Recupero (s)</Label>
                  <Input
                    id="rest_s"
                    name="rest_s"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    className="metric"
                    value={vals.rest_s}
                    onChange={(e) => set("rest_s", e.target.value)}
                  />
                </div>
              </div>

              {state.error && (
                <p role="alert" className="text-sm text-rouge">
                  {state.error}
                </p>
              )}
              {added > 0 && !state.error && (
                <p className="text-sm text-vert">
                  {added} set aggiunti in questa sessione.
                </p>
              )}

              <DrawerFooter className="px-0">
                <Button type="submit" disabled={pending || !exerciseId}>
                  {pending ? "Aggiungo…" : "Aggiungi set"}
                </Button>
                <DrawerClose asChild>
                  <Button type="button" variant="outline">
                    Fine
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </form>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
