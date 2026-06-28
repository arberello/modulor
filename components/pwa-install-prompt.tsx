"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function PwaInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null
  );
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!deferred || dismissed) return null;

  return (
    <div className="flex items-center justify-between gap-fib3 border-b border-ligne bg-rouge px-fib4 py-fib2 text-beton">
      <span className="text-sm">Installa Modulor sul telefono</span>
      <div className="flex items-center gap-fib2">
        <button
          type="button"
          onClick={async () => {
            await deferred.prompt();
            setDeferred(null);
          }}
          className="flex items-center gap-fib1 rounded-sm bg-beton/15 px-fib2 py-fib1 text-sm font-medium"
        >
          <Download className="size-4" aria-hidden />
          Installa
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Chiudi"
          className="text-beton/80 hover:text-beton"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
