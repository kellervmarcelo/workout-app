import { ref, computed } from 'vue'
import type { ExerciseLibraryItem, MuscleGroup } from '~/types'
import { exerciseLibrary } from '~/data/exercises'

export function useExerciseLibrary() {
  const searchQuery = ref('')
  const selectedGroup = ref<MuscleGroup | null>(null)

  const filteredExercises = computed<ExerciseLibraryItem[]>(() => {
    const query = searchQuery.value.toLowerCase().trim()

    return exerciseLibrary.filter((exercise) => {
      const matchesSearch = !query || exercise.name.toLowerCase().includes(query)
      const matchesGroup = !selectedGroup.value || exercise.muscleGroup === selectedGroup.value
      return matchesSearch && matchesGroup
    })
  })

  const setGroup = (group: MuscleGroup | null) => {
    selectedGroup.value = group
  }

  const resetFilters = () => {
    searchQuery.value = ''
    selectedGroup.value = null
  }

  return {
    searchQuery,
    selectedGroup,
    filteredExercises,
    setGroup,
    resetFilters,
  }
}
