import { Skeleton } from "@/components/ui/skeleton";

// Loader della tab Allenamento — rispecchia la struttura di page.tsx.
export default function Loading() {
  return (
    <div className="flex flex-col gap-fib4 p-fib4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-9 w-full" />
      <div className="flex flex-col divide-y divide-ligne overflow-hidden rounded-md border border-ligne bg-surface">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-fib3 px-fib3 py-fib3"
          >
            <div className="flex flex-col gap-fib1">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="size-4" />
          </div>
        ))}
      </div>
    </div>
  );
}
