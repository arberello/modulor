"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, {});

  return (
    <form action={action} className="flex flex-col gap-fib3">
      <div className="flex flex-col gap-fib1">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="tu@esempio.com"
          autoComplete="email"
          required
        />
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-rouge">
          {state.error}
        </p>
      )}
      {state.message && (
        <p className="rounded-md border border-vert/40 bg-vert/10 p-fib3 text-sm text-encre">
          {state.message}
        </p>
      )}

      <Button type="submit" className="mt-fib2 w-full" disabled={pending}>
        {pending ? "Invio…" : "Invia link di reset"}
      </Button>

      <Link href="/login" className="text-center text-sm text-encre-2 hover:underline">
        Torna al login
      </Link>
    </form>
  );
}
