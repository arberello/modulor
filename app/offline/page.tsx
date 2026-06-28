import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Offline",
};

export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-fib4 p-fib5 text-center">
      <div
        aria-hidden
        className="h-fib7 w-fib2 rounded-sm bg-rouge"
      />
      <h1 className="text-2xl font-display font-semibold">Sei offline</h1>
      <p className="max-w-xs text-encre-2">
        Modulor ha bisogno della rete per sincronizzare i tuoi dati. Torna online
        e riprova.
      </p>
    </main>
  );
}
