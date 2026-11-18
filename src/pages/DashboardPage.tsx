import { Link } from 'react-router-dom'
import { useBoard } from '../data/BoardProvider'
import { formatDate, formatLongDate } from '../lib/dates'
import { categoryLabel, goalStatusLabel } from '../lib/labels'
import { goalProgress, progressCaption } from '../lib/progress'
import { countGoals, importantGoals, milestonesFor, nextTasks, tasksFor, weekTasks } from '../lib/select'
import { Button, Card, EmptyState, PageHeader, ProgressBar, StatusBadge, usePageTitle } from '../components/ui'

export function DashboardPage() {
  usePageTitle('Översikt')
  const board = useBoard()
  const goals = board.snapshot?.goals ?? []
  const milestones = board.snapshot?.milestones ?? []
  const tasks = board.snapshot?.tasks ?? []
  const focus = weekTasks(tasks, goals).filter((task) => !task.completed).slice(0, 3)
  const upcoming = nextTasks(tasks, goals)
  const highlighted = importantGoals(goals)
  const active = countGoals(goals, 'active')
  const completed = countGoals(goals, 'completed')

  return (
    <div>
      <PageHeader
        eyebrow={formatLongDate(new Date())}
        title="Översikt"
        lede="En lugn bild av vad som är igång, vad som är klart och vad som väntar härnäst."
        action={<Link to="/mal?ny=1"><Button>Nytt mål</Button></Link>}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Aktiva mål" value={active} />
        <Stat label="Uppnådda mål" value={completed} />
        <Stat label="Kvar i veckans fokus" value={weekTasks(tasks, goals).filter((task) => !task.completed).length} />
      </div>

      {goals.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="Inga mål ännu"
            body="Börja med ett mål som betyder något just nu. Du kan dela upp det i delmål och aktiviteter efteråt."
            action={<Link to="/mal?ny=1"><Button>Skapa ditt första mål</Button></Link>}
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Card>
            <SectionTitle title="Veckans fokus" href="/vecka" linkLabel="Visa veckan" />
            <TaskList tasks={focus} goals={goals} empty="Inget är markerat för veckan." />
          </Card>
          <Card>
            <SectionTitle title="Nästa aktiviteter" href="/mal" linkLabel="Alla mål" />
            <TaskList tasks={upcoming} goals={goals} empty="Inga öppna aktiviteter på aktiva mål." />
          </Card>
        </div>
      )}

      {highlighted.length > 0 ? (
        <section className="mt-6">
          <h2 className="mb-3 font-display text-2xl font-medium">Viktigaste målen</h2>
          <p className="mb-4 text-sm text-muted">Aktiva mål med närmast måldatum visas först.</p>
          <div className="grid gap-3 md:grid-cols-2">
            {highlighted.map((goal) => {
              const goalMilestones = milestonesFor(milestones, goal.id)
              const goalTasks = tasksFor(tasks, goal.id)
              const progress = goalProgress(goalMilestones, goalTasks, goal.status)
              return (
                <Link key={goal.id} to={`/mal/${goal.id}`} className="rounded-3xl border border-line bg-card p-5 transition hover:-translate-y-0.5 hover:border-sage/40">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-muted">{categoryLabel(goal.category)}</p>
                      <h3 className="mt-1 text-lg font-medium">{goal.title}</h3>
                    </div>
                    <StatusBadge status={goal.status} label={goalStatusLabel(goal.status)} />
                  </div>
                  <div className="mt-5">
                    <div className="mb-2 flex justify-between text-xs text-muted">
                      <span>{progressCaption(goalMilestones, goalTasks)}</span>
                      <span>{progress}%</span>
                    </div>
                    <ProgressBar value={progress} />
                    <p className="mt-3 text-xs text-muted">Måldatum {formatDate(goal.target_date)}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      ) : null}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 font-display text-5xl leading-none">{value}</p>
    </Card>
  )
}

function SectionTitle({ title, href, linkLabel }: { title: string; href: string; linkLabel: string }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="font-display text-2xl font-medium">{title}</h2>
      <Link to={href} className="text-sm font-medium text-sage">{linkLabel}</Link>
    </div>
  )
}

function TaskList({
  tasks,
  goals,
  empty,
}: {
  tasks: { id: string; title: string; goal_id: string; due_date: string | null }[]
  goals: { id: string; title: string }[]
  empty: string
}) {
  if (tasks.length === 0) return <p className="text-sm text-muted">{empty}</p>
  return (
    <ul className="divide-y divide-line">
      {tasks.map((task) => {
        const goal = goals.find((item) => item.id === task.goal_id)
        return (
          <li key={task.id}>
            <Link to={`/mal/${task.goal_id}`} className="flex items-center justify-between gap-3 py-3">
              <span>
                <span className="block text-sm font-medium">{task.title}</span>
                <span className="block text-xs text-muted">{goal?.title}</span>
              </span>
              <span className="shrink-0 text-xs text-muted">{task.due_date ? formatDate(task.due_date) : ''}</span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
