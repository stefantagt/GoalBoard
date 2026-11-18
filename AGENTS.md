# GoalBoard – Agentinstruktioner

Detta är den gemensamma ingången för alla Cursor Cloud Agents som arbetar i GoalBoard-repot.

## Projektöversikt

GoalBoard är en statisk React + TypeScript-app byggd med Vite som kommunicerar med en Neon-databas. Appen publiceras till GitHub Pages via GitHub Actions med basvägen `/GoalBoard/`.

**Teknikstack:**
- **Frontend:** React 19, TypeScript, Vite 8, React Router 7
- **Styling:** Tailwind CSS 4 (via Vite-plugin)
- **Databas:** Neon (via `@neon/neon-js` med Better Auth React adapter)
- **Test:** Vitest
- **Deploy:** GitHub Actions → GitHub Pages

## Agentstruktur

GoalBoard använder en **huvudagent med sex underagenter**:

- **Huvudagenten** samordnar arbetet, ansvarar för helheten i varje PR, och väljer vilka underagenter som behövs för uppgiften
- **Underagenterna** har var sin specialiserad kompetens och äger specifika delar av kodbasen

Huvudagenten kan själv sköta små uppgifter (t.ex. enkel dokumentationsuppdatering eller buggfix) och delegerar till en eller flera underagenter när deras kompetens behövs. En sammanhängande ändring får omfatta flera områden.

### Hur huvudagenten väljer underagenter

Huvudagenten analyserar uppgiften och:
1. **Identifierar filområden** som ska ändras (använd rolltabellen nedan)
2. **Delegerar till underagenter** vars ansvarsområden berörs
3. **Samordnar arbetet** om flera underagenter behövs
4. **Ansvarar för helheten** i PR:n – säkerställer att ändringarna passar ihop

**Exempel:**
- Ny React-komponent som hämtar data → Frontend + Databas
- Ändra bygge-process → Bygge (huvudagent kan koordinera)
- Uppdatera README → Huvudagent kan göra själv (eller delegera till Dokumentation)
- Säkerhetskritisk ändring → Säkerhet kopplas alltid in

Använd rollernas filområden för att undvika överlappande arbete. Vid konflikt samordnar huvudagenten.

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
| `npm test` | Kör alla enhetstester med Vitest |
| `npm run typecheck` | TypeScript-kontroll utan att bygga |
| `npm run build` | Typkontroll OCH produktionsbygge till `dist/` |
| `npm run preview` | Förhandsgranska produktionsbygget lokalt |

**Obs:** `npm run build` kör redan typkontroll (`tsc --noEmit`) före bygget.

## Globala regler för alla agenter

Alla agenter som arbetar i detta repo **MÅSTE** följa dessa regler:

### 1. 🚫 Merge aldrig till main själv
Endast ägaren (Stefan) godkänner och mergar PR:ar. Agenten öppnar PR:ar men mergar INTE.

### 2. 🔒 Repot är publikt – commit aldrig hemligheter
- `.env` finns INTE i git (kontrollera `.gitignore`)
- Uppdatera endast `.env.example` med platshållare, aldrig riktiga nycklar
- Inga lösenord, API-nycklar, databas-anslutningssträngar eller Neon API-nycklar i kod
- **Vite infogar `VITE_*`-variabler i det publicerade bygget** – de är synliga för alla
- Endast publika HTTPS-endpoints får användas i `VITE_*`-variabler

### 3. 🗑️ Radering kräver godkännande
- **Kräv Stefans godkännande** före radering av grenar, data eller större delar av projektet
- Vanlig filstädning inom uppgiften (t.ex. ta bort temporära testfiler) kan ingå i PR

### 4. 📝 Små, fokuserade PR:ar
- En PR = en logisk förändring
- Tydlig beskrivning av vad som ändrats och varför
- Huvudagent: nämn vilka underagenter som använts

### 5. ✅ Kontroller vid kodändringar
Vid kodändringar, kör:
```bash
npm test           # Alla tester måste gå igenom
npm run build      # Bygget (inkl. typkontroll) måste lyckas
```

Vid rena dokumentationsändringar räcker diff- och länkkontroll.

### 6. 🏷️ Huvudagentens ansvar
- Huvudagenten ansvarar för helheten i PR:n
- Samordnar underagenter när flera områden berörs
- Säkerställer att ändringarna passar ihop

## Underagenter och ansvarsområden

Varje underagent har sitt specialområde och instruktionsfil:

| Underagent | Fil | Ansvar |
|------------|-----|--------|
| **Frontend & Design** | [docs/agents/frontend-design.md](docs/agents/frontend-design.md) | React-komponenter, UI/UX, routing, state management |
| **Databas (Neon)** | [docs/agents/databas-neon.md](docs/agents/databas-neon.md) | Neon-integration, API-anrop, datamodeller, autentisering |
| **Test & Kvalitet** | [docs/agents/test-kvalitet.md](docs/agents/test-kvalitet.md) | Enhetstester, testinfrastruktur, kodkvalitet |
| **Bygge & Publicering** | [docs/agents/bygge-publicering.md](docs/agents/bygge-publicering.md) | GitHub Actions, Vite-konfiguration, deployment |
| **Dokumentation** | [docs/agents/dokumentation.md](docs/agents/dokumentation.md) | README, kommentarer, utvecklardokumentation |
| **Säkerhet** | [docs/agents/sakerhet.md](docs/agents/sakerhet.md) | Säkerhetsgranskningar, sårbarheter, secrets-hantering |

## Koordinering mellan underagenter

När arbete påverkar flera områden:
1. Huvudagenten koordinerar och ansvarar för helheten
2. Använd filområden för att avgöra vilka underagenter som behövs
3. Säkerhetsunderagent kopplas in vid säkerhetskritiska ändringar

## Kommunikation

- Alla PR:ar går till Stefan för godkännande
- PR-beskrivningar och instruktioner på svenska
- Säkerhetsunderagent rapporterar blockerande fynd till huvudagent och Stefan
- Stefan fattar merge-beslutet
