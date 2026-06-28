import { ModulorBar } from "@/components/modulor-bar";

export function AuthBrand({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-fib4 flex items-center gap-fib3">
      <ModulorBar className="h-fib6" />
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          {title}
        </h1>
        {subtitle && <p className="text-sm text-encre-2">{subtitle}</p>}
      </div>
    </div>
  );
}
