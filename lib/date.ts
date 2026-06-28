// Confini del giorno locale, indipendenti dalla timezone del server (Vercel = UTC).
// Entrambi gli utenti sono in Italia → usiamo Europe/Rome.

export const APP_TZ = "Europe/Rome";

function tzOffsetMinutes(date: Date, tz: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const map: Record<string, string> = {};
  for (const p of dtf.formatToParts(date)) map[p.type] = p.value;
  const asUTC = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour),
    Number(map.minute),
    Number(map.second)
  );
  return (asUTC - date.getTime()) / 60000;
}

/** Intervallo [start, end) ISO del giorno (nella tz) che contiene `now`. */
export function dayRangeInTZ(
  now: Date = new Date(),
  tz: string = APP_TZ
): { start: string; end: string } {
  const ymd = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now); // "YYYY-MM-DD"
  const utcMidnight = new Date(`${ymd}T00:00:00Z`);
  const offset = tzOffsetMinutes(utcMidnight, tz);
  const start = new Date(utcMidnight.getTime() - offset * 60000);
  const end = new Date(start.getTime() + 86_400_000);
  return { start: start.toISOString(), end: end.toISOString() };
}
