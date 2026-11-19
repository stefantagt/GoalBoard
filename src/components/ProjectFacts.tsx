import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, FolderGit2 } from 'lucide-react'
import { GoalProgress } from './GoalProgress'
import { featureList, inventorySummary, languageParts } from '../lib/projectImport'
import { formatDate } from '../lib/dates'
import { goalStatusLabel } from '../lib/labels'
import type { Goal, Milestone, Project, Task } from '../lib/types'
import { safeHttpUrl } from '../lib/urls'
import { StatusBadge } from './ui'

export function ProjectFacts({
  project,
  goal = null,
  milestones = [],
  tasks = [],
  showDescription = false,
}: {
  project: Project
  goal?: Goal | null
  milestones?: Milestone[]
  tasks?: Task[]
  showDescription?: boolean
}) {
  const languages = languageParts(project.primary_language, project.languages)
  const summary = inventorySummary(project)
  const features = featureList(project.features)
  const github = safeHttpUrl(project.github_url)
  const live = safeHttpUrl(project.live_url)

  return (
    <div className="grid gap-4 text-sm leading-6">
      {showDescription && project.description ? <p className="whitespace-pre-wrap">{project.description}</p> : null}
      {languages.head ? (
        <Fact title="Språk">
          <LanguageLine primary={project.primary_language} languages={project.languages} />
        </Fact>
      ) : null}
      {summary ? (
        <Fact title="Omfattning">
          <p className="text-muted">{summary}</p>
        </Fact>
      ) : null}
      {features.length > 0 ? (
        <Fact title="Funktioner">
          <ul className="text-muted">
            {features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </Fact>
      ) : null}
      <Fact title="Mål">
        {goal ? <LinkedGoal goal={goal} milestones={milestones} tasks={tasks} /> : <p className="text-muted">Inte kopplat till något mål.</p>}
      </Fact>
      {project.tech_stack || project.notes || github || live ? (
        <Fact title="Koppling">
          {project.tech_stack ? <p>{project.tech_stack}</p> : null}
          {project.notes ? <p className="mt-2 whitespace-pre-wrap">{project.notes}</p> : null}
          {github || live ? (
            <div className="mt-3 flex flex-wrap gap-3">
              {github ? (
                <a className="inline-flex min-h-11 items-center gap-2 font-medium text-sage" href={github} target="_blank" rel="noreferrer">
                  <FolderGit2 size={16} /> GitHub
                </a>
              ) : null}
              {live ? (
                <a className="inline-flex min-h-11 items-center gap-2 font-medium text-sage" href={live} target="_blank" rel="noreferrer">
                  <ExternalLink size={16} /> Öppna appen
                </a>
              ) : null}
            </div>
          ) : null}
        </Fact>
      ) : null}
    </div>
  )
}

export function LanguageLine({
  primary,
  languages,
  limit,
}: {
  primary: string
  languages: string
  limit?: number
}) {
  const { head, rest } = languageParts(primary, languages)
  if (!head) return null
  const shown = limit === undefined ? rest : rest.slice(0, limit)
  const hidden = rest.length - shown.length
  return (
    <p className="truncate text-sm leading-6">
      <span className="font-medium text-sage-deep">{head}</span>
      {shown.length > 0 ? <span className="text-muted"> · {shown.join(' · ')}</span> : null}
      {hidden > 0 ? <span className="text-muted"> +{hidden}</span> : null}
    </p>
  )
}

function LinkedGoal({ goal, milestones, tasks }: { goal: Goal; milestones: Milestone[]; tasks: Task[] }) {
  const goalMilestones = milestones.filter((milestone) => milestone.goal_id === goal.id)
  const goalTasks = tasks.filter((task) => task.goal_id === goal.id)
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <Link to={`/mal/${goal.id}`} className="font-medium">{goal.title}</Link>
        <StatusBadge status={goal.status} label={goalStatusLabel(goal.status)} />
      </div>
      <dl className="mt-3 grid gap-2 sm:grid-cols-2">
        <div>
          <dt className="text-muted">Start</dt>
          <dd>{formatDate(goal.start_date)}</dd>
        </div>
        <div>
          <dt className="text-muted">Måldatum</dt>
          <dd>{formatDate(goal.target_date)}</dd>
        </div>
      </dl>
      <div className="mt-3">
        <GoalProgress milestones={goalMilestones} tasks={goalTasks} status={goal.status} compact />
      </div>
      {goalMilestones.length > 0 ? (
        <ul className="mt-3">
          {goalMilestones.map((milestone) => (
            <li key={milestone.id} className={milestone.completed ? 'text-muted line-through' : ''}>{milestone.title}</li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function Fact({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="text-xs font-medium tracking-[0.14em] text-sage uppercase">{title}</h3>
      <div className="mt-1">{children}</div>
    </section>
  )
}
