import { Skeleton } from "@/components/ui/skeleton";

// Loader della tab Peso — rispecchia la struttura di page.tsx (zero layout shift).
export default function Loading() {
  return (
    <div className="flex flex-col gap-fib4 p-fib4">
      {/* Piano rosso dello stato di oggi */}
      <header className="flex items-stretch justify-between gap-fib3 rounded-md bg-rouge p-fib4">
        <div className="flex flex-col justify-between gap-fib3">
          <Skeleton className="h-3 w-28 bg-beton/30" />
          <Skeleton className="h-9 w-40 bg-beton/30" />
          <Skeleton className="h-3 w-24 bg-beton/30" />
        </div>
        <div className="flex flex-col items-end justify-between gap-fib3">
          <Skeleton className="h-fib6 w-fib2 bg-beton/30" />
          <Skeleton className="h-3 w-16 bg-beton/30" />
        </div>
      </header>

      {/* Stat tiles: BMI / BMR / TDEE */}
      <section className="grid grid-cols-3 gap-fib2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex flex-col gap-fib1 rounded-md border border-ligne bg-surface p-fib3"
          >
            <Skeleton className="h-3 w-10" />
            <Skeleton className="h-6 w-14" />
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </section>

      {/* Azioni */}
      <div className="flex flex-col gap-fib2">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="mx-auto h-3 w-48" />
      </div>

      {/* Grafico trend */}
      <Skeleton className="h-fib8 w-full" />

      {/* Storico */}
      <div className="flex flex-col gap-fib2">
        <Skeleton className="h-4 w-20" />
        <div className="flex flex-col divide-y divide-ligne overflow-hidden rounded-md border border-ligne bg-surface">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-fib3 px-fib3 py-fib2"
            >
              <div className="flex flex-col gap-fib1">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="size-7" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
