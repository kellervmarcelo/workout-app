<template>
  <div v-if="workout" class="space-y-5 md:space-y-8 px-3 md:px-0">
    <!-- Header -->
    <div class="space-y-4 md:space-y-6">
      <div class="flex items-center justify-between">
        <NuxtLink to="/" class="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors min-h-[44px]">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Voltar
        </NuxtLink>

        <!-- More Options Menu -->
        <div class="relative">
          <Button variant="ghost" size="icon" class="h-9 w-9" @click="showMoreMenu = !showMoreMenu">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="19" r="2" />
            </svg>
          </Button>
          <div v-if="showMoreMenu" class="absolute right-0 top-10 z-50 w-56 bg-popover border rounded-md shadow-md">
            <div class="py-1">
              <Button variant="ghost" size="sm" class="w-full justify-start gap-2 font-normal" @click="showTemplateSelector = true; showMoreMenu = false; fetchTemplates()">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Carregar Template
              </Button>
            </div>
          </div>
        </div>
      </div>

      <h1 class="text-xl font-bold tracking-tight md:text-3xl">
        {{ workout.name }}
      </h1>

      <!-- Notes Section - prominent -->
      <div v-if="workout.notes" class="rounded-lg border-l-4 border-l-primary bg-muted/50 p-3 md:p-5">
        <div class="flex items-center gap-2 mb-2">
          <svg class="w-4 h-4 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          <span class="text-sm font-semibold">Notas</span>
        </div>
        <p class="text-sm whitespace-pre-wrap">
          {{ workout.notes }}
        </p>
      </div>

      <!-- +Infos Toggle -->
      <Button variant="outline" size="sm" class="w-full" @click="showInfos = !showInfos">
        <svg class="w-4 h-4 mr-2 transition-transform" :class="{ 'rotate-180': showInfos }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {{ showInfos ? 'Menos infos' : '+ Infos' }}
      </Button>

      <!-- Expanded Infos -->
      <div v-if="showInfos" class="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        <Card class="p-3 md:p-4">
          <div class="text-xs text-muted-foreground md:text-sm">
            Data
          </div>
          <div class="text-sm font-semibold mt-1 md:text-lg">
            {{ new Date(workout.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) }}
          </div>
        </Card>
        <Card class="p-3 md:p-4">
          <div class="text-xs text-muted-foreground md:text-sm">
            Séries
          </div>
          <div class="text-sm font-bold mt-1 md:text-lg">
            {{ totalSets }}
          </div>
        </Card>
        <Card class="p-3 md:p-4">
          <div class="text-xs text-muted-foreground md:text-sm">
            Volume
          </div>
          <div class="text-sm font-bold mt-1 md:text-lg">
            {{ totalVolume.toLocaleString('pt-BR') }} <span class="text-xs font-normal text-muted-foreground">kg</span>
          </div>
        </Card>
        <Card class="p-3 md:p-4">
          <div class="text-xs text-muted-foreground md:text-sm">
            Exercícios
          </div>
          <div class="text-sm font-bold mt-1 md:text-lg">
            {{ workout.exercises?.length || 0 }}
          </div>
        </Card>
      </div>
    </div>

    <!-- Exercise Picker Drawer -->
    <ExercisePickerDrawer
      :open="showExercisePicker"
      :added-exercise-names="existingExerciseNames"
      @close="showExercisePicker = false"
      @select="addExerciseFromLibrary"
      @add-custom="openCustomExercise"
    />

    <!-- Exercise Form (Custom) -->
    <Card v-if="showExerciseForm" class="p-4 md:p-6">
      <h2 class="text-lg font-semibold mb-4 md:text-xl md:mb-6">
        Adicionar Exercício Customizado
      </h2>
      <form class="space-y-4" @submit.prevent="addExercise">
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
          <Button type="button" variant="outline" class="flex-1" @click="showExerciseForm = false">
            Cancelar
          </Button>
          <Button type="submit" class="flex-1">
            Adicionar
          </Button>
        </div>
      </form>
    </Card>

    <!-- Template Selector Modal -->
    <Card v-if="showTemplateSelector" class="p-4 md:p-6">
      <div class="flex items-center justify-between mb-4 md:mb-6">
        <h2 class="text-lg font-semibold md:text-xl">
          Carregar Template
        </h2>
        <Button variant="ghost" size="icon" class="h-9 w-9" @click="showTemplateSelector = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Button>
      </div>

      <div v-if="templates.length === 0" class="text-center py-8 text-muted-foreground">
        <p class="text-sm">
          Nenhum template disponível. Crie um em
        </p>
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
              <h3 class="font-semibold">
                {{ t.name }}
              </h3>
              <p v-if="t.description" class="text-sm text-muted-foreground mt-1">
                {{ t.description }}
              </p>
              <p class="text-sm text-muted-foreground mt-2">
                {{ t.exercises?.length || 0 }} exercícios
              </p>
            </div>
            <Badge variant="outline">
              {{ t.exercises?.length || 0 }} exercícios
            </Badge>
          </div>
        </Card>
      </div>
    </Card>

    <!-- Exercises -->
    <div v-if="workout.exercises?.length" class="space-y-4 md:space-y-6">
      <Collapsible
        v-for="(exercise, idx) in workout.exercises"
        :key="exercise.id"
        :ref="(el: any) => collapsibleRefs[exercise.id] = el"
        :default-open="!exercise.sets?.every(s => s.completed)"
      >
        <template #title>
          <div class="flex items-center gap-2 md:gap-3 min-w-0">
            <Badge variant="outline" class="font-mono text-xs shrink-0">
              {{ idx + 1 }}
            </Badge>
            <h3 class="text-sm font-semibold md:text-lg truncate min-w-0">
              {{ exercise.name }}
            </h3>
            <Badge variant="secondary" class="text-[10px] shrink-0">
              {{ completedSetCount(exercise) }}/{{ exercise.sets?.length || 0 }}
            </Badge>
          </div>
        </template>

        <!-- Sets Table -->
        <div class="overflow-x-auto -mx-1 px-1">
          <table class="w-full text-sm table-fixed">
            <colgroup>
              <col class="w-8">
              <col class="w-24">
              <col class="w-24">
            </colgroup>
            <thead>
              <tr class="text-muted-foreground border-b">
                <th class="py-3 px-1 text-center">
                  <input
                    type="checkbox"
                    :checked="exercise.sets?.length ? exercise.sets.every(s => s.completed) : false"
                    :indeterminate.prop="exercise.sets?.length ? exercise.sets.some(s => s.completed) && !exercise.sets.every(s => s.completed) : false"
                    class="h-4 w-4 rounded border-input text-primary focus:ring-primary cursor-pointer mx-auto"
                    @change="toggleAllSets(exercise.id, exercise.sets || [])"
                  >
                </th>
                <th class="py-3 px-1 text-center font-medium text-xs">
                  Reps
                </th>
                <th class="py-3 px-1 text-center font-medium text-xs">
                  Kg
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="set in exercise.sets" :key="set.id" class="border-b last:border-0 hover:bg-muted/20">
                <td class="py-3 px-1 text-center">
                  <input
                    type="checkbox"
                    :checked="!!set.completed"
                    class="h-4 w-4 rounded border-input text-primary focus:ring-primary cursor-pointer"
                    @change="toggleSetComplete(set.id, set.completed)"
                  >
                </td>
                <td class="py-3 px-1">
                  <Input
                    :model-value="String(set.reps)"
                    type="number"
                    min="1"
                    class="h-9 text-center text-sm font-mono"
                    @update:model-value="updateSet(set.id, 'reps', Number($event))"
                  />
                </td>
                <td class="py-3 px-1">
                  <Input
                    :model-value="String(set.weight_kg)"
                    type="number"
                    step="0.5"
                    min="0"
                    class="h-9 text-center text-sm font-mono"
                    @update:model-value="updateSet(set.id, 'weight_kg', Number($event))"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Add Set Button -->
        <Button
          variant="outline"
          size="sm"
          class="mt-3 w-full h-10"
          @click="addSet(exercise.id)"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Adicionar Série
        </Button>

        <!-- Rest Timer Button -->
        <Button
          variant="outline"
          size="sm"
          class="mt-2 w-full h-10"
          @click="openExerciseTimer(exercise)"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Timer de Descanso
        </Button>

        <!-- Delete Exercise Button -->
        <Button
          variant="outline"
          size="sm"
          class="mt-2 w-full h-10 text-destructive hover:text-destructive"
          @click="deleteExercise(exercise.id)"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Remover Exercício
        </Button>
      </Collapsible>

      <!-- Add Exercise Button - at end of list -->
      <Button
        variant="outline"
        size="sm"
        class="w-full h-11 md:h-10 border-dashed"
        @click="showExercisePicker = true"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Adicionar Exercício
      </Button>
    </div>

    <!-- Empty State -->
    <Card v-else class="p-8 md:p-12 text-center">
      <div class="text-5xl mb-4">
        🏋️
      </div>
      <h3 class="text-xl font-semibold mb-2">
        Nenhum exercício
      </h3>
      <p class="text-muted-foreground">
        Adicione exercícios ao seu treino!
      </p>
    </Card>
  </div>

  <!-- Loading -->
  <div v-else class="flex justify-center py-12 md:py-20">
    <div class="text-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
      <p class="text-muted-foreground">
        Carregando...
      </p>
    </div>
  </div>

  <!-- Rest Timer Modal -->
  <div v-if="showTimerModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="showTimerModal = false">
    <Card class="w-full max-w-md mx-4 p-6 md:p-8">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold">
          Timer de Descanso
        </h3>
        <Button variant="ghost" size="icon" class="h-8 w-8" @click="showTimerModal = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Button>
      </div>
      <RestTimer :default-seconds="timerRestSeconds" />
    </Card>
  </div>
</template>

<script setup lang="ts">
import type { ExerciseLibraryItem } from '~/types'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const workoutId = route.params.id as string

const supabase = useSupabaseClient()

const workout = ref<WorkoutWithExercises | null>(null)
const loading = ref(false)
const showExerciseForm = ref(false)
const showExercisePicker = ref(false)
const newExerciseName = ref('')
const showTemplateSelector = ref(false)
const showMoreMenu = ref(false)
const showInfos = ref(false)
const templates = ref<WorkoutTemplateWithExercises[]>([])
const collapsibleRefs = ref<Record<string, any>>({})
const showTimerModal = ref(false)
const timerRestSeconds = ref(60)

const existingExerciseNames = computed(() => {
  return workout.value?.exercises?.map(e => e.name.toLowerCase()) || []
})

async function fetchWorkout() {
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
      .maybeSingle()

    if (error)
      throw error
    if (!data) {
      navigateTo('/')
      return
    }
    workout.value = data
  }
  catch (error: any) {
    console.error('Erro ao buscar treino:', error)
  }
  finally {
    loading.value = false
  }
}

async function fetchTemplates() {
  const { data: sessionData } = await supabase.auth.getSession()
  if (!sessionData.session?.user)
    return

  try {
    const { data, error } = await supabase
      .from('workout_templates')
      .select(`
        *,
        exercises:template_exercises(*)
      `)
      .eq('user_id', sessionData.session.user.id)
      .order('name', { ascending: true })

    if (error)
      throw error
    templates.value = data || []
  }
  catch (error: any) {
    console.error('Erro ao buscar templates:', error)
  }
}

async function loadTemplate(templateId: string) {
  if (!workout.value)
    return

  const template = templates.value.find(t => t.id === templateId)
  if (!template?.exercises?.length)
    return

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

      if (exerciseError)
        throw exerciseError

      // Gerar séries baseado no default_sets do template
      const totalSets = exercise.default_sets || 3

      const setsToInsert = []
      for (let i = 1; i <= totalSets; i++) {
        setsToInsert.push({
          exercise_id: exerciseData.id,
          set_number: i,
          reps: exercise.default_reps,
          weight_kg: exercise.default_weight_kg,
          completed: false,
        })
      }

      const { error: setError } = await supabase
        .from('workout_sets')
        .insert(setsToInsert)

      if (setError)
        throw setError
    }

    // Copiar comentários do template para as notas do workout
    if (template.comments) {
      const existingNotes = workout.value.notes || ''
      const newNotes = existingNotes
        ? `${existingNotes}\n\n---\n\n${template.comments}`
        : template.comments

      await supabase
        .from('workouts')
        .update({ notes: newNotes })
        .eq('id', workoutId)

      workout.value.notes = newNotes
    }

    showTemplateSelector.value = false
    await fetchWorkout()
  }
  catch (error: any) {
    console.error('Erro ao carregar template:', error)
  }
}

async function addExerciseFromLibrary(exercise: ExerciseLibraryItem) {
  if (!workout.value)
    return

  const order = workout.value.exercises?.length || 0

  try {
    const { data: _data, error } = await supabase
      .from('exercises')
      .insert({
        workout_id: workoutId,
        name: exercise.name,
        order,
      })
      .select()
      .single()

    if (error)
      throw error

    showExercisePicker.value = false
    await fetchWorkout()
  }
  catch (error: any) {
    console.error('Erro ao adicionar exercício:', error)
  }
}

function openCustomExercise() {
  showExercisePicker.value = false
  showExerciseForm.value = true
}

async function addExercise() {
  if (!workout.value || !newExerciseName.value)
    return

  const order = workout.value.exercises?.length || 0

  try {
    const { data: _data, error } = await supabase
      .from('exercises')
      .insert({
        workout_id: workoutId,
        name: newExerciseName.value,
        order,
      })
      .select()
      .single()

    if (error)
      throw error

    newExerciseName.value = ''
    showExerciseForm.value = false
    await fetchWorkout()
  }
  catch (error: any) {
    console.error('Erro ao adicionar exercício:', error)
  }
}

async function addSet(exerciseId: string) {
  if (!workout.value?.exercises)
    return

  const exercise = workout.value.exercises.find(e => e.id === exerciseId)
  if (!exercise)
    return

  const sets = exercise.sets || []
  const setNumber = sets.length + 1
  const lastSet = sets[sets.length - 1]

  try {
    const { error } = await supabase.from('workout_sets').insert({
      exercise_id: exerciseId,
      set_number: setNumber,
      reps: lastSet?.reps || 10,
      weight_kg: lastSet?.weight_kg || 0,
      rest_seconds: lastSet?.rest_seconds || 60,
      completed: false,
    })

    if (error)
      throw error
    await fetchWorkout()
  }
  catch (error: any) {
    console.error('Erro ao adicionar série:', error)
  }
}

async function updateSet(setId: string, field: keyof WorkoutSet, value: number) {
  try {
    const { error } = await supabase
      .from('workout_sets')
      .update({ [field]: value })
      .eq('id', setId)

    if (error)
      throw error
  }
  catch (error: any) {
    console.error('Erro ao atualizar série:', error)
  }
}

function completedSetCount(exercise: ExerciseWithSets): number {
  return (exercise.sets || []).filter(s => s.completed).length
}

function openSetTimer(set: WorkoutSet) {
  timerRestSeconds.value = set.rest_seconds || 60
  showTimerModal.value = true
}

function openExerciseTimer(_exercise: ExerciseWithSets) {
  timerRestSeconds.value = 60
  showTimerModal.value = true
}

async function toggleSetComplete(setId: string, currentCompleted: boolean | undefined) {
  const newCompleted = !currentCompleted

  try {
    const { error } = await supabase
      .from('workout_sets')
      .update({ completed: newCompleted })
      .eq('id', setId)

    if (error)
      throw error

    // Update local state
    const set = workout.value?.exercises
      ?.flatMap(e => e.sets || [])
      .find(s => s.id === setId)
    if (set)
      set.completed = newCompleted

    // Auto-close exercise accordion when all sets are completed
    if (newCompleted && workout.value?.exercises) {
      for (const exercise of workout.value.exercises) {
        const allComplete = (exercise.sets || []).every(s => s.completed)
        if (allComplete && collapsibleRefs.value[exercise.id]) {
          const el = collapsibleRefs.value[exercise.id]
          // Collapsible component exposes a toggle method or isOpen ref
          if (el && typeof el.close === 'function') {
            el.close()
          }
        }
      }
    }
  }
  catch (error: any) {
    console.error('Erro ao atualizar série:', error)
  }
}

async function toggleAllSets(exerciseId: string, sets: WorkoutSet[]) {
  if (!sets.length)
    return

  const allComplete = sets.every(s => s.completed)
  const newCompleted = !allComplete

  try {
    const { error } = await supabase
      .from('workout_sets')
      .update({ completed: newCompleted })
      .in('id', sets.map(s => s.id))

    if (error)
      throw error

    // Update local state
    for (const set of sets) {
      set.completed = newCompleted
    }

    // Auto-close if all completed
    if (newCompleted && workout.value?.exercises) {
      const exercise = workout.value.exercises.find(e => e.id === exerciseId)
      if (exercise && collapsibleRefs.value[exerciseId]) {
        const el = collapsibleRefs.value[exerciseId]
        if (el && typeof el.close === 'function') {
          el.close()
        }
      }
    }
  }
  catch (error: any) {
    console.error('Erro ao atualizar séries:', error)
  }
}

async function deleteSet(setId: string) {
  try {
    const { error } = await supabase.from('workout_sets').delete().eq('id', setId)
    if (error)
      throw error
    await fetchWorkout()
  }
  catch (error: any) {
    console.error('Erro ao deletar série:', error)
  }
}

async function deleteExercise(exerciseId: string) {
  try {
    const { error } = await supabase.from('exercises').delete().eq('id', exerciseId)
    if (error)
      throw error
    await fetchWorkout()
  }
  catch (error: any) {
    console.error('Erro ao deletar exercício:', error)
  }
}

const totalVolume = computed(() => {
  if (!workout.value?.exercises)
    return 0
  return workout.value.exercises.reduce((sum, ex) => {
    const exerciseVolume = (ex.sets || []).reduce((s, set) => s + (set.reps * set.weight_kg), 0)
    return sum + exerciseVolume
  }, 0)
})

const totalSets = computed(() => {
  if (!workout.value?.exercises)
    return 0
  return workout.value.exercises.reduce((sum, ex) => sum + (ex.sets?.length || 0), 0)
})

onMounted(fetchWorkout)
</script>
