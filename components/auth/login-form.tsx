"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(login, {});

  return (
    <form action={action} className="flex flex-col gap-fib3">
      <input type="hidden" name="next" value={next} />
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
      <div className="flex flex-col gap-fib1">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link
            href="/forgot-password"
            className="text-xs text-encre-2 underline-offset-2 hover:underline"
          >
            Password dimenticata?
          </Link>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-rouge">
          {state.error}
        </p>
      )}

      <Button type="submit" className="mt-fib2 w-full" disabled={pending}>
        {pending ? "Accesso…" : "Entra"}
      </Button>

      <p className="text-center text-sm text-encre-2">
        Non hai un account?{" "}
        <Link href="/signup" className="text-rouge hover:underline">
          Registrati
        </Link>
      </p>
    </form>
  );
}
