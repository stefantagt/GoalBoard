import type { GoalCategory, GoalStatus, ProjectStatus } from './types'

export const goalCategories: { value: GoalCategory; label: string }[] = [
  { value: 'ekonomi', label: 'Ekonomi' },
  { value: 'egna_projekt', label: 'Egna projekt' },
  { value: 'halsa', label: 'Hälsa & träning' },
  { value: 'familj', label: 'Familj & fritid' },
  { value: 'ovrigt', label: 'Övrigt' },
]

export const goalStatuses: { value: GoalStatus; label: string }[] = [
  { value: 'active', label: 'Aktivt' },
  { value: 'paused', label: 'Pausat' },
  { value: 'completed', label: 'Uppnått' },
  { value: 'archived', label: 'Arkiverat' },
]

export const projectStatuses: { value: ProjectStatus; label: string }[] = [
  { value: 'idea', label: 'Idé' },
  { value: 'active', label: 'Aktivt' },
  { value: 'paused', label: 'Pausat' },
  { value: 'done', label: 'Klart' },
  { value: 'archived', label: 'Arkiverat' },
]

export function categoryLabel(category: GoalCategory): string {
  return goalCategories.find((item) => item.value === category)?.label ?? category
}

export function goalStatusLabel(status: GoalStatus): string {
  return goalStatuses.find((item) => item.value === status)?.label ?? status
}

export function projectStatusLabel(status: ProjectStatus): string {
  return projectStatuses.find((item) => item.value === status)?.label ?? status
}
