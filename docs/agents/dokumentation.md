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

Innan du öppnar en pull request, kontrollera:

- [ ] **README är aktuellt:**
  - Installations-instruktioner stämmer
  - Alla npm-skript är dokumenterade
  - Tekniker och versioner är korrekta
  
- [ ] **AGENTS.md är synkroniserat:**
  - Rolltabellen länkar till alla rollfiler
  - Globala regler är tydliga
  
- [ ] **Rolldokument är konsekventa:**
  - Alla roller har samma struktur
  - Länkar mellan dokument fungerar
  
- [ ] **Kommentarer är meningsfulla:**
  - Förklarar *varför*, inte *vad*
  - På svenska eller engelska konsekvent
  - Inga föråldrade kommentarer kvar
  
- [ ] **Koden byggs:** `npm run build`
  - Dokumentationen orsakar inga build-fel
  
- [ ] **PR-beskrivning:**
  - Första raden: `**Agent-roll:** Dokumentation`
  - Beskriv vilken dokumentation som uppdaterats
  - Nämn om ändringar påverkar andra roller

## Handoff till andra roller

### Till alla roller
När du uppdaterar dokumentation:
- Verifiera att det du skriver stämmer med faktisk kod
- Om något är oklart, fråga relevant roll:
  - **Frontend:** UI/UX-dokumentation
  - **Databas:** Neon-integration
  - **Bygge:** Build-process
  - **Test:** Teststrategi

### Till Säkerhetsrollen
Om du:
- Dokumenterar säkerhetskritiska aspekter
- Skriver om miljövariabler eller secrets

→ Låt Säkerhetsrollen granska att dokumentationen inte exponerar sårbarheter.

## Best practices

1. **Håll README kort:** Fokusera på hur man kommer igång
2. **Länka istället för att duplicera:** Referera till rolldokument istället för att upprepa
3. **Använd markdown korrekt:** Rubriker, listor, kodblock
4. **Exempel är bra:** Visa konkreta exempel på kommandon och output
5. **Uppdatera när kod ändras:** Dokumentation ska alltid spegla verkligheten

## Vanliga uppgifter

- Uppdatera README efter nya features
- Dokumentera API-ändringar
- Skriva eller uppdatera agent-rolldokument
- Lägga till kommentarer i komplex kod
- Skapa utvecklarguider
- Dokumentera säkerhetspolicies

## Vad som ska dokumenteras

### I README.md
- Projektöversikt
- Hur man kommer igång (installation, setup)
- Tillgängliga npm-skript
- Deployment-process
- Länk till AGENTS.md för agents

### I AGENTS.md
- Projektöversikt för agents
- Globala regler
- Tabell med alla roller
- Hur roller koordinerar

### I rolldokument (docs/agents/)
- Syfte och ansvar
- Filer och tekniker
- Vad rollen INTE får röra
- Checklista innan PR
- Handoff till andra roller
- Best practices

### I kod (via kommentarer)
- **Komplexa algoritmer:** Förklara steget-för-steg
- **Business rules:** Varför vissa regler finns
- **Workarounds:** Temporära lösningar och varför
- **Security:** Varför något görs på ett visst sätt för säkerhet
- **Performance:** Optimeringar som inte är uppenbara

### Vad som INTE ska dokumenteras
- Uppenbar kod (t.ex. "// Create variable x")
- Självförklarande funktionsnamn
- Standard React patterns
- Triviala getters/setters

## Format och stil

### Markdown i dokumentation
```markdown
# Huvudrubrik (H1)
## Sektion (H2)
### Undersektion (H3)

- Lista
- Punkter

**Fetstil** för viktigt
*Kursiv* för betoning
`kod` för kommandon
```

### Kommentarer i TypeScript
```typescript
// Kort förklaring på en rad

/**
 * Längre förklaring som beskriver en funktion.
 * @param input - Vad parametern gör
 * @returns Vad funktionen returnerar
 */
export function example(input: string): boolean {
  // Förklara komplicerad logik här
  return input.length > 0
}
```

### Svenska vs Engelska
- **Dokumentation (README, AGENTS):** Svenska
- **Kommentarer i kod:** Följ befintliga konventioner (oftast engelska)
- **JSDoc:** Engelska
- **Git commit messages:** Svenska (Stefan föredrar det)

## När något är oklart

Om du ska dokumentera något men är osäker:
1. **Läs koden noggrant** – försök förstå först
2. **Kolla git history** – se varför något lades till
3. **Fråga via PR-kommentar** – tagga relevant roll
4. **Dokumentera det du vet** – markera oklarheter med `TODO` eller `FIXME`

Exempel:
```typescript
// TODO(Dokumentation): Behöver verifieras med Databas-rollen
// FIXME: Denna logik är oklar, dokumentera när den har refaktorerats
```

## Granskning av dokumentation

När en annan roll öppnar en PR som påverkar dokumentation:
- Kontrollera att README/AGENTS uppdateras om nödvändigt
- Föreslå dokumentation om något är oklart
- Granska kommentarer för tydlighet

**Format för granskningskommentar:**
```
📄 **Dokumentationsfeedback:**
- [ ] README behöver uppdateras med nya skript
- [ ] Lägg till kommentar i `api.ts` som förklarar denna logik
- [ ] AGENTS.md: uppdatera Databas-rollens ansvarsområde
```

## Verktyg

- **Markdown preview:** Använd VS Code eller Cursor för förhandsvisning
- **Linkcheck:** Verifiera att länkar i dokumentation fungerar
- **Spell check:** Kontrollera stavning (särskilt i README)

## Kontinuerlig förbättring

Dokumentation är aldrig "klar". När du läser koden och upptäcker:
- Förvirrande logik utan kommentarer
- Föråldrad dokumentation
- Saknade förklaringar

→ Öppna en PR för att förbättra.
