import { CalendarDays, Flag, FolderKanban, LayoutDashboard, LogOut } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { useBoard } from '../data/BoardProvider'
import { Button, FullScreenMessage } from './ui'

const links = [
  { to: '/', label: 'Översikt', icon: LayoutDashboard, end: true },
  { to: '/mal', label: 'Mål', icon: Flag, end: false },
  { to: '/projekt', label: 'Projekt', icon: FolderKanban, end: false },
  { to: '/vecka', label: 'Vecka', icon: CalendarDays, end: false },
]

export function AppShell() {
  const auth = useAuth()
  const board = useBoard()
  const access = board.snapshot?.access

  if (board.loading && !board.snapshot) {
    return <FullScreenMessage title="Hämtar din tavla" body="Ett ögonblick medan målen läses från Neon." />
  }

  if (!board.snapshot && board.error) {
    return (
      <FullScreenMessage title="Kunde inte läsa data" body={board.error} action={<Button onClick={() => void board.refresh()}>Försök igen</Button>} />
    )
  }

  if (access?.kind === 'unmigrated') {
    return (
      <FullScreenMessage
        title="Databasen är inte klar"
        body={access.message}
        action={<Button variant="secondary" onClick={() => void auth.signOut()}>Logga ut</Button>}
      />
    )
  }

  if (access?.kind === 'denied') {
    const userId = access.userId ?? auth.user?.id ?? ''
    return (
      <FullScreenMessage
        title="Kontot är inte godkänt"
        body="Du är inloggad, men det här användar-ID:t finns inte i allowed_users. Lägg in det i Neon SQL Editor och ladda om."
        action={
          <div className="space-y-4">
            <code className="block overflow-x-auto rounded-2xl bg-card px-4 py-3 text-left text-xs leading-5 text-ink">
              {`INSERT INTO public.allowed_users (user_id, label)\nVALUES ('${userId}', 'owner')\nON CONFLICT (user_id) DO NOTHING;`}
            </code>
            <Button variant="secondary" onClick={() => void auth.signOut()}>Logga ut</Button>
          </div>
        }
      />
    )
  }

  return (
    <div className="min-h-dvh bg-paper">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-line bg-card px-4 py-6 md:flex">
        <Brand />
        <nav className="mt-8 flex flex-1 flex-col gap-1" aria-label="Huvudmeny">
          {links.map((link) => (
            <SideLink key={link.to} {...link} />
          ))}
        </nav>
        <Account />
      </aside>

      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-paper/90 px-4 py-3 backdrop-blur md:hidden" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}>
        <Brand compact />
        <button type="button" className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-muted" onClick={() => void auth.signOut()} aria-label="Logga ut">
          <LogOut size={18} />
        </button>
      </header>

      <main className="px-4 pt-5 pb-[calc(6.5rem+env(safe-area-inset-bottom))] md:py-8 md:pr-8 md:pl-72">
        <div className="mx-auto max-w-5xl rise">
          {board.error ? <p className="mb-4 rounded-2xl bg-amber-soft px-4 py-3 text-sm text-amber">{board.error}</p> : null}
          <Outlet />
        </div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-card/95 backdrop-blur md:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} aria-label="Huvudmeny">
        <ul className="grid grid-cols-4">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium ${isActive ? 'text-sage-deep' : 'text-muted'}`
                }
              >
                <link.icon size={18} />
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3 px-2">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-sage text-sm font-semibold text-white">G</span>
      {compact ? <span className="font-display text-2xl">GoalBoard</span> : <span className="font-display text-3xl leading-none">GoalBoard</span>}
    </div>
  )
}

function SideLink({ to, label, icon: Icon, end }: (typeof links)[number]) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex min-h-11 items-center gap-3 rounded-2xl px-3 text-sm font-medium transition ${isActive ? 'bg-sage-soft text-sage-deep' : 'text-muted hover:bg-paper hover:text-ink'}`
      }
    >
      <Icon size={18} />
      {label}
    </NavLink>
  )
}

function Account() {
  const auth = useAuth()
  return (
    <div className="border-t border-line px-2 pt-4">
      <p className="truncate text-sm font-medium">{auth.user?.name || 'Inloggad'}</p>
      <p className="truncate text-xs text-muted">{auth.user?.email}</p>
      <button type="button" className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm text-muted hover:text-ink" onClick={() => void auth.signOut()}>
        <LogOut size={16} />
        Logga ut
      </button>
    </div>
  )
}
