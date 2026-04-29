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

  function formatDuration(startedAt: string | null | undefined, completedAt: string | null | undefined): string | null {
    if (!startedAt || !completedAt)
      return null
    const ms = new Date(completedAt).getTime() - new Date(startedAt).getTime()
    if (ms <= 0)
      return null
    const totalMin = Math.round(ms / 60000)
    const h = Math.floor(totalMin / 60)
    const min = totalMin % 60
    if (h === 0)
      return `${min}min`
    return `${h}h ${min}min`
  }

  return { totalVolume, totalSets, formatDuration }
}
