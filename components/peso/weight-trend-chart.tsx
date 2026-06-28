"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { movingAverage } from "@/lib/health";
import { cn } from "@/lib/utils";

export type TrendPoint = {
  t: number; // ms epoch
  weight: number;
  bodyFat: number | null;
  muscle: number | null;
};

const METRICS = [
  { key: "weight", label: "Peso", unit: "kg" },
  { key: "bodyFat", label: "Grasso", unit: "%" },
  { key: "muscle", label: "Massa", unit: "kg" },
] as const;

type MetricKey = (typeof METRICS)[number]["key"];

const dateShort = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "2-digit",
});
const dateLong = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

/** Legge i colori della palette dal CSS (così segue anche il dark mode). */
function usePalette() {
  const [c, setC] = useState({
    rouge: "#b23a1e",
    encre2: "#6b6862",
    ligne: "#c9c3b4",
    surface: "#f3f1eb",
  });
  useEffect(() => {
    const read = () => {
      const s = getComputedStyle(document.documentElement);
      const g = (n: string, f: string) => s.getPropertyValue(n).trim() || f;
      setC({
        rouge: g("--rouge", "#b23a1e"),
        encre2: g("--encre-2", "#6b6862"),
        ligne: g("--ligne", "#c9c3b4"),
        surface: g("--surface", "#f3f1eb"),
      });
    };
    read();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", read);
    return () => mq.removeEventListener("change", read);
  }, []);
  return c;
}

export function WeightTrendChart({ points }: { points: TrendPoint[] }) {
  const [metric, setMetric] = useState<MetricKey>("weight");
  const palette = usePalette();
  const meta = METRICS.find((m) => m.key === metric)!;

  const data = useMemo(() => {
    const ma =
      metric === "weight"
        ? movingAverage(
            points.map((p) => ({ t: p.t, v: p.weight })),
            7
          )
        : null;
    return points.map((p, i) => ({
      t: p.t,
      value: p[metric],
      ma: ma ? ma[i] : null,
    }));
  }, [points, metric]);

  const hasData = data.some((d) => d.value != null);

  return (
    <div className="flex flex-col gap-fib3 rounded-md border border-ligne bg-surface p-fib3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-medium">Andamento</h2>
        <div className="flex gap-fib1" role="tablist" aria-label="Metrica">
          {METRICS.map((m) => (
            <button
              key={m.key}
              role="tab"
              aria-selected={metric === m.key}
              onClick={() => setMetric(m.key)}
              className={cn(
                "rounded-sm px-fib2 py-fib1 text-xs transition-colors",
                metric === m.key
                  ? "bg-rouge text-beton"
                  : "text-encre-2 hover:text-encre"
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {hasData ? (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart
            data={data}
            margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
          >
            <CartesianGrid stroke={palette.ligne} vertical={false} />
            <XAxis
              dataKey="t"
              type="number"
              scale="time"
              domain={["dataMin", "dataMax"]}
              tickFormatter={(t) => dateShort.format(new Date(t))}
              stroke={palette.ligne}
              tick={{ fill: palette.encre2, fontFamily: "var(--font-mono)", fontSize: 10 }}
              minTickGap={24}
            />
            <YAxis
              domain={["auto", "auto"]}
              tickFormatter={(v) => Number(v).toFixed(metric === "weight" ? 0 : 0)}
              stroke={palette.ligne}
              tick={{ fill: palette.encre2, fontFamily: "var(--font-mono)", fontSize: 10 }}
              width={40}
            />
            <Tooltip
              cursor={{ stroke: palette.ligne }}
              contentStyle={{
                background: palette.surface,
                border: `1px solid ${palette.ligne}`,
                borderRadius: 3,
                fontFamily: "var(--font-mono)",
                fontSize: 12,
              }}
              labelFormatter={(t) => dateLong.format(new Date(Number(t)))}
              formatter={(value, name) => {
                const v = value == null ? null : Number(value);
                if (v == null || Number.isNaN(v)) return ["—", ""];
                const label = name === "ma" ? "Media 7gg" : meta.label;
                return [`${v.toFixed(1)} ${meta.unit}`, label];
              }}
            />
            {metric === "weight" && (
              <Line
                type="monotone"
                dataKey="ma"
                stroke={palette.encre2}
                strokeWidth={1.5}
                strokeDasharray="4 3"
                dot={false}
                connectNulls
                isAnimationActive={false}
              />
            )}
            <Line
              type="monotone"
              dataKey="value"
              stroke={palette.rouge}
              strokeWidth={2}
              dot={{ r: 2, fill: palette.rouge }}
              activeDot={{ r: 4 }}
              connectNulls
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p className="py-fib5 text-center text-sm text-encre-2">
          Nessun dato per «{meta.label}».
        </p>
      )}
    </div>
  );
}
