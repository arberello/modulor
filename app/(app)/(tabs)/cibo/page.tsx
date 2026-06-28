import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { dayRangeInTZ } from "@/lib/date";
import {
  addMacros,
  autoTargets,
  emptyMacros,
  macrosForQuantity,
  MEAL_LABELS,
  type Macros,
  type Meal,
} from "@/lib/nutrition";
import {
  ageFromBirthDate,
  bmrMifflinStJeor,
  tdee as calcTdee,
  type ActivityLevel,
  type Sex,
} from "@/lib/health";
import { Button } from "@/components/ui/button";
import { MacroBar } from "@/components/cibo/macro-bar";
import { TargetsDrawer } from "@/components/cibo/targets-drawer";
import { DeleteLogButton } from "@/components/cibo/delete-log-button";

const MEAL_ORDER: Meal[] = ["breakfast", "lunch", "dinner", "snack"];

export default async function CiboPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: targets }, { data: lastW }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("sex, birth_date, height_cm, goal, activity_level")
        .eq("id", user!.id)
        .single(),
      supabase
        .from("nutrition_targets")
        .select("kcal, protein_g, carbs_g, fat_g")
        .eq("user_id", user!.id)
        .maybeSingle(),
      supabase
        .from("body_measurements")
        .select("weight_kg")
        .order("measured_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  // Log di oggi (giorno locale Europe/Rome).
  const { start, end } = dayRangeInTZ();
  const { data: logs } = await supabase
    .from("food_logs")
    .select("id, meal, quantity_g, logged_at, food_id")
    .gte("logged_at", start)
    .lt("logged_at", end)
    .order("logged_at", { ascending: true });

  const foodIds = [...new Set((logs ?? []).map((l) => l.food_id))];
  const { data: foods } = foodIds.length
    ? await supabase
        .from("foods")
        .select(
          "id, name, brand, kcal_per_100, protein_per_100, carbs_per_100, fat_per_100"
        )
        .in("id", foodIds)
    : { data: [] };
  const foodMap = new Map((foods ?? []).map((f) => [f.id, f]));

  // Totali + raggruppamento per pasto.
  let consumed = emptyMacros();
  const byMeal = new Map<
    Meal,
    { items: { id: string; name: string; grams: number; macros: Macros }[]; subtotal: Macros }
  >();
  for (const log of logs ?? []) {
    const f = foodMap.get(log.food_id);
    if (!f) continue;
    const grams = Number(log.quantity_g);
    const m = macrosForQuantity(f, grams);
    consumed = addMacros(consumed, m);
    const meal = log.meal as Meal;
    if (!byMeal.has(meal)) byMeal.set(meal, { items: [], subtotal: emptyMacros() });
    const bucket = byMeal.get(meal)!;
    bucket.items.push({ id: log.id, name: f.name, grams, macros: m });
    bucket.subtotal = addMacros(bucket.subtotal, m);
  }

  // Suggerimento target da TDEE.
  const weightNow = lastW ? Number(lastW.weight_kg) : null;
  let suggestion: Macros | null = null;
  if (
    weightNow &&
    profile?.height_cm &&
    profile.sex &&
    profile.birth_date &&
    profile.activity_level &&
    profile.goal
  ) {
    const age = ageFromBirthDate(profile.birth_date);
    const bmr = bmrMifflinStJeor(
      profile.sex as Sex,
      weightNow,
      Number(profile.height_cm),
      age
    );
    const t = calcTdee(bmr, profile.activity_level as ActivityLevel);
    suggestion = autoTargets(t, profile.goal as "cut" | "bulk" | "maintain", weightNow);
  }

  const kcalTarget = targets?.kcal ?? null;
  const kcalPct =
    kcalTarget && kcalTarget > 0
      ? Math.min(100, (consumed.kcal / kcalTarget) * 100)
      : 0;
  const hasLogs = (logs ?? []).length > 0;

  return (
    <div className="flex flex-col gap-fib4 p-fib4">
      {/* Color-blocking: piano blu della giornata nutrizione */}
      <header className="flex flex-col gap-fib2 rounded-md bg-bleu p-fib4 text-beton">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm/none opacity-80">Oggi</p>
            <p className="metric text-4xl font-semibold leading-none">
              {Math.round(consumed.kcal)}
              <span className="ml-1 text-lg font-normal opacity-80">
                {kcalTarget ? `/ ${Math.round(kcalTarget)}` : ""} kcal
              </span>
            </p>
          </div>
          <span className="metric text-sm opacity-90">
            {kcalTarget
              ? `${Math.max(0, Math.round(kcalTarget - consumed.kcal))} rimaste`
              : "nessun target"}
          </span>
        </div>
        <div className="h-fib1 overflow-hidden rounded-full bg-beton/25">
          <div
            className="h-full rounded-full bg-beton"
            style={{ width: `${kcalPct}%` }}
          />
        </div>
      </header>

      <section className="flex flex-col gap-fib3 rounded-md border border-ligne bg-surface p-fib3">
        <MacroBar
          label="Proteine"
          consumed={consumed.protein}
          target={targets?.protein_g ?? null}
          unit="g"
          color="bleu"
        />
        <MacroBar
          label="Carboidrati"
          consumed={consumed.carbs}
          target={targets?.carbs_g ?? null}
          unit="g"
          color="ocre"
        />
        <MacroBar
          label="Grassi"
          consumed={consumed.fat}
          target={targets?.fat_g ?? null}
          unit="g"
          color="vert"
        />
      </section>

      <div className="flex flex-col gap-fib2">
        <Button asChild className="w-full gap-fib1">
          <Link href="/cibo/cerca">
            <Plus className="size-4" aria-hidden />
            Aggiungi pasto
          </Link>
        </Button>
        <TargetsDrawer
          current={{
            kcal: targets?.kcal ?? null,
            protein: targets?.protein_g ?? null,
            carbs: targets?.carbs_g ?? null,
            fat: targets?.fat_g ?? null,
          }}
          suggestion={suggestion}
        />
      </div>

      {hasLogs ? (
        <section className="flex flex-col gap-fib3">
          {MEAL_ORDER.filter((m) => byMeal.has(m)).map((meal) => {
            const bucket = byMeal.get(meal)!;
            return (
              <div key={meal} className="flex flex-col gap-fib1">
                <div className="flex items-baseline justify-between">
                  <h2 className="font-display text-base font-medium">
                    {MEAL_LABELS[meal]}
                  </h2>
                  <span className="metric text-sm text-encre-2">
                    {Math.round(bucket.subtotal.kcal)} kcal
                  </span>
                </div>
                <ul className="flex flex-col divide-y divide-ligne overflow-hidden rounded-md border border-ligne bg-surface">
                  {bucket.items.map((it) => (
                    <li
                      key={it.id}
                      className="flex items-center justify-between gap-fib3 px-fib3 py-fib2"
                    >
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-sm">{it.name}</span>
                        <span className="metric text-xs text-encre-2">
                          {Math.round(it.grams)} g · {Math.round(it.macros.kcal)}{" "}
                          kcal
                        </span>
                      </div>
                      <DeleteLogButton id={it.id} />
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </section>
      ) : (
        <div className="rounded-md border border-dashed border-ligne bg-surface p-fib6 text-center text-sm text-encre-2">
          Nessun pasto registrato oggi — aggiungi il primo alimento.
        </div>
      )}
    </div>
  );
}
