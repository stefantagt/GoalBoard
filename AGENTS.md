# GoalBoard – Agentinstruktioner

Detta dokument beskriver hur Cursor Cloud Agents arbetar i GoalBoard-repot.

## Projektöversikt

GoalBoard är en statisk React + TypeScript-app byggd med Vite som kommunicerar med en Neon-databas. Appen publiceras till GitHub Pages via GitHub Actions med basvägen `/GoalBoard/`.

**Teknikstack:**
- **Frontend:** React 19, TypeScript, Vite 8, React Router 7
- **Styling:** Tailwind CSS 4
- **Databas:** Neon (via `@neon/neon-js` med Better Auth React adapter)
- **Test:** Vitest
- **Deploy:** GitHub Actions → GitHub Pages

## Så här kör du projektet

Kräver Node 22.

```bash
npm install
cp .env.example .env
# Fyll i .env med de två Neon-adresserna (Auth URL och Data API URL)
npm run dev
```

Öppna `http://localhost:5173/GoalBoard/`

## Tillgängliga skript

| Kommando | Beskrivning |
|----------|-------------|
| `npm run dev` | Startar Vite dev-server |
| `npm run test` | Kör alla enhetstester med Vitest |
| `npm run typecheck` | TypeScript-kontroll utan att bygga |
| `npm run build` | Typkontroll OCH produktionsbygge till `dist/` |
| `npm run preview` | Förhandsgranska produktionsbygget lokalt |

## Globala regler för alla agenter

Alla agenter som arbetar i detta repo **MÅSTE** följa dessa regler:

### 1. 🚫 Merge aldrig till main själv
Endast ägaren (Stefan) godkänner och mergar PR:ar. Agenten öppnar PR:ar men mergar INTE.

### 2. 🔒 Repot är publikt – commit aldrig hemligheter
- `.env` finns INTE i git (kontrollera `.gitignore`)
- Uppdatera endast `.env.example` med platshållare, aldrig riktiga nycklar
- Inga lösenord, API-nycklar, databas-anslutningssträngar eller Neon API-nycklar i kod
- Vite infogar miljövariabler i den statiska siten, så `VITE_*`-variabler är publika
- Endast publika Neon Auth URL och Data API URL är tillåtna

### 3. 🗑️ Ta aldrig bort filer, grenar eller data utan uppmaning
Fråga alltid innan du raderar något. Inga automatiska cleanup-operationer.

### 4. 📝 Små, fokuserade PR:ar
- En PR = en logisk förändring
- Tydlig beskrivning av vad som ändrats och varför
- Nämn vilken roll du agerade som i PR-beskrivningen

### 5. ✅ Kör alltid test, typecheck och build innan PR
Innan du öppnar en PR:
```bash
npm run test       # Alla tester måste gå igenom
npm run typecheck  # Inga TypeScript-fel
npm run build      # Bygget måste lyckas
```

Om något fallerar, fixa det innan PR:n öppnas.

### 6. 🏷️ Ange din roll i PR-beskrivningen
Första raden i PR-beskrivningen ska innehålla: `**Agent-roll:** [rollnamn]`

## Agentroller och ansvarsområden

En koordinerande agent kommer att starta en Cloud Agent per uppgift och tilldela en roll. Varje roll har ett tydligt ansvarsområde och egna riktlinjer.

| Roll | Fil | Ansvar |
|------|-----|--------|
| **Frontend & Design** | [docs/agents/frontend-design.md](docs/agents/frontend-design.md) | React-komponenter, UI/UX, routing, state management |
| **Databas (Neon)** | [docs/agents/databas-neon.md](docs/agents/databas-neon.md) | Neon-integration, API-anrop, datamodeller, autentisering |
| **Test & Kvalitet** | [docs/agents/test-kvalitet.md](docs/agents/test-kvalitet.md) | Enhetstester, testinfrastruktur, kodkvalitet |
| **Bygge & Publicering** | [docs/agents/bygge-publicering.md](docs/agents/bygge-publicering.md) | GitHub Actions, Vite-konfiguration, deployment |
| **Dokumentation** | [docs/agents/dokumentation.md](docs/agents/dokumentation.md) | README, kommentarer, utvecklardokumentation |
| **Säkerhet** | [docs/agents/sakerhet.md](docs/agents/sakerhet.md) | Säkerhetsgranskningar, sårbarheter, secrets-hantering |

## Koordinering mellan roller

Om ditt arbete påverkar en annan rolls ansvarsområde:
1. Nämn det tydligt i PR-beskrivningen
2. Tagga relevanta filer som "berörs av annat område"
3. Om osäker: låt Säkerhetsrollen granska först

## Kommunikation med Stefan

- Alla PR:ar går till Stefan för godkännande
- Skriv PR-beskrivningar på svenska
- Var tydlig om vad som ändrats och varför
- Flagga eventuella brådskande säkerhetsproblem direkt
