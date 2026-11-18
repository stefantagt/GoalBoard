import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { Button, ErrorNote, FullScreenMessage, fieldClass } from '../components/ui'

export function LoginPage() {
  const auth = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  if (!auth.configured) {
    return <FullScreenMessage title="Koppla Neon innan du loggar in" body={auth.configMessage ?? ''} />
  }
  if (auth.loading) {
    return <FullScreenMessage title="Kontrollerar sessionen" body="Ett ögonblick." />
  }
  if (auth.user) return <Navigate to="/" replace />

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setPending(true)
    setError(null)
    try {
      await auth.signIn(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Inloggningen misslyckades.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="grid min-h-dvh bg-paper lg:grid-cols-[1.1fr_0.9fr]">
      <section className="flex flex-col justify-between px-6 py-8 sm:px-12 lg:px-16" style={{ paddingTop: 'max(2rem, env(safe-area-inset-top))' }}>
        <p className="font-display text-3xl text-sage">GoalBoard</p>
        <div className="max-w-lg py-16">
          <h1 className="font-display text-5xl leading-[1.05] font-medium tracking-tight sm:text-6xl">
            Håll det samlat, även när du är ute.
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-muted">
            En stängd sida. Inget mer syns härifrån.
          </p>
        </div>
        <p className="text-sm text-muted">Bara ditt konto.</p>
      </section>
      <section className="flex items-center justify-center px-6 py-10 sm:px-12">
        <form className="w-full max-w-sm rise" onSubmit={onSubmit}>
          <h2 className="font-display text-4xl font-medium">Logga in</h2>
          <p className="mt-2 text-sm leading-6 text-muted">E-post och lösenord.</p>
          <div className="mt-6 grid gap-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">E-postadress</span>
              <input className={fieldClass} type="email" autoComplete="email" inputMode="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Lösenord</span>
              <input className={fieldClass} type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </label>
            {error ? <ErrorNote>{error}</ErrorNote> : null}
            <Button type="submit" disabled={pending}>{pending ? 'Loggar in…' : 'Logga in'}</Button>
          </div>
        </form>
      </section>
    </div>
  )
}
