import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { GoalFields, goalToDraft } from '../components/forms'
import { Button, Card, Dialog, ErrorNote, PageHeader, ProgressBar, StatusBadge, usePageTitle } from '../components/ui'
import { useBoard } from '../data/BoardProvider'
import { dueLabel, dueTone, formatDate } from '../lib/dates'
import { categoryLabel, goalStatusLabel, projectStatusLabel } from '../lib/labels'
import { goalProgress, progressCaption } from '../lib/progress'
import { milestonesFor, projectsForGoal, tasksFor } from '../lib/select'
import type { GoalDraft } from '../lib/types'

export function GoalDetailPage() {
  const { goalId = '' } = useParams()
  const navigate = useNavigate()
  const board = useBoard()
  const goal = board.snapshot?.goals.find((item) => item.id === goalId)
  const milestones = milestonesFor(board.snapshot?.milestones ?? [], goalId)
  const tasks = tasksFor(board.snapshot?.tasks ?? [], goalId)
  const projects = projectsForGoal(board.snapshot?.projects ?? [], goalId)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<GoalDraft | null>(null)
  const [milestoneTitle, setMilestoneTitle] = useState('')
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDue, setTaskDue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  usePageTitle(goal?.title ?? 'Mål')

  if (!goal) {
    return (
      <div>
        <PageHeader title="Målet finns inte" lede="Det kan ha tagits bort, eller så tillhör det inte ditt konto." />
        <Link to="/mal" className="text-sm font-medium text-sage">Tillbaka till målen</Link>
      </div>
    )
  }

  const progress = goalProgress(milestones, tasks, goal.status)
  const allTasksDone = tasks.length > 0 && tasks.every((task) => task.completed)

  async function run(action: () => Promise<void>) {
    setError(null)
    try {
      await action()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunde inte spara.')
    }
  }

  return (
    <div>
      <Link to="/mal" className="mb-4 inline-flex min-h-11 items-center text-sm text-muted">Tillbaka</Link>
      <PageHeader
        eyebrow={categoryLabel(goal.category)}
        title={goal.title}
        lede={goal.description || 'Ingen beskrivning ännu.'}
        action={<StatusBadge status={goal.status} label={goalStatusLabel(goal.status)} />}
      />

      <Card>
        <div className="mb-2 flex justify-between text-sm text-muted">
          <span>{progressCaption(milestones, tasks)}</span>
          <span>{progress}%</span>
        </div>
        <ProgressBar value={progress} />
        <p className="mt-3 text-xs leading-5 text-muted">
          Framsteg räknas på aktiviteter när det finns några. Annars används delmål. Ett mål utan båda är 0 %, eller 100 % om status är uppnått.
        </p>
        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-muted">Start</dt>
            <dd>{formatDate(goal.start_date)}</dd>
          </div>
          <div>
            <dt className="text-muted">Måldatum</dt>
            <dd>{formatDate(goal.target_date)}</dd>
          </div>
          <div>
            <dt className="text-muted">Varför</dt>
            <dd>{goal.why_important || 'Inte ifyllt'}</dd>
          </div>
        </dl>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => { setDraft(goalToDraft(goal)); setEditing(true) }}>Redigera</Button>
          <Button
            variant="secondary"
            onClick={() => void run(() => board.changeGoalStatus(goal.id, goal.status === 'archived' ? 'active' : 'archived'))}
          >
            {goal.status === 'archived' ? 'Återställ' : 'Arkivera'}
          </Button>
          {goal.status !== 'completed' ? (
            <Button variant="secondary" onClick={() => void run(() => board.changeGoalStatus(goal.id, 'completed'))}>Markera som uppnått</Button>
          ) : null}
          <Button variant="danger" onClick={() => setConfirmDelete(true)}>Ta bort</Button>
        </div>
        {allTasksDone && goal.status === 'active' ? (
          <p className="mt-4 text-sm text-sage-deep">Alla aktiviteter är klara. Du kan markera målet som uppnått när det känns rätt.</p>
        ) : null}
      </Card>

      {error ? <div className="mt-4"><ErrorNote>{error}</ErrorNote></div> : null}

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-display text-2xl font-medium">Delmål</h2>
          <form
            className="mt-4 flex gap-2"
            onSubmit={(event) => {
              event.preventDefault()
              const title = milestoneTitle
              setMilestoneTitle('')
              void run(() => board.createMilestone(goal.id, title))
            }}
          >
            <input className="min-h-11 flex-1 rounded-xl border border-line px-3 text-base" value={milestoneTitle} onChange={(event) => setMilestoneTitle(event.target.value)} placeholder="Nytt delmål" aria-label="Nytt delmål" />
            <Button type="submit">Lägg till</Button>
          </form>
          <ul className="mt-4 divide-y divide-line">
            {milestones.map((milestone) => (
              <li key={milestone.id} className="flex items-center gap-3 py-3">
                <input
                  type="checkbox"
                  className="h-5 w-5"
                  checked={milestone.completed}
                  onChange={() => void run(() => board.toggleMilestone(milestone.id, !milestone.completed))}
                  aria-label={`Markera ${milestone.title}`}
                />
                <span className={`flex-1 text-sm ${milestone.completed ? 'text-muted line-through' : ''}`}>{milestone.title}</span>
                <button type="button" className="min-h-11 px-2 text-xs text-muted" onClick={() => void run(() => board.removeMilestone(milestone.id))}>Ta bort</button>
              </li>
            ))}
            {milestones.length === 0 ? <li className="py-3 text-sm text-muted">Inga delmål ännu.</li> : null}
          </ul>
        </Card>

        <Card>
          <h2 className="font-display text-2xl font-medium">Aktiviteter</h2>
          <form
            className="mt-4 grid gap-2"
            onSubmit={(event) => {
              event.preventDefault()
              const title = taskTitle
              const dueDate = taskDue
              setTaskTitle('')
              setTaskDue('')
              void run(() => board.createTask({ goalId: goal.id, title, dueDate }))
            }}
          >
            <input className="min-h-11 rounded-xl border border-line px-3 text-base" value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} placeholder="Ny aktivitet" aria-label="Ny aktivitet" />
            <div className="flex gap-2">
              <input className="min-h-11 flex-1 rounded-xl border border-line px-3 text-base" type="date" value={taskDue} onChange={(event) => setTaskDue(event.target.value)} aria-label="Datum för aktiviteten" />
              <Button type="submit">Lägg till</Button>
            </div>
          </form>
          <ul className="mt-4 divide-y divide-line">
            {tasks.map((task) => {
              const tone = dueTone(task.due_date)
              return (
                <li key={task.id} className="py-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      className="mt-1 h-5 w-5"
                      checked={task.completed}
                      onChange={() => void run(() => board.patchTask(task.id, { completed: !task.completed }))}
                      aria-label={`Markera ${task.title}`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm ${task.completed ? 'text-muted line-through' : ''}`}>{task.title}</p>
                      {dueLabel(task.due_date) ? (
                        <p className={`text-xs ${tone === 'overdue' && !task.completed ? 'text-rose' : 'text-muted'}`}>{dueLabel(task.due_date)}</p>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-2 flex gap-2 pl-8">
                    <button
                      type="button"
                      className={`min-h-10 rounded-full px-3 text-xs font-medium ${task.week_focus ? 'bg-sage-soft text-sage-deep' : 'bg-paper text-muted'}`}
                      onClick={() => void run(() => board.patchTask(task.id, { week_focus: !task.week_focus }))}
                    >
                      {task.week_focus ? 'I veckans fokus' : 'Lägg i veckan'}
                    </button>
                    <button type="button" className="min-h-10 px-2 text-xs text-muted" onClick={() => void run(() => board.removeTask(task.id))}>Ta bort</button>
                  </div>
                </li>
              )
            })}
            {tasks.length === 0 ? <li className="py-3 text-sm text-muted">Inga aktiviteter ännu.</li> : null}
          </ul>
        </Card>
      </div>

      <Card className="mt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-medium">Kopplade projekt</h2>
          {goal.category === 'egna_projekt' ? (
            <Link to={`/projekt?ny=1&mal=${goal.id}`} className="text-sm font-medium text-sage">Nytt projekt för det här målet</Link>
          ) : null}
        </div>
        {projects.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Inget projekt är kopplat. Kopplingen är frivillig och görs under Mina projekt.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {projects.map((project) => (
              <li key={project.id} className="flex items-center justify-between py-3 text-sm">
                <Link to="/projekt" className="font-medium">{project.name}</Link>
                <span className="text-muted">{projectStatusLabel(project.status)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {editing && draft ? (
        <Dialog title="Redigera mål" onClose={() => setEditing(false)}>
          <form
            className="grid gap-5"
            onSubmit={(event) => {
              event.preventDefault()
              void run(async () => {
                await board.saveGoal(goal.id, draft)
                setEditing(false)
              })
            }}
          >
            <GoalFields draft={draft} onChange={setDraft} />
            <Button type="submit">Spara ändringar</Button>
          </form>
        </Dialog>
      ) : null}

      {confirmDelete ? (
        <Dialog title="Ta bort målet?" onClose={() => setConfirmDelete(false)}>
          <p className="text-sm leading-6 text-muted">Delmål och aktiviteter som hör till målet tas också bort. Det går inte att ångra.</p>
          <div className="mt-5 flex gap-2">
            <Button
              variant="danger"
              onClick={() => {
                setConfirmDelete(false)
                void run(async () => {
                  await board.removeGoal(goal.id)
                  navigate('/mal')
                })
              }}
            >
              Ta bort
            </Button>
            <Button variant="secondary" onClick={() => setConfirmDelete(false)}>Avbryt</Button>
          </div>
        </Dialog>
      ) : null}
    </div>
  )
}
