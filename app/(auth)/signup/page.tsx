import type { Metadata } from "next";
import { AuthBrand } from "@/components/auth/auth-brand";
import { SignupForm } from "@/components/auth/signup-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Registrati" };

export default function SignupPage() {
  return (
    <div className="flex flex-col">
      <AuthBrand title="Modulor" subtitle="Crea il tuo account" />
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">Registrati</CardTitle>
        </CardHeader>
        <CardContent>
          <SignupForm />
        </CardContent>
      </Card>
    </div>
  );
}
