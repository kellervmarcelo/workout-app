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
        <Button data-tour="templates" variant="outline" size="sm" class="flex-1 md:flex-none" @click="navigateTo('/templates')">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span class="hidden sm:inline">Templates</span>
        </Button>
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
        <Button variant="ghost" size="icon" class="h-9 w-9" @click="showCreateDialog = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Button>
      </div>
      <form class="space-y-4" @submit.prevent="createWorkout">
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
        <div class="flex gap-2">
          <Button type="button" variant="outline" class="flex-1" @click="showCreateDialog = false">
            Cancelar
          </Button>
          <Button type="submit" class="flex-1">
            Criar Treino
          </Button>
        </div>
      </form>
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
      <Card
        v-for="workout in workouts"
        :key="workout.id"
        class="p-4 hover:shadow-md transition-shadow cursor-pointer md:p-6"
        @click="navigateTo(`/workouts/${workout.id}`)"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="space-y-1.5 flex-1 min-w-0 md:space-y-2">
            <div class="flex flex-wrap items-center gap-1.5">
              <h3 class="text-base font-semibold truncate md:text-lg">
                {{ workout.name }}
              </h3>
              <Badge data-tour="stats" variant="outline" class="font-mono text-[10px] shrink-0">
                {{ totalExercises(workout) }}
              </Badge>
              <Badge variant="secondary" class="text-[10px] shrink-0">
                {{ totalSets(workout) }}s
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
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Session } from '@supabase/supabase-js'

definePageMeta({ middleware: 'auth' })

const supabase = useSupabaseClient()
const session = ref<Session | null>(null)
const { checkTourStatus, startTour } = useOnboardingTour()

onMounted(async () => {
  const { data } = await supabase.auth.getSession()
  session.value = data.session

  supabase.auth.onAuthStateChange((_event, newSession) => {
    session.value = newSession
  })

  if (!data.session) {
    navigateTo('/login')
    return
  }

  await fetchWorkouts()

  // Start onboarding tour for first-time users
  await checkTourStatus(data.session.user.id)
  startTour()
})

const workouts = ref<WorkoutWithExercises[]>([])
const loading = ref(false)
const showCreateDialog = ref(false)
const newWorkoutName = ref('')
const newWorkoutDate = ref(new Date().toISOString().split('T')[0])

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

async function createWorkout() {
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
    newWorkoutName.value = ''
    newWorkoutDate.value = new Date().toISOString().split('T')[0]

    await fetchWorkouts()
  }
  catch (error: any) {
    console.error('Erro ao criar treino:', error)
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
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function totalExercises(workout: WorkoutWithExercises) {
  return workout.exercises?.length || 0
}

function totalSets(workout: WorkoutWithExercises) {
  return workout.exercises?.reduce((sum, ex) => sum + (ex.sets?.length || 0), 0) || 0
}

function totalVolume(workout: WorkoutWithExercises) {
  return workout.exercises?.reduce((sum, ex) => {
    const exerciseVolume = (ex.sets || []).reduce((s, set) => s + (set.reps * set.weight_kg), 0)
    return sum + exerciseVolume
  }, 0) || 0
}
</script>
