import type { WorkoutSet, WorkoutWithExercises } from '~/types'

export { createForegroundRecoveryController as createWorkoutResumeController } from './foreground-recovery'

type WorkoutSetPatch = Partial<Pick<WorkoutSet, 'completed' | 'duration_seconds' | 'reps' | 'rest_seconds' | 'weight_kg'>>

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
