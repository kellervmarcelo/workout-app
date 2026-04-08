<script setup lang="ts">
import type { Session } from '@supabase/supabase-js'

definePageMeta({ middleware: 'auth' })

const supabase = useSupabaseClient()
const session = ref<Session | null>(null)

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
})

const workouts = ref<WorkoutWithExercises[]>([])
const loading = ref(false)
const showCreateDialog = ref(false)
const newWorkoutName = ref('')
const newWorkoutDate = ref(new Date().toISOString().split('T')[0])

const fetchWorkouts = async () => {
  if (!session.value?.user) return
  
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

    if (error) throw error
    workouts.value = data || []
  } catch (error: any) {
    console.error('Erro ao buscar treinos:', error)
  } finally {
    loading.value = false
  }
}

const createWorkout = async () => {
  if (!session.value?.user || !newWorkoutName.value) return

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

    if (error) throw error
    
    showCreateDialog.value = false
    newWorkoutName.value = ''
    newWorkoutDate.value = new Date().toISOString().split('T')[0]
    
    await fetchWorkouts()
  } catch (error: any) {
    console.error('Erro ao criar treino:', error)
  }
}

const deleteWorkout = async (id: string) => {
  try {
    const { error } = await supabase.from('workouts').delete().eq('id', id)
    if (error) throw error
    await fetchWorkouts()
  } catch (error: any) {
    console.error('Erro ao deletar treino:', error)
  }
}

onMounted(fetchWorkouts)

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const totalExercises = (workout: WorkoutWithExercises) => {
  return workout.exercises?.length || 0
}

const totalSets = (workout: WorkoutWithExercises) => {
  return workout.exercises?.reduce((sum, ex) => sum + (ex.sets?.length || 0), 0) || 0
}

const totalVolume = (workout: WorkoutWithExercises) => {
  return workout.exercises?.reduce((sum, ex) => {
    const exerciseVolume = (ex.sets || []).reduce((s, set) => s + (set.reps * set.weight_kg), 0)
    return sum + exerciseVolume
  }, 0) || 0
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Meus Treinos</h1>
        <p class="text-muted-foreground mt-1">Gerencie seus treinos e exercícios</p>
      </div>
      <Button @click="showCreateDialog = true">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Novo Treino
      </Button>
    </div>

    <!-- Create Dialog -->
    <Card v-if="showCreateDialog" class="p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold">Novo Treino</h2>
        <Button variant="ghost" size="icon" class="h-8 w-8" @click="showCreateDialog = false">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Button>
      </div>
      <form @submit.prevent="createWorkout" class="space-y-4">
        <div class="space-y-2">
          <Label for="workout-name" required>Nome</Label>
          <Input
            id="workout-name"
            v-model="newWorkoutName"
            placeholder="Ex: Treino A - Peito"
            required
          />
        </div>
        <div class="space-y-2">
          <Label for="workout-date">Data</Label>
          <Input
            id="workout-date"
            v-model="newWorkoutDate"
            type="date"
          />
        </div>
        <div class="flex gap-2 justify-end">
          <Button type="button" variant="outline" @click="showCreateDialog = false">
            Cancelar
          </Button>
          <Button type="submit">Criar Treino</Button>
        </div>
      </form>
    </Card>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p class="text-muted-foreground">Carregando...</p>
      </div>
    </div>

    <!-- Empty State -->
    <Card v-else-if="workouts.length === 0" class="p-12 text-center">
      <div class="text-5xl mb-4">🏋️</div>
      <h3 class="text-xl font-semibold mb-2">Nenhum treino ainda</h3>
      <p class="text-muted-foreground">Clique em "Novo Treino" para começar!</p>
    </Card>

    <!-- Workout List -->
    <div v-else class="space-y-4">
      <Card
        v-for="workout in workouts"
        :key="workout.id"
        class="p-6 hover:shadow-md transition-shadow cursor-pointer"
        @click="navigateTo(`/workouts/${workout.id}`)"
      >
        <div class="flex items-start justify-between">
          <div class="space-y-2 flex-1">
            <div class="flex items-center gap-2">
              <h3 class="text-lg font-semibold">{{ workout.name }}</h3>
              <Badge variant="outline" class="font-mono text-xs">
                {{ totalExercises(workout) }} exercícios
              </Badge>
              <Badge variant="secondary" class="text-xs">
                {{ totalSets(workout) }} séries
              </Badge>
            </div>
            <div class="flex items-center gap-4 text-sm text-muted-foreground">
              <span class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {{ formatDate(workout.date) }}
              </span>
              <span v-if="totalVolume(workout) > 0" class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                {{ totalVolume(workout).toLocaleString('pt-BR') }} kg
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            class="h-8 w-8 text-muted-foreground hover:text-destructive"
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
