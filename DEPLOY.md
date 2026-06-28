# Deploy — Modulor

Tutto il codice è pronto. Mancano solo i passi che richiedono i tuoi account
(GitHub, Vercel) e i tuoi telefoni. Lo schema DB e la Edge Function sono **già
applicati sul progetto Supabase live** (`modulor`) tramite migration.

## 1. Variabili d'ambiente

Già in `.env.local` (non committato). Servono anche su Vercel:

```
NEXT_PUBLIC_SUPABASE_URL=https://rxwhqdafnelnnjkcxech.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_AaExO9CIhyf4yBBMY_V2kA_FJzAamUC
```

Sono client-safe (protette da RLS). Nessun secret server è necessario per il
deploy dell'app: la Edge Function usa la service-role key iniettata da Supabase.

## 2. Push su GitHub

```bash
gh repo create modulor --private --source=. --remote=origin --push
# oppure: crea il repo a mano e `git push -u origin main`
```

## 3. Import su Vercel (Hobby, free)

1. vercel.com → Add New → Project → importa il repo `modulor`.
2. Framework: Next.js (auto). Build/Output: default.
3. Environment Variables → aggiungi le due `NEXT_PUBLIC_*` qui sopra.
4. Deploy. Ottieni un URL tipo `https://modulor.vercel.app`.

## 4. Supabase — configurazione una tantum (dashboard)

- **Auth → URL Configuration**: imposta *Site URL* = il dominio Vercel e
  aggiungi `https://<tuo-dominio>.vercel.app/**` ai *Redirect URLs* (serve per i
  link di conferma email e reset password).
- **Auth → Providers/Policies**: abilita *Leaked password protection*
  (HaveIBeenPwned) — consigliato dall'advisor di sicurezza.
- **Conferma email**: attualmente **attiva**. Lasciala così (più sicura) oppure
  disattivala (`Auth → Sign In / Providers → Confirm email`) se vuoi che la
  registrazione entri subito senza click sull'email.

## 5. Anti-pausa Supabase (GitHub Action)

Il workflow `.github/workflows/keepalive.yml` pinga `/api/health` ogni giorno.
Imposta la variabile del repo:

- GitHub → Settings → Secrets and variables → Actions → **Variables** →
  `MODULOR_URL = https://<tuo-dominio>.vercel.app`

(Esegui una volta a mano da Actions → Keepalive Supabase → Run workflow.)

## 6. Installazione sui telefoni (PWA)

- **iPhone**: apri l'URL in Safari → Condividi → *Aggiungi a Home*.
- **Android**: comparirà il banner "Installa Modulor" (o menu → Installa app).

Ogni utente: registrati (email + password) → conferma email → onboarding.

## 7. Sync bilancia (per ciascun utente)

Nell'app: tab Peso → *Sincronizza con la bilancia* (`/sync`). Lì trovi endpoint,
token personale e i passi per lo Shortcut iOS (Apple Salute → Edge Function).
Prerequisito una tantum: iPhone → Salute → Mi Home → abilita peso/%grasso.

## Account di test

Esiste `arber@alesea.com` (password provvisoria `modulor2026`), già confermato e
con dati d'esempio (peso, pasti, un allenamento). Cambia la password da
"Password dimenticata" o elimina/ricrea l'account come preferisci.

## Sviluppo locale

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build di produzione
npm run lint
npx tsc --noEmit
```
