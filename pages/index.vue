<template>
  <div class="space-y-4 md:space-y-6">
    <!-- Header -->
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
    <CreateWorkoutDialog
      v-if="showCreateDialog"
      :templates="templates"
      :creating="creating"
      @close="showCreateDialog = false"
      @create-empty="createEmptyWorkout"
      @create-from-template="createWorkoutFromTemplate"
    />

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
      <WorkoutCard
        v-for="workout in workouts"
        :key="workout.id"
        :workout="workout"
        @delete="deleteWorkout"
      />

      <div v-if="hasMore" class="pt-2 flex justify-center">
        <Button variant="outline" :disabled="loadingMore" @click="loadMore">
          <svg v-if="loadingMore" class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {{ loadingMore ? 'Carregando...' : 'Carregar mais treinos' }}
        </Button>
      </div>
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
const { templates, fetchTemplates } = useTemplates()
const { getTodayString } = useDate()

onMounted(async () => {
  const { data } = await supabase.auth.getSession()
  session.value = data.session

  supabase.auth.onAuthStateChange((_event, newSession) => {
    session.value = newSession
  })

  await fetchWorkouts()
  await fetchTemplates()

  if (data.session) {
    await checkTourStatus(data.session.user.id)
  }
  startTour()
})

const LIMIT = 10
const workouts = ref<WorkoutWithExercises[]>([])
const loading = ref(false)
const loadingMore = ref(false)
const hasMore = ref(false)
const offset = ref(0)
const creating = ref(false)
const showCreateDialog = ref(false)

async function fetchWorkouts() {
  if (!session.value?.user)
    return

  loading.value = true
  offset.value = 0
  try {
    const { data, error } = await supabase
      .from('workouts')
      .select(`*, exercises(*, sets:workout_sets(*))`)
      .eq('user_id', session.value.user.id)
      .order('date', { ascending: false })
      .range(0, LIMIT - 1)

    if (error)
      throw error
    workouts.value = data || []
    hasMore.value = (data?.length ?? 0) === LIMIT
    offset.value = LIMIT
  }
  catch (error: any) {
    console.error('Erro ao buscar treinos:', error)
  }
  finally {
    loading.value = false
  }
}

async function loadMore() {
  if (!session.value?.user || !hasMore.value || loadingMore.value)
    return

  loadingMore.value = true
  try {
    const { data, error } = await supabase
      .from('workouts')
      .select(`*, exercises(*, sets:workout_sets(*))`)
      .eq('user_id', session.value.user.id)
      .order('date', { ascending: false })
      .range(offset.value, offset.value + LIMIT - 1)

    if (error)
      throw error
    workouts.value.push(...(data || []))
    hasMore.value = (data?.length ?? 0) === LIMIT
    offset.value += LIMIT
  }
  catch (error: any) {
    console.error('Erro ao carregar mais treinos:', error)
  }
  finally {
    loadingMore.value = false
  }
}

async function createEmptyWorkout(name: string, date: string) {
  if (!session.value?.user || !name)
    return

  try {
    const { data, error } = await supabase
      .from('workouts')
      .insert({
        user_id: session.value.user.id,
        name,
        date,
      })
      .select()
      .single()

    if (error)
      throw error

    showCreateDialog.value = false
    navigateTo(`/workouts/${data.id}`)
  }
  catch (error: any) {
    console.error('Erro ao criar treino:', error)
  }
}

async function createWorkoutFromTemplate(templateId: string) {
  if (!session.value?.user)
    return

  const template = templates.value.find(t => t.id === templateId)
  if (!template)
    return

  creating.value = true
  try {
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

    if (template.exercises?.length) {
      for (let i = 0; i < template.exercises.length; i++) {
        const templateEx = template.exercises[i]
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
</script>
