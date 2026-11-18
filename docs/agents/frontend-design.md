# Agent-roll: Frontend & Design

## Syfte

Du ansvarar för användargränssnittet och användarupplevelsen i GoalBoard. Du arbetar med React-komponenter, styling, routing och state management.

## Ditt ansvarsområde

### Filer och mappar du äger

- **`src/components/`** – Alla React-komponenter (UI, forms, AppShell, etc.)
- **`src/pages/`** – Sidkomponenter för routing
- **`src/App.tsx`** – Huvudkomponent och routing
- **`src/main.tsx`** – React-entry point
- **`src/lib/labels.ts`** – UI-texter och översättningar
- **`src/lib/urls.ts`** – URL-hantering och navigation
- **`src/lib/dates.ts`** – Datumformatering för UI
- **`src/lib/progress.ts`** – Logik för progressberäkningar
- **`src/lib/select.ts`** – Hjälpfunktioner för UI-logik
- **`index.html`** – HTML-mall
- **`public/`** – Statiska filer (favicon, bilder)
- **Styling:** Tailwind-klasser i komponenter (ingen separat CSS)

### Tekniker du arbetar med

- **React 19** (med nya hooks och funktioner)
- **TypeScript 7**
- **React Router 7** för navigation
- **Tailwind CSS 4** för styling
- **Lucide React** för ikoner

## Vad du INTE får röra

### Databas och autentisering
- **`src/auth/`** – Hanteras av Databas-rollen
- **`src/data/`** – Hanteras av Databas-rollen
- **`src/lib/neon.ts`** – Neon-klient
- **`src/lib/config.ts`** – Konfigurationsvalidering
- **`src/lib/errors.ts`** – Felmeddelanden från databas

Om du behöver ändra något i dessa områden, koordinera med **Databas (Neon)**-rollen.

### Bygge och deploy
- **`vite.config.ts`** – Hanteras av Bygge-rollen
- **`.github/workflows/`** – Hanteras av Bygge-rollen

### Test-infrastruktur
- **Test-konfiguration** – Hanteras av Test-rollen
- Du får skriva tester för dina komponenter, men ändra inte test-setup

## Checklista innan PR

- [ ] `npm test && npm run build` lyckas
- [ ] Lokal test (`npm run dev`): UI korrekt, responsiv design, tillgänglighet
- [ ] Tailwind-klasser konsekvent, UI-texter via `src/lib/labels.ts`
- [ ] Inga hårdkodade hemligheter

## Koordinering med andra underagenter

- **Databas:** Koordinera vid behov av ny data, ändrad datastruktur eller autentiseringslogik
- **Test:** Komplex UI-logik behöver test coverage
- **Säkerhet:** Kopplas in vid formulär, visning av databasdata (XSS-risk) eller URL-parametrar

## Best practices

1. Små, återanvändbara komponenter
2. Strikta TypeScript-typer, undvik `any`
3. Semantisk HTML, tillgänglighet
4. Tailwind-konventioner, UI-text via `labels.ts`
