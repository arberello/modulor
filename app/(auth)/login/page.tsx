import type { Metadata } from "next";
import { AuthBrand } from "@/components/auth/auth-brand";
import { LoginForm } from "@/components/auth/login-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Accedi" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const next =
    sp.redirect && sp.redirect.startsWith("/") && !sp.redirect.startsWith("//")
      ? sp.redirect
      : "/";

  return (
    <div className="flex flex-col">
      <AuthBrand title="Modulor" subtitle="Salute · Nutrizione · Allenamento" />
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">Accedi</CardTitle>
        </CardHeader>
        <CardContent>
          {sp.error === "link" && (
            <p role="alert" className="mb-fib3 text-sm text-rouge">
              Link non valido o scaduto. Richiedine uno nuovo.
            </p>
          )}
          <LoginForm next={next} />
        </CardContent>
      </Card>
    </div>
  );
}
