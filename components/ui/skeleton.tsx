import * as React from "react";

import { cn } from "@/lib/utils";

// Placeholder di caricamento. Neutro (--ligne), niente grigi a caso.
// L'animazione è disattivata da prefers-reduced-motion (regola globale).
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden
      className={cn("animate-pulse rounded-md bg-ligne/70", className)}
      {...props}
    />
  );
}

export { Skeleton };
