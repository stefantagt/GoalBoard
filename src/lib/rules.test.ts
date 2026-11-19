import { describe, expect, it } from 'vitest'
import { readNeonConfig, looksLikeSecret } from './config'
import { toUserMessage } from './errors'
import { dueLabel } from './dates'
import { progressSlices } from './progress'
import { importantGoals, nextTasks, weekTasks } from './select'
import type { Goal, Task } from './types'
import { normalizeHttpUrl, safeHttpUrl } from './urls'

describe('progressSlices', () => {
  it('keeps milestones and activities as separate measures', () => {
    expect(progressSlices([{ completed: true }, { completed: false }], [{ completed: false }], 'active')).toEqual([
      { kind: 'milestones', caption: '1 av 2 delmål', percent: 50 },
      { kind: 'tasks', caption: '0 av 1 aktiviteter', percent: 0 },
    ])
  })

  it('uses milestones alone when there are no activities', () => {
    expect(progressSlices([{ completed: true }, { completed: true }, { completed: false }], [], 'active')).toEqual([
      { kind: 'milestones', caption: '2 av 3 delmål', percent: 67 },
    ])
  })

  it('is 100 only for a completed goal without children', () => {
    expect(progressSlices([], [], 'completed')).toEqual([{ kind: 'status', caption: 'Uppnått', percent: 100 }])
    expect(progressSlices([], [], 'active')).toEqual([{ kind: 'status', caption: 'Inga delmål eller aktiviteter ännu', percent: 0 }])
  })
})

describe('dueLabel', () => {
  const today = new Date(2026, 10, 18)

  it('labels nearby dates in Swedish', () => {
    expect(dueLabel('2026-11-17', today)).toBe('Försenad')
    expect(dueLabel('2026-11-18', today)).toBe('Idag')
    expect(dueLabel('2026-11-19', today)).toBe('Imorgon')
    expect(dueLabel(null, today)).toBeNull()
  })
})

describe('database errors', () => {
  it('tells the user to refresh the schema cache when a new column is missing from it', () => {
    expect(
      toUserMessage({
        code: 'PGRST204',
        message: "Could not find the 'primary_language' column of 'projects' in the schema cache",
      }),
    ).toMatch(/Refresh schema cache/)
  })
})

describe('neon config', () => {
  it('rejects connection strings and accepts public Neon URLs', () => {
    expect(looksLikeSecret('postgresql://user:secret@ep.neon.tech/db')).toBe(true)
    expect(looksLikeSecret('https://ep.example.neon.tech/neondb')).toBe(false)
    const config = readNeonConfig({
      VITE_NEON_DATABASE_URL: 'postgresql://user:secret@ep.neon.tech/db',
    })
    expect(config.ok).toBe(false)
  })

  it('prefers the explicit Auth and Data API pair', () => {
    const config = readNeonConfig({
      VITE_NEON_AUTH_URL: 'https://ep.example.neonauth.aws.neon.tech/neondb/auth',
      VITE_NEON_DATA_API_URL: 'https://ep.example.apirest.aws.neon.tech/neondb/rest/v1',
      VITE_NEON_DATABASE_URL: 'https://ep.example.aws.neon.tech/neondb',
    })
    expect(config).toMatchObject({ ok: true, mode: 'explicit' })
  })

  it('notices swapped URLs', () => {
    const config = readNeonConfig({
      VITE_NEON_AUTH_URL: 'https://ep.example.apirest.aws.neon.tech/neondb/rest/v1',
      VITE_NEON_DATA_API_URL: 'https://ep.example.neonauth.aws.neon.tech/neondb/auth',
    })
    expect(config.ok).toBe(false)
  })
})

describe('urls', () => {
  it('accepts http(s) links and rejects other protocols', () => {
    expect(normalizeHttpUrl('github.com/stefantagt/GoalBoard')).toBe('https://github.com/stefantagt/GoalBoard')
    expect(safeHttpUrl('javascript:alert(1)')).toBeNull()
    expect(safeHttpUrl('')).toBeNull()
  })
})

describe('selectors', () => {
  const goals: Goal[] = [
    goal('a', 'active', '2026-12-01'),
    goal('b', 'active', null),
    goal('c', 'completed', '2026-11-01'),
    goal('d', 'archived', '2026-11-20'),
  ]
  const tasks: Task[] = [
    task('t1', 'a', false, false, '2026-11-20'),
    task('t2', 'a', false, true, '2026-11-18'),
    task('t3', 'd', false, true, '2026-11-18'),
    task('t4', 'c', false, false, '2026-11-01'),
  ]

  it('orders active goals with a target date first', () => {
    expect(importantGoals(goals).map((item) => item.id)).toEqual(['a', 'b'])
  })

  it('skips tasks on completed and archived goals', () => {
    expect(nextTasks(tasks, goals).map((item) => item.id)).toEqual(['t2', 't1'])
  })

  it('keeps weekly focus off archived goals', () => {
    expect(weekTasks(tasks, goals).map((item) => item.id)).toEqual(['t2'])
  })
})

function goal(id: string, status: Goal['status'], target: string | null): Goal {
  return {
    id,
    user_id: 'user',
    title: id,
    description: '',
    category: 'ovrigt',
    why_important: '',
    start_date: null,
    target_date: target,
    status,
    created_at: '2026-11-01T00:00:00Z',
    updated_at: `2026-11-0${id === 'b' ? 2 : 1}T00:00:00Z`,
    ...overrides(id),
  }
}

function overrides(id: string): Partial<Goal> {
  return { updated_at: id === 'b' ? '2026-11-02T00:00:00Z' : '2026-11-01T00:00:00Z' }
}

function task(
  id: string,
  goalId: string,
  completed: boolean,
  weekFocus: boolean,
  due: string | null,
): Task {
  return {
    id,
    goal_id: goalId,
    milestone_id: null,
    user_id: 'user',
    title: id,
    completed,
    week_focus: weekFocus,
    due_date: due,
    sort_order: 0,
    created_at: '2026-11-01T00:00:00Z',
    updated_at: '2026-11-01T00:00:00Z',
  }
}
