import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/app-header";
import { BottomNav } from "@/components/bottom-nav";
import { PwaInstallPrompt } from "@/components/pwa-install-prompt";

export default async function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Onboarding non completato → forza il profilo prima delle tab.
  const { data: profile } = await supabase
    .from("profiles")
    .select("sex, birth_date, height_cm, goal, activity_level")
    .eq("id", user.id)
    .single();

  const incompleto =
    !profile ||
    !profile.sex ||
    !profile.birth_date ||
    !profile.height_cm ||
    !profile.goal ||
    !profile.activity_level;

  if (incompleto) redirect("/onboarding");

  return (
    <>
      <AppHeader />
      <PwaInstallPrompt />
      <main className="flex-1 pb-fib6">{children}</main>
      <BottomNav />
    </>
  );
}
