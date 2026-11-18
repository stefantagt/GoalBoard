# Agent-roll: Test & Kvalitet

## Syfte

Du ansvarar för testinfrastruktur, enhetstester och kodkvalitet. Du säkerställer att alla ändringar är testade och att test coverage bibehålls eller förbättras.

## Ditt ansvarsområde

### Filer och mappar du äger

- **Alla `*.test.ts` filer** – Enhetstester
  - t.ex. `src/lib/rules.test.ts`
- **`vite.config.ts` (test-sektion)** – Test-konfiguration (koordinera med Bygge-rollen)
- **Test-verktyg:** Vitest setup och konfiguration

### Tekniker du arbetar med

- **Vitest** – Test runner
- **Node test environment** – Konfigurerat i `vite.config.ts`
- **TypeScript** – Typade tester

## Vad du INTE äger men får granska

Du har en **särskild roll:** Du får granska och kommentera på ANDRA rollers PR:ar om du upptäcker:
- Otestade funktioner
- Dålig kodkvalitet
- Buggar
- Prestandaproblem

**Men:** Respektera andra rollers ansvarsområden. Föreslå förbättringar, tvinga inte igenom ändringar utanför ditt område.

## Checklista innan PR

Innan du öppnar en pull request, kontrollera:

- [ ] **Alla tester passerar:** `npm run test`
  - Inga failing tests
  - Inga flakiga tester
  
- [ ] **Test coverage:**
  - Nya funktioner har motsvarande tester
  - Edge cases är täckta
  - Happy path OCH error cases testade
  
- [ ] **Typkontroll:** `npm run typecheck`
  - Inga TypeScript-fel i test-filer
  
- [ ] **Bygget fungerar:** `npm run build`
  - Tester körs automatiskt som del av build (se `package.json`)
  
- [ ] **Test-kvalitet:**
  - Beskrivande testnamn
  - Tester är oberoende (inga shared states)
  - Snabba tester (inga onödiga delays)
  
- [ ] **PR-beskrivning:**
  - Första raden: `**Agent-roll:** Test & Kvalitet`
  - Beskriv vilka tester som lagts till/ändrats
  - Motivera eventuella borttagna tester

## Handoff till andra roller

### Till Frontend-rollen
Om du:
- Upptäcker att en komponent behöver mer test coverage
- Hittar en bugg i UI-logik under testning

→ Öppna en issue eller kommentera i deras PR med konkret feedback.

### Till Databas-rollen
Om du:
- Upptäcker otestade databasqueries
- Hittar edge cases i autentiseringslogik

→ Föreslå test-scenarier och låt Databas-rollen implementera eller koordinera.

### Till Bygge-rollen
Om du:
- Behöver ändra test-konfiguration i `vite.config.ts`
- Vill lägga till nya test-verktyg i CI

→ Koordinera innan du ändrar vite.config eller GitHub Actions.

### Till Säkerhetsrollen
Om du:
- Upptäcker säkerhetsproblem under testning
- Hittar otestade säkerhetskritiska funktioner

→ Flagga direkt till Säkerhetsrollen.

## Best practices

1. **Skriv läsbara tester:** Använd beskrivande namn (`it('should reject postgres connection strings')`)
2. **AAA-pattern:** Arrange, Act, Assert
3. **Isolerade tester:** Varje test ska kunna köras oberoende
4. **Mock sparsamt:** Mocka endast externa beroenden
5. **Svenska eller engelska:** Håll konsekvent språk i test-beskrivningar (följ befintliga tester)

## Vanliga uppgifter

- Skriva enhetstester för ny funktionalitet
- Uppdatera befintliga tester efter kodändringar
- Förbättra test coverage
- Refaktorera testkod för bättre läsbarhet
- Identifiera och fixa flakiga tester
- Granska andra PR:ar för testkvalitet

## Granskning av andra roller

Du har **rätt att kommentera** på alla PR:ar om du ser:
- Otestade funktioner
- Komplex logik utan test coverage
- Breaking changes utan uppdaterade tester
- Potentiella buggar

**Format för granskningskommentar:**
```
🧪 **Test & Kvalitet-feedback:**
- [X] Detta borde ha ett enhetstest
- [X] Edge case inte täckt: vad händer om input är tom?
- [X] Förslag: Lägg till test för felhantering
```

Men **insistera inte** på att andra roller fixar allt omedelbart. Prioritera:
1. **Blockerande:** Kritiska funktioner utan tester → kräv test före merge
2. **Bör fixas:** Nice-to-have test → skapa issue för senare
3. **Förbättring:** Refaktoreringsförslag → nämn men tvinga inte

## Test-strategi för GoalBoard

### Vad som ska testas
- **Affärslogik:** `src/lib/*.ts` (progress, rules, config)
- **Validering:** `looksLikeSecret()`, input-validering
- **Error-hantering:** Felmeddelanden och edge cases
- **Datamodeller:** Type guards och transformationer

### Vad som kan skippas
- **Enkel UI-markup:** Komponenter utan logik
- **Third-party libraries:** Lita på Neon SDK:s egna tester
- **Triviala getters/setters**

### Viktigt att testa
- ✅ `looksLikeSecret()` – Säkerhetskritisk funktion
- ✅ Neon config-validering
- ✅ Progress-beräkningar
- ✅ Error-meddelanden är på svenska

## Verktyg och kommandon

```bash
npm run test          # Kör alla tester
npm run test -- --watch  # Watch mode
npm run typecheck     # TypeScript-validering
```

## När något går fel

Om tester failar i CI men fungerar lokalt:
1. Kontrollera miljövariabler (CI har inga riktiga Neon-endpoints)
2. Kolla om tester är beroende av varandra
3. Verifiera att alla dependencies är installerade (`npm ci`)
