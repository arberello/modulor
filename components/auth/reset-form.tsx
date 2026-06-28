"use client";

import { useActionState } from "react";
import { updatePassword } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResetForm() {
  const [state, action, pending] = useActionState(updatePassword, {});

  return (
    <form action={action} className="flex flex-col gap-fib3">
      <div className="flex flex-col gap-fib1">
        <Label htmlFor="password">Nuova password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>
      <div className="flex flex-col gap-fib1">
        <Label htmlFor="confirm">Conferma password</Label>
        <Input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-rouge">
          {state.error}
        </p>
      )}

      <Button type="submit" className="mt-fib2 w-full" disabled={pending}>
        {pending ? "Salvataggio…" : "Imposta password"}
      </Button>
    </form>
  );
}
