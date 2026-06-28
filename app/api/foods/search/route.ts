import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { searchOpenFoodFacts } from "@/lib/openfoodfacts";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q") ?? "";
  if (q.trim().length < 2) return NextResponse.json({ results: [] });

  try {
    const results = await searchOpenFoodFacts(q);
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json(
      { error: "Open Food Facts non raggiungibile." },
      { status: 502 }
    );
  }
}
