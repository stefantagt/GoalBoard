import type { GoalDraft, ProjectDraft } from '../lib/types'
import { goalCategories, goalStatuses, projectStatuses } from '../lib/labels'
import { Field, fieldClass } from './ui'

export function GoalFields({
  draft,
  onChange,
}: {
  draft: GoalDraft
  onChange: (draft: GoalDraft) => void
}) {
  const set = (patch: Partial<GoalDraft>) => onChange({ ...draft, ...patch })
  return (
    <div className="grid gap-4">
      <Field label="Titel">
        <input className={fieldClass} value={draft.title} onChange={(event) => set({ title: event.target.value })} required maxLength={160} />
      </Field>
      <Field label="Beskrivning">
        <textarea className={`${fieldClass} min-h-24 resize-y`} value={draft.description} onChange={(event) => set({ description: event.target.value })} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Kategori">
          <select className={fieldClass} value={draft.category} onChange={(event) => set({ category: event.target.value as GoalDraft['category'] })}>
            {goalCategories.map((category) => (
              <option key={category.value} value={category.value}>{category.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select className={fieldClass} value={draft.status} onChange={(event) => set({ status: event.target.value as GoalDraft['status'] })}>
            {goalStatuses.map((status) => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Varför målet är viktigt">
        <textarea className={`${fieldClass} min-h-20 resize-y`} value={draft.why_important} onChange={(event) => set({ why_important: event.target.value })} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Startdatum">
          <input className={fieldClass} type="date" value={draft.start_date} onChange={(event) => set({ start_date: event.target.value })} />
        </Field>
        <Field label="Måldatum">
          <input className={fieldClass} type="date" value={draft.target_date} onChange={(event) => set({ target_date: event.target.value })} />
        </Field>
      </div>
    </div>
  )
}

export function ProjectFields({
  draft,
  goals,
  onChange,
}: {
  draft: ProjectDraft
  goals: { id: string; title: string }[]
  onChange: (draft: ProjectDraft) => void
}) {
  const set = (patch: Partial<ProjectDraft>) => onChange({ ...draft, ...patch })
  return (
    <div className="grid gap-4">
      <Field label="Projektnamn">
        <input className={fieldClass} value={draft.name} onChange={(event) => set({ name: event.target.value })} required maxLength={160} />
      </Field>
      <Field label="Kort beskrivning">
        <textarea className={`${fieldClass} min-h-20 resize-y`} value={draft.description} onChange={(event) => set({ description: event.target.value })} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Status">
          <select className={fieldClass} value={draft.status} onChange={(event) => set({ status: event.target.value as ProjectDraft['status'] })}>
            {projectStatuses.map((status) => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Kopplat mål" hint="Valfritt.">
          <select className={fieldClass} value={draft.goal_id} onChange={(event) => set({ goal_id: event.target.value })}>
            <option value="">Inget mål</option>
            {goals.map((goal) => (
              <option key={goal.id} value={goal.id}>{goal.title}</option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Teknikstack" hint="Separera med kommatecken, till exempel React, Vite, Neon.">
        <input className={fieldClass} value={draft.tech_stack} onChange={(event) => set({ tech_stack: event.target.value })} />
      </Field>
      <Field label="GitHub-repo">
        <input className={fieldClass} inputMode="url" placeholder="https://github.com/…" value={draft.github_url} onChange={(event) => set({ github_url: event.target.value })} />
      </Field>
      <Field label="Publicerad applikation">
        <input className={fieldClass} inputMode="url" placeholder="https://…" value={draft.live_url} onChange={(event) => set({ live_url: event.target.value })} />
      </Field>
      <Field label="Anteckningar">
        <textarea className={`${fieldClass} min-h-28 resize-y`} value={draft.notes} onChange={(event) => set({ notes: event.target.value })} />
      </Field>
    </div>
  )
}

export function goalToDraft(goal: {
  title: string
  description: string
  category: GoalDraft['category']
  why_important: string
  start_date: string | null
  target_date: string | null
  status: GoalDraft['status']
}): GoalDraft {
  return {
    title: goal.title,
    description: goal.description,
    category: goal.category,
    why_important: goal.why_important,
    start_date: goal.start_date ?? '',
    target_date: goal.target_date ?? '',
    status: goal.status,
  }
}

export function projectToDraft(project: {
  name: string
  description: string
  status: ProjectDraft['status']
  tech_stack: string
  github_url: string
  live_url: string
  notes: string
  goal_id: string | null
}): ProjectDraft {
  return {
    name: project.name,
    description: project.description,
    status: project.status,
    tech_stack: project.tech_stack,
    github_url: project.github_url,
    live_url: project.live_url,
    notes: project.notes,
    goal_id: project.goal_id ?? '',
  }
}
