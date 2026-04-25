import type { ExerciseWithSets } from '~/types'

export function useWorkoutMetrics() {
  function totalVolume(exercises: ExerciseWithSets[]): number {
    return (exercises || []).reduce((sum, ex) => {
      return sum + (ex.sets || []).reduce((s, set) => s + (set.reps * set.weight_kg), 0)
    }, 0)
  }

  function totalSets(exercises: ExerciseWithSets[]): number {
    return (exercises || []).reduce((sum, ex) => sum + (ex.sets?.length || 0), 0)
  }

  return { totalVolume, totalSets }
}
