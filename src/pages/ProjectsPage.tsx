import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ExternalLink, FolderGit2 } from 'lucide-react'
import { ProjectFields, projectToDraft } from '../components/forms'
import { Button, Card, Dialog, EmptyState, ErrorNote, PageHeader, StatusBadge, usePageTitle } from '../components/ui'
import { useBoard } from '../data/BoardProvider'
import { projectStatusLabel, projectStatuses } from '../lib/labels'
import { visibleProjects } from '../lib/select'
import { emptyProjectDraft, type Project, type ProjectDraft, type ProjectStatus } from '../lib/types'
import { safeHttpUrl } from '../lib/urls'

export function ProjectsPage() {
  usePageTitle('Mina projekt')
  const board = useBoard()
  const [params, setParams] = useSearchParams()
  const [status, setStatus] = useState<ProjectStatus | 'alla'>('alla')
  const [draft, setDraft] = useState<ProjectDraft>(() => ({
    ...emptyProjectDraft(),
    goal_id: params.get('mal') ?? '',
  }))
  const [editing, setEditing] = useState<Project | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const creating = params.get('ny') === '1'
  const linkedGoal = params.get('mal') ?? ''
  const projects = board.snapshot?.projects ?? []
  const goals = board.snapshot?.goals ?? []
  const visible = useMemo(() => visibleProjects(projects, status), [projects, status])

  useEffect(() => {
    if (!creating || !linkedGoal) return
    setDraft((current) => ({ ...current, goal_id: linkedGoal }))
  }, [creating, linkedGoal])

  function closeCreate() {
    params.delete('ny')
    params.delete('mal')
    setParams(params, { replace: true })
    setDraft(emptyProjectDraft())
    setError(null)
  }

  async function save(action: () => Promise<void>, after: () => void) {
    setPending(true)
    setError(null)
    try {
      await action()
      after()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunde inte spara projektet.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Mina projekt"
        lede="En enkel förteckning över vibecoding- och IT-projekt. Lägg in dem för hand och koppla dem till ett mål om du vill."
        action={<Button onClick={() => setParams({ ny: '1' })}>Nytt projekt</Button>}
      />

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        <Filter active={status === 'alla'} onClick={() => setStatus('alla')}>Alla</Filter>
        {projectStatuses.map((item) => (
          <Filter key={item.value} active={status === item.value} onClick={() => setStatus(item.value)}>{item.label}</Filter>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title={projects.length === 0 ? 'Inga projekt ännu' : 'Inget projekt i det här urvalet'}
          body="Registrera ett projekt med namn, status och de länkar du vill ha nära till hands."
          action={<Button onClick={() => setParams({ ny: '1' })}>Skapa ditt första projekt</Button>}
        />
      ) : (
        <div className="grid gap-3">
          {error ? <ErrorNote>{error}</ErrorNote> : null}
          {visible.map((project) => {
            const goal = goals.find((item) => item.id === project.goal_id)
            const open = expanded === project.id
            const stack = project.tech_stack.split(',').map((item) => item.trim()).filter(Boolean)
            const github = safeHttpUrl(project.github_url)
            const live = safeHttpUrl(project.live_url)
            return (
              <Card key={project.id}>
                <button type="button" className="flex w-full items-start justify-between gap-3 text-left" aria-expanded={open} onClick={() => setExpanded(open ? null : project.id)}>
                  <span>
                    <span className="block text-lg font-medium">{project.name}</span>
                    <span className="mt-1 block text-sm text-muted">{project.description || 'Ingen beskrivning'}</span>
                  </span>
                  <StatusBadge status={project.status} label={projectStatusLabel(project.status)} />
                </button>
                {stack.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {stack.map((item) => (
                      <span key={item} className="rounded-full bg-paper px-2.5 py-1 text-xs text-muted">{item}</span>
                    ))}
                  </div>
                ) : null}
                {open ? (
                  <div className="mt-4 border-t border-line pt-4 text-sm leading-6">
                    {goal ? <p className="text-muted">Kopplat mål: {goal.title}</p> : <p className="text-muted">Inte kopplat till något mål.</p>}
                    {project.notes ? <p className="mt-3 whitespace-pre-wrap">{project.notes}</p> : null}
                    <div className="mt-4 flex flex-wrap gap-3">
                      {github ? <a className="inline-flex min-h-11 items-center gap-2 font-medium text-sage" href={github} target="_blank" rel="noreferrer"><FolderGit2 size={16} /> GitHub</a> : null}
                      {live ? <a className="inline-flex min-h-11 items-center gap-2 font-medium text-sage" href={live} target="_blank" rel="noreferrer"><ExternalLink size={16} /> Öppna appen</a> : null}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button variant="secondary" onClick={() => { setEditing(project); setError(null) }}>Redigera</Button>
                      <Button
                        variant="danger"
                        onClick={() => {
                          if (window.confirm(`Ta bort projektet ${project.name}?`)) {
                            void save(() => board.removeProject(project.id), () => undefined)
                          }
                        }}
                      >
                        Ta bort
                      </Button>
                    </div>
                  </div>
                ) : null}
              </Card>
            )
          })}
        </div>
      )}

      {creating ? (
        <Dialog title="Nytt projekt" onClose={closeCreate}>
          <form className="grid gap-5" onSubmit={(event) => { event.preventDefault(); void save(() => board.createProject(draft), closeCreate) }}>
            <ProjectFields draft={draft} goals={goals} onChange={setDraft} />
            {error ? <ErrorNote>{error}</ErrorNote> : null}
            <Button type="submit" disabled={pending}>{pending ? 'Sparar…' : 'Spara projekt'}</Button>
          </form>
        </Dialog>
      ) : null}

      {editing ? (
        <Dialog title="Redigera projekt" onClose={() => setEditing(null)}>
          <EditProject
            project={editing}
            goals={goals}
            error={error}
            pending={pending}
            onSave={(next) => void save(() => board.saveProject(editing.id, next), () => setEditing(null))}
          />
        </Dialog>
      ) : null}
    </div>
  )
}

function EditProject({
  project,
  goals,
  error,
  pending,
  onSave,
}: {
  project: Project
  goals: { id: string; title: string }[]
  error: string | null
  pending: boolean
  onSave: (draft: ProjectDraft) => void
}) {
  const [draft, setDraft] = useState(() => projectToDraft(project))
  return (
    <form className="grid gap-5" onSubmit={(event) => { event.preventDefault(); onSave(draft) }}>
      <ProjectFields draft={draft} goals={goals} onChange={setDraft} />
      {error ? <ErrorNote>{error}</ErrorNote> : null}
      <Button type="submit" disabled={pending}>{pending ? 'Sparar…' : 'Spara ändringar'}</Button>
    </form>
  )
}

function Filter({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button type="button" aria-pressed={active} onClick={onClick} className={`shrink-0 rounded-full px-3 py-2 text-sm font-medium ${active ? 'bg-ink text-white' : 'bg-card text-muted ring-1 ring-line'}`}>
      {children}
    </button>
  )
}
