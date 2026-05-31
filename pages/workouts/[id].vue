<template>
  <div v-if="workout" :key="pageRenderKey" class="space-y-5 md:space-y-8 px-3 md:px-0">
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

      <div
        v-if="saveError"
        class="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
      >
        {{ saveError }}
      </div>

      <div
        v-else-if="isRecoveringAfterResume"
        class="rounded-md border border-primary/20 bg-primary/5 p-3 text-sm text-primary"
      >
        Recarregando o treino depois que o app voltou para o foco...
      </div>

      <!-- Completion Banner -->
      <div v-if="workout.completed_at" class="space-y-0">
        <div
          ref="shareCardRef"
          style="position: absolute; left: -9999px; top: -9999px; pointer-events: none;"
        >
          <WorkoutShareCard
            :week-days="shareCardData.weekDays"
            :workout-count="shareCardData.workoutCount"
            :logo-src="shareCardData.logoSrc"
            :week-label="shareCardData.weekLabel"
            :week-year="shareCardData.weekYear"
          />
        </div>

        <div class="p-3 rounded-md text-sm border bg-green-500/10 text-green-600 border-green-500/20 flex items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Treino concluído! Todos os exercícios finalizados.
          </div>
          <Button
            variant="ghost"
            size="sm"
            class="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-500/10 shrink-0"
            :disabled="sharing"
            @click="handleShare"
          >
            <svg v-if="sharing" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span class="ml-1 hidden sm:inline">Baixar card</span>
          </Button>
        </div>
      </div>

      <!-- Notes Section -->
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
            {{ parseSafeDate(workout.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) }}
          </div>
        </Card>
        <Card class="p-3 md:p-4">
          <div class="text-xs text-muted-foreground md:text-sm">
            Séries
          </div>
          <div class="text-sm font-bold mt-1 md:text-lg">
            {{ workoutTotalSets }}
          </div>
        </Card>
        <Card class="p-3 md:p-4">
          <div class="text-xs text-muted-foreground md:text-sm">
            Volume
          </div>
          <div class="text-sm font-bold mt-1 md:text-lg">
            {{ workoutTotalVolume.toLocaleString('pt-BR') }} <span class="text-xs font-normal text-muted-foreground">kg</span>
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
        <div class="flex gap-1 bg-muted rounded-md p-1">
          <button
            type="button"
            class="flex-1 rounded px-2 py-1 text-xs font-medium transition-colors"
            :class="newExerciseType === 'reps' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'"
            @click="newExerciseType = 'reps'"
          >
            Reps
          </button>
          <button
            type="button"
            class="flex-1 rounded px-2 py-1 text-xs font-medium transition-colors"
            :class="newExerciseType === 'time' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'"
            @click="newExerciseType = 'time'"
          >
            Tempo
          </button>
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
      <ExerciseAccordionItem
        v-for="(exercise, idx) in workout.exercises"
        :key="exercise.id"
        :ref="(el: any) => accordionRefs[exercise.id] = el"
        :exercise="exercise"
        :idx="idx"
        @add-set="addSet"
        @update-set="updateSet"
        @toggle-set="toggleSetComplete"
        @toggle-all-sets="toggleAllSets"
        @delete="deleteExercise"
        @open-timer="openExerciseTimer"
        @swipe-open="closeOtherSwipes"
      />

      <!-- Finish Workout Button -->
      <Button
        v-if="!workout.completed_at"
        variant="outline"
        class="w-full h-11 md:h-10"
        @click="showFinishModal = true"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Finalizar Treino
      </Button>

      <!-- Add Exercise Button -->
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

  <!-- Finish Workout Confirmation Modal -->
  <div v-if="showFinishModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" @click.self="showFinishModal = false">
    <Card class="w-full max-w-sm p-6 space-y-4">
      <h3 class="text-lg font-semibold">
        Finalizar treino?
      </h3>
      <p class="text-sm text-muted-foreground">
        O treino será marcado como concluído. Você poderá continuar editando depois.
      </p>
      <div class="flex gap-3 justify-end">
        <Button variant="outline" @click="showFinishModal = false">
          Cancelar
        </Button>
        <Button @click="confirmFinish">
          Confirmar
        </Button>
      </div>
    </Card>
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
      <RestTimer :default-seconds="timerRestSeconds" :readonly="true" />
    </Card>
  </div>
</template>

<script setup lang="ts">
import type { ExerciseLibraryItem, ExerciseWithSets, WorkoutSet } from '~/types'
import { createWorkoutResumeController, updateWorkoutSetLocally } from '~/lib/workout-page-state'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const workoutId = route.params.id as string

const supabase = useSupabaseClient()
const { templates, fetchTemplates } = useTemplates()
const { totalVolume, totalSets } = useWorkoutMetrics()
const { parseSafeDate } = useDate()

const workout = ref<WorkoutWithExercises | null>(null)

useHead(() => ({ title: workout.value?.name ? `YAFA — ${workout.value.name}` : 'YAFA — Treino' }))
const loading = ref(false)
const showExerciseForm = ref(false)
const showExercisePicker = ref(false)
const newExerciseName = ref('')
const newExerciseType = ref<'reps' | 'time'>('reps')
const showTemplateSelector = ref(false)
const showMoreMenu = ref(false)
const showInfos = ref(false)
const showFinishModal = ref(false)
const shareCardRef = ref<HTMLElement | null>(null)
const { sharing, shareCardData, generateAndShare } = useShareCard()
const accordionRefs = ref<Record<string, any>>({})
const showTimerModal = ref(false)
const timerRestSeconds = ref(60)
const pageRenderKey = ref(0)
const saveError = ref('')
const isRecoveringAfterResume = ref(false)

const resumeController = createWorkoutResumeController()
let removeResumeListeners: Array<() => void> = []

const existingExerciseNames = computed(() => {
  return workout.value?.exercises?.map(e => e.name.toLowerCase()) || []
})

const workoutTotalVolume = computed(() => totalVolume(workout.value?.exercises || []))
const workoutTotalSets = computed(() => totalSets(workout.value?.exercises || []))

function handleWorkoutActionError(message: string, error: any) {
  saveError.value = error?.message || message
  console.error(message, error)
}

async function fetchWorkout(options: { silent?: boolean } = {}) {
  if (!options.silent)
    loading.value = true

  try {
    const { data, error } = await supabase
      .from('workouts')
      .select(`
        *,
        exercises(
          *,
          sets:workout_sets(*)
        )
      `)
      .eq('id', workoutId)
      .single()

    if (error)
      throw error
    workout.value = data
  }
  catch (error: any) {
    handleWorkoutActionError('Erro ao buscar treino:', error)
  }
  finally {
    if (!options.silent)
      loading.value = false
  }
}

async function recoverWorkoutPage(_reason: 'focus' | 'pageshow' | 'visibilitychange') {
  if (isRecoveringAfterResume.value)
    return

  isRecoveringAfterResume.value = true
  saveError.value = ''

  showExercisePicker.value = false
  showExerciseForm.value = false
  showFinishModal.value = false
  showMoreMenu.value = false
  showTemplateSelector.value = false
  showTimerModal.value = false
  accordionRefs.value = {}
  pageRenderKey.value += 1

  await nextTick()
  await fetchWorkout({ silent: true })

  isRecoveringAfterResume.value = false
}

function registerResumeListeners() {
  const onVisibilityChange = () => {
    const shouldRecover = resumeController.onVisibilityChange(document.visibilityState === 'hidden')

    if (shouldRecover)
      void recoverWorkoutPage('visibilitychange')
  }

  const onFocus = () => {
    const isVisible = document.visibilityState !== 'hidden'
    const shouldRecover = resumeController.onFocus(Date.now(), isVisible)

    if (shouldRecover)
      void recoverWorkoutPage('focus')
  }

  const onPageShow = () => {
    const shouldRecover = resumeController.onPageShow()

    if (shouldRecover)
      void recoverWorkoutPage('pageshow')
  }

  document.addEventListener('visibilitychange', onVisibilityChange)
  window.addEventListener('focus', onFocus)
  window.addEventListener('pageshow', onPageShow)

  removeResumeListeners = [
    () => document.removeEventListener('visibilitychange', onVisibilityChange),
    () => window.removeEventListener('focus', onFocus),
    () => window.removeEventListener('pageshow', onPageShow),
  ]
}

async function loadTemplate(templateId: string) {
  if (!workout.value)
    return

  const template = templates.value.find(t => t.id === templateId)
  if (!template?.exercises?.length)
    return

  try {
    for (const exercise of template.exercises) {
      const { data: exerciseData, error: exerciseError } = await supabase
        .from('exercises')
        .insert({
          workout_id: workoutId,
          name: exercise.name,
          order: (workout.value.exercises?.length || 0),
          exercise_type: exercise.exercise_type || 'reps',
          rest_seconds: exercise.default_rest_seconds ?? 60,
        })
        .select()
        .single()

      if (exerciseError)
        throw exerciseError

      const isTime = exercise.exercise_type === 'time'
      if (exercise.default_sets > 0) {
        for (let s = 1; s <= exercise.default_sets; s++) {
          const { error: setError } = await supabase
            .from('workout_sets')
            .insert({
              exercise_id: exerciseData.id,
              set_number: s,
              reps: isTime ? 0 : exercise.default_reps,
              weight_kg: exercise.default_weight_kg,
              duration_seconds: isTime ? (exercise.default_duration_seconds || 30) : null,
              rest_seconds: exercise.default_rest_seconds ?? 60,
              completed: false,
            })

          if (setError)
            throw setError
        }
      }
    }

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
    saveError.value = ''
    await fetchWorkout()
  }
  catch (error: any) {
    handleWorkoutActionError('Erro ao carregar template:', error)
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
    saveError.value = ''
    await fetchWorkout()
  }
  catch (error: any) {
    handleWorkoutActionError('Erro ao adicionar exercício:', error)
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
        exercise_type: newExerciseType.value,
      })
      .select()
      .single()

    if (error)
      throw error

    newExerciseName.value = ''
    newExerciseType.value = 'reps'
    showExerciseForm.value = false
    saveError.value = ''
    await fetchWorkout()
  }
  catch (error: any) {
    handleWorkoutActionError('Erro ao adicionar exercício:', error)
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
    const isTime = exercise.exercise_type === 'time'
    const { error } = await supabase.from('workout_sets').insert({
      exercise_id: exerciseId,
      set_number: setNumber,
      reps: isTime ? 0 : (lastSet?.reps || 10),
      weight_kg: lastSet?.weight_kg || 0,
      rest_seconds: lastSet?.rest_seconds || 60,
      duration_seconds: isTime ? (lastSet?.duration_seconds || 30) : null,
      completed: false,
    })

    if (error)
      throw error
    saveError.value = ''
    await fetchWorkout()
  }
  catch (error: any) {
    handleWorkoutActionError('Erro ao adicionar série:', error)
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

    updateWorkoutSetLocally(workout.value, setId, { [field]: value })
    saveError.value = ''
    await syncSetToTemplate(setId, field, value)
  }
  catch (error: any) {
    handleWorkoutActionError('Erro ao atualizar série:', error)
  }
}

async function syncSetToTemplate(setId: string, field: keyof WorkoutSet, value: number) {
  if (!workout.value || !(workout.value as any).source_template_id)
    return

  const exercise = workout.value.exercises?.find(e =>
    e.sets?.some((s: WorkoutSet) => s.id === setId),
  )
  if (!exercise)
    return

  const templateField = field === 'weight_kg' ? 'default_weight_kg' : field === 'reps' ? 'default_reps' : null
  if (!templateField)
    return

  const { error } = await supabase
    .from('template_exercises')
    .update({ [templateField]: value })
    .eq('template_id', (workout.value as any).source_template_id)
    .eq('"order"', exercise.order)

  if (error)
    console.error('Erro ao sincronizar com template:', error)
}

function openExerciseTimer(exercise: ExerciseWithSets) {
  timerRestSeconds.value = exercise.rest_seconds ?? 60
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

    updateWorkoutSetLocally(workout.value, setId, { completed: newCompleted })

    if (newCompleted && workout.value && !workout.value.started_at) {
      const startedAt = new Date().toISOString()
      const { error: startError } = await supabase
        .from('workouts')
        .update({ started_at: startedAt })
        .eq('id', workout.value.id)
      if (!startError)
        workout.value.started_at = startedAt
    }

    await checkWorkoutCompletion()
    saveError.value = ''

    if (newCompleted && workout.value?.exercises) {
      for (const exercise of workout.value.exercises) {
        const allComplete = (exercise.sets || []).every(s => s.completed)
        if (allComplete) {
          accordionRefs.value[exercise.id]?.collapseAccordion()
        }
      }
    }
  }
  catch (error: any) {
    handleWorkoutActionError('Erro ao atualizar série:', error)
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

    for (const set of sets) {
      set.completed = newCompleted
    }

    if (newCompleted && workout.value && !workout.value.started_at) {
      const startedAt = new Date().toISOString()
      const { error: startError } = await supabase
        .from('workouts')
        .update({ started_at: startedAt })
        .eq('id', workout.value.id)
      if (!startError)
        workout.value.started_at = startedAt
    }

    await checkWorkoutCompletion()
    saveError.value = ''

    if (newCompleted) {
      accordionRefs.value[exerciseId]?.collapseAccordion()
    }
  }
  catch (error: any) {
    handleWorkoutActionError('Erro ao atualizar séries:', error)
  }
}

async function checkWorkoutCompletion() {
  if (!workout.value?.exercises)
    return
  const allSets = workout.value.exercises.flatMap(e => e.sets || [])
  if (!allSets.length)
    return

  const allCompleted = allSets.every(s => s.completed)
  const wasCompleted = !!workout.value.completed_at
  if (allCompleted === wasCompleted)
    return

  const newCompletedAt = allCompleted ? new Date().toISOString() : null
  try {
    const { error } = await supabase
      .from('workouts')
      .update({ completed_at: newCompletedAt })
      .eq('id', workout.value.id)
    if (error)
      throw error
    workout.value.completed_at = newCompletedAt
  }
  catch {}
}

async function confirmFinish() {
  if (!workout.value)
    return
  showFinishModal.value = false
  const completedAt = new Date().toISOString()
  try {
    const { error } = await supabase
      .from('workouts')
      .update({ completed_at: completedAt })
      .eq('id', workout.value.id)
    if (error)
      throw error
    workout.value.completed_at = completedAt
  }
  catch {}
}

async function handleShare() {
  const cardEl = shareCardRef.value?.firstElementChild as HTMLElement | null
  if (!cardEl)
    return
  await generateAndShare(cardEl)
}

function closeOtherSwipes(openedId: string) {
  for (const [id, ref] of Object.entries(accordionRefs.value)) {
    if (id !== openedId && ref) {
      ref.closeSwipe()
    }
  }
}

async function deleteExercise(exerciseId: string) {
  try {
    const { error } = await supabase.from('exercises').delete().eq('id', exerciseId)
    if (error)
      throw error
    saveError.value = ''
    await fetchWorkout()
  }
  catch (error: any) {
    handleWorkoutActionError('Erro ao deletar exercício:', error)
  }
}

onMounted(async () => {
  registerResumeListeners()
  await fetchWorkout()
})

onBeforeUnmount(() => {
  for (const removeListener of removeResumeListeners)
    removeListener()
  removeResumeListeners = []
})
</script>
