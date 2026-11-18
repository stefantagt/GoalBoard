import { toUserMessage, type ApiError } from '../lib/errors'
import type { NeonClient } from '../lib/neon'
import type { Goal, GoalDraft, Milestone, Project, ProjectDraft, Task } from '../lib/types'
import { normalizeHttpUrl } from '../lib/urls'

export type AccessState =
  | { kind: 'allowed'; userId: string | null }
  | { kind: 'denied'; userId: string | null }
  | { kind: 'unmigrated'; message: string }

export type BoardSnapshot = {
  access: AccessState
  goals: Goal[]
  milestones: Milestone[]
  tasks: Task[]
  projects: Project[]
}

type QueryResult = {
  data: unknown
  error: ApiError | null
}

export async function loadBoard(client: NeonClient): Promise<BoardSnapshot> {
  const [accessResult, goalsResult, milestonesResult, tasksResult, projectsResult] = await Promise.all([
    client.rpc('current_access') as PromiseLike<QueryResult>,
    client.from('goals').select('*').order('updated_at', { ascending: false }) as PromiseLike<QueryResult>,
    client.from('milestones').select('*').order('sort_order', { ascending: true }) as PromiseLike<QueryResult>,
    client.from('tasks').select('*').order('sort_order', { ascending: true }) as PromiseLike<QueryResult>,
    client.from('projects').select('*').order('updated_at', { ascending: false }) as PromiseLike<QueryResult>,
  ])

  if (isMissingSchema(accessResult.error) || [goalsResult, milestonesResult, tasksResult, projectsResult].some((result) => isMissingSchema(result.error))) {
    return {
      access: { kind: 'unmigrated', message: toUserMessage(accessResult.error ?? goalsResult.error) },
      goals: [],
      milestones: [],
      tasks: [],
      projects: [],
    }
  }

  assertOk(accessResult)
  assertOk(goalsResult)
  assertOk(milestonesResult)
  assertOk(tasksResult)
  assertOk(projectsResult)

  const accessRow = firstRow(accessResult.data)
  const allowed = accessRow?.allowed === true
  const userId = typeof accessRow?.user_id === 'string' ? accessRow.user_id : null

  return {
    access: { kind: allowed ? 'allowed' : 'denied', userId },
    goals: asArray(goalsResult.data).flatMap(parseGoal),
    milestones: asArray(milestonesResult.data).flatMap(parseMilestone),
    tasks: asArray(tasksResult.data).flatMap(parseTask),
    projects: asArray(projectsResult.data).flatMap(parseProject),
  }
}

export async function insertGoal(client: NeonClient, draft: GoalDraft): Promise<void> {
  validateGoalDraft(draft)
  await write(client.from('goals').insert(goalPayload(draft)) as PromiseLike<QueryResult>)
}

export async function updateGoal(client: NeonClient, id: string, draft: GoalDraft): Promise<void> {
  validateGoalDraft(draft)
  await write(client.from('goals').update(goalPayload(draft)).eq('id', id).select('id') as PromiseLike<QueryResult>, true)
}

export async function setGoalStatus(client: NeonClient, id: string, status: Goal['status']): Promise<void> {
  await write(client.from('goals').update({ status }).eq('id', id).select('id') as PromiseLike<QueryResult>, true)
}

export async function deleteGoal(client: NeonClient, id: string): Promise<void> {
  await write(client.from('goals').delete().eq('id', id).select('id') as PromiseLike<QueryResult>, true)
}

export async function insertMilestone(client: NeonClient, goalId: string, title: string, sortOrder: number): Promise<void> {
  const trimmed = title.trim()
  if (!trimmed) throw new Error('Delmålet behöver en titel.')
  await write(client.from('milestones').insert({ goal_id: goalId, title: trimmed, sort_order: sortOrder }) as PromiseLike<QueryResult>)
}

export async function setMilestoneCompleted(client: NeonClient, id: string, completed: boolean): Promise<void> {
  await write(client.from('milestones').update({ completed }).eq('id', id).select('id') as PromiseLike<QueryResult>, true)
}

export async function deleteMilestone(client: NeonClient, id: string): Promise<void> {
  await write(client.from('milestones').delete().eq('id', id).select('id') as PromiseLike<QueryResult>, true)
}

export async function insertTask(
  client: NeonClient,
  input: { goalId: string; title: string; sortOrder: number; dueDate?: string; weekFocus?: boolean },
): Promise<void> {
  const title = input.title.trim()
  if (!title) throw new Error('Aktiviteten behöver en titel.')
  await write(
    client.from('tasks').insert({
      goal_id: input.goalId,
      title,
      sort_order: input.sortOrder,
      due_date: input.dueDate || null,
      week_focus: input.weekFocus ?? false,
    }) as PromiseLike<QueryResult>,
  )
}

export async function updateTask(
  client: NeonClient,
  id: string,
  patch: Partial<Pick<Task, 'title' | 'completed' | 'week_focus' | 'due_date'>>,
): Promise<void> {
  await write(client.from('tasks').update(patch).eq('id', id).select('id') as PromiseLike<QueryResult>, true)
}

export async function deleteTask(client: NeonClient, id: string): Promise<void> {
  await write(client.from('tasks').delete().eq('id', id).select('id') as PromiseLike<QueryResult>, true)
}

export async function insertProject(client: NeonClient, draft: ProjectDraft): Promise<void> {
  await write(client.from('projects').insert(projectPayload(draft)) as PromiseLike<QueryResult>)
}

export async function updateProject(client: NeonClient, id: string, draft: ProjectDraft): Promise<void> {
  await write(client.from('projects').update(projectPayload(draft)).eq('id', id).select('id') as PromiseLike<QueryResult>, true)
}

export async function deleteProject(client: NeonClient, id: string): Promise<void> {
  await write(client.from('projects').delete().eq('id', id).select('id') as PromiseLike<QueryResult>, true)
}

function goalPayload(draft: GoalDraft) {
  return {
    title: draft.title.trim(),
    description: draft.description.trim(),
    category: draft.category,
    why_important: draft.why_important.trim(),
    start_date: draft.start_date || null,
    target_date: draft.target_date || null,
    status: draft.status,
  }
}

function projectPayload(draft: ProjectDraft) {
  const name = draft.name.trim()
  if (!name) throw new Error('Projektet behöver ett namn.')
  return {
    name,
    description: draft.description.trim(),
    status: draft.status,
    tech_stack: draft.tech_stack.trim(),
    github_url: normalizeHttpUrl(draft.github_url),
    live_url: normalizeHttpUrl(draft.live_url),
    notes: draft.notes.trim(),
    goal_id: draft.goal_id || null,
  }
}

function validateGoalDraft(draft: GoalDraft) {
  if (!draft.title.trim()) throw new Error('Målet behöver en titel.')
  if (draft.start_date && draft.target_date && draft.target_date < draft.start_date) {
    throw new Error('Måldatum kan inte ligga före startdatum.')
  }
}

async function write(query: PromiseLike<QueryResult>, requireRow = false) {
  const result = await query
  assertOk(result)
  if (requireRow && asArray(result.data).length === 0) {
    throw new Error('Inget sparades. Kontrollera att kontot finns i allowed_users.')
  }
}

function assertOk(result: QueryResult) {
  if (result.error) throw new Error(toUserMessage(result.error))
}

function isMissingSchema(error: ApiError | null): boolean {
  if (!error) return false
  const message = error.message ?? ''
  return error.code === 'PGRST205' || error.code === 'PGRST202' || /does not exist/i.test(message) || /could not find the function/i.test(message) || /schema cache/i.test(message)
}

function asArray(data: unknown): unknown[] {
  return Array.isArray(data) ? data : []
}

function firstRow(data: unknown): { allowed?: boolean; user_id?: string } | null {
  const row = asArray(data)[0]
  return row && typeof row === 'object' ? (row as { allowed?: boolean; user_id?: string }) : null
}

function parseGoal(value: unknown): Goal[] {
  if (!isRecord(value) || typeof value.id !== 'string' || typeof value.title !== 'string') return []
  return [
    {
      id: value.id,
      user_id: stringField(value.user_id),
      title: value.title,
      description: stringField(value.description),
      category: isGoalCategory(value.category) ? value.category : 'ovrigt',
      why_important: stringField(value.why_important),
      start_date: nullableString(value.start_date),
      target_date: nullableString(value.target_date),
      status: isGoalStatus(value.status) ? value.status : 'active',
      created_at: stringField(value.created_at),
      updated_at: stringField(value.updated_at),
    },
  ]
}

function parseMilestone(value: unknown): Milestone[] {
  if (!isRecord(value) || typeof value.id !== 'string' || typeof value.goal_id !== 'string') return []
  return [
    {
      id: value.id,
      goal_id: value.goal_id,
      user_id: stringField(value.user_id),
      title: stringField(value.title),
      completed: Boolean(value.completed),
      sort_order: numberField(value.sort_order),
      created_at: stringField(value.created_at),
      updated_at: stringField(value.updated_at),
    },
  ]
}

function parseTask(value: unknown): Task[] {
  if (!isRecord(value) || typeof value.id !== 'string' || typeof value.goal_id !== 'string') return []
  return [
    {
      id: value.id,
      goal_id: value.goal_id,
      milestone_id: nullableString(value.milestone_id),
      user_id: stringField(value.user_id),
      title: stringField(value.title),
      completed: Boolean(value.completed),
      week_focus: Boolean(value.week_focus),
      due_date: nullableString(value.due_date),
      sort_order: numberField(value.sort_order),
      created_at: stringField(value.created_at),
      updated_at: stringField(value.updated_at),
    },
  ]
}

function parseProject(value: unknown): Project[] {
  if (!isRecord(value) || typeof value.id !== 'string' || typeof value.name !== 'string') return []
  return [
    {
      id: value.id,
      user_id: stringField(value.user_id),
      goal_id: nullableString(value.goal_id),
      name: value.name,
      description: stringField(value.description),
      status: isProjectStatus(value.status) ? value.status : 'idea',
      tech_stack: stringField(value.tech_stack),
      github_url: stringField(value.github_url),
      live_url: stringField(value.live_url),
      notes: stringField(value.notes),
      created_at: stringField(value.created_at),
      updated_at: stringField(value.updated_at),
    },
  ]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function stringField(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function nullableString(value: unknown): string | null {
  return typeof value === 'string' && value ? value : null
}

function numberField(value: unknown): number {
  return typeof value === 'number' ? value : 0
}

function isGoalCategory(value: unknown): value is Goal['category'] {
  return value === 'ekonomi' || value === 'egna_projekt' || value === 'halsa' || value === 'familj' || value === 'ovrigt'
}

function isGoalStatus(value: unknown): value is Goal['status'] {
  return value === 'active' || value === 'paused' || value === 'completed' || value === 'archived'
}

function isProjectStatus(value: unknown): value is Project['status'] {
  return value === 'idea' || value === 'active' || value === 'paused' || value === 'done' || value === 'archived'
}
