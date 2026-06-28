# GOAL — Modulor (Health / Nutrition / Training PWA)

## Naming

- Repo: `modulor` · Progetto Supabase: `modulor` · App/bundle id: `app.modulor` · PWA name: "Modulor".

## Obiettivo (one-liner)

**PWA mobile-first** per uso personale (2 utenti: io e la mia ragazza), con login, per tracciare **peso/composizione corporea** (bilancia Xiaomi S400), **nutrizione** (macro/kcal con food DB) e **allenamento**, con uno strato **AI** per generare/aggiornare piani. Tutto su free tier, niente costi (no Apple Developer Program).

## Vincoli & decisioni fissate

- **Stack**: Next.js 16 (App Router, React 19, TypeScript, Turbopack), Tailwind + shadcn/ui, **PWA installabile** ("Aggiungi a Home", manifest + service worker — es. Serwist o `@ducanh2912/next-pwa`).
- **Backend/Auth/DB**: Supabase (Postgres + Auth + RLS + Storage + Edge Functions).
- **Deploy**: Vercel Hobby (free).
- **Food DB**: Open Food Facts API (free, search + barcode), cache locale in tabella `foods`.
- **Bilancia**: Xiaomi **S400** → app **Mi Home** → **Apple Health** (peso, %grasso, altezza, BMI) → **Shortcut iOS** → **Edge Function Supabase**. (No nativo, no Web Bluetooth.)
- **AI**: solo **livello 1** — export di un prompt strutturato (snapshot dati) da incollare in Claude chat. Niente API server-side per ora.
- **Auth**: **email + password** (Supabase Auth).
- **Design**: seguire la skill **`modulor-design`** per tutta la UI (linea Le Corbusier/Modulor: sans geometrico, Polychromie, spaziature Fibonacci). Non usare i default shadcn così come sono.

## Limiti free tier (verificati giugno 2026)

- **Supabase Free**: 500 MB DB, 1 GB storage, 5 GB egress/mese, 50K MAU, 2 progetti. **Pausa dopo 7 giorni di inattività DB** (cold start ~30–60s) → mitigazione: cron giornaliera (Fase 7). Con uso quotidiano è quasi irrilevante.
- **Vercel Hobby**: uso non-commerciale (ok per app personale).

## Principi

- Backend-first: schema + RLS solidi prima della UI. RLS attiva da subito su ogni tabella (default deny).
- Logica sensibile in Server Actions / Route Handlers; service-role key mai nel browser.
- Mobile-first; iterare a fasi, ogni fase con **acceptance criteria** verificabili.
- UI: derivare ogni scelta visiva dalla skill `modulor-design`.

---

## FASE 0 — Scaffold & infrastruttura

- `create-next-app@latest` (TS, App Router, Tailwind, ESLint). Node 20+.
- shadcn/ui init; PWA (manifest, icone, service worker, `display: standalone`).
- `@supabase/supabase-js` + `@supabase/ssr` (client browser + server con cookie).
- Token di `modulor-design` nel `tailwind.config` e nelle CSS variables globali (colori, font Jost/Inter/IBM Plex Mono, spacing Fibonacci).
- Cartelle: `app/(auth)`, `app/(app)`, `lib/supabase`, `lib/db`, `components/ui`.

**Acceptance**: `npm run dev` parte; route protette → login; PWA installabile; i font e i colori Modulor sono già attivi.

---

## FASE 1 — Schema DB + RLS

```sql
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  sex text check (sex in ('m','f')),
  birth_date date,
  height_cm numeric,
  activity_level text,
  goal text,                         -- 'cut' | 'bulk' | 'maintain'
  created_at timestamptz default now()
);

create table body_measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  measured_at timestamptz not null default now(),
  weight_kg numeric not null,
  body_fat_pct numeric,
  muscle_mass_kg numeric,
  water_pct numeric,
  bone_mass_kg numeric,
  bmr_kcal numeric,
  visceral_fat numeric,
  source text not null default 'manual',   -- 'manual' | 'health_sync'
  raw jsonb,
  created_at timestamptz default now()
);

create table foods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,  -- null = condiviso
  off_barcode text,
  name text not null, brand text,
  kcal_per_100 numeric not null,
  protein_per_100 numeric not null,
  carbs_per_100 numeric not null,
  fat_per_100 numeric not null,
  fiber_per_100 numeric,
  created_at timestamptz default now()
);
create index on foods (off_barcode);

create table food_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  logged_at timestamptz not null default now(),
  meal text not null,                 -- 'breakfast'|'lunch'|'dinner'|'snack'
  food_id uuid not null references foods(id),
  quantity_g numeric not null,
  created_at timestamptz default now()
);

create table nutrition_targets (
  user_id uuid primary key references auth.users on delete cascade,
  kcal numeric, protein_g numeric, carbs_g numeric, fat_g numeric,
  updated_at timestamptz default now()
);

create table exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  name text not null, muscle_group text,
  type text                            -- 'strength'|'calisthenics'|'cardio'
);
create table workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  performed_at timestamptz not null default now(),
  name text, notes text
);
create table workout_sets (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references workout_sessions(id) on delete cascade,
  exercise_id uuid not null references exercises(id),
  set_index int, reps int, weight_kg numeric, rpe numeric, rest_s int
);
```

**RLS** (per ogni tabella user-scoped):

```sql
alter table body_measurements enable row level security;
create policy "own rows" on body_measurements
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- foods: select su (user_id = auth.uid() OR user_id is null); write solo own
```

Trigger su nuovo utente → crea `profiles`. Usare il **Supabase MCP** per applicare migration e rigenerare i type TS.

**Acceptance**: RLS attiva e verificata con 2 utenti di test; `get_advisors` senza warning di sicurezza.

---

## FASE 2 — Auth & shell mobile

- Auth **email + password** (Supabase Auth): signup, login, logout, recupero password. Middleware per route protette.
- Onboarding `profiles` (sesso, data nascita, altezza, obiettivo).
- Shell: bottom nav (Peso · Cibo · Allenamento · AI) secondo `modulor-design`.

**Acceptance**: nuovo utente → onboarding → dashboard; sessione persiste (cookie SSR).

---

## FASE 3 — Peso & composizione

- Form inserimento manuale (peso + campi opzionali; numeri in mono).
- Storico + grafici trend (peso, %grasso, massa) con Recharts stile Modulor; media mobile 7gg.
- BMI; stima BMR/TDEE (Mifflin-St Jeor) per i target.
- Elemento firma "barra Modulor" sul trend/obiettivo.

**Acceptance**: 3 misurazioni → trend e media mobile corretti, look Modulor.

---

## FASE 4 — Bilancia Xiaomi S400 (path bloccato)

Catena: **S400 → Mi Home → Apple Health → Shortcut iOS → Edge Function → `body_measurements`**.

- Prerequisito utente (una tantum, per ciascuno): iPhone → Impostazioni → Salute → Accesso ai dati e dispositivi → **Mi Home** → abilita peso, %grasso, altezza, BMI. (Solo l'account principale Xiaomi sincronizza su Health.)
- **Edge Function** `ingest-health` (Supabase): riceve POST JSON dallo Shortcut, valida `SHORTCUT_SYNC_SECRET`, fa upsert in `body_measurements` con `source='health_sync'` (dedup su `measured_at`+`user_id`).
- **Shortcut iOS**: automazione che legge gli ultimi campioni Apple Health (peso, %grasso) e fa POST autenticato alla Edge Function. (Documentare i passi nello Shortcut; il secret va nel campo header dello Shortcut, non nel codice client.)
- Nota dati: su Health passano solo peso/%grasso/altezza/BMI. Muscolo/acqua/viscerale/BMR restano in Mi Home → eventuale inserimento manuale se li vuoi.
- Fallback: inserimento manuale (Fase 3) sempre disponibile.

**Acceptance**: dopo la pesata e l'esecuzione dello Shortcut, la misurazione compare nello storico con `source='health_sync'`, senza inserimento manuale.

---

## FASE 5 — Nutrizione

- Ricerca alimenti via **Open Food Facts** (testo + barcode). Scanner barcode in-browser (`BarcodeDetector`/zxing) dove supportato; fallback ricerca testuale.
- Cache prodotti usati in `foods` (riduce egress).
- Logging pasto: alimento + quantità g → macro/kcal.
- Dashboard giornaliera: kcal/macro consumati vs `nutrition_targets` (ring/barre stile Modulor coi 4 colori dati).
- Target auto da TDEE + obiettivo, modificabile.

**Acceptance**: log per nome e per barcode; somma macro/kcal vs target corretta.

---

## FASE 6 — Allenamento + AI

- Libreria esercizi (seed calisthenics + pesi), esercizi custom.
- Logging sessione: esercizi → set (reps, peso, RPE, rest).
- **AI (livello 1)**: bottone "Genera prompt" → blocco testo con snapshot dati (profilo, trend peso, media kcal/macro 2 settimane, ultime sessioni) da incollare in Claude chat. Nessuna chiamata API server-side.

**Acceptance**: "Genera prompt" produce un prompt completo e coerente coi dati reali.

---

## FASE 7 — Deploy, PWA polish, anti-pausa

- Deploy Vercel (env configurate), migration applicate in prod.
- PWA: icone (figura Modulor), offline shell, install prompt, theme color `--rouge`.
- **Cron giornaliera** (GitHub Action) con query leggera → evita la pausa Supabase a 7 giorni.
- Check: RLS, nessun secret nel bundle client, Lighthouse PWA.

**Acceptance**: app installata su entrambi i telefoni, flussi ok in prod, niente pausa Supabase.

---

## Decisioni — tutte chiuse

AI: solo livello 1 (prompt da incollare). · Auth: email + password. · OS: iPhone. · Bilancia: Xiaomi S400. → pronti a partire.

## Uso con Claude Code

Dai questo file come goal + tieni `modulor-design` in `.claude/skills/`. Esegui **una fase per volta**, validando gli acceptance criteria. Salvalo come `GOAL.md` in root; metti le regole permanenti in `CLAUDE.md` (vedi checklist).
