import type { Metadata } from "next";
import { AuthBrand } from "@/components/auth/auth-brand";
import { ForgotForm } from "@/components/auth/forgot-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Recupera password" };

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col">
      <AuthBrand title="Modulor" subtitle="Recupera l'accesso" />
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">
            Password dimenticata
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ForgotForm />
        </CardContent>
      </Card>
    </div>
  );
}
