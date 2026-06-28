import { cn } from "@/lib/utils";

/**
 * La "barra Modulor": righello proporzionale verticale con segmenti
 * rosso/blu in serie di Fibonacci e nodo alla sezione aurea.
 * Elemento firma del brand — usato come accento, non ovunque.
 */
export function ModulorBar({
  className,
  withNode = true,
}: {
  className?: string;
  withNode?: boolean;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "relative flex w-fib3 flex-col overflow-hidden rounded-sm",
        className
      )}
    >
      <div className="bg-bleu" style={{ flex: 13 }} />
      <div className="bg-rouge" style={{ flex: 21 }} />
      <div className="bg-bleu" style={{ flex: 34 }} />
      <div className="bg-rouge" style={{ flex: 55 }} />
      {withNode && (
        <span
          className="absolute left-1/2 size-fib3 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-encre bg-beton"
          style={{ top: "38.2%" }}
        />
      )}
    </div>
  );
}
