import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingForm } from "@/components/auth/onboarding-form";
import { ModulorBar } from "@/components/modulor-bar";

export const metadata: Metadata = { title: "Profilo" };

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, sex, birth_date, height_cm, goal, activity_level")
    .eq("id", user.id)
    .single();

  // Profilo già completo → niente onboarding.
  if (
    profile?.sex &&
    profile.birth_date &&
    profile.height_cm &&
    profile.goal &&
    profile.activity_level
  ) {
    redirect("/");
  }

  const defaultName =
    profile?.display_name ??
    (typeof user.user_metadata?.display_name === "string"
      ? user.user_metadata.display_name
      : "") ??
    "";

  return (
    <div className="flex flex-1 flex-col gap-fib4 p-fib4">
      <div className="flex items-center gap-fib3">
        <ModulorBar className="h-fib6" />
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Il tuo profilo
          </h1>
          <p className="text-sm text-encre-2">
            Serve per calcolare metabolismo e obiettivi.
          </p>
        </div>
      </div>
      <OnboardingForm defaultName={defaultName} />
    </div>
  );
}
