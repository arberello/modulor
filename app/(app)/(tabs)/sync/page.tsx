import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CopyField } from "@/components/sync/copy-field";

export const metadata: Metadata = { title: "Sincronizza bilancia" };

export default async function SyncPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("sync_token")
    .eq("id", user!.id)
    .single();

  const endpoint = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ingest-health`;
  const token = profile?.sync_token ?? "";
  const samplePayload = `{
  "weight_kg": 80.4,
  "body_fat_pct": 18.2,
  "measured_at": "2026-06-28T07:30:00Z"
}`;

  return (
    <div className="flex flex-col gap-fib4 p-fib4">
      <div className="flex flex-col gap-fib2">
        <Link
          href="/"
          className="flex items-center gap-fib1 self-start text-sm text-encre-2 hover:text-encre"
        >
          <ChevronLeft className="size-4" aria-hidden />
          Peso
        </Link>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Sincronizza la bilancia
        </h1>
        <p className="text-sm text-encre-2">
          Xiaomi S400 → Mi Home → Apple Salute → Comando iOS → Modulor. Una volta
          configurato, ogni pesata arriva qui da sola.
        </p>
      </div>

      {/* Credenziali */}
      <section className="flex flex-col gap-fib3 rounded-md border border-ligne bg-surface p-fib3">
        <CopyField label="Endpoint (URL)" value={endpoint} />
        <CopyField label="Il tuo token (x-sync-token)" value={token} />
        <p className="text-xs text-encre-2">
          Il token è personale e segreto: scrive solo sulle tue misurazioni. Non
          condividerlo.
        </p>
      </section>

      {/* Prerequisito */}
      <section className="flex flex-col gap-fib2">
        <h2 className="font-display text-base font-medium">
          1 · Prerequisito (una volta)
        </h2>
        <p className="text-sm text-encre-2">
          iPhone → Impostazioni → Salute → Accesso ai dati e dispositivi → Mi
          Home → abilita peso, % grasso, altezza, BMI. Solo l&apos;account
          principale Xiaomi sincronizza su Salute.
        </p>
      </section>

      {/* Comando */}
      <section className="flex flex-col gap-fib2">
        <h2 className="font-display text-base font-medium">
          2 · Comando iOS (app Comandi)
        </h2>
        <ol className="flex list-decimal flex-col gap-fib2 pl-fib4 text-sm text-encre-2">
          <li>
            Azione «Trova campioni di salute»: tipo <em>Peso corporeo</em>,
            ordina per data, limite 1. (Aggiungine un&apos;altra per la massa
            grassa se vuoi.)
          </li>
          <li>
            Azione «Ottieni contenuto di URL» con i parametri qui sotto.
          </li>
          <li>
            Imposta come <em>Automazione</em> personale: «Quando aggiungo un dato
            di Salute → Peso», così parte da sola dopo la pesata.
          </li>
        </ol>
      </section>

      {/* Parametri richiesta */}
      <section className="flex flex-col gap-fib3 rounded-md border border-ligne bg-surface p-fib3">
        <h2 className="font-display text-base font-medium">
          3 · Parametri «Ottieni contenuto di URL»
        </h2>
        <CopyField label="URL" value={endpoint} />
        <div className="flex flex-col gap-fib1 text-sm">
          <span className="text-xs uppercase tracking-wide text-encre-2">
            Metodo
          </span>
          <span className="font-mono">POST</span>
        </div>
        <div className="flex flex-col gap-fib1 text-sm">
          <span className="text-xs uppercase tracking-wide text-encre-2">
            Intestazioni
          </span>
          <span className="font-mono">Content-Type: application/json</span>
          <span className="font-mono break-all">x-sync-token: {token}</span>
        </div>
        <CopyField label="Corpo richiesta (JSON)" value={samplePayload} multiline />
        <p className="text-xs text-encre-2">
          Sostituisci i valori con i campi del campione di Salute. `measured_at`
          in formato ISO è la data/ora della pesata: misurazioni con la stessa
          data/ora vengono aggiornate, non duplicate.
        </p>
      </section>
    </div>
  );
}
