import type { Metadata } from "next";
import { AuthBrand } from "@/components/auth/auth-brand";
import { ResetForm } from "@/components/auth/reset-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Nuova password" };

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-col">
      <AuthBrand title="Modulor" subtitle="Scegli una nuova password" />
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">Nuova password</CardTitle>
        </CardHeader>
        <CardContent>
          <ResetForm />
        </CardContent>
      </Card>
    </div>
  );
}
