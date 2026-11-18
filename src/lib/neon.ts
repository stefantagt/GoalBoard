import { createClient } from '@neon/neon-js'
import { BetterAuthReactAdapter } from '@neon/neon-js/auth/react/adapters'
import { readNeonConfig } from './config'

function createNeonClient() {
  const config = readNeonConfig(import.meta.env)
  if (!config.ok) return null
  if (config.mode === 'derived') {
    return createClient(config.databaseUrl, {
      auth: { adapter: BetterAuthReactAdapter({ fetchOptions: { credentials: 'include' } }) },
    })
  }
  return createClient({
    auth: {
      url: config.authUrl,
      adapter: BetterAuthReactAdapter({ fetchOptions: { credentials: 'include' } }),
    },
    dataApi: { url: config.dataApiUrl },
  })
}

export type NeonClient = NonNullable<ReturnType<typeof createNeonClient>>

let client: NeonClient | null | undefined
let initError: string | null = null

export function getNeonClient(): NeonClient | null {
  if (client === undefined) {
    try {
      client = createNeonClient()
    } catch (error) {
      client = null
      initError = error instanceof Error ? error.message : 'Neon-klienten kunde inte skapas.'
    }
  }
  return client
}

export function neonConfigMessage(): string | null {
  const config = readNeonConfig(import.meta.env)
  if (!config.ok) return config.message
  getNeonClient()
  return initError
}
