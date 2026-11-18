export type GoalCategory = 'ekonomi' | 'egna_projekt' | 'halsa' | 'familj' | 'ovrigt'

export type GoalStatus = 'active' | 'paused' | 'completed' | 'archived'

export type ProjectStatus = 'idea' | 'active' | 'paused' | 'done' | 'archived'

export type Goal = {
  id: string
  user_id: string
  title: string
  description: string
  category: GoalCategory
  why_important: string
  start_date: string | null
  target_date: string | null
  status: GoalStatus
  created_at: string
  updated_at: string
}

export type Milestone = {
  id: string
  goal_id: string
  user_id: string
  title: string
  completed: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export type Task = {
  id: string
  goal_id: string
  milestone_id: string | null
  user_id: string
  title: string
  completed: boolean
  week_focus: boolean
  due_date: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export type Project = {
  id: string
  user_id: string
  goal_id: string | null
  name: string
  description: string
  status: ProjectStatus
  tech_stack: string
  github_url: string
  live_url: string
  notes: string
  created_at: string
  updated_at: string
}

export type GoalDraft = {
  title: string
  description: string
  category: GoalCategory
  why_important: string
  start_date: string
  target_date: string
  status: GoalStatus
}

export type ProjectDraft = {
  name: string
  description: string
  status: ProjectStatus
  tech_stack: string
  github_url: string
  live_url: string
  notes: string
  goal_id: string
}

export const emptyGoalDraft = (): GoalDraft => ({
  title: '',
  description: '',
  category: 'ovrigt',
  why_important: '',
  start_date: '',
  target_date: '',
  status: 'active',
})

export const emptyProjectDraft = (): ProjectDraft => ({
  name: '',
  description: '',
  status: 'idea',
  tech_stack: '',
  github_url: '',
  live_url: '',
  notes: '',
  goal_id: '',
})
