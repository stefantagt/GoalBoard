import type { GoalStatus } from './types'

export type ProgressInput = {
  completed: boolean
}

export type ProgressSlice = {
  kind: 'milestones' | 'tasks' | 'status'
  caption: string
  percent: number
}

/**
 * Milestones and activities are separate measures.
 * A goal with neither is 100 only when it is completed.
 */
export function progressSlices(
  milestones: ProgressInput[],
  tasks: ProgressInput[],
  status: GoalStatus,
): ProgressSlice[] {
  const slices: ProgressSlice[] = []
  if (milestones.length > 0) {
    const done = milestones.filter((milestone) => milestone.completed).length
    slices.push({ kind: 'milestones', caption: `${done} av ${milestones.length} delmål`, percent: percent(done, milestones.length) })
  }
  if (tasks.length > 0) {
    const done = tasks.filter((task) => task.completed).length
    slices.push({ kind: 'tasks', caption: `${done} av ${tasks.length} aktiviteter`, percent: percent(done, tasks.length) })
  }
  if (slices.length > 0) return slices
  return [
    {
      kind: 'status',
      caption: status === 'completed' ? 'Uppnått' : 'Inga delmål eller aktiviteter ännu',
      percent: status === 'completed' ? 100 : 0,
    },
  ]
}

function percent(done: number, total: number): number {
  return Math.round((done / total) * 100)
}
