import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  TrainingIntake,
  type TrainingDefaults,
} from "@/components/ai/training-intake";

export const metadata: Metadata = { title: "Piano di allenamento" };

export default async function AiTrainingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("training_preferences")
    .select(
      "experience, training_goal, focus_muscles, days_per_week, session_minutes, intensity, equipment, training_style, limitations, notes"
    )
    .eq("user_id", user!.id)
    .maybeSingle();

  return (
    <div className="flex flex-col gap-fib4 p-fib4">
      <div className="flex flex-col gap-fib2">
        <Link
          href="/ai"
          className="inline-flex items-center gap-fib1 text-sm text-encre-2 transition-colors hover:text-encre focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rouge"
        >
          <ArrowLeft className="size-4" aria-hidden />
          AI
        </Link>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Piano di allenamento
        </h1>
        <p className="text-sm text-encre-2">
          Dimmi come vuoi allenarti. Combino queste preferenze con il tuo
          profilo e le ultime sessioni per generare il prompt. Claude risponderà
          con un JSON che poi importi in{" "}
          <Link
            href="/allenamento/importa"
            className="font-medium text-encre underline underline-offset-2"
          >
            Allenamento → Importa piano
          </Link>
          .
        </p>
      </div>

      <TrainingIntake defaults={(data as TrainingDefaults) ?? null} />
    </div>
  );
}
