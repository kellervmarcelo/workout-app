<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const route = useRoute()
const workoutId = route.params.id as string

const supabase = useSupabaseClient()

const workout = ref<WorkoutWithExercises | null>(null)
const loading = ref(false)
const showExerciseForm = ref(false)
const newExerciseName = ref('')

const fetchWorkout = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('workouts')
      .select(`
        *,
        exercises (
          *,
          sets:workout_sets(*)
        )
      `)
      .eq('id', workoutId)
      .single()

    if (error) throw error
    workout.value = data
  } catch (error: any) {
    console.error('Erro ao buscar treino:', error)
  } finally {
    loading.value = false
  }
}

const addExercise = async () => {
  if (!workout.value || !newExerciseName.value) return

  const order = workout.value.exercises?.length || 0

  try {
    const { data, error } = await supabase
      .from('exercises')
      .insert({
        workout_id: workoutId,
        name: newExerciseName.value,
        order,
      })
      .select()
      .single()

    if (error) throw error
    
    newExerciseName.value = ''
    showExerciseForm.value = false
    await fetchWorkout()
  } catch (error: any) {
    console.error('Erro ao adicionar exercício:', error)
  }
}

const addSet = async (exerciseId: string) => {
  if (!workout.value?.exercises) return

  const exercise = workout.value.exercises.find(e => e.id === exerciseId)
  if (!exercise) return

  const sets = exercise.sets || []
  const setNumber = sets.length + 1
  const lastSet = sets[sets.length - 1]

  try {
    const { error } = await supabase.from('workout_sets').insert({
      exercise_id: exerciseId,
      set_number: setNumber,
      reps: lastSet?.reps || 10,
      weight_kg: lastSet?.weight_kg || 0,
      completed: true,
    })

    if (error) throw error
    await fetchWorkout()
  } catch (error: any) {
    console.error('Erro ao adicionar série:', error)
  }
}

const updateSet = async (setId: string, field: keyof WorkoutSet, value: number) => {
  try {
    const { error } = await supabase
      .from('workout_sets')
      .update({ [field]: value })
      .eq('id', setId)

    if (error) throw error
  } catch (error: any) {
    console.error('Erro ao atualizar série:', error)
  }
}

const deleteSet = async (setId: string) => {
  try {
    const { error } = await supabase.from('workout_sets').delete().eq('id', setId)
    if (error) throw error
    await fetchWorkout()
  } catch (error: any) {
    console.error('Erro ao deletar série:', error)
  }
}

const deleteExercise = async (exerciseId: string) => {
  try {
    const { error } = await supabase.from('exercises').delete().eq('id', exerciseId)
    if (error) throw error
    await fetchWorkout()
  } catch (error: any) {
    console.error('Erro ao deletar exercício:', error)
  }
}

onMounted(fetchWorkout)
</script>

<template>
  <div v-if="workout" class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <NuxtLink to="/" class="text-sm text-muted-foreground hover:text-primary mb-1 block">
          ← Voltar aos treinos
        </NuxtLink>
        <h1 class="text-3xl font-bold">{{ workout.name }}</h1>
        <p class="text-muted-foreground mt-1">
          {{ new Date(workout.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) }}
        </p>
      </div>
      <Button @click="showExerciseForm = true">
        <span class="mr-2">+</span> Exercício
      </Button>
    </div>

    <!-- Exercise Form -->
    <Card v-if="showExerciseForm" class="p-6">
      <h2 class="text-xl font-semibold mb-4">Adicionar Exercício</h2>
      <form @submit.prevent="addExercise" class="space-y-4">
        <div class="space-y-2">
          <Label for="exercise-name" required>Nome do Exercício</Label>
          <Input
            id="exercise-name"
            v-model="newExerciseName"
            placeholder="Ex: Supino Reto"
            required
          />
        </div>
        <div class="flex gap-2 justify-end">
          <Button type="button" variant="outline" @click="showExerciseForm = false">
            Cancelar
          </Button>
          <Button type="submit">Adicionar</Button>
        </div>
      </form>
    </Card>

    <!-- Exercises -->
    <div v-if="workout.exercises?.length" class="space-y-6">
      <Card
        v-for="exercise in workout.exercises"
        :key="exercise.id"
        class="p-6"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">{{ exercise.name }}</h3>
          <Button variant="ghost" size="sm" @click="deleteExercise(exercise.id)">
            🗑️
          </Button>
        </div>

        <!-- Sets Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b">
                <th class="text-left py-2 px-2 font-medium">Série</th>
                <th class="text-left py-2 px-2 font-medium">Reps</th>
                <th class="text-left py-2 px-2 font-medium">Carga (kg)</th>
                <th class="text-left py-2 px-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="set in exercise.sets" :key="set.id" class="border-b">
                <td class="py-2 px-2">
                  <span class="font-medium">{{ set.set_number }}</span>
                </td>
                <td class="py-2 px-2">
                  <Input
                    :model-value="String(set.reps)"
                    type="number"
                    class="w-20 h-8"
                    @update:model-value="updateSet(set.id, 'reps', Number($event))"
                  />
                </td>
                <td class="py-2 px-2">
                  <Input
                    :model-value="String(set.weight_kg)"
                    type="number"
                    step="0.5"
                    class="w-24 h-8"
                    @update:model-value="updateSet(set.id, 'weight_kg', Number($event))"
                  />
                </td>
                <td class="py-2 px-2">
                  <Button variant="ghost" size="sm" @click="deleteSet(set.id)">
                    ✕
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Add Set Button -->
        <Button
          variant="outline"
          size="sm"
          class="mt-4"
          @click="addSet(exercise.id)"
        >
          + Série
        </Button>
      </Card>
    </div>

    <!-- Empty State -->
    <Card v-else class="p-12 text-center">
      <p class="text-4xl mb-4">🏋️</p>
      <h3 class="text-xl font-semibold mb-2">Nenhum exercício</h3>
      <p class="text-muted-foreground">Adicione exercícios ao seu treino!</p>
    </Card>
  </div>

  <!-- Loading -->
  <div v-else class="flex justify-center py-12">
    <p class="text-muted-foreground">Carregando...</p>
  </div>
</template>
