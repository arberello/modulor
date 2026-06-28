import { Skeleton } from "@/components/ui/skeleton";

// Loader della tab Cibo — rispecchia la struttura di page.tsx.
export default function Loading() {
  return (
    <div className="flex flex-col gap-fib4 p-fib4">
      {/* Piano blu della giornata nutrizione */}
      <header className="flex flex-col gap-fib2 rounded-md bg-bleu p-fib4">
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-fib2">
            <Skeleton className="h-3 w-12 bg-beton/30" />
            <Skeleton className="h-9 w-44 bg-beton/30" />
          </div>
          <Skeleton className="h-3 w-20 bg-beton/30" />
        </div>
        <Skeleton className="h-fib1 w-full rounded-full bg-beton/25" />
      </header>

      {/* Macro: proteine / carbo / grassi */}
      <section className="flex flex-col gap-fib3 rounded-md border border-ligne bg-surface p-fib3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-col gap-fib1">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-fib2 w-full rounded-full" />
          </div>
        ))}
      </section>

      <Skeleton className="h-9 w-full" />

      {/* Pasti */}
      <div className="flex flex-col gap-fib3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-col gap-fib2">
            <Skeleton className="h-4 w-24" />
            <div className="flex flex-col divide-y divide-ligne overflow-hidden rounded-md border border-ligne bg-surface">
              {[0, 1].map((j) => (
                <div
                  key={j}
                  className="flex items-center justify-between gap-fib3 px-fib3 py-fib2"
                >
                  <div className="flex flex-col gap-fib1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-3 w-12" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
