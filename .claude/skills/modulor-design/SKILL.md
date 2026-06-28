---
name: modulor-design
description: Linea di stile e design system per l'app Modulor (health/nutrition/training PWA). Da applicare per QUALSIASI lavoro di UI/frontend del progetto — componenti, schermate, grafici, palette, tipografia, spaziature. Usare questi token e principi invece dei default di shadcn/Tailwind.
---

# Modulor — Design System

## Tesi

Modulor prende il nome dal sistema di proporzioni di Le Corbusier, costruito sul corpo umano e sulla serie di Fibonacci / sezione aurea. L'app misura il corpo; **il design si misura con la stessa logica**. Direzione: razionalista, precisa, "calcestruzzo caldo", a colore disciplinato. Bauhaus/modernismo anni '40-'50, non minimalismo generico.

## ⚠️ Anti-default (leggere prima di scegliere)

Il design AI tende a 3 cliché: (1) sfondo crema + display serif + accento terracotta; (2) quasi-nero + un accento acido; (3) layout "broadsheet" con sole righe sottili e raggio 0. **Modulor non è nessuno di questi.** I differenziatori obbligatori:

- **Sans geometrico** (lineage Futura), MAI display serif — è coerente con l'epoca di Le Corbusier.
- Palette = **vera Polychromie Architecturale** di Le Corbusier (rossi/blu/ocra/verdi specifici), non "terracotta" generica.
- **Spaziature = serie di Fibonacci** (vedi sotto): è la firma, non decorazione.
- Uso di **piani di colore pieni** (color-blocking modernista), non solo hairline.

## Color tokens (Polychromie, restrained)

Sfondo neutro caldo + inchiostro scuro + UN accento forte (rouge) usato con parsimonia. Gli altri colori servono quasi solo ai dati.

```css
:root {
  --beton: #e7e4dc; /* background, calcestruzzo chiaro caldo (più grigio del crema-cliché) */
  --surface: #f3f1eb; /* card / superfici rialzate */
  --encre: #1c1b18; /* testo / icone */
  --encre-2: #6b6862; /* testo secondario */
  --ligne: #c9c3b4; /* bordi hairline */

  --rouge: #b23a1e; /* ACCENTO primario — azioni chiave, stato attivo, serie peso */
  --bleu: #2e4057; /* secondario — seconda serie dati, link */
  --ocre: #c68a30; /* terza serie / warning soft */
  --vert: #5f6e4a; /* on-target / success (muted, earthy) */
}

/* Dark opzionale */
@media (prefers-color-scheme: dark) {
  :root {
    --beton: #16150f;
    --surface: #211f18;
    --encre: #e7e4dc;
    --encre-2: #9a968c;
    --ligne: #34322a;
    --rouge: #cf4a2c;
    --bleu: #5c7fa6;
    --ocre: #d6a24a;
    --vert: #7e9163;
  }
}
```

Regola d'oro: **un solo rosso protagonista**. Tutto il resto quieto. I 4 colori dati (rouge/bleu/ocre/vert) si usano in modo consistente: peso=rouge, una seconda metrica=bleu, ecc.

## Tipografia (tutte free, Google Fonts)

- **Display / heading → `Jost`** (geometrico, lineage Futura). Pesi 500/600, tracking leggermente stretto sui titoli grandi.
- **Body / UI → `Inter`** (neutro, leggibile a piccoli corpi su mobile).
- **Dati / numeri → `IBM Plex Mono`** — FIRMA: ogni metrica (kg, %, kcal, macro, reps, RPE) va in mono. Fa sembrare l'interfaccia uno strumento di misura. I numeri non sono mai in Inter.

```css
--font-display: "Jost", sans-serif;
--font-body: "Inter", sans-serif;
--font-mono: "IBM Plex Mono", monospace;
```

### Type scale (modulare, rem, base 16px)

`0.75 · 0.875 · 1 · 1.125 · 1.5 · 2 · 2.75 · 3.75`
Display grande per i numeri-chiave (es. peso di oggi in mono 2.75–3.75rem), gerarchia netta, niente "tutto medio".

## Spaziatura — la firma Modulor (Fibonacci, px)

Niente scala arbitraria 4/8/12/16. Si usa la **serie di Fibonacci**:
`4 · 8 · 13 · 21 · 34 · 55 · 89 · 144`

```js
// tailwind.config — spacing
spacing: { fib1:'4px', fib2:'8px', fib3:'13px', fib4:'21px', fib5:'34px', fib6:'55px', fib7:'89px', fib8:'144px' }
```

Padding card, gap, margini di sezione: sempre dalla serie. È coerente col nome ed è percepibile.

## Layout

- Mobile-first, **bottom nav** a 4 voci (Peso · Cibo · Allenamento · AI), icone `--encre`, attiva `--rouge`.
- Griglia modulare, margini `--beton` generosi.
- Superfici = rettangoli piatti su `--surface` con bordo hairline `--ligne`; **raggio piccolo e costante (2–4px)**, non 0 (evita il look broadsheet) e non pillole morbide.
- **Color-blocking** come mossa modernista: es. fascia header dello stato giornaliero come piano pieno `--rouge` o `--bleu` con testo `--beton`. Usato 1 volta per schermata, non ovunque.
- Ombre: quasi assenti; la profondità è data da bordi e piani di colore.

## Elemento firma

La **"barra Modulor"**: un righello proporzionale verticale (segmenti rosso/blu come la figura del Modulor) usato per il trend peso e per i progressi verso il target. Idea anche per l'icona PWA: silhouette/figura del Modulor stilizzata. È l'unico elemento "memorabile": tenere tutto il resto disciplinato.

## Data viz (Recharts)

- Linee sottili, label assi in `--font-mono`, griglia in `--ligne`.
- Peso: linea `--rouge` + media mobile 7gg in grigio.
- Macro: ring o barre con i 4 colori dati; nessun gradiente, nessun effetto lucido.

## Componenti & copy

- Bottoni primari: pieno `--rouge`, testo chiaro; **verbi attivi in sentence case** ("Salva misurazione", "Aggiungi pasto", non "Submit"). L'azione mantiene lo stesso nome in tutto il flusso.
- Stati vuoti = invito ad agire, non decorazione ("Nessuna misurazione oggi — sali sulla bilancia o aggiungi a mano").
- Errori: dicono cosa è successo e come rimediare, voce dell'interfaccia, niente scuse.
- Lingua UI: **italiano**, sentence case, verbi semplici.

## Quality floor (sempre)

Responsive fino a mobile; focus tastiera visibile; `prefers-reduced-motion` rispettato; contrasto AA. Motion minimale e funzionale (transizioni di navigazione, micro-feedback sul log), mai effetti scenografici.

## Come usarla

All'inizio di ogni schermata/componente: deriva colori, font, spaziature SOLO da questi token. Se una scelta somiglia al default shadcn o ai 3 cliché sopra, cambiala e spiega perché. La baldanza si spende sull'elemento firma; il resto resta quieto.
