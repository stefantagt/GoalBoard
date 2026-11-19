import { progressSlices, type ProgressInput } from '../lib/progress'
import type { GoalStatus } from '../lib/types'
import { ProgressBar } from './ui'

export function GoalProgress({
  milestones,
  tasks,
  status,
  compact = false,
}: {
  milestones: ProgressInput[]
  tasks: ProgressInput[]
  status: GoalStatus
  compact?: boolean
}) {
  const slices = progressSlices(milestones, tasks, status)
  return (
    <div className="grid gap-3">
      {slices.map((slice) => (
        <div key={slice.kind}>
          <div className={`mb-2 flex justify-between text-muted ${compact ? 'text-xs' : 'text-sm'}`}>
            <span>{slice.caption}</span>
            <span>{slice.percent}%</span>
          </div>
          <ProgressBar value={slice.percent} />
        </div>
      ))}
    </div>
  )
}
