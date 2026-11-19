export type GoalCategory = 'ekonomi' | 'egna_projekt' | 'halsa' | 'familj' | 'ovrigt'

export type GoalStatus = 'active' | 'paused' | 'completed' | 'archived'

export type ProjectStatus = 'idea' | 'active' | 'paused' | 'done' | 'launched' | 'archived'

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
  primary_language: string
  languages: string
  line_count: number | null
  file_count: number | null
  folder_count: number | null
  repo_changed_on: string | null
  features: string
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
  primary_language: string
  languages: string
  line_count: string
  file_count: string
  folder_count: string
  repo_changed_on: string
  features: string
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
  primary_language: '',
  languages: '',
  line_count: '',
  file_count: '',
  folder_count: '',
  repo_changed_on: '',
  features: '',
  goal_id: '',
})
