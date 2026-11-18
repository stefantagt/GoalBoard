import { Link } from 'react-router-dom'
import { Button, Card, EmptyState, ErrorNote, PageHeader, usePageTitle } from '../components/ui'
import { useBoard } from '../data/BoardProvider'
import { dueLabel, dueTone } from '../lib/dates'
import { weekTasks } from '../lib/select'
import { useState } from 'react'

export function WeekPage() {
  usePageTitle('Veckans fokus')
  const board = useBoard()
  const [error, setError] = useState<string | null>(null)
  const goals = board.snapshot?.goals ?? []
  const tasks = weekTasks(board.snapshot?.tasks ?? [], goals)
  const open = tasks.filter((task) => !task.completed)
  const done = tasks.filter((task) => task.completed)

  async function toggle(id: string, completed: boolean) {
    setError(null)
    try {
      await board.patchTask(id, { completed })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunde inte uppdatera aktiviteten.')
    }
  }

  return (
    <div>
      <PageHeader
        title="Veckans fokus"
        lede="Aktiviteter du själv har markerat för veckan. Bocka av dem här, utan kalender eller påminnelser."
      />
      {error ? <div className="mb-4"><ErrorNote>{error}</ErrorNote></div> : null}
      {tasks.length === 0 ? (
        <EmptyState
          title="Inget är markerat för veckan"
          body="Öppna ett mål och välj Lägg i veckan på de aktiviteter som ska få plats nu."
          action={<Link to="/mal"><Button>Gå till målen</Button></Link>}
        />
      ) : (
        <div className="grid gap-4">
          <TaskGroup title="Att göra" tasks={open} goals={goals} onToggle={toggle} empty="Allt i veckans fokus är avbockat." />
          {done.length > 0 ? <TaskGroup title="Klart" tasks={done} goals={goals} onToggle={toggle} empty="" /> : null}
        </div>
      )}
    </div>
  )
}

function TaskGroup({
  title,
  tasks,
  goals,
  onToggle,
  empty,
}: {
  title: string
  tasks: { id: string; title: string; goal_id: string; completed: boolean; due_date: string | null }[]
  goals: { id: string; title: string }[]
  onToggle: (id: string, completed: boolean) => void
  empty: string
}) {
  return (
    <Card>
      <h2 className="font-display text-2xl font-medium">{title}</h2>
      {tasks.length === 0 ? <p className="mt-3 text-sm text-muted">{empty}</p> : null}
      <ul className="mt-2 divide-y divide-line">
        {tasks.map((task) => {
          const goal = goals.find((item) => item.id === task.goal_id)
          const tone = dueTone(task.due_date)
          return (
            <li key={task.id} className="flex items-start gap-3 py-3">
              <input
                type="checkbox"
                className="mt-1 h-5 w-5"
                checked={task.completed}
                onChange={() => onToggle(task.id, !task.completed)}
                aria-label={`Markera ${task.title}`}
              />
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium ${task.completed ? 'text-muted line-through' : ''}`}>{task.title}</p>
                <p className="text-xs text-muted">
                  <Link to={`/mal/${task.goal_id}`} className="underline-offset-2 hover:underline">{goal?.title}</Link>
                  {dueLabel(task.due_date) ? <span className={tone === 'overdue' && !task.completed ? ' text-rose' : ''}> · {dueLabel(task.due_date)}</span> : null}
                </p>
              </div>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
