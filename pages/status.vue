<template>
  <div class="space-y-6 md:space-y-8 px-0 md:px-0 max-w-md mx-auto">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-bold tracking-tight md:text-3xl">
        Status
      </h1>
      <Button variant="outline" size="sm" @click="showReportModal = true">
        Relatório
      </Button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
        <p class="text-muted-foreground text-sm">
          Carregando...
        </p>
      </div>
    </div>

    <template v-else>
      <!-- Calendar Card -->
      <Card class="p-4 md:p-6">
        <WorkoutCalendar
          :workouts-by-date="latestWorkoutIdByDate"
          @select="navigateTo(`/workouts/${$event}`)"
        />
      </Card>

      <!-- Stats Cards -->
      <div class="grid grid-cols-2 gap-3 md:gap-4">
        <Card class="p-4 md:p-5">
          <div class="text-xs text-muted-foreground md:text-sm mb-1">
            Sequência atual
          </div>
          <div class="text-2xl font-bold md:text-3xl">
            {{ currentStreak }}
          </div>
          <div class="text-xs text-muted-foreground mt-0.5">
            {{ currentStreak === 1 ? 'dia seguido' : 'dias seguidos' }}
          </div>
        </Card>

        <Card class="p-4 md:p-5">
          <div class="text-xs text-muted-foreground md:text-sm mb-1">
            Este mês
          </div>
          <div class="text-2xl font-bold md:text-3xl">
            {{ workoutsThisMonth }}
          </div>
          <div class="text-xs text-muted-foreground mt-0.5">
            {{ workoutsThisMonth === 1 ? 'treino' : 'treinos' }}
          </div>
        </Card>
      </div>
    </template>
  </div>

  <ReportModal v-if="showReportModal" @close="showReportModal = false" />
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useHead({ title: 'YAFA — Status' })

interface WorkoutSummary {
  id: string
  date: string
  name: string
}

const supabase = useSupabaseClient()
const session = useSupabaseSession()

const workouts = ref<WorkoutSummary[]>([])
const loading = ref(true)

async function fetchWorkouts() {
  if (!session.value?.user)
    return

  try {
    const { data, error } = await supabase
      .from('workouts')
      .select('id, date, name')
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

// Map: YYYY-MM-DD → id do treino mais recente (query já vem DESC por data)
const latestWorkoutIdByDate = computed(() => {
  const map: Record<string, string> = {}
  for (const workout of workouts.value) {
    if (!map[workout.date]) {
      map[workout.date] = workout.id
    }
  }
  return map
})

// Streak: dias consecutivos com treino contando regressivamente a partir de hoje
const currentStreak = computed(() => {
  if (!workouts.value.length)
    return 0

  const workoutDates = new Set(workouts.value.map(w => w.date))

  const todayStr = getTodayString()
  let streak = 0
  const cursor = new Date()

  // Se não treinou hoje, começa checando ontem
  if (!workoutDates.has(todayStr)) {
    cursor.setDate(cursor.getDate() - 1)
  }

  while (true) {
    const dateStr = toDateString(cursor)
    if (!workoutDates.has(dateStr))
      break
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
})

// Contagem de treinos no mês atual
const workoutsThisMonth = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const prefix = `${year}-${month}`
  return workouts.value.filter(w => w.date.startsWith(prefix)).length
})

function getTodayString(): string {
  const now = new Date()
  return toDateString(now)
}

function toDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const showReportModal = ref(false)

onMounted(fetchWorkouts)
</script>
