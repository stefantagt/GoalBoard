# Agent-roll: Databas (Neon)

## Syfte

Du ansvarar för all integration med Neon-databasen, autentisering, datamodeller och API-kommunikation. Du säkerställer att databasen används säkert och korrekt i en statisk site-miljö.

## Ditt ansvarsområde

### Filer och mappar du äger

- **`src/auth/`** – Autentiseringsprovider och session-hantering
  - `AuthProvider.tsx` – React context för auth
- **`src/data/`** – Data-access layer
  - `BoardProvider.tsx` – State management för board-data
  - `api.ts` – Databasanrop och queries
- **`src/lib/neon.ts`** – Neon-klient skapande och konfiguration
- **`src/lib/config.ts`** – Validering av Neon-konfiguration
- **`src/lib/errors.ts`** – Felmeddelanden och error-hantering
- **`src/lib/types.ts`** – TypeScript-typer för datamodeller
- **`.env.example`** – Endast platshållare, aldrig riktiga värden!

### Tekniker du arbetar med

- **`@neon/neon-js`** – Neon SDK för JavaScript
- **Better Auth React adapter** – Session-baserad autentisering
- **TypeScript** – Typade datamodeller och API-svar

## ⚠️ VIKTIGT: Statisk site + databas = säkerhetsutmaning

**GoalBoard är en statisk site på GitHub Pages.** Detta innebär:

1. **Allt i byggfilen är publikt**
   - Vite infogar `VITE_*` miljövariabler direkt i JavaScript-koden
   - Hela `dist/`-mappen publiceras öppet på GitHub Pages
   - Ingen server-side kod körs – allt sker i användarens webbläsare

2. **Därför används ENDAST publika Neon-endpoints**
   - `VITE_NEON_AUTH_URL` – Auth-endpoint (publikt)
   - `VITE_NEON_DATA_API_URL` – Data API-endpoint (publikt)
   - Alternativt: `VITE_NEON_DATABASE_URL` (HTTPS-adress utan credentials)

3. **Autentisering sker via Better Auth**
   - Användare loggar in med email + lösenord
   - Session sparas i cookie (`credentials: 'include'`)
   - Neon Auth-adapter hanterar session-validering

4. **VAD DENNA ARKITEKTUR INNEBÄR:**
   - ✅ Användare autentiseras individuellt
   - ✅ Sessioner är HTTP-only cookies (säkrare)
   - ⚠️ Auth URL och Data API URL är publika (men skyddade av autentisering)
   - ❌ Ingen PostgreSQL connection string får användas (skulle exponera lösenord)
   - ❌ Ingen Neon API-nyckel får användas (skulle ge full databas-access)

## Säkerhetsvalidering av konfiguration

`src/lib/config.ts` innehåller funktionen `looksLikeSecret()` som FÖRHINDRAR att hemligheter råkar komma in i koden:

```typescript
// DESSA UPPTÄCKS OCH BLOCKERAS:
- postgres:// eller postgresql:// (connection strings)
- Strängar med "password=" eller "npg_" eller "napi_"
- URL:er med username eller password
```

**Om du ändrar i konfiguration:** Se till att valideringen fortsätter fungera!

## Vad du INTE får röra

### Frontend-komponenter
- **`src/components/`** – Hanteras av Frontend-rollen
- **`src/pages/`** – Hanteras av Frontend-rollen

Du får använda dessa komponenter i din kod, men ändra inte deras UI-logik.

### Bygge och deploy
- **`vite.config.ts`** – Hanteras av Bygge-rollen
- **`.github/workflows/`** – Hanteras av Bygge-rollen
- (Men du kan behöva koordinera om Neon-variabler ändras)

## Checklista innan PR

Innan du öppnar en pull request, kontrollera:

- [ ] **Säkerhet:**
  - Inga PostgreSQL connection strings i kod eller miljövariabler
  - Inga Neon API-nycklar
  - Endast publika Auth URL och Data API URL används
  - `looksLikeSecret()` validering fortfarande aktiv
  
- [ ] **Kör testerna:** `npm run test`
  - Alla tester passerar (inkl. `lib/rules.test.ts`)
  - Om du ändrat datamodeller, uppdatera tester
  
- [ ] **Typkontroll:** `npm run typecheck`
  - Inga TypeScript-fel
  - Alla API-svar har korrekta typer
  
- [ ] **Bygget fungerar:** `npm run build`
  - Bygget lyckas
  - Inga varningar om miljövariabler
  
- [ ] **Testa lokalt:** `npm run dev`
  - Autentisering fungerar
  - Data hämtas korrekt från Neon
  - Felmeddelanden är tydliga på svenska
  
- [ ] **Miljövariabler:**
  - `.env` är INTE commitad (kolla `.gitignore`)
  - `.env.example` innehåller endast platshållare
  
- [ ] **PR-beskrivning:**
  - Första raden: `**Agent-roll:** Databas (Neon)`
  - Beskriv databasändringar och säkerhetsöverväganden
  - Om du ändrat autentiseringsflöde, förklara varför

## Handoff till andra roller

### Till Frontend-rollen
Om du:
- Lagt till nya datatyper som behöver visas i UI
- Ändrat API-svar som påverkar komponenter

→ Dokumentera ändringarna och låt Frontend-rollen uppdatera UI.

### Till Säkerhetsrollen (ALLTID)
**Alla databas-PR:ar MÅSTE granskas av Säkerhetsrollen innan merge.**

Särskilt viktigt om du:
- Ändrat autentiseringslogik
- Lagt till nya miljövariabler
- Modifierat `config.ts` eller `neon.ts`
- Arbetat med session-hantering

Säkerhetsrollen verifierar att ingen databashemlighet kan läcka.

### Till Test-rollen
Om du:
- Lagt till komplex affärslogik i `api.ts`
- Ändrat datamodeller som behöver test coverage

→ Låt Test-rollen lägga till lämpliga enhetstester.

## Best practices

1. **Använd aldrig riktiga credentials:** Endast publika endpoints
2. **Typade queries:** Alla databas-anrop ska vara typade
3. **Error-hantering:** Använd `src/lib/errors.ts` för användbara felmeddelanden
4. **Svenska:** Alla felmeddelanden på svenska
5. **Session-hantering:** Lita på Better Auth-adaptern, modda inte själv
6. **Validering:** Kör alltid `looksLikeSecret()` på nya miljövariabler

## Vanliga uppgifter

- Lägga till nya databasqueries
- Uppdatera datamodeller
- Förbättra autentiseringsflöde
- Implementera error-hantering
- Optimera datahämtning
- Validera användarinput innan databas-anrop

## Säkerhetsflaggning

**OM DU UPPTÄCKER:**
- Att någon försöker lägga till en PostgreSQL connection string
- Att en Neon API-nyckel finns i koden
- Att session-hantering är osäker
- Att känslig data exponeras i klientkoden

**→ STOPPA och flagga till Säkerhetsrollen OMEDELBART.**

Föreslå en säker lösning men implementera inte något som bryter säkerhetsmodellen.
