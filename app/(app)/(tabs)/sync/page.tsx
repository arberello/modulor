import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CopyField } from "@/components/sync/copy-field";

export const metadata: Metadata = { title: "Sincronizza bilancia" };

// Campi del corpo JSON da costruire DENTRO l'azione «Ottieni contenuti dell'URL».
// La chiave (key) va copiata esatta; il valore è una variabile del campione di
// Salute, salvo `token`. NB: vanno messi qui, non in un'azione Dizionario a parte
// (un Dizionario separato non si aggancia al corpo della richiesta).
const jsonFields: { label: string; key: string; hint: string }[] = [
  {
    label: "Autenticazione",
    key: "token",
    hint: "Valore = il tuo token (lo trovi qui sopra). È testo fisso, non una variabile.",
  },
  {
    label: "Il peso",
    key: "weight_kg",
    hint: "Valore = tocca il campo, «Seleziona variabile», scegli i Campioni del Peso e poi «Valore».",
  },
  {
    label: "Grasso % — facoltativo",
    key: "body_fat_pct",
    hint: "Valore = la variabile dei Campioni della massa grassa, poi «Valore». Salta la riga se non lo misuri.",
  },
];

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
          Una volta configurato, ogni pesata arriva qui da sola: Xiaomi S400 → Mi
          Home → Apple Salute → Comando iOS → Modulor.
        </p>
      </div>

      {/* I due valori da incollare */}
      <section className="flex flex-col gap-fib3 rounded-md border border-ligne bg-surface p-fib3">
        <h2 className="font-display text-base font-medium">I tuoi due valori</h2>
        <CopyField label="Endpoint (URL)" value={endpoint} />
        <CopyField label="Token" value={token} />
        <p className="text-xs text-encre-2">
          Ti servono solo questi due. Il token è personale e segreto: scrive solo
          sulle tue misurazioni, non condividerlo.
        </p>
      </section>

      {/* 1 · Prerequisito */}
      <section className="flex flex-col gap-fib2">
        <h2 className="font-display text-base font-medium">
          1 · Prerequisito (una volta)
        </h2>
        <p className="text-sm text-encre-2">
          iPhone → Impostazioni → Salute → Accesso ai dati e dispositivi → Mi
          Home → abilita Peso e Percentuale massa grassa. Solo l&apos;account
          principale Xiaomi sincronizza su Salute.
        </p>
      </section>

      {/* 2 · Costruisci il comando */}
      <section className="flex flex-col gap-fib3">
        <h2 className="font-display text-base font-medium">
          2 · Costruisci il comando
        </h2>
        <p className="text-sm text-encre-2">
          App Comandi → <span className="font-mono">+</span> → aggiungi queste
          azioni in ordine (cercale dalla barra in basso).
        </p>

        {/* Azione 1 */}
        <div className="flex flex-col gap-fib1 rounded-md border border-ligne bg-surface p-fib3">
          <span className="text-xs uppercase tracking-wide text-encre-2">
            Azione 1
          </span>
          <p className="text-sm font-medium">Trova campioni di salute</p>
          <p className="text-sm text-encre-2">
            Tipo <em>Peso corporeo</em> · Ordina per <em>Data di fine</em>,
            più recenti prima · Limite <em>1</em>.
          </p>
        </div>

        {/* Azione 2 (facoltativa) */}
        <div className="flex flex-col gap-fib1 rounded-md border border-ligne bg-surface p-fib3">
          <span className="text-xs uppercase tracking-wide text-encre-2">
            Azione 2 · facoltativa
          </span>
          <p className="text-sm font-medium">Trova campioni di salute</p>
          <p className="text-sm text-encre-2">
            Tipo <em>Percentuale massa grassa</em> · Limite <em>1</em>. Salta
            questa se non ti interessa il grasso corporeo.
          </p>
        </div>

        {/* Azione 3 · Ottieni contenuti dell'URL */}
        <div className="flex flex-col gap-fib3 rounded-md border border-ligne bg-surface p-fib3">
          <div className="flex flex-col gap-fib1">
            <span className="text-xs uppercase tracking-wide text-encre-2">
              Azione 3
            </span>
            <p className="text-sm font-medium">Ottieni contenuti dell&apos;URL</p>
            <p className="text-sm text-encre-2">
              Incolla l&apos;<em>URL</em> qui sopra, poi tocca{" "}
              <em>Mostra altro</em> e imposta Metodo e Corpo.
            </p>
          </div>
          <CopyField label="URL" value={endpoint} />
          <div className="flex flex-col gap-fib1">
            <span className="text-xs uppercase tracking-wide text-encre-2">
              Metodo
            </span>
            <span className="font-mono text-sm">POST</span>
          </div>
          <div className="flex flex-col gap-fib1">
            <span className="text-xs uppercase tracking-wide text-encre-2">
              Corpo della richiesta
            </span>
            <span className="text-sm text-encre-2">
              Scegli <em>JSON</em>, poi con <em>Aggiungi nuovo campo</em> crea
              queste righe (tipo <em>Testo</em>):
            </span>
          </div>
          <div className="flex flex-col gap-fib3">
            {jsonFields.map((row) => (
              <div key={row.key} className="flex flex-col gap-fib1">
                <CopyField label={row.label} value={row.key} />
                <p className="text-xs text-encre-2">{row.hint}</p>
              </div>
            ))}
          </div>
          <p className="rounded-md border border-rouge/40 bg-rouge/5 p-fib2 text-xs text-encre-2">
            Importante: i campi vanno <em>dentro</em> questa azione. Non usare
            un&apos;azione «Dizionario» separata — non si aggancia al corpo e la
            richiesta parte vuota. Le intestazioni le mette Comandi da sé.
          </p>
        </div>
      </section>

      {/* 3 · Automazione */}
      <section className="flex flex-col gap-fib2">
        <h2 className="font-display text-base font-medium">
          3 · Rendilo automatico (facoltativo)
        </h2>
        <p className="text-sm text-encre-2">
          Scheda <em>Automazione</em> → <span className="font-mono">+</span> →{" "}
          <em>Quando aggiungo un dato di Salute</em> → Peso → esegui questo
          comando, «Esegui immediatamente» senza chiedere. Così parte da sola
          dopo ogni pesata.
        </p>
      </section>

      {/* Per il secondo account */}
      <section className="flex flex-col gap-fib2 rounded-md border border-ligne bg-surface p-fib3">
        <h2 className="font-display text-base font-medium">
          Per il secondo account
        </h2>
        <p className="text-sm text-encre-2">
          Non rifarlo da capo: quando funziona, apri il comando → Condividi →
          Copia link iCloud e invialo all&apos;altro telefono. All&apos;import
          basta cambiare il valore del campo{" "}
          <span className="font-mono">token</span> con il proprio.
        </p>
      </section>
    </div>
  );
}
