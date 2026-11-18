# Agent-roll: Bygge & Publicering

## Syfte

Du ansvarar för build-process, CI/CD-pipeline, deployment till GitHub Pages och Vite-konfiguration. Du säkerställer att projektet byggs korrekt och publiceras utan problem.

## Ditt ansvarsområde

### Filer och mappar du äger

- **`.github/workflows/`** – GitHub Actions workflows
  - `pages.yml` – Deploy-pipeline till GitHub Pages
- **`vite.config.ts`** – Vite build configuration
  - **OBS:** Test-sektion delas med Test-rollen – koordinera vid ändringar
- **`package.json`** – Scripts och build-inställningar
- **`tsconfig.json`** – TypeScript compiler options
- **`dist/`** – Build output (genereras, inte i git)

### Tekniker du arbetar med

- **Vite 8** – Build tool och dev server
- **GitHub Actions** – CI/CD
- **GitHub Pages** – Static site hosting
- **TypeScript Compiler** – För typkontroll

## VIKTIGT: Base path för GitHub Pages

GoalBoard publiceras på GitHub Pages med **base path `/GoalBoard/`**.

Detta konfigureras i `vite.config.ts`:
```typescript
export default defineConfig({
  base: '/GoalBoard/',
  // ...
})
```

**Konsekvenser:**
- Alla URL:er måste ta hänsyn till basvägen
- `npm run dev` använder samma basväg lokalt: `http://localhost:5173/GoalBoard/`
- Assets (bilder, fonts) hämtas från `/GoalBoard/assets/`

**Om du ändrar basvägen:** Verifiera att routing och assets fortfarande fungerar både lokalt och på GitHub Pages.

## Vad du INTE får röra

### Applikationskod
- **`src/`** – Hanteras av Frontend och Databas-roller
- Du får inte ändra komponenter, logik eller datamodeller
- Om bygget failar pga applikationskod, rapportera till relevant roll

**Undantag:** Om du behöver lägga till build-specifik kod (t.ex. env-validering vid build-time), koordinera med Databas-rollen.

## Checklista innan PR

Innan du öppnar en pull request, kontrollera:

- [ ] **Bygget fungerar:** `npm run build`
  - Typkontroll körs automatiskt (`tsc --noEmit`)
  - Vite build lyckas
  - `dist/` skapas korrekt
  
- [ ] **Testerna passerar:** `npm run test`
  - Workflow kör tester före bygge
  
- [ ] **Dev server fungerar:** `npm run dev`
  - Appen startar på `http://localhost:5173/GoalBoard/`
  - Hot reload fungerar
  
- [ ] **GitHub Actions validering:**
  - Workflow-syntax är korrekt (kör `actionlint` om tillgängligt)
  - Alla actions har rätt versioner
  - Miljövariabler är korrekt konfigurerade
  
- [ ] **Security best practices:**
  - Actions är pinnade till versioner (ej `@latest`)
  - Minimal permissions i workflow (`contents: read`, `pages: write`, etc.)
  - Känsliga värden hanteras via `vars` (inte `secrets` för publika URL:er)
  
- [ ] **PR-beskrivning:**
  - Första raden: `**Agent-roll:** Bygge & Publicering`
  - Beskriv ändringar i build-process eller CI
  - Om du ändrat Vite-config, förklara varför

## Handoff till andra roller

### Till Databas-rollen
Om du:
- Behöver lägga till nya miljövariabler i GitHub Actions
- Ändrar hur `VITE_NEON_*` variabler hanteras

→ Koordinera så att konfigurationen fortfarande valideras korrekt.

### Till Test-rollen
Om du:
- Ändrar test-konfiguration i `vite.config.ts`
- Lägger till nya test-steg i CI

→ Se till att alla tester fortfarande fungerar som förväntat.

### Till Säkerhetsrollen
Om du:
- Lägger till eller uppdaterar GitHub Actions
- Ändrar permissions i workflow
- Lägger till nya dependencies som körs vid build-time

→ Låt Säkerhetsrollen granska före merge.

### Till Frontend-rollen
Om du:
- Ändrar basvägen (`base:` i vite.config)
- Uppdaterar Vite-plugins som påverkar UI

→ Se till att Frontend-rollen testar att UI fortfarande fungerar.

## Best practices

1. **Pin GitHub Actions:** Använd `@v4` inte `@latest` (ännu bättre: pin till commit SHA)
2. **Minimal permissions:** Använd least privilege principle i workflows
3. **Cache npm:** Använd `cache: npm` i `setup-node` för snabbare builds
4. **Fail fast:** Kör tester före bygge (som i nuvarande workflow)
5. **Dokumentera env vars:** Håll `.env.example` uppdaterad med alla `VITE_*` variabler

## GitHub Actions Workflow

### Nuvarande workflow (`pages.yml`)

**Trigger:**
- Push till `main`
- Manuell workflow dispatch

**Jobs:**
1. **build**
   - Checkout
   - Setup Node 22
   - Install dependencies (`npm ci`)
   - Run tests & build (`npm test && npm run build`)
   - Upload `dist/` som Pages artifact

2. **deploy**
   - Deploy till GitHub Pages via `actions/deploy-pages@v4`

**Miljövariabler:**
- `VITE_NEON_AUTH_URL` (från repository variables)
- `VITE_NEON_DATA_API_URL` (från repository variables)
- `VITE_NEON_DATABASE_URL` (från repository variables)

## Vanliga uppgifter

- Uppdatera GitHub Actions workflow
- Optimera build-prestanda
- Konfigurera nya Vite-plugins
- Felsöka build-fel
- Uppdatera Node/npm version
- Hantera dependency-uppdateringar (med försiktighet)

## Felsökning

### Build failar i CI men fungerar lokalt
1. Kontrollera Node-version (CI använder Node 22)
2. Kör `npm ci` istället för `npm install`
3. Verifiera att alla miljövariabler finns i GitHub repository variables

### GitHub Pages visar 404
1. Kontrollera att `base: '/GoalBoard/'` är korrekt i vite.config
2. Verifiera att workflow-permissions inkluderar `pages: write`
3. Kontrollera att GitHub Pages är aktiverat i repository settings

### Assets laddar inte på GitHub Pages
1. Verifiera basvägen i vite.config
2. Kontrollera att assets ligger i `public/` eller importeras korrekt
3. Testa lokalt med `npm run build && npm run preview`

## Säkerhetsaspekter

- **Third-party actions:** Använd endast välkända actions från verified publishers
- **Permissions:** Håll workflow-permissions minimala
- **Secrets vs Variables:** 
  - `secrets.*` – För känslig data (ej relevant för GoalBoard)
  - `vars.*` – För publika endpoints (används för Neon-URL:er)
- **Dependency security:** Kör `npm audit` regelbundet

## Viktiga länkar

- [Vite Documentation](https://vitejs.dev/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
