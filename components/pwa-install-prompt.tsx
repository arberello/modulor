"use client";

import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "modulor:install-dismissed";

export function PwaInstallPrompt() {
  // Android/Chrome: evento nativo. iOS Safari NON lo emette → istruzione manuale.
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null
  );
  const [iosHint, setIosHint] = useState(false);
  // Parte nascosto: si decide nel client (evita flash e mismatch SSR).
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    const nav = window.navigator as Navigator & { standalone?: boolean };

    // Già installata (avviata in standalone) → nessun banner.
    const installed =
      window.matchMedia("(display-mode: standalone)").matches ||
      nav.standalone === true;
    if (installed) return;

    // Già chiuso in passato dall'utente.
    try {
      if (localStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      /* localStorage non disponibile (es. private mode): ignora */
    }

    // Decisione di visibilità basata su API solo-client (no SSR) → ok in effect.
    /* eslint-disable react-hooks/set-state-in-effect */
    setHidden(false);

    // iOS / iPadOS: l'installazione è manuale via "Aggiungi a Home".
    const isIOS =
      /iphone|ipad|ipod/i.test(nav.userAgent) ||
      (nav.platform === "MacIntel" && nav.maxTouchPoints > 1);
    if (isIOS) setIosHint(true);
    /* eslint-enable react-hooks/set-state-in-effect */

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function close() {
    setHidden(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignora */
    }
  }

  // Mostra solo se: Android col prompt pronto, oppure iOS (istruzione manuale).
  if (hidden || (!deferred && !iosHint)) return null;

  return (
    <div className="flex items-center justify-between gap-fib3 border-b border-ligne bg-rouge px-fib4 py-fib2 text-beton">
      {deferred ? (
        <span className="text-sm">Installa Modulor sul telefono</span>
      ) : (
        <span className="flex flex-wrap items-center gap-fib1 text-sm">
          Installa Modulor: tocca
          <Share className="size-4 shrink-0" aria-label="Condividi" />
          Condividi, poi «Aggiungi a Home»
        </span>
      )}

      <div className="flex shrink-0 items-center gap-fib2">
        {deferred && (
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
        )}
        <button
          type="button"
          onClick={close}
          aria-label="Chiudi"
          className="text-beton/80 hover:text-beton"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
