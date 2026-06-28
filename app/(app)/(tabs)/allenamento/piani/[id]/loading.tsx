import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-fib4 p-fib4">
      <div className="flex flex-col gap-fib2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-40" />
      </div>
      {[0, 1].map((i) => (
        <div
          key={i}
          className="flex flex-col gap-fib3 rounded-md border border-ligne bg-surface p-fib3"
        >
          <Skeleton className="h-5 w-44" />
          <div className="flex flex-col gap-fib2">
            {[0, 1, 2].map((j) => (
              <Skeleton key={j} className="h-8 w-full" />
            ))}
          </div>
          <Skeleton className="h-9 w-full" />
        </div>
      ))}
    </div>
  );
}
