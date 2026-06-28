import { LogOut } from "lucide-react";
import { signOut } from "@/app/(auth)/actions";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-ligne bg-beton/95 px-fib4 py-fib3 backdrop-blur">
      <span className="font-display text-lg font-semibold tracking-tight">
        Modulor
      </span>
      <form action={signOut}>
        <button
          type="submit"
          aria-label="Esci"
          className="rounded-md p-fib1 text-encre-2 transition-colors hover:text-rouge focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rouge"
        >
          <LogOut className="size-5" aria-hidden />
        </button>
      </form>
    </header>
  );
}
