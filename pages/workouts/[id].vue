<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const route = useRoute()
const workoutId = route.params.id as string

const supabase = useSupabaseClient()

const workout = ref<WorkoutWithExercises | null>(null)
const loading = ref(false)
const showExerciseForm = ref(false)
const newExerciseName = ref('')
const showTemplateSelector = ref(false)
const templates = ref<WorkoutTemplateWithExercises[]>([])

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

const fetchTemplates = async () => {
  const { data: sessionData } = await supabase.auth.getSession()
  if (!sessionData.session?.user) return

  try {
    const { data, error } = await supabase
      .from('workout_templates')
      .select(`
        *,
        exercises:template_exercises(*)
      `)
      .eq('user_id', sessionData.session.user.id)
      .order('name', { ascending: true })

    if (error) throw error
    templates.value = data || []
  } catch (error: any) {
    console.error('Erro ao buscar templates:', error)
  }
}

const loadTemplate = async (templateId: string) => {
  if (!workout.value) return

  const template = templates.value.find(t => t.id === templateId)
  if (!template?.exercises?.length) return

  try {
    // Adicionar cada exercício do template ao treino
    for (const exercise of template.exercises) {
      const { data: exerciseData, error: exerciseError } = await supabase
        .from('exercises')
        .insert({
          workout_id: workoutId,
          name: exercise.name,
          order: exercise.order,
        })
        .select()
        .single()

      if (exerciseError) throw exerciseError

      // Criar série padrão com os valores do template
      const { error: setError } = await supabase.from('workout_sets').insert({
        exercise_id: exerciseData.id,
        set_number: 1,
        reps: exercise.default_reps,
        weight_kg: exercise.default_weight_kg,
        completed: true,
      })

      if (setError) throw setError
    }

    showTemplateSelector.value = false
    await fetchWorkout()
  } catch (error: any) {
    console.error('Erro ao carregar template:', error)
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
  <div v-if="workout" class="space-y-4 md:space-y-6">
    <!-- Header -->
    <div class="space-y-3 md:space-y-4">
      <NuxtLink to="/" class="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors min-h-[44px]">
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Voltar
      </NuxtLink>

      <div class="space-y-2">
        <h1 class="text-xl font-bold tracking-tight md:text-3xl">{{ workout.name }}</h1>
        <p class="text-sm text-muted-foreground flex items-center gap-1">
          <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {{ new Date(workout.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) }}
        </p>
      </div>

      <!-- Action Buttons - coluna em mobile -->
      <div class="flex gap-2">
        <Button variant="outline" size="sm" @click="showTemplateSelector = true; fetchTemplates()" class="flex-1 md:flex-none">
          <svg class="w-4 h-4 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span class="hidden sm:inline">Carregar Template</span>
          <span class="sm:hidden">Template</span>
        </Button>
        <Button size="sm" @click="showExerciseForm = true" class="flex-1 md:flex-none">
          <svg class="w-4 h-4 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Exercício
        </Button>
      </div>

      <!-- Stats - coluna em mobile, row em desktop -->
      <div class="grid grid-cols-3 gap-2 md:gap-4">
        <Card class="p-3 md:p-4">
          <div class="text-xs text-muted-foreground md:text-sm">Séries</div>
          <div class="text-lg font-bold md:text-2xl">{{ totalSets }}</div>
        </Card>
        <Card class="p-3 md:p-4">
          <div class="text-xs text-muted-foreground md:text-sm">Volume</div>
          <div class="text-lg font-bold md:text-2xl">{{ totalVolume.toLocaleString('pt-BR') }}<span class="text-xs font-normal text-muted-foreground"> kg</span></div>
        </Card>
        <Card class="p-3 md:p-4">
          <div class="text-xs text-muted-foreground md:text-sm">Exercícios</div>
          <div class="text-lg font-bold md:text-2xl">{{ workout.exercises?.length || 0 }}</div>
        </Card>
      </div>
    </div>

    <!-- Exercise Form -->
    <Card v-if="showExerciseForm" class="p-4 md:p-6">
      <h2 class="text-lg font-semibold mb-4 md:text-xl">Adicionar Exercício</h2>
      <form @submit.prevent="addExercise" class="space-y-4">
        <div class="space-y-2">
          <Label for="exercise-name" required>Nome do Exercício</Label>
          <Input
            id="exercise-name"
            v-model="newExerciseName"
            placeholder="Ex: Supino Reto"
            required
            class="h-11 text-base"
          />
        </div>
        <div class="flex gap-2">
          <Button type="button" variant="outline" @click="showExerciseForm = false" class="flex-1">
            Cancelar
          </Button>
          <Button type="submit" class="flex-1">Adicionar</Button>
        </div>
      </form>
    </Card>

    <!-- Template Selector Modal -->
    <Card v-if="showTemplateSelector" class="p-4 md:p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold md:text-xl">Carregar Template</h2>
        <Button variant="ghost" size="icon" class="h-9 w-9" @click="showTemplateSelector = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Button>
      </div>

      <div v-if="templates.length === 0" class="text-center py-8 text-muted-foreground">
        <p class="text-sm">Nenhum template disponível. Crie um em</p>
        <NuxtLink to="/templates" class="text-primary hover:underline text-sm">
          Templates
        </NuxtLink>
      </div>

      <div v-else class="space-y-2 md:space-y-3">
        <Card
          v-for="t in templates"
          :key="t.id"
          class="p-4 cursor-pointer hover:bg-muted/30 transition-colors border-2 hover:border-primary"
          @click="loadTemplate(t.id)"
        >
          <div class="flex items-start justify-between">
            <div>
              <h3 class="font-semibold">{{ t.name }}</h3>
              <p v-if="t.description" class="text-sm text-muted-foreground mt-1">
                {{ t.description }}
              </p>
              <p class="text-sm text-muted-foreground mt-2">
                {{ t.exercises?.length || 0 }} exercícios
              </p>
            </div>
            <Badge variant="outline">{{ t.exercises?.length || 0 }} exercícios</Badge>
          </div>
        </Card>
      </div>
    </Card>

    <!-- Exercises -->
    <div v-if="workout.exercises?.length" class="space-y-3 md:space-y-4">
      <Collapsible
        v-for="(exercise, idx) in workout.exercises"
        :key="exercise.id"
        :default-open="true"
      >
        <template #title>
          <div class="flex items-center gap-2 md:gap-3">
            <Badge variant="outline" class="font-mono text-xs">{{ idx + 1 }}</Badge>
            <h3 class="text-sm font-semibold md:text-lg truncate">{{ exercise.name }}</h3>
            <Badge variant="secondary" class="text-[10px] shrink-0">{{ exercise.sets?.length || 0 }}s</Badge>
          </div>
        </template>

        <!-- Sets Table - scroll horizontal em mobile -->
        <div class="overflow-x-auto -mx-1 px-1">
          <table class="w-full text-sm min-w-[280px]">
            <thead>
              <tr class="text-muted-foreground border-b">
                <th class="text-left py-2 px-2 font-medium text-xs">Set</th>
                <th class="text-left py-2 px-2 font-medium text-xs">Reps</th>
                <th class="text-left py-2 px-2 font-medium text-xs">Carga</th>
                <th class="text-right py-2 px-2 font-medium text-xs"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="set in exercise.sets" :key="set.id" class="border-b last:border-0">
                <td class="py-2.5 px-2">
                  <Badge variant="secondary" class="font-mono text-xs">{{ set.set_number }}</Badge>
                </td>
                <td class="py-2.5 px-2">
                  <Input
                    :model-value="String(set.reps)"
                    type="number"
                    min="1"
                    class="w-16 h-10 text-base font-mono md:h-9 md:w-20 md:text-sm"
                    @update:model-value="updateSet(set.id, 'reps', Number($event))"
                  />
                </td>
                <td class="py-2.5 px-2">
                  <Input
                    :model-value="String(set.weight_kg)"
                    type="number"
                    step="0.5"
                    min="0"
                    class="w-20 h-10 text-base font-mono md:h-9 md:w-24 md:text-sm"
                    @update:model-value="updateSet(set.id, 'weight_kg', Number($event))"
                  />
                </td>
                <td class="py-2.5 px-2 text-right">
                  <Button variant="ghost" size="icon" class="h-9 w-9 text-muted-foreground hover:text-destructive" @click="deleteSet(set.id)">
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
          class="mt-3 w-full h-11 md:h-9"
          @click="addSet(exercise.id)"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Adicionar Série
        </Button>

        <!-- Rest Timer -->
        <div class="mt-3 pt-3 border-t">
          <div class="flex items-center gap-2 mb-2">
            <svg class="w-4 h-4 text-muted-foreground shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="text-sm font-medium">Descanso</span>
          </div>
          <RestTimer />
        </div>

        <!-- Delete Exercise Button -->
        <Button
          variant="outline"
          size="sm"
          class="mt-2 w-full h-11 text-destructive hover:text-destructive md:h-9"
          @click="deleteExercise(exercise.id)"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Remover Exercício
        </Button>
      </Collapsible>
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
