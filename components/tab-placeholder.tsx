import { ModulorBar } from "@/components/modulor-bar";

export function TabPlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-fib4 p-fib4">
      <h1 className="font-display text-2xl font-semibold tracking-tight">
        {title}
      </h1>
      <div className="flex flex-col items-center gap-fib3 rounded-md border border-dashed border-ligne bg-surface p-fib6 text-center">
        <ModulorBar className="h-fib6" withNode={false} />
        <p className="max-w-xs text-sm text-encre-2">{description}</p>
      </div>
    </div>
  );
}
