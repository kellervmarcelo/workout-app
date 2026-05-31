import type { WorkoutSet, WorkoutWithExercises } from '~/types'

interface ResumeControllerOptions {
  debounceMs?: number
  now?: number
}

type WorkoutSetPatch = Partial<Pick<WorkoutSet, 'completed' | 'duration_seconds' | 'reps' | 'rest_seconds' | 'weight_kg'>>

export function createWorkoutResumeController(options: ResumeControllerOptions = {}) {
  const debounceMs = options.debounceMs ?? 750
  let wasHidden = false
  let lastRecoveryAt = (options.now ?? Date.now()) - debounceMs

  function canRecover(now: number) {
    return now - lastRecoveryAt >= debounceMs
  }

  function commitRecovery(now: number) {
    wasHidden = false
    lastRecoveryAt = now
    return true
  }

  return {
    onVisibilityChange(isHidden: boolean, now = Date.now()) {
      if (isHidden) {
        wasHidden = true
        return false
      }

      if (!wasHidden || !canRecover(now))
        return false

      return commitRecovery(now)
    },

    onFocus(now = Date.now(), isDocumentVisible = true) {
      if (!isDocumentVisible || !canRecover(now))
        return false

      return commitRecovery(now)
    },

    onPageShow(now = Date.now()) {
      if (!canRecover(now))
        return false

      return commitRecovery(now)
    },
  }
}

export function updateWorkoutSetLocally(
  workout: WorkoutWithExercises | null | undefined,
  setId: string,
  patch: WorkoutSetPatch,
) {
  if (!workout?.exercises?.length)
    return false

  for (const exercise of workout.exercises) {
    const set = exercise.sets?.find(currentSet => currentSet.id === setId)
    if (!set)
      continue

    Object.assign(set, patch)
    return true
  }

  return false
}
