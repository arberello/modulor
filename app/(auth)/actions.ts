"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; message?: string };

function traduciErrore(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login credentials"))
    return "Email o password non corretti.";
  if (m.includes("email not confirmed"))
    return "Conferma prima la tua email: controlla la casella.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Esiste già un account con questa email.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Troppi tentativi. Riprova tra qualche minuto.";
  if (m.includes("password")) return "Password non valida (min. 8 caratteri).";
  return "Qualcosa è andato storto. Riprova.";
}

async function getOrigin() {
  const h = await headers();
  const origin = h.get("origin");
  if (origin) return origin;
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

function safeNext(value: FormDataEntryValue | null): string {
  const next = String(value ?? "/");
  return next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export async function login(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));
  if (!email || !password) return { error: "Inserisci email e password." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: traduciErrore(error.message) };

  revalidatePath("/", "layout");
  redirect(next);
}

export async function signup(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("display_name") ?? "").trim();
  if (!email) return { error: "Inserisci un'email." };
  if (password.length < 8)
    return { error: "La password deve avere almeno 8 caratteri." };

  const supabase = await createClient();
  const origin = await getOrigin();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName || null },
      emailRedirectTo: `${origin}/auth/confirm?next=/onboarding`,
    },
  });
  if (error) return { error: traduciErrore(error.message) };

  // Conferma email disattivata → sessione subito attiva.
  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/onboarding");
  }

  // Conferma email attiva → attendi il click sul link.
  return {
    message:
      "Ti abbiamo inviato un'email di conferma. Aprila per attivare l'account, poi accedi.",
  };
}

export async function requestPasswordReset(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Inserisci la tua email." };

  const supabase = await createClient();
  const origin = await getOrigin();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/confirm?next=/reset-password`,
  });
  if (error) return { error: traduciErrore(error.message) };

  return {
    message:
      "Se l'email è registrata, riceverai il link per reimpostare la password.",
  };
}

export async function updatePassword(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (password.length < 8)
    return { error: "La password deve avere almeno 8 caratteri." };
  if (password !== confirm) return { error: "Le password non coincidono." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: traduciErrore(error.message) };

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
