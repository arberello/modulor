# Modulor — PWA Health/Nutrition/Training (uso personale, 2 utenti)

## Stack

Next.js 16 (App Router, TS, Turbopack), Tailwind + shadcn/ui, PWA installabile.
Supabase (Postgres + Auth + RLS + Edge Functions). Deploy Vercel. Food DB: Open Food Facts.

## DB (non negoziabile)

- Usa SEMPRE il Supabase MCP per schema/migration (apply_migration), mai SQL incollato a mano.
- Ogni tabella user-scoped: RLS attiva (default deny), policy auth.uid() = user_id.
- Dopo ogni migration: generate_typescript_types → lib/db/types.ts; poi get_advisors e correggi.

## UI (non negoziabile)

- Segui SEMPRE la skill .claude/skills/modulor-design per colori, tipografia, spaziature (Fibonacci), componenti.
- Numeri/metriche in IBM Plex Mono. Un solo rosso protagonista. Niente default shadcn grezzi.

## Codice

- Niente service_role nel client; logica sensibile in Server Actions / Route Handlers.
- Mobile-first; procedi una fase per volta (vedi GOAL), fermati agli acceptance criteria.

## Segreti

- .env.local non committato; chiavi server-only mai NEXT*PUBLIC*.
