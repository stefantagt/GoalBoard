import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { ProjectFields, projectToDraft } from '../components/forms'
import { LanguageLine, ProjectFacts } from '../components/ProjectFacts'
import { Button, Card, Dialog, EmptyState, ErrorNote, PageHeader, StatusBadge, fieldClass, usePageTitle } from '../components/ui'
import { useBoard } from '../data/BoardProvider'
import { projectStatusLabel, projectStatuses } from '../lib/labels'
import { featureList, formatCount, isoDate, languageParts, parseProjectTable, planImport, type ImportPlan } from '../lib/projectImport'
import { projectCountLabel, sortProjects, type ProjectSort, type ProjectSortKey } from '../lib/projectSort'
import { visibleProjects } from '../lib/select'
import { safeHttpUrl } from '../lib/urls'
import { emptyProjectDraft, type Goal, type Milestone, type Project, type ProjectDraft, type ProjectStatus, type Task } from '../lib/types'

const viewKey = 'goalboard-project-view'
const columnKey = 'goalboard-project-columns'

const optionalColumns = [
  { id: 'goal', label: 'Mål' },
  { id: 'language', label: 'Språk' },
  { id: 'lines', label: 'Rader' },
  { id: 'files', label: 'Filer' },
  { id: 'folders', label: 'Mappar' },
  { id: 'changed', label: 'Senast ändrad' },
  { id: 'features', label: 'Funktioner' },
  { id: 'stack', label: 'Teknikstack' },
  { id: 'github', label: 'GitHub' },
  { id: 'live', label: 'Webb' },
  { id: 'notes', label: 'Anteckningar' },
] as const

type ProjectColumn = (typeof optionalColumns)[number]['id']
type ProjectView = 'cards' | 'list'

export function ProjectsPage() {
  usePageTitle('Mina projekt')
  const board = useBoard()
  const [params, setParams] = useSearchParams()
  const [status, setStatus] = useState<ProjectStatus | 'alla'>('alla')
  const [view, setView] = useState<ProjectView>(readView)
  const [columns, setColumns] = useState<ProjectColumn[]>(readColumns)
  const [draft, setDraft] = useState<ProjectDraft>(() => ({
    ...emptyProjectDraft(),
    goal_id: params.get('mal') ?? '',
  }))
  const [editing, setEditing] = useState<Project | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const creating = params.get('ny') === '1'
  const linkedGoal = params.get('mal') ?? ''
  const projects = board.snapshot?.projects ?? []
  const goals = board.snapshot?.goals ?? []
  const visible = visibleProjects(projects, status)
  const activeColumns = optionalColumns.filter((column) => columns.includes(column.id)).map((column) => column.id)

  useEffect(() => {
    if (!creating || !linkedGoal) return
    setDraft((current) => ({ ...current, goal_id: linkedGoal }))
  }, [creating, linkedGoal])

  useEffect(() => {
    try {
      localStorage.setItem(viewKey, view)
    } catch {
      // The view still works when the browser refuses storage.
    }
  }, [view])

  useEffect(() => {
    try {
      localStorage.setItem(columnKey, JSON.stringify(columns))
    } catch {
      // Column choices still apply until the page is reloaded.
    }
  }, [columns])

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

  function toggleColumn(column: ProjectColumn) {
    setColumns((current) => (current.includes(column) ? current.filter((item) => item !== column) : [...current, column]))
  }

  function setAllColumns(selected: boolean) {
    setColumns(selected ? optionalColumns.map((column) => column.id) : [])
  }

  return (
    <div>
      <PageHeader
        title="Mina projekt"
        lede="Växla mellan kort och lista. Importera en tabell, eller lägg till ett projekt för hand."
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => { setError(null); setImportOpen(true) }}>Importera</Button>
            <Button onClick={() => setParams({ ny: '1' })}>Nytt projekt</Button>
          </div>
        }
      />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <Filter active={status === 'alla'} onClick={() => setStatus('alla')}>Alla</Filter>
          {projectStatuses.map((item) => (
            <Filter key={item.value} active={status === item.value} onClick={() => setStatus(item.value)}>{item.label}</Filter>
          ))}
        </div>
        <div className="flex gap-2">
          <Filter active={view === 'cards'} onClick={() => setView('cards')}>Kort</Filter>
          <Filter active={view === 'list'} onClick={() => setView('list')}>Lista</Filter>
          {view === 'list' ? <ColumnPicker columns={columns} onToggle={toggleColumn} onSetAll={setAllColumns} /> : null}
        </div>
      </div>

      {view === 'list' && projects.length > 0 ? (
        <p className="mb-3 text-sm text-muted">{projectCountLabel(visible.length, projects.length)}</p>
      ) : null}

      {visible.length === 0 ? (
        <EmptyState
          title={projects.length === 0 ? 'Inga projekt ännu' : 'Inget projekt i det här urvalet'}
          body="Importera en tabell eller registrera ett projekt med namn, status och de länkar du vill ha nära till hands."
          action={<Button onClick={() => setParams({ ny: '1' })}>Skapa ditt första projekt</Button>}
        />
      ) : view === 'cards' ? (
        <CardList
          projects={visible}
          goals={goals}
          milestones={board.snapshot?.milestones ?? []}
          tasks={board.snapshot?.tasks ?? []}
          expanded={expanded}
          error={error}
          onToggle={setExpanded}
          onEdit={(project) => { setEditing(project); setError(null) }}
          onDelete={(project) => {
            if (window.confirm(`Ta bort projektet ${project.name}?`)) void save(() => board.removeProject(project.id), () => undefined)
          }}
        />
      ) : (
        <ProjectTable
          projects={visible}
          goals={goals}
          milestones={board.snapshot?.milestones ?? []}
          tasks={board.snapshot?.tasks ?? []}
          columns={activeColumns}
          expanded={expanded}
          error={error}
          onToggle={setExpanded}
          onEdit={(project) => { setEditing(project); setError(null) }}
          onDelete={(project) => {
            if (window.confirm(`Ta bort projektet ${project.name}?`)) void save(() => board.removeProject(project.id), () => undefined)
          }}
        />
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

      {importOpen ? (
        <ImportDialog
          projects={projects}
          pending={pending}
          saveError={error}
          onClose={() => setImportOpen(false)}
          onImport={(text) => void save(() => board.importProjects(text), () => setImportOpen(false))}
        />
      ) : null}
    </div>
  )
}

function CardList({
  projects,
  goals,
  milestones,
  tasks,
  expanded,
  error,
  onToggle,
  onEdit,
  onDelete,
}: ProjectCollectionProps) {
  return (
    <div className="grid gap-3">
      {error ? <ErrorNote>{error}</ErrorNote> : null}
      {projects.map((project) => {
        const open = expanded === project.id
        const stack = project.tech_stack.split(',').map((item) => item.trim()).filter(Boolean)
        return (
          <Card key={project.id}>
            <ProjectButton project={project} open={open} onToggle={() => onToggle(open ? null : project.id)} />
            {stack.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {stack.map((item) => (
                  <span key={item} className="rounded-full bg-paper px-2.5 py-1 text-xs text-muted">{item}</span>
                ))}
              </div>
            ) : null}
            {open ? (
              <div className="mt-4 border-t border-line pt-4">
                <ProjectBody project={project} goals={goals} milestones={milestones} tasks={tasks} onEdit={() => onEdit(project)} onDelete={() => onDelete(project)} />
              </div>
            ) : null}
          </Card>
        )
      })}
    </div>
  )
}

function ProjectTable({
  projects,
  goals,
  milestones,
  tasks,
  columns,
  expanded,
  error,
  onToggle,
  onEdit,
  onDelete,
}: ProjectCollectionProps & { columns: ProjectColumn[] }) {
  const [sort, setSort] = useState<ProjectSort>({ key: 'name', direction: 'asc' })
  const sortKeys = useMemo(() => new Set<ProjectSortKey>(['name', 'description', 'status', ...columns]), [columns])
  const activeSort = sortKeys.has(sort.key) ? sort : { key: 'name' as const, direction: sort.direction }
  const sorted = useMemo(() => sortProjects(projects, goals, activeSort), [projects, goals, activeSort])

  function chooseSort(key: ProjectSortKey) {
    setSort((current) => (current.key === key ? { key, direction: current.direction === 'asc' ? 'desc' : 'asc' } : { key, direction: 'asc' }))
  }

  return (
    <div>
      {error ? <div className="mb-3"><ErrorNote>{error}</ErrorNote></div> : null}
      <div className="mb-3 flex gap-2 md:hidden">
        <select className={fieldClass} aria-label="Sortera listan" value={activeSort.key} onChange={(event) => chooseSort(event.target.value as ProjectSortKey)}>
          <option value="name">Namn</option>
          <option value="description">Beskrivning</option>
          <option value="status">Status</option>
          {columns.map((column) => (
            <option key={column} value={column}>{columnLabel(column)}</option>
          ))}
        </select>
        <Button variant="secondary" onClick={() => chooseSort(activeSort.key)}>{activeSort.direction === 'asc' ? 'Stigande' : 'Fallande'}</Button>
      </div>
      <div className="hidden overflow-x-auto rounded-3xl border border-line bg-card md:block">
        <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
          <thead className="border-b border-line text-xs tracking-[0.14em] text-muted uppercase">
            <tr>
              <th className="w-12 px-4 py-3 font-medium">Nr</th>
              <SortHeader label="Namn" column="name" sort={activeSort} onSort={chooseSort} />
              <SortHeader label="Beskrivning" column="description" sort={activeSort} onSort={chooseSort} />
              <SortHeader label="Status" column="status" sort={activeSort} onSort={chooseSort} />
              {columns.map((column) => (
                <SortHeader key={column} label={columnLabel(column)} column={column} sort={activeSort} onSort={chooseSort} />
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((project, index) => {
              const open = expanded === project.id
              return (
                <ProjectRows
                  key={project.id}
                  index={index + 1}
                  project={project}
                  columns={columns}
                  open={open}
                  goals={goals}
                  milestones={milestones}
                  tasks={tasks}
                  goalTitle={goalTitle(goals, project)}
                  onToggle={() => onToggle(open ? null : project.id)}
                  onEdit={() => onEdit(project)}
                  onDelete={() => onDelete(project)}
                />
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="grid gap-3 md:hidden">
        {sorted.map((project, index) => {
          const open = expanded === project.id
          const linkedGoal = goalTitle(goals, project)
          return (
            <Card key={project.id} className="p-4">
              <div className="flex gap-3">
                <span className="pt-1 text-xs text-muted tabular-nums">{index + 1}</span>
                <div className="min-w-0 flex-1">
                  <ProjectButton project={project} open={open} clamp onToggle={() => onToggle(open ? null : project.id)} />
                  <MobileMeta project={project} columns={columns} goalTitle={linkedGoal} />
                  {open ? (
                    <div className="mt-4 border-t border-line pt-4">
                      <ProjectBody project={project} goals={goals} milestones={milestones} tasks={tasks} showDescription onEdit={() => onEdit(project)} onDelete={() => onDelete(project)} />
                    </div>
                  ) : null}
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function SortHeader({
  label,
  column,
  sort,
  onSort,
}: {
  label: string
  column: ProjectSortKey
  sort: ProjectSort
  onSort: (column: ProjectSortKey) => void
}) {
  const active = sort.key === column
  return (
    <th className="px-4 py-3 font-medium whitespace-nowrap" aria-sort={active ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
      <button type="button" className="inline-flex items-center gap-1" onClick={() => onSort(column)}>
        {label}
        {active ? sort.direction === 'asc' ? <ArrowUp size={13} aria-hidden="true" /> : <ArrowDown size={13} aria-hidden="true" /> : null}
      </button>
    </th>
  )
}

function ProjectRows({
  index,
  project,
  columns,
  open,
  goals,
  milestones,
  tasks,
  goalTitle,
  onToggle,
  onEdit,
  onDelete,
}: {
  index: number
  project: Project
  columns: ProjectColumn[]
  open: boolean
  goals: Goal[]
  milestones: Milestone[]
  tasks: Task[]
  goalTitle: string | null
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <>
      <tr className="border-b border-line last:border-b-0">
        <td className="px-4 py-3 align-top text-muted tabular-nums">{index}</td>
        <td className="px-4 py-3 align-top">
          <button type="button" className="text-left font-medium" aria-expanded={open} onClick={onToggle}>
            {project.name}
          </button>
        </td>
        <td className="max-w-md px-4 py-3 align-top text-muted">
          <span className="line-clamp-2">{project.description || 'Ingen beskrivning'}</span>
        </td>
        <td className="px-4 py-3 align-top whitespace-nowrap">
          <StatusBadge status={project.status} label={projectStatusLabel(project.status)} />
        </td>
        {columns.map((column) => (
          <td key={column} className={`max-w-56 px-4 py-3 align-top text-muted ${column === 'notes' || column === 'stack' ? '' : 'whitespace-nowrap'}`}>
            <ColumnValue project={project} column={column} goalTitle={goalTitle} />
          </td>
        ))}
      </tr>
      {open ? (
        <tr className="border-b border-line bg-paper/60">
          <td className="px-4 py-4" colSpan={4 + columns.length}>
            <ProjectBody project={project} goals={goals} milestones={milestones} tasks={tasks} showDescription onEdit={onEdit} onDelete={onDelete} />
          </td>
        </tr>
      ) : null}
    </>
  )
}

function ProjectButton({ project, open, clamp = false, onToggle }: { project: Project; open: boolean; clamp?: boolean; onToggle: () => void }) {
  return (
    <button type="button" className="flex w-full items-start justify-between gap-3 text-left" aria-expanded={open} onClick={onToggle}>
      <span>
        <span className="block text-lg font-medium">{project.name}</span>
        <span className={`mt-1 block text-sm text-muted ${clamp ? 'line-clamp-2' : ''}`}>{project.description || 'Ingen beskrivning'}</span>
      </span>
      <StatusBadge status={project.status} label={projectStatusLabel(project.status)} />
    </button>
  )
}

function MobileMeta({ project, columns, goalTitle: linkedGoal }: { project: Project; columns: ProjectColumn[]; goalTitle: string | null }) {
  const text = columns
    .filter((column) => column !== 'language')
    .map((column) => columnText(project, column, linkedGoal))
    .filter(Boolean)
    .join(' · ')
  const hasLanguage = columns.includes('language') && languageParts(project.primary_language, project.languages).head
  if (!hasLanguage && !text) return null
  return (
    <div className="mt-2 text-xs text-muted">
      {hasLanguage ? <LanguageLine primary={project.primary_language} languages={project.languages} limit={2} /> : null}
      {text ? <p className="truncate">{text}</p> : null}
    </div>
  )
}

function ProjectBody({
  project,
  goals,
  milestones,
  tasks,
  showDescription = false,
  onEdit,
  onDelete,
}: {
  project: Project
  goals: Goal[]
  milestones: Milestone[]
  tasks: Task[]
  showDescription?: boolean
  onEdit: () => void
  onDelete: () => void
}) {
  const goal = goals.find((item) => item.id === project.goal_id) ?? null
  return (
    <div>
      <ProjectFacts project={project} goal={goal} milestones={milestones} tasks={tasks} showDescription={showDescription} />
      <div className="mt-4 flex gap-2">
        <Button variant="secondary" onClick={onEdit}>Redigera</Button>
        <Button variant="danger" onClick={onDelete}>Ta bort</Button>
      </div>
    </div>
  )
}

function ImportDialog({
  projects,
  pending,
  saveError,
  onClose,
  onImport,
}: {
  projects: Project[]
  pending: boolean
  saveError: string | null
  onClose: () => void
  onImport: (text: string) => void
}) {
  const [text, setText] = useState('')
  const [plan, setPlan] = useState<ImportPlan | null>(null)
  const [error, setError] = useState<string | null>(null)

  function preview() {
    try {
      const next = planImport(projects.map((project) => ({ id: project.id, name: project.name })), parseProjectTable(text))
      if (next.create.length === 0 && next.update.length === 0) {
        setPlan(null)
        setError('Ingen rad att importera.')
        return
      }
      setPlan(next)
      setError(null)
    } catch (err) {
      setPlan(null)
      setError(err instanceof Error ? err.message : 'Tabellen kunde inte läsas.')
    }
  }

  const rows = plan ? [...plan.create.map((project) => ({ project, action: 'Ny' })), ...plan.update.map((item) => ({ project: item.project, action: 'Uppdateras' }))] : []

  return (
    <Dialog title="Importera projekt" wide onClose={onClose}>
      <div className="grid gap-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Tabell</span>
          <textarea
            className="min-h-36 w-full resize-y rounded-xl border border-line bg-card px-3 py-2.5 text-sm text-ink outline-none focus:border-sage focus:ring-2 focus:ring-sage/20"
            value={text}
            placeholder="Klistra in tabellen med rubrikraden Namn och Beskrivning."
            onChange={(event) => {
              setText(event.target.value)
              setPlan(null)
              setError(null)
            }}
          />
        </label>
        <p className="text-xs leading-5 text-muted">
          Nya projekt får status Idé. Ett befintligt namn uppdaterar beskrivning, språk, omfattning och funktioner. En tom beskrivning skriver inte över text som redan finns. Status, länkar, anteckningar och kopplat mål lämnas orörda.
        </p>
        {error ? <ErrorNote>{error}</ErrorNote> : null}
        {saveError ? <ErrorNote>{saveError}</ErrorNote> : null}
        {plan ? (
          <div className="max-h-64 overflow-auto rounded-2xl border border-line">
            <p className="border-b border-line px-3 py-2 text-sm">{plan.create.length} nya, {plan.update.length} uppdateras</p>
            <ul>
              {rows.map((row) => (
                <li key={`${row.action}-${row.project.name}`} className="flex items-baseline justify-between gap-3 border-b border-line px-3 py-2 text-sm last:border-b-0">
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{row.project.name}</span>
                    <span className="block truncate text-xs text-muted">{row.project.primaryLanguage || 'Inget språk'} · {formatCount(row.project.lineCount) || '–'} rader</span>
                  </span>
                  <span className="shrink-0 text-xs text-muted">{row.action}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {plan ? (
          <Button disabled={pending} onClick={() => onImport(text)}>{pending ? 'Importerar…' : 'Lägg in projekten'}</Button>
        ) : (
          <Button variant="secondary" onClick={preview}>Visa förhandsvisning</Button>
        )}
      </div>
    </Dialog>
  )
}

function ColumnPicker({
  columns,
  onToggle,
  onSetAll,
}: {
  columns: ProjectColumn[]
  onToggle: (column: ProjectColumn) => void
  onSetAll: (selected: boolean) => void
}) {
  const [open, setOpen] = useState(false)
  const panel = useRef<HTMLDivElement>(null)
  const allSelected = columns.length === optionalColumns.length

  useEffect(() => {
    if (!open) return
    function closeOnOutside(event: PointerEvent) {
      if (!panel.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutside)
    return () => document.removeEventListener('pointerdown', closeOnOutside)
  }, [open])

  return (
    <div className="relative" ref={panel}>
      <Filter active={open} onClick={() => setOpen((current) => !current)}>Kolumner</Filter>
      {open ? (
        <div className="absolute right-0 z-20 mt-2 max-h-[70dvh] w-52 overflow-y-auto rounded-2xl border border-line bg-card p-2 shadow-[0_8px_24px_rgba(28,25,23,0.06)]">
          <label className="flex min-h-11 items-center gap-2 border-b border-line px-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={allSelected}
              ref={(node) => {
                if (node) node.indeterminate = columns.length > 0 && !allSelected
              }}
              onChange={() => onSetAll(!allSelected)}
            />
            Alla
          </label>
          {optionalColumns.map((column) => (
            <label key={column.id} className="flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm">
              <input type="checkbox" checked={columns.includes(column.id)} onChange={() => onToggle(column.id)} />
              {column.label}
            </label>
          ))}
        </div>
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

type ProjectCollectionProps = {
  projects: Project[]
  goals: Goal[]
  milestones: Milestone[]
  tasks: Task[]
  expanded: string | null
  error: string | null
  onToggle: (id: string | null) => void
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
}

function goalTitle(goals: { id: string; title: string }[], project: Project): string | null {
  return goals.find((goal) => goal.id === project.goal_id)?.title ?? null
}

function columnLabel(column: ProjectColumn): string {
  return optionalColumns.find((item) => item.id === column)?.label ?? column
}

function ColumnValue({ project, column, goalTitle: linkedGoal }: { project: Project; column: ProjectColumn; goalTitle: string | null }) {
  if (column === 'language') return <LanguageLine primary={project.primary_language} languages={project.languages} limit={2} />
  if (column === 'github' || column === 'live') return <ProjectLink value={column === 'github' ? project.github_url : project.live_url} />
  const text = columnText(project, column, linkedGoal)
  if (!text) return null
  if (column === 'notes' || column === 'stack') return <span className="line-clamp-2 whitespace-normal">{text}</span>
  return text
}

function ProjectLink({ value }: { value: string }) {
  const href = safeHttpUrl(value)
  if (!href) return null
  return (
    <a className="block max-w-56 truncate font-medium text-sage" href={href} target="_blank" rel="noreferrer">
      {linkLabel(href)}
    </a>
  )
}

function linkLabel(href: string): string {
  const url = new URL(href)
  return `${url.hostname}${url.pathname.replace(/\/$/, '')}`
}

function columnText(project: Project, column: ProjectColumn, linkedGoal: string | null): string {
  if (column === 'goal') return linkedGoal ?? ''
  if (column === 'lines') return formatCount(project.line_count)
  if (column === 'files') return formatCount(project.file_count)
  if (column === 'folders') return formatCount(project.folder_count)
  if (column === 'changed') return isoDate(project.repo_changed_on)
  if (column === 'stack') return project.tech_stack
  if (column === 'github') return safeHttpUrl(project.github_url) ?? ''
  if (column === 'live') return safeHttpUrl(project.live_url) ?? ''
  if (column === 'notes') return project.notes
  if (column === 'features') {
    const features = featureList(project.features)
    if (features.length === 0) return ''
    return features.length === 1 ? features[0] : `${features.length} funktioner`
  }
  return ''
}

function readView(): ProjectView {
  try {
    return localStorage.getItem(viewKey) === 'list' ? 'list' : 'cards'
  } catch {
    return 'cards'
  }
}

function readColumns(): ProjectColumn[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(columnKey) ?? '[]') as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is ProjectColumn => optionalColumns.some((column) => column.id === item))
  } catch {
    return []
  }
}
