import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ModulorBar } from "@/components/modulor-bar";
import { AddMeasurementDrawer } from "@/components/peso/add-measurement-drawer";
import {
  WeightTrendChart,
  type TrendPoint,
} from "@/components/peso/weight-trend-chart";
import { DeleteMeasurementButton } from "@/components/peso/delete-measurement-button";
import {
  ageFromBirthDate,
  bmi as calcBmi,
  bmiCategory,
  bmrMifflinStJeor,
  tdee as calcTdee,
  GOAL_LABELS,
  type Sex,
  type ActivityLevel,
} from "@/lib/health";

const dateFmt = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function StatTile({
  label,
  value,
  sub,
  accent = "encre",
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: "rouge" | "bleu" | "ocre" | "vert" | "encre";
}) {
  const accentClass = {
    rouge: "text-rouge",
    bleu: "text-bleu",
    ocre: "text-ocre",
    vert: "text-vert",
    encre: "text-encre",
  }[accent];
  return (
    <div className="flex flex-col gap-fib1 rounded-md border border-ligne bg-surface p-fib3">
      <span className="text-xs uppercase tracking-wide text-encre-2">
        {label}
      </span>
      <span className={`metric text-xl font-medium ${accentClass}`}>
        {value}
      </span>
      {sub ? <span className="text-xs text-encre-2">{sub}</span> : null}
    </div>
  );
}

export default async function PesoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, sex, birth_date, height_cm, goal, activity_level")
    .eq("id", user!.id)
    .single();

  const { data: rows } = await supabase
    .from("body_measurements")
    .select(
      "id, measured_at, weight_kg, body_fat_pct, muscle_mass_kg, source"
    )
    .order("measured_at", { ascending: true });

  const measurements = rows ?? [];
  const latest = measurements.at(-1);
  const previous = measurements.at(-2);
  const delta =
    latest && previous ? Number(latest.weight_kg) - Number(previous.weight_kg) : null;

  const heightCm = profile?.height_cm ? Number(profile.height_cm) : null;
  const weightNow = latest ? Number(latest.weight_kg) : null;

  // Metriche derivate (solo se ci sono dati a sufficienza)
  let bmiVal: number | null = null;
  let bmrVal: number | null = null;
  let tdeeVal: number | null = null;
  if (weightNow && heightCm) {
    bmiVal = calcBmi(weightNow, heightCm);
    if (profile?.sex && profile.birth_date && profile.activity_level) {
      const age = ageFromBirthDate(profile.birth_date);
      bmrVal = bmrMifflinStJeor(
        profile.sex as Sex,
        weightNow,
        heightCm,
        age
      );
      tdeeVal = calcTdee(bmrVal, profile.activity_level as ActivityLevel);
    }
  }

  const points: TrendPoint[] = measurements.map((m) => ({
    t: new Date(m.measured_at).getTime(),
    weight: Number(m.weight_kg),
    bodyFat: m.body_fat_pct != null ? Number(m.body_fat_pct) : null,
    muscle: m.muscle_mass_kg != null ? Number(m.muscle_mass_kg) : null,
  }));

  const goalLabel = profile?.goal ? GOAL_LABELS[profile.goal] : null;
  const recent = [...measurements].reverse().slice(0, 10);

  return (
    <div className="flex flex-col gap-fib4 p-fib4">
      {/* Color-blocking: il piano rosso dello stato di oggi */}
      <header className="flex items-stretch justify-between gap-fib3 rounded-md bg-rouge p-fib4 text-beton">
        <div className="flex flex-col justify-between">
          <p className="text-sm/none opacity-80">
            {latest
              ? `Ultimo peso · ${dateFmt.format(new Date(latest.measured_at))}`
              : "Nessuna misurazione"}
          </p>
          <p className="metric text-4xl font-semibold leading-none">
            {weightNow != null ? weightNow.toFixed(1) : "—"}
            <span className="ml-1 text-lg font-normal opacity-80">kg</span>
          </p>
          {delta != null && (
            <p className="metric text-sm opacity-90">
              {delta > 0 ? "+" : ""}
              {delta.toFixed(1)} kg dall&apos;ultima
            </p>
          )}
        </div>
        <div className="flex flex-col items-end justify-between">
          <ModulorBar className="h-fib6" />
          {goalLabel && (
            <span className="text-xs uppercase tracking-wide opacity-80">
              {goalLabel}
            </span>
          )}
        </div>
      </header>

      <section className="grid grid-cols-3 gap-fib2">
        <StatTile
          label="BMI"
          value={bmiVal != null ? bmiVal.toFixed(1) : "—"}
          sub={bmiVal != null ? bmiCategory(bmiVal) : undefined}
          accent="bleu"
        />
        <StatTile
          label="BMR"
          value={bmrVal != null ? String(Math.round(bmrVal)) : "—"}
          sub="kcal/g"
          accent="ocre"
        />
        <StatTile
          label="TDEE"
          value={tdeeVal != null ? String(Math.round(tdeeVal)) : "—"}
          sub="kcal/g"
          accent="vert"
        />
      </section>

      <div className="flex flex-col gap-fib2">
        <AddMeasurementDrawer />
        <Link
          href="/sync"
          className="flex items-center justify-center gap-fib1 text-sm text-encre-2 transition-colors hover:text-rouge"
        >
          <RefreshCw className="size-4" aria-hidden />
          Sincronizza con la bilancia
        </Link>
      </div>

      {measurements.length > 0 ? (
        <>
          <WeightTrendChart points={points} />

          <section className="flex flex-col gap-fib2">
            <h2 className="font-display text-base font-medium">Storico</h2>
            <ul className="flex flex-col divide-y divide-ligne overflow-hidden rounded-md border border-ligne bg-surface">
              {recent.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between gap-fib3 px-fib3 py-fib2"
                >
                  <div className="flex flex-col">
                    <span className="metric text-sm font-medium">
                      {Number(m.weight_kg).toFixed(1)} kg
                    </span>
                    <span className="text-xs text-encre-2">
                      {dateFmt.format(new Date(m.measured_at))}
                      {m.body_fat_pct != null
                        ? ` · ${Number(m.body_fat_pct).toFixed(1)}% grasso`
                        : ""}
                      {m.source === "health_sync" ? " · bilancia" : ""}
                    </span>
                  </div>
                  <DeleteMeasurementButton id={m.id} />
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : (
        <div className="flex flex-col items-center gap-fib3 rounded-md border border-dashed border-ligne bg-surface p-fib6 text-center">
          <ModulorBar className="h-fib6" withNode={false} />
          <p className="max-w-xs text-sm text-encre-2">
            Nessuna misurazione oggi — sali sulla bilancia o aggiungila a mano.
          </p>
        </div>
      )}
    </div>
  );
}
