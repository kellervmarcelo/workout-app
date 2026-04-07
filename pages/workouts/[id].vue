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

const totalVolume = computed(() => {
  if (!workout.value?.exercises) return 0
  return workout.value.exercises.reduce((sum, ex) => {
    const exerciseVolume = (ex.sets || []).reduce((s, set) => s + (set.reps * set.weight_kg), 0)
    return sum + exerciseVolume
  }, 0)
})

const totalSets = computed(() => {
  if (!workout.value?.exercises) return 0
  return workout.value.exercises.reduce((sum, ex) => sum + (ex.sets?.length || 0), 0)
})

onMounted(fetchWorkout)
</script>

<template>
  <div v-if="workout" class="space-y-6">
    <!-- Header -->
    <div class="space-y-4">
      <NuxtLink to="/" class="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Voltar aos treinos
      </NuxtLink>
      
      <div class="flex items-start justify-between">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">{{ workout.name }}</h1>
          <p class="text-muted-foreground mt-1 flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {{ new Date(workout.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) }}
          </p>
        </div>
        <Button @click="showExerciseForm = true">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Exercício
        </Button>
      </div>

      <!-- Stats -->
      <div class="flex gap-4">
        <Card class="flex-1 p-4">
          <div class="text-sm text-muted-foreground">Total de Séries</div>
          <div class="text-2xl font-bold">{{ totalSets }}</div>
        </Card>
        <Card class="flex-1 p-4">
          <div class="text-sm text-muted-foreground">Volume Total</div>
          <div class="text-2xl font-bold">{{ totalVolume.toLocaleString('pt-BR') }} <span class="text-sm font-normal text-muted-foreground">kg</span></div>
        </Card>
        <Card class="flex-1 p-4">
          <div class="text-sm text-muted-foreground">Exercícios</div>
          <div class="text-2xl font-bold">{{ workout.exercises?.length || 0 }}</div>
        </Card>
      </div>
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
        v-for="(exercise, idx) in workout.exercises"
        :key="exercise.id"
        class="overflow-hidden"
      >
        <!-- Exercise Header -->
        <div class="flex items-center justify-between p-4 border-b bg-muted/30">
          <div class="flex items-center gap-3">
            <Badge variant="outline" class="font-mono">{{ idx + 1 }}</Badge>
            <h3 class="text-lg font-semibold">{{ exercise.name }}</h3>
          </div>
          <div class="flex items-center gap-2">
            <Badge variant="secondary">{{ exercise.sets?.length || 0 }} séries</Badge>
            <Button variant="ghost" size="icon" class="h-8 w-8 text-muted-foreground hover:text-destructive" @click="deleteExercise(exercise.id)">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </Button>
          </div>
        </div>

        <!-- Sets Table -->
        <div class="p-4">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-muted-foreground border-b">
                  <th class="text-left py-2 px-3 font-medium">Série</th>
                  <th class="text-left py-2 px-3 font-medium">Reps</th>
                  <th class="text-left py-2 px-3 font-medium">Carga (kg)</th>
                  <th class="text-right py-2 px-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="set in exercise.sets" :key="set.id" class="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td class="py-3 px-3">
                    <Badge variant="secondary" class="font-mono">{{ set.set_number }}</Badge>
                  </td>
                  <td class="py-3 px-3">
                    <Input
                      :model-value="String(set.reps)"
                      type="number"
                      min="1"
                      class="w-20 h-9 font-mono"
                      @update:model-value="updateSet(set.id, 'reps', Number($event))"
                    />
                  </td>
                  <td class="py-3 px-3">
                    <Input
                      :model-value="String(set.weight_kg)"
                      type="number"
                      step="0.5"
                      min="0"
                      class="w-24 h-9 font-mono"
                      @update:model-value="updateSet(set.id, 'weight_kg', Number($event))"
                    />
                  </td>
                  <td class="py-3 px-3 text-right">
                    <Button variant="ghost" size="icon" class="h-8 w-8 text-muted-foreground hover:text-destructive" @click="deleteSet(set.id)">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
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
            class="mt-4 w-full"
            @click="addSet(exercise.id)"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Adicionar Série
          </Button>
        </div>
      </Card>
    </div>

    <!-- Empty State -->
    <Card v-else class="p-12 text-center">
      <div class="text-5xl mb-4">🏋️</div>
      <h3 class="text-xl font-semibold mb-2">Nenhum exercício</h3>
      <p class="text-muted-foreground">Adicione exercícios ao seu treino!</p>
    </Card>
  </div>

  <!-- Loading -->
  <div v-else class="flex justify-center py-12">
    <div class="text-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
      <p class="text-muted-foreground">Carregando...</p>
    </div>
  </div>
</template>
