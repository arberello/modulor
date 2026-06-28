"use client";

import { useEffect } from "react";

/**
 * Registra il service worker solo in produzione (in dev il SW interferisce
 * con l'HMR di Turbopack). Montato una volta nel root layout.
 */
export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* registrazione SW fallita: l'app funziona comunque online */
      });
    };

    // Se la pagina è già caricata (effetto montato dopo "load"), registra subito.
    if (document.readyState === "complete") {
      register();
      return;
    }
    window.addEventListener("load", register);
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
