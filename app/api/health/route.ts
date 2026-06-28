import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Endpoint pubblico e leggero: una query minima tiene attivo il DB Supabase
// (evita la pausa dopo 7 giorni di inattività). Pingato da una GitHub Action.
export async function GET() {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("exercises").select("id").limit(1);
    if (error) return NextResponse.json({ ok: false }, { status: 500 });
    return NextResponse.json({ ok: true, ts: new Date().toISOString() });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
