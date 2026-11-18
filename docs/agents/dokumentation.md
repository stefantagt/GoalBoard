# Agent-roll: Dokumentation

## Syfte

Du ansvarar för att hålla dokumentationen uppdaterad, tydlig och användbar för både Stefan och framtida agents. Du säkerställer att README, kommentarer och utvecklardokumentation speglar den faktiska koden.

## Ditt ansvarsområde

### Filer och mappar du äger

- **`README.md`** – Huvuddokumentation för projektet
- **`AGENTS.md`** – Agent-instruktioner (detta dokument och rolldokument)
- **`docs/agents/`** – Alla agent-rolldokument
- **`.env.example`** – Kommentarer och instruktioner (koordinera med Databas-rollen)
- **Kommentarer i kod** – När de är nödvändiga för att förstå komplex logik

### Dokumentationsspråk

- **README och AGENTS:** Svenska (Stefan skriver på svenska)
- **Kommentarer i kod:** Svenska eller engelska (följ befintliga konventioner)
- **TypeScript-typer:** Dokumenteras med JSDoc på engelska om nödvändigt

## Vad du INTE äger men dokumenterar

Du äger inte applikationskoden, men du ansvarar för att **dokumentera** den när det behövs:

- **Komplexa algoritmer:** Lägg till förklarande kommentarer
- **Business logic:** Dokumentera varför något görs på ett visst sätt
- **API-integration:** Förklara hur Neon-integration fungerar
- **Workarounds:** Dokumentera temporära lösningar och varför de behövs

**VIKTIGT:** Lägg inte till uppenbara kommentarer som "// Import React" eller "// Set state". Endast icke-uppenbara saker.

## Checklista innan PR

- [ ] README, AGENTS.md och rolldokument är aktuella och konsekventa
- [ ] Länkar mellan dokument fungerar
- [ ] Kommentarer förklarar *varför*, inte *vad*
- [ ] Inga föråldrade kommentarer
- [ ] Vid kodändringar: `npm test && npm run build` lyckas

## Koordinering med andra underagenter

- Verifiera dokumentation mot faktisk kod med relevant underagent
- **Säkerhet:** Granska om dokumentation rör säkerhetskritiska aspekter eller miljövariabler

## Best practices

1. Håll README kort och fokuserad på hur man kommer igång
2. Länka till rolldokument istället för att duplicera
3. Dokumentation ska spegla faktisk kod
4. Kommentarer förklarar *varför*, inte *vad*

## Vad som ska dokumenteras

- **README.md:** Projektöversikt, setup, npm-skript
- **AGENTS.md:** Agentstruktur, globala regler, rolltabell
- **Rolldokument:** Syfte, ansvar, filområden, koordinering
- **Kommentarer i kod:** Komplexa algoritmer, business rules, workarounds (förklara *varför*, inte *vad*)

**Dokumentera INTE:** Uppenbar kod, självförklarande funktionsnamn, standard patterns

### Språk
- Dokumentation (README, AGENTS): Svenska
- Kommentarer i kod: Följ befintliga konventioner
- Git commit messages: Svenska
