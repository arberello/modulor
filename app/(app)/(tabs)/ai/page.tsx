import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Dumbbell, Utensils } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "AI" };

const dFmt = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "short",
});

function StatusLine({ updatedAt }: { updatedAt: string | null }) {
  if (!updatedAt)
    return <span className="text-encre-2">Preferenze da impostare</span>;
  return (
    <span className="text-encre-2">
      Preferenze salvate ·{" "}
      <span className="font-mono">{dFmt.format(new Date(updatedAt))}</span>
    </span>
  );
}

function PlanCard({
  href,
  title,
  description,
  updatedAt,
  icon: Icon,
  accent,
}: {
  href: string;
  title: string;
  description: string;
  updatedAt: string | null;
  icon: typeof Dumbbell;
  accent: "rouge" | "bleu";
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-fib3 rounded-md border border-ligne bg-surface p-fib3 transition-colors hover:border-encre-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rouge"
    >
      <span
        className={
          "flex size-fib6 shrink-0 items-center justify-center rounded-md text-beton " +
          (accent === "rouge" ? "bg-rouge" : "bg-bleu")
        }
      >
        <Icon className="size-5" strokeWidth={1.8} aria-hidden />
      </span>
      <span className="flex min-w-0 flex-col gap-fib1">
        <span className="font-display text-base font-semibold tracking-tight">
          {title}
        </span>
        <span className="text-sm text-encre-2">{description}</span>
        <span className="text-xs">
          <StatusLine updatedAt={updatedAt} />
        </span>
      </span>
      <ChevronRight
        className="ml-auto size-5 shrink-0 text-encre-2 transition-transform group-hover:translate-x-fib1"
        aria-hidden
      />
    </Link>
  );
}

export default async function AiPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: training }, { data: nutrition }] = await Promise.all([
    supabase
      .from("training_preferences")
      .select("updated_at")
      .eq("user_id", user!.id)
      .maybeSingle(),
    supabase
      .from("nutrition_preferences")
      .select("updated_at")
      .eq("user_id", user!.id)
      .maybeSingle(),
  ]);

  return (
    <div className="flex flex-col gap-fib4 p-fib4">
      <div className="flex flex-col gap-fib2">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          AI
        </h1>
        <p className="text-sm text-encre-2">
          Imposta le tue preferenze e genera un prompt strutturato — con i tuoi
          dati reali — da incollare in Claude per ricevere un piano. Nessun dato
          lascia l&apos;app finché non lo incolli tu.
        </p>
      </div>

      <div className="flex flex-col gap-fib3">
        <PlanCard
          href="/ai/allenamento"
          title="Piano di allenamento"
          description="Zone in focus, intensità, giorni, attrezzatura + ultime sessioni."
          updatedAt={training?.updated_at ?? null}
          icon={Dumbbell}
          accent="rouge"
        />
        <PlanCard
          href="/ai/nutrizione"
          title="Piano alimentare"
          description="Regime, pasti, allergie, preferenze + fabbisogno e consumi."
          updatedAt={nutrition?.updated_at ?? null}
          icon={Utensils}
          accent="bleu"
        />
      </div>
    </div>
  );
}
