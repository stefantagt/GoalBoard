import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  deleteGoal,
  deleteMilestone,
  deleteProject,
  deleteTask,
  insertGoal,
  insertMilestone,
  insertProject,
  insertTask,
  loadBoard,
  setGoalStatus,
  setMilestoneCompleted,
  updateGoal,
  updateProject,
  updateTask,
  type BoardSnapshot,
} from '../data/api'
import type { NeonClient } from '../lib/neon'
import type { Goal, GoalDraft, ProjectDraft, Task } from '../lib/types'

type BoardContextValue = {
  loading: boolean
  error: string | null
  snapshot: BoardSnapshot | null
  refresh: () => Promise<void>
  createGoal: (draft: GoalDraft) => Promise<void>
  saveGoal: (id: string, draft: GoalDraft) => Promise<void>
  changeGoalStatus: (id: string, status: Goal['status']) => Promise<void>
  removeGoal: (id: string) => Promise<void>
  createMilestone: (goalId: string, title: string) => Promise<void>
  toggleMilestone: (id: string, completed: boolean) => Promise<void>
  removeMilestone: (id: string) => Promise<void>
  createTask: (input: { goalId: string; title: string; dueDate?: string; weekFocus?: boolean }) => Promise<void>
  patchTask: (id: string, patch: Partial<Pick<Task, 'completed' | 'week_focus' | 'due_date'>>) => Promise<void>
  removeTask: (id: string) => Promise<void>
  createProject: (draft: ProjectDraft) => Promise<void>
  saveProject: (id: string, draft: ProjectDraft) => Promise<void>
  removeProject: (id: string) => Promise<void>
}

const BoardContext = createContext<BoardContextValue | null>(null)

export function BoardProvider({ client, children }: { client: NeonClient; children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<BoardSnapshot | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const next = await loadBoard(client)
      setSnapshot(next)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunde inte hämta data.')
    } finally {
      setLoading(false)
    }
  }, [client])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') void refresh()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [refresh])

  const value = useMemo<BoardContextValue>(() => {
    const run = async (action: () => Promise<void>) => {
      await action()
      await refresh()
    }
    return {
      loading,
      error,
      snapshot,
      refresh,
      createGoal: (draft) => run(() => insertGoal(client, draft)),
      saveGoal: (id, draft) => run(() => updateGoal(client, id, draft)),
      changeGoalStatus: (id, status) => run(() => setGoalStatus(client, id, status)),
      removeGoal: (id) => run(() => deleteGoal(client, id)),
      createMilestone: (goalId, title) =>
        run(() => insertMilestone(client, goalId, title, nextSort(snapshot?.milestones ?? [], goalId))),
      toggleMilestone: (id, completed) => run(() => setMilestoneCompleted(client, id, completed)),
      removeMilestone: (id) => run(() => deleteMilestone(client, id)),
      createTask: (input) =>
        run(() =>
          insertTask(client, {
            ...input,
            sortOrder: nextSort(snapshot?.tasks ?? [], input.goalId),
          }),
        ),
      patchTask: (id, patch) => run(() => updateTask(client, id, patch)),
      removeTask: (id) => run(() => deleteTask(client, id)),
      createProject: (draft) => run(() => insertProject(client, draft)),
      saveProject: (id, draft) => run(() => updateProject(client, id, draft)),
      removeProject: (id) => run(() => deleteProject(client, id)),
    }
  }, [client, error, loading, refresh, snapshot])

  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>
}

export function useBoard(): BoardContextValue {
  const value = useContext(BoardContext)
  if (!value) throw new Error('useBoard måste användas inuti BoardProvider.')
  return value
}

function nextSort(rows: { goal_id: string; sort_order: number }[], goalId: string): number {
  const related = rows.filter((row) => row.goal_id === goalId)
  return related.reduce((max, row) => Math.max(max, row.sort_order), 0) + 1
}
