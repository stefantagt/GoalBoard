import type { GoalStatus } from './types'

export type ProgressInput = {
  completed: boolean
}

/**
 * Progress is a percentage from 0 to 100.
 * Activities decide the result when any exist.
 * Otherwise milestones are used.
 * A goal with neither is 100 only when its status is completed.
 */
export function goalProgress(
  milestones: ProgressInput[],
  tasks: ProgressInput[],
  status: GoalStatus,
): number {
  if (tasks.length > 0) {
    return percent(tasks.filter((task) => task.completed).length, tasks.length)
  }
  if (milestones.length > 0) {
    return percent(milestones.filter((milestone) => milestone.completed).length, milestones.length)
  }
  return status === 'completed' ? 100 : 0
}

export function progressCaption(
  milestones: ProgressInput[],
  tasks: ProgressInput[],
): string {
  if (tasks.length > 0) {
    const done = tasks.filter((task) => task.completed).length
    return `${done} av ${tasks.length} aktiviteter`
  }
  if (milestones.length > 0) {
    const done = milestones.filter((milestone) => milestone.completed).length
    return `${done} av ${milestones.length} delmål`
  }
  return 'Inga delmål eller aktiviteter ännu'
}

function percent(done: number, total: number): number {
  return Math.round((done / total) * 100)
}
