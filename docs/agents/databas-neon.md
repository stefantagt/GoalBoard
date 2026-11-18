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
   - **Vite infogar `VITE_*` miljövariabler i det publicerade bygget**
   - Hela `dist/`-mappen publiceras öppet på GitHub Pages
   - Ingen server-side kod körs – allt sker i användarens webbläsare
   - **Alla `VITE_*`-värden är synliga i JavaScript-koden för alla**

2. **Därför används ENDAST publika HTTPS-endpoints**
   - `VITE_NEON_AUTH_URL` – Auth-endpoint (publikt HTTPS)
   - `VITE_NEON_DATA_API_URL` – Data API-endpoint (publikt HTTPS)
   - `VITE_NEON_DATABASE_URL` – Befintligt kompatibilitetsalternativ för publik HTTPS-adress (SDK härleder Auth/Data API-URL:er från denna)

3. **Autentisering och åtkomstkontroll**
   - Användare loggar in med email + lösenord via Better Auth
   - Session sparas i cookie med `credentials: 'include'` (styr om cookies skickas)
   - Servern (Neon) sätter HTTP-only-flag på cookies
   - **Radnivåsäkerhet (RLS) i Neon:** Privata tabeller som exponeras via Data API ska ha RLS aktiverad. Innan användning med privata data ska det verifieras att ägarens konto kan läsa och skriva, och att både oinloggade och andra inloggade konton nekas
   - **Registrering:** Öppen registrering ska vara stängd eller begränsad för denna enanvändarapp

4. **VAD DENNA ARKITEKTUR INNEBÄR:**
   - ✅ Användare autentiseras individuellt
   - ✅ Sessioner skyddas av HTTP-only cookies
   - ⚠️ Auth/Data API-URL:er är publika (men RLS skyddar data)
   - ❌ PostgreSQL connection strings får ALDRIG användas (exponerar lösenord)
   - ❌ Neon API-nycklar får ALDRIG användas (ger full databas-access)

## Säkerhetsvalidering av konfiguration

`src/lib/config.ts` innehåller funktionen `looksLikeSecret()` som är en **extra kontroll** för att förhindra att credentials råkar hamna i `VITE_*`-variabler:

```typescript
// DESSA UPPTÄCKS OCH BLOCKERAS:
- postgres:// eller postgresql:// (connection strings)
- Strängar med "password=" eller "npg_" eller "napi_"
- URL:er med username eller password
```

Detta är ett säkerhetslager, men den primära ansvaret ligger på att aldrig lägga till hemligheter i första hand.

**Vid en läckt hemlighet:**
1. Spärra eller rotera hemligheten FÖRST (i Neon Console)
2. Ta sedan bort från koden med `git rm --cached <fil>` (lämnar tidigare commits intakta)
3. Överväg att rensa git-historiken om känsligt värde kommit in

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

- [ ] **Säkerhet:** Inga PostgreSQL connection strings, API-nycklar eller credentials i kod
- [ ] **RLS-verifiering:** Om privata tabeller berörs, verifiera åtkomstkontroll (se ovan)
- [ ] **Kontroller:** `npm test && npm run build` lyckas
- [ ] **Miljövariabler:** `.env` inte commitad, `.env.example` endast platshållare
- [ ] **Lokal test:** Autentisering och datahämtning fungerar

## Koordinering med andra underagenter

- **Säkerhet:** Kopplas in vid ändringar som rör autentisering, åtkomstpolicyer, hemligheter eller miljövariabler
- **Frontend:** Dokumentera nya datatyper eller API-ändringar som påverkar UI
- **Test:** Komplex affärslogik eller datamodells-ändringar behöver test coverage

## Best practices

1. Endast publika HTTPS-endpoints i `VITE_*`-variabler
2. Typade databas-anrop och API-svar
3. Felmeddelanden på svenska via `src/lib/errors.ts`
4. Lita på Better Auth – ingen egen session-hantering
5. Verifiera RLS-åtkomst innan privata tabeller används

## Säkerhetsflaggning

Om du upptäcker att någon försöker lägga till PostgreSQL connection strings, API-nycklar eller andra credentials: **stoppa och flagga till Säkerhet och huvudagenten omedelbart.**
