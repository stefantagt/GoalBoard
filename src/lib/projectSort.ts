import { projectStatusLabel } from './labels'
import { featureList, languageParts } from './projectImport'
import type { Project } from './types'

export type SortDirection = 'asc' | 'desc'

export type ProjectSortKey =
  | 'name'
  | 'description'
  | 'status'
  | 'goal'
  | 'language'
  | 'lines'
  | 'files'
  | 'folders'
  | 'changed'
  | 'features'
  | 'stack'
  | 'github'
  | 'live'
  | 'notes'

export type ProjectSort = {
  key: ProjectSortKey
  direction: SortDirection
}

export function sortProjects(
  projects: Project[],
  goals: { id: string; title: string }[],
  sort: ProjectSort,
): Project[] {
  const titles = new Map(goals.map((goal) => [goal.id, goal.title]))
  return [...projects].sort((left, right) => {
    const compared = compareValue(sortValue(left, titles, sort.key), sortValue(right, titles, sort.key), sort.direction)
    if (compared !== 0) return compared
    return left.name.localeCompare(right.name, 'sv', { sensitivity: 'base' })
  })
}

export function projectCountLabel(shown: number, total: number): string {
  if (shown === total) return `${total} projekt`
  return `${shown} av ${total} projekt`
}

function sortValue(project: Project, titles: Map<string, string>, key: ProjectSortKey): string | number | null {
  switch (key) {
    case 'name':
      return project.name
    case 'description':
      return project.description
    case 'status':
      return projectStatusLabel(project.status)
    case 'goal':
      return project.goal_id ? titles.get(project.goal_id) ?? '' : ''
    case 'language':
      return languageParts(project.primary_language, project.languages).head
    case 'lines':
      return project.line_count
    case 'files':
      return project.file_count
    case 'folders':
      return project.folder_count
    case 'changed':
      return project.repo_changed_on
    case 'features':
      return featureList(project.features).length
    case 'stack':
      return project.tech_stack
    case 'github':
      return project.github_url
    case 'live':
      return project.live_url
    case 'notes':
      return project.notes
  }
}

function compareValue(left: string | number | null, right: string | number | null, direction: SortDirection): number {
  const emptyLeft = left === null || left === ''
  const emptyRight = right === null || right === ''
  if (emptyLeft || emptyRight) {
    if (emptyLeft && emptyRight) return 0
    return emptyLeft ? 1 : -1
  }
  const result =
    typeof left === 'number' && typeof right === 'number'
      ? left - right
      : String(left).localeCompare(String(right), 'sv', { sensitivity: 'base', numeric: true })
  return direction === 'asc' ? result : -result
}
