import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-fib4 p-fib4">
      <div className="flex flex-col gap-fib2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-4 w-full" />
      </div>
      <div className="flex flex-col gap-fib3">
        {[0, 1].map((i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    </div>
  );
}
