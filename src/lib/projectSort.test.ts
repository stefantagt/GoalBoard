import { describe, expect, it } from 'vitest'
import { projectCountLabel, sortProjects } from './projectSort'
import type { Project } from './types'

describe('sortProjects', () => {
  const goals = [{ id: 'goal-1', title: 'Ekonomi' }]
  const projects = [
    row({ id: 'b', name: 'Övrigt', status: 'active', goal_id: null, line_count: null }),
    row({ id: 'a', name: 'alfa', status: 'idea', goal_id: 'goal-1', line_count: 10 }),
    row({ id: 'c', name: 'beta', status: 'done', goal_id: 'goal-1', line_count: 2 }),
  ]

  it('sorts names with Swedish alphabet and keeps empty values last', () => {
    expect(sortProjects(projects, goals, { key: 'name', direction: 'asc' }).map((project) => project.name)).toEqual(['alfa', 'beta', 'Övrigt'])
    expect(sortProjects(projects, goals, { key: 'lines', direction: 'desc' }).map((project) => project.line_count)).toEqual([10, 2, null])
  })

  it('sorts status and goal by the text shown in the list', () => {
    expect(sortProjects(projects, goals, { key: 'status', direction: 'asc' }).map((project) => project.status)).toEqual(['idea', 'done', 'active'])
    expect(sortProjects(projects, goals, { key: 'goal', direction: 'asc' }).map((project) => project.id)).toEqual(['a', 'c', 'b'])
  })
})

describe('projectCountLabel', () => {
  it('states the total and the filtered part', () => {
    expect(projectCountLabel(24, 24)).toBe('24 projekt')
    expect(projectCountLabel(8, 24)).toBe('8 av 24 projekt')
  })
})

function row(patch: Partial<Project> & Pick<Project, 'id' | 'name'>): Project {
  return {
    user_id: 'user',
    goal_id: null,
    description: '',
    status: 'idea',
    tech_stack: '',
    github_url: '',
    live_url: '',
    notes: '',
    primary_language: '',
    languages: '',
    line_count: null,
    file_count: null,
    folder_count: null,
    repo_changed_on: null,
    features: '',
    created_at: '',
    updated_at: '',
    ...patch,
  }
}
