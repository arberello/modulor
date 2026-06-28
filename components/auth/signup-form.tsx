"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signup } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignupForm() {
  const [state, action, pending] = useActionState(signup, {});

  if (state.message) {
    return (
      <div className="flex flex-col gap-fib3">
        <p className="rounded-md border border-vert/40 bg-vert/10 p-fib3 text-sm text-encre">
          {state.message}
        </p>
        <Link href="/login" className="text-center text-sm text-rouge hover:underline">
          Vai al login
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-fib3">
      <div className="flex flex-col gap-fib1">
        <Label htmlFor="display_name">Nome</Label>
        <Input
          id="display_name"
          name="display_name"
          type="text"
          placeholder="Come ti chiami"
          autoComplete="name"
        />
      </div>
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
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <p className="text-xs text-encre-2">Almeno 8 caratteri.</p>
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-rouge">
          {state.error}
        </p>
      )}

      <Button type="submit" className="mt-fib2 w-full" disabled={pending}>
        {pending ? "Creazione…" : "Crea account"}
      </Button>

      <p className="text-center text-sm text-encre-2">
        Hai già un account?{" "}
        <Link href="/login" className="text-rouge hover:underline">
          Accedi
        </Link>
      </p>
    </form>
  );
}
