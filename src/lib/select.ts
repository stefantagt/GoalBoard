import type { Goal, GoalStatus, Milestone, Project, ProjectStatus, Task } from './types'

export function importantGoals(goals: Goal[]): Goal[] {
  return goals
    .filter((goal) => goal.status === 'active')
    .sort((a, b) => compareDates(a.target_date, b.target_date) || b.updated_at.localeCompare(a.updated_at))
    .slice(0, 4)
}

export function nextTasks(tasks: Task[], goals: Goal[]): Task[] {
  const openGoalIds = new Set(
    goals.filter((goal) => goal.status === 'active' || goal.status === 'paused').map((goal) => goal.id),
  )
  return tasks
    .filter((task) => !task.completed && openGoalIds.has(task.goal_id))
    .sort((a, b) => compareDates(a.due_date, b.due_date) || a.created_at.localeCompare(b.created_at))
    .slice(0, 5)
}

export function weekTasks(tasks: Task[], goals: Goal[]): Task[] {
  const visibleGoalIds = new Set(goals.filter((goal) => goal.status !== 'archived').map((goal) => goal.id))
  return tasks
    .filter((task) => task.week_focus && visibleGoalIds.has(task.goal_id))
    .sort((a, b) => Number(a.completed) - Number(b.completed) || compareDates(a.due_date, b.due_date))
}

export function goalById(goals: Goal[], id: string | undefined): Goal | undefined {
  return goals.find((goal) => goal.id === id)
}

export function milestonesFor(milestones: Milestone[], goalId: string): Milestone[] {
  return milestones
    .filter((milestone) => milestone.goal_id === goalId)
    .sort((a, b) => a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at))
}

export function tasksFor(tasks: Task[], goalId: string): Task[] {
  return tasks
    .filter((task) => task.goal_id === goalId)
    .sort((a, b) => a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at))
}

export function projectsForGoal(projects: Project[], goalId: string): Project[] {
  return projects.filter((project) => project.goal_id === goalId)
}

export function visibleGoals(goals: Goal[], category: string, showArchived: boolean): Goal[] {
  return goals.filter((goal) => {
    if (!showArchived && goal.status === 'archived') return false
    if (category !== 'alla' && goal.category !== category) return false
    return true
  })
}

export function visibleProjects(projects: Project[], status: ProjectStatus | 'alla'): Project[] {
  if (status === 'alla') return projects.filter((project) => project.status !== 'archived')
  return projects.filter((project) => project.status === status)
}

export function countGoals(goals: Goal[], status: GoalStatus): number {
  return goals.filter((goal) => goal.status === status).length
}

function compareDates(a: string | null, b: string | null): number {
  if (a && b) return a.localeCompare(b)
  if (a) return -1
  if (b) return 1
  return 0
}
