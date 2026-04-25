<template>
  <div class="space-y-4 md:space-y-6">
    <!-- Header - empilhado em mobile -->
    <div class="space-y-3 md:flex md:items-center md:justify-between md:space-y-0">
      <div>
        <h1 class="text-2xl font-bold tracking-tight md:text-3xl">
          Meus Treinos
        </h1>
        <p class="text-sm text-muted-foreground mt-0.5 md:mt-1">
          Gerencie seus treinos e exercícios
        </p>
      </div>
      <div class="flex gap-2">
        <NuxtLink to="/templates" class="flex-1 md:flex-none">
          <Button data-tour="templates" variant="outline" size="sm" class="w-full">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span class="hidden sm:inline">Templates</span>
          </Button>
        </NuxtLink>
        <Button data-tour="create-workout" size="sm" class="flex-1 md:flex-none" @click="showCreateDialog = true">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span class="hidden sm:inline">Novo Treino</span>
          <span class="sm:hidden">Novo</span>
        </Button>
      </div>
    </div>

    <!-- Create Dialog -->
    <Card v-if="showCreateDialog" class="p-4 md:p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold md:text-xl">
          Novo Treino
        </h2>
        <Button variant="ghost" size="icon" class="h-9 w-9" @click="closeCreateDialog">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Button>
      </div>

      <!-- Template Selection -->
      <div class="space-y-4">
        <div class="space-y-2">
          <Label for="template-select">Template</Label>
          <select
            id="template-select"
            v-model="selectedTemplateId"
            class="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            @change="onTemplateSelected"
          >
            <option value="empty">
              Treino vazio
            </option>
            <option
              v-for="template in templates"
              :key="template.id"
              :value="template.id"
            >
              {{ template.name }} ({{ template.exercises?.length || 0 }} exercícios)
            </option>
          </select>
          <p v-if="templates.length === 0" class="text-xs text-muted-foreground">
            <NuxtLink to="/templates" class="text-primary hover:underline">
              Crie um template
            </NuxtLink>
            para reutilizar treinos.
          </p>
        </div>

        <!-- Empty workout mode -->
        <template v-if="selectedTemplateId === 'empty'">
          <div class="space-y-2">
            <Label for="workout-name" required>Nome</Label>
            <Input
              id="workout-name"
              v-model="newWorkoutName"
              placeholder="Ex: Treino A - Peito"
              required
              class="h-11 text-base"
            />
          </div>
          <div class="space-y-2">
            <Label for="workout-date">Data</Label>
            <Input
              id="workout-date"
              v-model="newWorkoutDate"
              type="date"
              class="h-11 text-base"
            />
          </div>
        </template>

        <!-- Template selected - show preview -->
        <div v-else-if="selectedTemplate" class="space-y-3">
          <div class="rounded-lg border bg-muted/30 p-3">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-sm">
                  {{ selectedTemplate.name }}
                </p>
                <p v-if="selectedTemplate.description" class="text-xs text-muted-foreground mt-0.5">
                  {{ selectedTemplate.description }}
                </p>
              </div>
              <Badge variant="outline" class="font-mono text-xs">
                {{ selectedTemplate.exercises?.length || 0 }} exercícios
              </Badge>
            </div>
          </div>

          <!-- Exercise preview list -->
          <div
            v-if="selectedTemplate.exercises?.length"
            class="space-y-1.5"
          >
            <div
              v-for="(ex, idx) in selectedTemplate.exercises"
              :key="ex.id"
              class="flex items-center gap-2 text-sm px-3 py-1.5 rounded-md bg-muted/50"
            >
              <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-medium text-primary">
                {{ idx + 1 }}
              </span>
              <span class="truncate flex-1">{{ ex.name }}</span>
              <span v-if="ex.exercise_type === 'reps'" class="text-xs font-mono text-muted-foreground shrink-0">
                {{ ex.default_sets }}s × {{ ex.default_reps }} reps
              </span>

              <span v-else class="text-xs font-mono text-muted-foreground shrink-0">
                {{ ex.default_sets }}s × {{ ex.default_duration_seconds }}sec
              </span>
            </div>
          </div>
        </div>

        <div class="flex gap-2 pt-2">
          <Button type="button" variant="outline" class="flex-1" @click="closeCreateDialog">
            Cancelar
          </Button>
          <Button
            type="submit"
            class="flex-1"
            :disabled="creating || (selectedTemplateId === 'empty' && !newWorkoutName)"
            @click="selectedTemplateId === 'empty' ? createEmptyWorkout() : createWorkoutFromTemplate()"
          >
            <svg v-if="creating" class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {{ creating ? 'Criando...' : 'Criar Treino' }}
          </Button>
        </div>
      </div>
    </Card>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
        <p class="text-muted-foreground">
          Carregando...
        </p>
      </div>
    </div>

    <!-- Empty State -->
    <Card v-else-if="workouts.length === 0" class="p-8 text-center md:p-12">
      <div class="text-5xl mb-4">
        🏋️
      </div>
      <h3 class="text-lg font-semibold mb-2 md:text-xl">
        Nenhum treino ainda
      </h3>
      <p class="text-sm text-muted-foreground">
        Clique em "Novo Treino" para começar!
      </p>
    </Card>

    <!-- Workout List -->
    <div v-else data-tour="workout-list" class="space-y-3 md:space-y-4">
      <NuxtLink
        v-for="workout in workouts"
        :key="workout.id"
        :to="`/workouts/${workout.id}`"
        class="block"
      >
        <Card class="p-4 hover:shadow-md transition-shadow md:p-6">
          <div class="flex items-start justify-between gap-3">
            <div class="space-y-1.5 flex-1 min-w-0 md:space-y-2">
              <div class="flex flex-wrap items-center gap-1.5">
                <h3 class="text-base font-semibold truncate md:text-lg">
                  {{ workout.name }}
                </h3>
                <Badge data-tour="stats" variant="outline" class="font-mono text-[10px] shrink-0">
                  {{ totalExercises(workout) }}
                </Badge>
                <Badge
                  v-if="workout.completed_at"
                  variant="outline"
                  class="text-[10px] shrink-0 border-green-500/50 text-green-600 bg-green-500/10"
                >
                  ✓ Concluído
                </Badge>
              </div>
              <div class="flex flex-wrap items-center gap-2 text-xs text-muted-foreground md:gap-4 md:text-sm">
                <span class="flex items-center gap-1">
                  <svg class="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {{ formatDate(workout.date) }}
                </span>
                <span v-if="totalVolume(workout) > 0" class="flex items-center gap-1">
                  <svg class="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span class="truncate">{{ totalVolume(workout).toLocaleString('pt-BR') }} kg</span>
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              class="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
              @click.stop="deleteWorkout(workout.id)"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </Button>
          </div>
        </Card>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Session } from '@supabase/supabase-js'

definePageMeta({ middleware: 'auth' })
useHead({ title: 'YAFA — Treinos' })

const supabase = useSupabaseClient()
const session = ref<Session | null>(null)
const { checkTourStatus, startTour } = useOnboardingTour()

onMounted(async () => {
  const { data } = await supabase.auth.getSession()
  session.value = data.session

  supabase.auth.onAuthStateChange((_event, newSession) => {
    session.value = newSession
  })

  await fetchWorkouts()
  await fetchTemplates()

  // Start onboarding tour for first-time users
  if (data.session) {
    await checkTourStatus(data.session.user.id)
  }
  startTour()
})

const workouts = ref<WorkoutWithExercises[]>([])
const templates = ref<WorkoutTemplateWithExercises[]>([])
const loading = ref(false)
const creating = ref(false)
const showCreateDialog = ref(false)
const selectedTemplateId = ref<string | 'empty'>('empty')
const newWorkoutName = ref('')
const newWorkoutDate = ref(getTodayString())

const selectedTemplate = computed(() => {
  if (selectedTemplateId.value === 'empty')
    return null
  return templates.value.find(t => t.id === selectedTemplateId.value) || null
})

// Generate today's date as a local string (avoid UTC conversion issues)
function getTodayString() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

async function fetchWorkouts() {
  if (!session.value?.user)
    return

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
      .eq('user_id', session.value.user.id)
      .order('date', { ascending: false })

    if (error)
      throw error
    workouts.value = data || []
  }
  catch (error: any) {
    console.error('Erro ao buscar treinos:', error)
  }
  finally {
    loading.value = false
  }
}

async function fetchTemplates() {
  if (!session.value?.user)
    return

  try {
    const { data, error } = await supabase
      .from('workout_templates')
      .select(`
        *,
        exercises:template_exercises(*)
      `)
      .eq('user_id', session.value.user.id)
      .order('created_at', { ascending: false })

    if (error)
      throw error
    templates.value = data || []
  }
  catch (error: any) {
    console.error('Erro ao buscar templates:', error)
  }
}

function onTemplateSelected() {
  if (selectedTemplateId.value !== 'empty' && selectedTemplate.value) {
    newWorkoutName.value = selectedTemplate.value.name
  }
  else {
    newWorkoutName.value = ''
  }
}

function closeCreateDialog() {
  showCreateDialog.value = false
  selectedTemplateId.value = 'empty'
  newWorkoutName.value = ''
  newWorkoutDate.value = getTodayString()
}

async function createEmptyWorkout() {
  if (!session.value?.user || !newWorkoutName.value)
    return

  try {
    const { data, error } = await supabase
      .from('workouts')
      .insert({
        user_id: session.value.user.id,
        name: newWorkoutName.value,
        date: newWorkoutDate.value,
      })
      .select()
      .single()

    if (error)
      throw error

    showCreateDialog.value = false
    selectedTemplateId.value = 'empty'
    newWorkoutName.value = ''
    newWorkoutDate.value = getTodayString()

    // Navigate to the newly created workout
    navigateTo(`/workouts/${data.id}`)
  }
  catch (error: any) {
    console.error('Erro ao criar treino:', error)
  }
}

async function createWorkoutFromTemplate() {
  if (!session.value?.user || !selectedTemplate.value)
    return
  const template = selectedTemplate.value
  creating.value = true

  try {
    // 1. Create the workout
    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .insert({
        user_id: session.value.user.id,
        name: template.name,
        date: getTodayString(),
        notes: template.comments || null,
        source_template_id: template.id,
      })
      .select()
      .single()

    if (workoutError)
      throw workoutError

    // 2. Copy exercises and sets from template
    if (template.exercises?.length) {
      for (let i = 0; i < template.exercises.length; i++) {
        const templateEx = template.exercises[i]

        // Create exercise
        const isTime = templateEx.exercise_type === 'time'
        const { data: exercise, error: exError } = await supabase
          .from('exercises')
          .insert({
            workout_id: workout.id,
            name: templateEx.name,
            order: templateEx.order,
            exercise_type: templateEx.exercise_type || 'reps',
            notes: null,
            rest_seconds: templateEx.default_rest_seconds ?? 60,
          })
          .select()
          .single()

        if (exError)
          throw exError

        // Create default sets from template
        if (templateEx.default_sets > 0) {
          for (let s = 1; s <= templateEx.default_sets; s++) {
            const { error: setError } = await supabase
              .from('workout_sets')
              .insert({
                exercise_id: exercise.id,
                set_number: s,
                reps: isTime ? 0 : templateEx.default_reps,
                weight_kg: templateEx.default_weight_kg,
                duration_seconds: isTime ? (templateEx.default_duration_seconds || 30) : null,
                rest_seconds: templateEx.default_rest_seconds ?? 60,
                completed: false,
              })

            if (setError)
              throw setError
          }
        }
      }
    }

    showCreateDialog.value = false
    selectedTemplateId.value = 'empty'
    newWorkoutName.value = ''
    newWorkoutDate.value = getTodayString()

    // Navigate to the newly created workout
    navigateTo(`/workouts/${workout.id}`)
  }
  catch (error: any) {
    console.error('Erro ao criar treino a partir do template:', error)
  }
  finally {
    creating.value = false
  }
}

async function deleteWorkout(id: string) {
  try {
    const { error } = await supabase.from('workouts').delete().eq('id', id)
    if (error)
      throw error
    await fetchWorkouts()
  }
  catch (error: any) {
    console.error('Erro ao deletar treino:', error)
  }
}

onMounted(fetchWorkouts)

function formatDate(date: string) {
  // Append T12:00:00 to avoid UTC conversion shifting the day
  return new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function totalExercises(workout: WorkoutWithExercises) {
  return workout.exercises?.length || 0
}

function totalVolume(workout: WorkoutWithExercises) {
  return workout.exercises?.reduce((sum, ex) => {
    const exerciseVolume = (ex.sets || []).reduce((s, set) => s + (set.reps * set.weight_kg), 0)
    return sum + exerciseVolume
  }, 0) || 0
}
</script>
