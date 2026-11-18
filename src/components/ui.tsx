import { useEffect, type ButtonHTMLAttributes, type ReactNode } from 'react'

export const fieldClass =
  'w-full rounded-xl border border-line bg-card px-3 py-2.5 text-base text-ink outline-none transition placeholder:text-muted/70 focus:border-sage focus:ring-2 focus:ring-sage/20'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
}

export function Button({ variant = 'primary', className = '', type = 'button', ...props }: ButtonProps) {
  const styles = {
    primary: 'bg-sage text-white hover:bg-sage-deep',
    secondary: 'border border-line bg-card text-ink hover:bg-paper',
    ghost: 'text-muted hover:bg-paper-deep hover:text-ink',
    danger: 'bg-rose-soft text-rose hover:bg-rose hover:text-white',
  }[variant]
  return (
    <button
      type={type}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${styles} ${className}`}
      {...props}
    />
  )
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
      {hint ? <span className="mt-1.5 block text-xs leading-5 text-muted">{hint}</span> : null}
    </label>
  )
}

export function PageHeader({
  eyebrow,
  title,
  lede,
  action,
}: {
  eyebrow?: string
  title: string
  lede?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow ? <p className="mb-2 text-xs font-medium tracking-[0.16em] text-sage uppercase">{eyebrow}</p> : null}
        <h1 className="font-display text-4xl leading-none font-medium tracking-tight">{title}</h1>
        {lede ? <p className="mt-3 text-sm leading-6 text-muted">{lede}</p> : null}
      </div>
      {action}
    </div>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-3xl border border-line bg-card p-5 shadow-[0_1px_0_rgba(28,25,23,0.03)] ${className}`}>{children}</section>
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-paper-deep" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full bg-sage transition-[width] duration-500" style={{ width: `${value}%` }} />
    </div>
  )
}

const statusTone: Record<string, string> = {
  active: 'bg-sage-soft text-sage-deep',
  paused: 'bg-amber-soft text-amber',
  completed: 'bg-sea-soft text-sea',
  done: 'bg-sage-soft text-sage-deep',
  archived: 'bg-paper-deep text-muted',
  idea: 'bg-sea-soft text-sea',
}

export function StatusBadge({ status, label }: { status: string; label: string }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusTone[status] ?? statusTone.archived}`}>{label}</span>
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string
  body: string
  action?: ReactNode
}) {
  return (
    <Card className="px-6 py-12 text-center">
      <h2 className="font-display text-3xl font-medium">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">{body}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </Card>
  )
}

export function ErrorNote({ children }: { children: ReactNode }) {
  return <p className="rounded-2xl bg-rose-soft px-4 py-3 text-sm text-rose">{children}</p>
}

export function Dialog({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: ReactNode
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 p-0 sm:items-center sm:p-4" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className="max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl bg-card p-5 shadow-2xl sm:max-w-lg sm:rounded-3xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 id="dialog-title" className="font-display text-3xl font-medium">
            {title}
          </h2>
          <button type="button" className="rounded-full px-3 py-1 text-sm text-muted hover:bg-paper" onClick={onClose} aria-label="Stäng">
            Stäng
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function FullScreenMessage({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-paper px-5">
      <div className="w-full max-w-md rise">
        <p className="font-display text-2xl text-sage">GoalBoard</p>
        <h1 className="mt-3 font-display text-4xl font-medium">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-muted">{body}</p>
        {action ? <div className="mt-6">{action}</div> : null}
      </div>
    </div>
  )
}

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title === 'GoalBoard' ? title : `${title} · GoalBoard`
  }, [title])
}
