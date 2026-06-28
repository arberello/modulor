// Client server-side per Open Food Facts. Normalizza i prodotti nel formato
// usato dalla tabella `foods` (valori per 100 g). Niente chiamate dal browser
// (CORS + User-Agent richiesto da OFF).
//
// Ricerca testuale → Search-a-licious (search.openfoodfacts.org): veloce e
// affidabile. Il vecchio cgi/search.pl su world.* è lento/instabile.
// Barcode → API v2 product (world.openfoodfacts.org): lookup diretto, veloce.

const UA = "Modulor/1.0 (PWA personale salute/nutrizione; arber@alesea.com)";

export type OffFood = {
  off_barcode: string | null;
  name: string;
  brand: string | null;
  kcal_per_100: number;
  protein_per_100: number;
  carbs_per_100: number;
  fat_per_100: number;
  fiber_per_100: number | null;
};

type OffNutriments = Record<string, number | string | undefined>;
type MultiLang = string | Record<string, string>;
type OffProduct = {
  code?: string;
  product_name?: MultiLang;
  product_name_it?: MultiLang;
  brands?: string | string[];
  nutriments?: OffNutriments;
};

function num(v: number | string | undefined): number | null {
  if (v === undefined || v === null || v === "") return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function pickName(p: OffProduct): string {
  const raw = p.product_name_it ?? p.product_name;
  if (typeof raw === "string") return raw.trim();
  if (raw && typeof raw === "object") {
    return (raw.it || raw.en || Object.values(raw)[0] || "").trim();
  }
  return "";
}

function pickBrand(b: OffProduct["brands"]): string | null {
  if (!b) return null;
  if (Array.isArray(b)) return b.length ? String(b[0]).trim() || null : null;
  return b.split(",")[0].trim() || null;
}

function kcalFrom(n: OffNutriments): number | null {
  const kcal = num(n["energy-kcal_100g"]);
  if (kcal !== null) return kcal;
  const kj = num(n["energy_100g"]); // kJ → kcal
  return kj !== null ? kj / 4.184 : null;
}

/** Mappa un prodotto OFF nel nostro formato. Ritorna null se mancano i dati base. */
function mapProduct(p: OffProduct): OffFood | null {
  const name = pickName(p);
  const n = p.nutriments ?? {};
  const kcal = kcalFrom(n);
  if (!name || kcal === null) return null;

  return {
    off_barcode: p.code ?? null,
    name,
    brand: pickBrand(p.brands),
    kcal_per_100: Math.round(kcal * 10) / 10,
    protein_per_100: num(n.proteins_100g) ?? 0,
    carbs_per_100: num(n.carbohydrates_100g) ?? 0,
    fat_per_100: num(n.fat_100g) ?? 0,
    fiber_per_100: num(n.fiber_100g),
  };
}

export async function searchOpenFoodFacts(query: string): Promise<OffFood[]> {
  const q = query.trim();
  if (!q) return [];
  const url =
    "https://search.openfoodfacts.org/search?" +
    new URLSearchParams({ q, page_size: "24" }).toString();

  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) throw new Error(`OFF search ${res.status}`);
  const data = (await res.json()) as { hits?: OffProduct[] };

  const seen = new Set<string>();
  const out: OffFood[] = [];
  for (const p of data.hits ?? []) {
    const mapped = mapProduct(p);
    if (!mapped) continue;
    const key = mapped.off_barcode ?? mapped.name;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(mapped);
  }
  return out;
}

export async function lookupBarcode(code: string): Promise<OffFood | null> {
  const c = code.replace(/\D/g, "");
  if (!c) return null;
  const url = `https://world.openfoodfacts.org/api/v2/product/${c}.json?fields=code,product_name,product_name_it,brands,nutriments`;

  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(10000),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`OFF barcode ${res.status}`);
  const data = (await res.json()) as { status?: number; product?: OffProduct };
  if (!data.product) return null;
  return mapProduct(data.product);
}
