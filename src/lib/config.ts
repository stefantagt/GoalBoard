export function looksLikeSecret(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed) return false
  const lower = trimmed.toLowerCase()
  if (lower.startsWith('postgres://') || lower.startsWith('postgresql://')) return true
  if (lower.includes('password=') || lower.includes('npg_') || lower.startsWith('napi_')) return true
  try {
    const url = new URL(trimmed)
    if (url.username || url.password) return true
  } catch {
    if (trimmed.includes('://') && trimmed.includes('@')) return true
  }
  return false
}

export type NeonConfig =
  | { ok: true; mode: 'explicit'; authUrl: string; dataApiUrl: string }
  | { ok: true; mode: 'derived'; databaseUrl: string }
  | { ok: false; message: string }

export function readNeonConfig(env: {
  VITE_NEON_AUTH_URL?: string
  VITE_NEON_DATA_API_URL?: string
  VITE_NEON_DATABASE_URL?: string
}): NeonConfig {
  const authUrl = clean(env.VITE_NEON_AUTH_URL)
  const dataApiUrl = clean(env.VITE_NEON_DATA_API_URL)
  const databaseUrl = clean(env.VITE_NEON_DATABASE_URL)
  const provided = [authUrl, dataApiUrl, databaseUrl].filter((value): value is string => Boolean(value))

  if (provided.some(looksLikeSecret)) {
    return {
      ok: false,
      message:
        'En miljövariabel ser ut som en databasanslutning eller en nyckel. GoalBoard får bara använda Neon Auth-URL och Data API-URL.',
    }
  }

  if (authUrl || dataApiUrl) {
    if (!authUrl || !dataApiUrl) {
      return {
        ok: false,
        message: 'Ange både VITE_NEON_AUTH_URL och VITE_NEON_DATA_API_URL, eller endast VITE_NEON_DATABASE_URL.',
      }
    }
    if (!authUrl.startsWith('https://') || !dataApiUrl.startsWith('https://')) {
      return { ok: false, message: 'Neon-adresserna måste börja med https://.' }
    }
    if (authUrl.includes('/rest/v1') || dataApiUrl.endsWith('/auth')) {
      return { ok: false, message: 'Auth-URL och Data API-URL verkar ha bytt plats.' }
    }
    return { ok: true, mode: 'explicit', authUrl, dataApiUrl }
  }

  if (databaseUrl) {
    if (!databaseUrl.startsWith('https://')) {
      return { ok: false, message: 'VITE_NEON_DATABASE_URL måste vara en https-adress utan inloggningsuppgifter.' }
    }
    return { ok: true, mode: 'derived', databaseUrl }
  }

  return {
    ok: false,
    message:
      'Neon är inte konfigurerat. Lokalt lägger du Auth-URL och Data API-URL i .env och startar om. På GitHub Pages sätter du samma värden som repository variables och kör publiceringen igen.',
  }
}

function clean(value: string | undefined): string {
  return value?.trim() ?? ''
}
