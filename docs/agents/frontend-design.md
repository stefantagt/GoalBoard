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

Innan du öppnar en pull request, kontrollera:

- [ ] **Kör testerna:** `npm run test`
  - Alla tester passerar
  - Om du lagt till ny UI-logik, överväg att lägga till tester
  
- [ ] **Typkontroll:** `npm run typecheck`
  - Inga TypeScript-fel
  - Alla props har korrekta typer
  
- [ ] **Bygget fungerar:** `npm run build`
  - Bygget lyckas utan fel eller varningar
  
- [ ] **Testa lokalt:** `npm run dev`
  - Komponenten/sidan visas korrekt
  - Ingen broken UI eller layout-problem
  - Responsiv design fungerar (mobil/desktop)
  - Tillgänglighet: tangentbordsnavigation, kontrast, semantisk HTML
  
- [ ] **Kodstilar:**
  - Tailwind-klasser används konsekvent
  - Komponentnamn är beskrivande
  - Inga hårdkodade strängar – använd `src/lib/labels.ts` för texter
  
- [ ] **Inga hemligheter:**
  - Ingen API-nyckel, lösenord eller anslutningssträng i koden
  
- [ ] **PR-beskrivning:**
  - Första raden: `**Agent-roll:** Frontend & Design`
  - Beskriv vad som ändrats och varför
  - Om du behöver röra databas eller bygge, nämn det

## Handoff till andra roller

### Till Databas-rollen
Om din UI-komponent behöver:
- Ny data från databasen
- Ändrad datastruktur
- Ny autentiseringslogik

→ Öppna en separat issue eller PR och låt Databas-rollen implementera backend-logiken först.

### Till Test-rollen
Om du:
- Lagt till komplex UI-logik som behöver enhetstester
- Upptäckt att existerande tester är bristfälliga

→ Nämn det i din PR och låt Test-rollen granska och förbättra.

### Till Säkerhetsrollen
Varje PR ska granskas av Säkerhetsrollen innan Stefan godkänner. Särskilt om du:
- Hanterar användarinput (formulär)
- Visar data från databasen (risk för XSS)
- Arbetar med navigation eller URL-parametrar

## Best practices

1. **Komponentstruktur:** Håll komponenter små och återanvändbara
2. **TypeScript:** Använd strikta typer, undvik `any`
3. **Tillgänglighet:** Använd semantiska HTML-element, ARIA när nödvändigt
4. **Prestanda:** Använd React.memo, useMemo och useCallback när det är meningsfullt
5. **Styling:** Följ befintliga Tailwind-konventioner i projektet
6. **Svenska:** All UI-text på svenska via `labels.ts`

## Vanliga uppgifter

- Skapa nya UI-komponenter
- Uppdatera befintliga komponenter
- Förbättra layout och design
- Lägg till nya sidor i applikationen
- Förbättra responsivitet
- Implementera tillgänglighet (a11y)
- Optimera prestanda i UI-lager
