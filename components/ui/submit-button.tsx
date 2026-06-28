"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Bottone di submit con feedback di caricamento automatico (useFormStatus).
 * Va usato DENTRO un <form action={serverAction}>: mentre l'azione è in corso
 * mostra uno spinner e si disabilita. `pendingLabel` cambia il testo.
 */
export function SubmitButton({
  children,
  pendingLabel,
  icon,
  className,
  variant,
  disabled,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  icon?: React.ReactNode;
  className?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant={variant}
      disabled={pending || disabled}
      aria-busy={pending}
      className={className}
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" aria-hidden />
      ) : (
        icon
      )}
      {pending ? pendingLabel ?? children : children}
    </Button>
  );
}
