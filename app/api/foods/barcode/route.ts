import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { lookupBarcode } from "@/lib/openfoodfacts";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const code = req.nextUrl.searchParams.get("code") ?? "";
  if (!code.trim())
    return NextResponse.json({ error: "Barcode mancante." }, { status: 400 });

  try {
    const product = await lookupBarcode(code);
    return NextResponse.json({ product });
  } catch {
    return NextResponse.json(
      { error: "Open Food Facts non raggiungibile." },
      { status: 502 }
    );
  }
}
