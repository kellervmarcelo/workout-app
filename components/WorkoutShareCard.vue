<template>
  <div :style="rootStyle">
    <!-- Logo -->
    <img
      src="/yafa_logo_final_transparent.png"
      alt="YAFA"
      style="height: 48px; width: auto; margin-bottom: 28px; display: block;"
    >

    <!-- Dias da semana -->
    <div style="display: flex; gap: 10px; justify-content: center; margin-bottom: 28px;">
      <div
        v-for="day in props.weekDays"
        :key="day.date"
        style="display: flex; flex-direction: column; align-items: center; gap: 8px;"
      >
        <div :style="getDayBoxStyle(day)">
          <span v-if="day.hasWorkout" style="font-size: 22px; line-height: 1;">✓</span>
        </div>
        <span :style="day.isToday ? 'color: #ffffff; font-size: 12px; font-weight: 700;' : 'color: #6b7280; font-size: 12px; font-weight: 500;'">
          {{ day.label }}
        </span>
      </div>
    </div>

    <!-- Contador -->
    <div style="text-align: center; color: #9ca3af; font-size: 15px; font-weight: 400; letter-spacing: 0.01em;">
      {{ props.workoutCount }} {{ props.workoutCount === 1 ? 'treino' : 'treinos' }} essa semana
    </div>
  </div>
</template>

<script setup lang="ts">
interface WeekDay {
  date: string
  label: string
  hasWorkout: boolean
  isToday: boolean
}

const props = withDefaults(defineProps<{
  weekDays?: WeekDay[]
  workoutCount?: number
}>(), {
  weekDays: () => [],
  workoutCount: 0,
})

const rootStyle = 'width: 800px; height: 400px; background: #111111; border-radius: 16px; padding: 40px 48px; box-sizing: border-box; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; justify-content: center;'

function getDayBoxStyle(day: WeekDay): string {
  const base = 'width: 72px; height: 72px; border-radius: 12px; display: flex; align-items: center; justify-content: center;'
  if (day.hasWorkout)
    return `${base} background: rgba(34,197,94,0.15); border: 2px solid rgba(34,197,94,0.6); color: #22c55e;`
  if (day.isToday)
    return `${base} background: rgba(255,255,255,0.07); border: 2px solid rgba(255,255,255,0.35); color: transparent;`
  return `${base} background: rgba(255,255,255,0.04); border: 2px solid rgba(255,255,255,0.1); color: transparent;`
}
</script>
