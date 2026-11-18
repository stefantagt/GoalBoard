# GoalBoard

Statisk React-app.

## Kom igång lokalt

Kräver Node 22.

```bash
npm install
copy .env.example .env
npm run dev
```

Öppna `http://localhost:5173/GoalBoard/`.

Fyll `.env` med de två adresserna. Lämna filen olagrad i git.

## Skript

| Kommando | Gör |
| --- | --- |
| `npm run dev` | Startar Vite |
| `npm run test` | Kör enhetstesterna |
| `npm run typecheck` | TypeScript utan bygge |
| `npm run build` | Typkontroll och produktionsbygge till `dist` |

## Publicering

GitHub Actions publicerar till GitHub Pages. Vite använder basvägen `/GoalBoard/`.
