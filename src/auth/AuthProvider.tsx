import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { authErrorMessage } from '../lib/errors'
import { getNeonClient, neonConfigMessage, type NeonClient } from '../lib/neon'

export type AuthUser = {
  id: string
  email: string
  name: string
}

type AuthContextValue = {
  configured: boolean
  configMessage: string | null
  loading: boolean
  user: AuthUser | null
  client: NeonClient | null
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const configMessage = neonConfigMessage()
  if (configMessage) {
    return <AuthContext.Provider value={signedOut(configMessage)}>{children}</AuthContext.Provider>
  }
  const client = getNeonClient()
  if (!client) {
    return <AuthContext.Provider value={signedOut('Neon-klienten kunde inte skapas.')}>{children}</AuthContext.Provider>
  }
  return <SessionAuth client={client}>{children}</SessionAuth>
}

function SessionAuth({ client, children }: { client: NeonClient; children: ReactNode }) {
  const session = client.auth.useSession() as {
    data: { user?: { id?: string; email?: string; name?: string } } | null
    isPending: boolean
  }
  const rawUser = session.data?.user
  const user = useMemo(
    () => toUser(rawUser),
    [rawUser?.id, rawUser?.email, rawUser?.name],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      configured: true,
      configMessage: null,
      loading: session.isPending,
      user,
      client,
      async signIn(email: string, password: string) {
        const result = await client.auth.signIn.email({
          email: email.trim(),
          password,
          rememberMe: true,
        })
        if (result.error) {
          throw new Error(authErrorMessage(readMessage(result.error)))
        }
      },
      async signOut() {
        await client.auth.signOut()
      },
    }),
    [client, session.isPending, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth måste användas inuti AuthProvider.')
  return value
}

function signedOut(message: string): AuthContextValue {
  return {
    configured: false,
    configMessage: message,
    loading: false,
    user: null,
    client: null,
    async signIn() {
      throw new Error(message)
    },
    async signOut() {},
  }
}

function toUser(user: { id?: string; email?: string; name?: string } | undefined): AuthUser | null {
  if (!user?.id || !user.email) return null
  return { id: user.id, email: user.email, name: user.name ?? '' }
}

function readMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') return error.message
  return ''
}
