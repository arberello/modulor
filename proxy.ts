import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next 16: convenzione "proxy" (ex "middleware"). Rinnova la sessione Supabase
// e protegge le rotte.
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Tutte le rotte tranne:
     * - _next/static, _next/image (asset build)
     * - favicon, icon, manifest, sw, file in /icons
     * - file con estensione (immagini, font, ecc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|icon.png|manifest.webmanifest|sw.js|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
};
