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
            {{ currentStreak === 1 ? 'semana seguindo a meta' : 'semanas seguindo a meta' }}
          </div>
          <div class="text-xs text-muted-foreground/60 mt-0.5">
            Meta: {{ weeklyGoal }}x/semana
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
const { goal: weeklyGoal, fetchGoal } = useWeeklyGoal()

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

// Retorna chave ISO da semana: "YYYY-Www"
function getISOWeekKey(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`)
  const day = d.getDay() || 7 // 1=seg…7=dom
  d.setDate(d.getDate() + 4 - day) // ancora na quinta-feira ISO
  const year = d.getFullYear()
  const jan1 = new Date(year, 0, 1)
  const week = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + 1) / 7)
  return `${year}-W${String(week).padStart(2, '0')}`
}

// Streak: semanas consecutivas passadas em que o usuário atingiu a meta
const currentStreak = computed(() => {
  if (!workouts.value.length)
    return 0

  // Conta treinos por semana ISO
  const weekMap = new Map<string, number>()
  for (const w of workouts.value) {
    const key = getISOWeekKey(w.date)
    weekMap.set(key, (weekMap.get(key) ?? 0) + 1)
  }

  const todayWeekKey = getISOWeekKey(getTodayString())
  let streak = 0
  const cursor = new Date()

  // Começa pela semana anterior (semana atual está em progresso)
  cursor.setDate(cursor.getDate() - 7)

  while (true) {
    const key = getISOWeekKey(toDateString(cursor))
    if (key === todayWeekKey)
      break
    const count = weekMap.get(key) ?? 0
    if (count < weeklyGoal.value)
      break
    streak++
    cursor.setDate(cursor.getDate() - 7)
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

onMounted(async () => {
  if (session.value?.user) {
    await Promise.all([
      fetchWorkouts(),
      fetchGoal(session.value.user.id),
    ])
  }
})
</script>
