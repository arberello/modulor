import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/db/types";

/** Client Supabase per il browser (componenti "use client"). */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
