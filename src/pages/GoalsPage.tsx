import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { GoalFields } from '../components/forms'
import { GoalProgress } from '../components/GoalProgress'
import { Button, Card, Dialog, EmptyState, ErrorNote, PageHeader, StatusBadge, usePageTitle } from '../components/ui'
import { useBoard } from '../data/BoardProvider'
import { categoryLabel, goalCategories, goalStatusLabel } from '../lib/labels'
import { milestonesFor, tasksFor, visibleGoals } from '../lib/select'
import { emptyGoalDraft, type GoalCategory, type GoalDraft } from '../lib/types'
import { formatDate } from '../lib/dates'

export function GoalsPage() {
  usePageTitle('Mål')
  const board = useBoard()
  const [params, setParams] = useSearchParams()
  const [category, setCategory] = useState<GoalCategory | 'alla'>('alla')
  const [showArchived, setShowArchived] = useState(false)
  const [draft, setDraft] = useState<GoalDraft>(emptyGoalDraft)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const open = params.get('ny') === '1'
  const goals = board.snapshot?.goals ?? []
  const visible = useMemo(
    () => visibleGoals(goals, category, showArchived),
    [goals, category, showArchived],
  )

  function close() {
    params.delete('ny')
    setParams(params, { replace: true })
    setDraft(emptyGoalDraft())
    setError(null)
  }

  async function onCreate() {
    setPending(true)
    setError(null)
    try {
      await board.createGoal(draft)
      close()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunde inte spara målet.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Mål"
        lede="Formulera vad du vill åstadkomma och öppna ett mål för att arbeta med delmål och aktiviteter."
        action={<Button onClick={() => setParams({ ny: '1' })}>Nytt mål</Button>}
      />

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        <FilterChip active={category === 'alla'} onClick={() => setCategory('alla')}>Alla</FilterChip>
        {goalCategories.map((item) => (
          <FilterChip key={item.value} active={category === item.value} onClick={() => setCategory(item.value)}>
            {item.label}
          </FilterChip>
        ))}
      </div>

      <label className="mb-5 flex min-h-11 items-center gap-2 text-sm text-muted">
        <input type="checkbox" checked={showArchived} onChange={(event) => setShowArchived(event.target.checked)} />
        Visa arkiverade
      </label>

      {category === 'egna_projekt' || category === 'alla' ? (
        <Link to="/projekt" className="mb-4 block rounded-2xl border border-dashed border-line px-4 py-3 text-sm text-muted hover:border-sage hover:text-ink">
          Vibecoding-projekt finns under <span className="font-medium text-sage">Mina projekt</span>.
        </Link>
      ) : null}

      {visible.length === 0 ? (
        <EmptyState
          title={goals.length === 0 ? 'Inga mål ännu' : 'Inget mål i det här urvalet'}
          body={goals.length === 0 ? 'Skapa ditt första mål. Kategori, datum och varför kan fyllas i direkt.' : 'Prova ett annat filter eller skapa ett nytt mål.'}
          action={<Button onClick={() => setParams({ ny: '1' })}>Skapa mål</Button>}
        />
      ) : (
        <div className="grid gap-3">
          {visible.map((goal) => {
            return (
              <Link key={goal.id} to={`/mal/${goal.id}`}>
                <Card className="transition hover:border-sage/40">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-muted">{categoryLabel(goal.category)}</p>
                      <h2 className="mt-1 text-lg font-medium">{goal.title}</h2>
                    </div>
                    <StatusBadge status={goal.status} label={goalStatusLabel(goal.status)} />
                  </div>
                  {goal.description ? <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted">{goal.description}</p> : null}
                  <div className="mt-4">
                    <GoalProgress
                      milestones={milestonesFor(board.snapshot?.milestones ?? [], goal.id)}
                      tasks={tasksFor(board.snapshot?.tasks ?? [], goal.id)}
                      status={goal.status}
                      compact
                    />
                    <p className="mt-2 text-xs text-muted">Måldatum {formatDate(goal.target_date)}</p>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      )}

      {open ? (
        <Dialog title="Nytt mål" onClose={close}>
          <form
            className="grid gap-5"
            onSubmit={(event) => {
              event.preventDefault()
              void onCreate()
            }}
          >
            <GoalFields draft={draft} onChange={setDraft} />
            {error ? <ErrorNote>{error}</ErrorNote> : null}
            <Button type="submit" disabled={pending}>{pending ? 'Sparar…' : 'Spara mål'}</Button>
          </form>
        </Dialog>
      ) : null}
    </div>
  )
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`shrink-0 rounded-full px-3 py-2 text-sm font-medium ${active ? 'bg-ink text-white' : 'bg-card text-muted ring-1 ring-line'}`}
    >
      {children}
    </button>
  )
}
