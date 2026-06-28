import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  NutritionIntake,
  type NutritionDefaults,
} from "@/components/ai/nutrition-intake";

export const metadata: Metadata = { title: "Piano alimentare" };

export default async function AiNutritionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("nutrition_preferences")
    .select(
      "diet, meals_per_day, allergies, dislikes, preferences, cooking_time, budget, notes"
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
          Piano alimentare
        </h1>
        <p className="text-sm text-encre-2">
          Dimmi come mangi e cosa preferisci. Combino queste preferenze con il
          tuo fabbisogno e i consumi reali per generare il prompt.
        </p>
      </div>

      <NutritionIntake defaults={(data as NutritionDefaults) ?? null} />
    </div>
  );
}
