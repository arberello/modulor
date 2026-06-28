import { cn } from "@/lib/utils";

const FILL: Record<string, string> = {
  rouge: "bg-rouge",
  bleu: "bg-bleu",
  ocre: "bg-ocre",
  vert: "bg-vert",
};

export function MacroBar({
  label,
  consumed,
  target,
  unit,
  color,
}: {
  label: string;
  consumed: number;
  target: number | null;
  unit: string;
  color: "rouge" | "bleu" | "ocre" | "vert";
}) {
  const pct =
    target && target > 0 ? Math.min(100, (consumed / target) * 100) : 0;
  const over = target != null && target > 0 && consumed > target;

  return (
    <div className="flex flex-col gap-fib1">
      <div className="flex items-baseline justify-between">
        <span className="text-sm">{label}</span>
        <span className="metric text-sm">
          <span className={cn(over && "text-rouge")}>
            {Math.round(consumed)}
          </span>
          <span className="text-encre-2">
            {" / "}
            {target != null ? Math.round(target) : "—"} {unit}
          </span>
        </span>
      </div>
      <div className="h-fib1 overflow-hidden rounded-full bg-ligne">
        <div
          className={cn("h-full rounded-full transition-[width]", FILL[color])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
