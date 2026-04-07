<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { data: session } = useSupabaseSession()
const supabase = useSupabaseClient()

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
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">Meus Treinos</h1>
        <p class="text-muted-foreground mt-1">Gerencie seus treinos e exercícios</p>
      </div>
      <Button @click="showCreateDialog = true">
        <span class="mr-2">+</span> Novo Treino
      </Button>
    </div>

    <!-- Create Dialog -->
    <Card v-if="showCreateDialog" class="p-6">
      <h2 class="text-xl font-semibold mb-4">Novo Treino</h2>
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
      <p class="text-muted-foreground">Carregando...</p>
    </div>

    <!-- Empty State -->
    <Card v-else-if="workouts.length === 0" class="p-12 text-center">
      <p class="text-4xl mb-4">🏋️</p>
      <h3 class="text-xl font-semibold mb-2">Nenhum treino ainda</h3>
      <p class="text-muted-foreground">Clique em "Novo Treino" para começar!</p>
    </Card>

    <!-- Workout List -->
    <div v-else class="space-y-4">
      <Card
        v-for="workout in workouts"
        :key="workout.id"
        class="p-6 hover:shadow-md transition-shadow"
      >
        <div class="flex items-start justify-between">
          <div class="space-y-1">
            <NuxtLink :to="`/workouts/${workout.id}`" class="text-lg font-semibold hover:text-primary">
              {{ workout.name }}
            </NuxtLink>
            <p class="text-sm text-muted-foreground">{{ formatDate(workout.date) }}</p>
            <p v-if="workout.exercises" class="text-sm text-muted-foreground">
              {{ workout.exercises.length }} exercício(s)
            </p>
          </div>
          <Button variant="ghost" size="icon" @click="deleteWorkout(workout.id)">
            🗑️
          </Button>
        </div>
      </Card>
    </div>
  </div>
</template>
