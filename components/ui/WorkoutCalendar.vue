<template>
  <div class="select-none">
    <!-- Month navigation -->
    <div class="flex items-center justify-between mb-4">
      <Button variant="ghost" size="icon" class="h-9 w-9" @click="prevMonth">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </Button>
      <span class="text-base font-semibold capitalize">{{ monthLabel }}</span>
      <Button variant="ghost" size="icon" class="h-9 w-9" :disabled="isCurrentMonth" @click="nextMonth">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </Button>
    </div>

    <!-- Day-of-week headers -->
    <div class="grid grid-cols-7 mb-1">
      <div
        v-for="label in weekDayLabels"
        :key="label"
        class="py-1 text-center text-xs font-medium text-muted-foreground"
      >
        {{ label }}
      </div>
    </div>

    <!-- Calendar grid -->
    <div class="grid grid-cols-7 gap-y-1">
      <!-- Empty offset cells -->
      <div v-for="i in startOffset" :key="`empty-${i}`" />

      <!-- Day cells -->
      <div
        v-for="day in daysInMonth"
        :key="day"
        class="flex items-center justify-center aspect-square"
      >
        <button
          :class="dayClasses(day)"
          :disabled="!hasWorkout(day)"
          @click="onDayClick(day)"
        >
          {{ day }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  workoutsByDate: Record<string, string>  // YYYY-MM-DD → workoutId (mais recente)
}>()

const emit = defineEmits<{
  select: [workoutId: string]
}>()

const WEEK_DAY_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

const today = new Date()
const currentYear = today.getFullYear()
const currentMonth = today.getMonth()

const displayYear = ref(currentYear)
const displayMonth = ref(currentMonth)

const weekDayLabels = WEEK_DAY_LABELS

const isCurrentMonth = computed(
  () => displayYear.value === currentYear && displayMonth.value === currentMonth,
)

const monthLabel = computed(() =>
  new Date(displayYear.value, displayMonth.value, 1)
    .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
)

const daysInMonth = computed(() =>
  new Date(displayYear.value, displayMonth.value + 1, 0).getDate(),
)

// Offset for Monday-first grid:
// JS getDay(): 0=Sun, 1=Mon, ..., 6=Sat
// Monday-first: Mon=0, Tue=1, ..., Sun=6 → (jsDay + 6) % 7
const startOffset = computed(() => {
  const jsDay = new Date(displayYear.value, displayMonth.value, 1).getDay()
  return (jsDay + 6) % 7
})

function toDateString(day: number): string {
  const m = String(displayMonth.value + 1).padStart(2, '0')
  const d = String(day).padStart(2, '0')
  return `${displayYear.value}-${m}-${d}`
}

function isToday(day: number): boolean {
  return (
    displayYear.value === currentYear
    && displayMonth.value === currentMonth
    && day === today.getDate()
  )
}

function hasWorkout(day: number): boolean {
  return !!props.workoutsByDate[toDateString(day)]
}

function dayClasses(day: number): string {
  const base = 'relative flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-colors'

  if (hasWorkout(day)) {
    return `${base} bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer`
  }

  if (isToday(day)) {
    return `${base} border-2 border-primary text-primary cursor-default`
  }

  return `${base} text-foreground cursor-default`
}

function onDayClick(day: number) {
  const workoutId = props.workoutsByDate[toDateString(day)]
  if (workoutId) {
    emit('select', workoutId)
  }
}

function prevMonth() {
  if (displayMonth.value === 0) {
    displayMonth.value = 11
    displayYear.value--
  }
  else {
    displayMonth.value--
  }
}

function nextMonth() {
  if (isCurrentMonth.value)
    return
  if (displayMonth.value === 11) {
    displayMonth.value = 0
    displayYear.value++
  }
  else {
    displayMonth.value++
  }
}
</script>
