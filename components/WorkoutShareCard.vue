<template>
  <div style="width:800px;height:400px;background:#0f0f0f;border-radius:20px;padding:40px 48px;box-sizing:border-box;font-family:system-ui,-apple-system,sans-serif;display:flex;flex-direction:column;justify-content:center;">
    <!-- Header: logo + nome | label da semana -->
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;">
      <div style="display:flex;align-items:center;gap:10px;">
        <img
          v-if="props.logoSrc"
          :src="props.logoSrc"
          alt=""
          style="height:36px;width:auto;display:block;"
        >
        <span style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.02em;line-height:1;">YAFA</span>
      </div>
      <span style="color:#4b5563;font-size:13px;font-weight:500;line-height:1;">{{ props.weekLabel }}</span>
    </div>

    <!-- Divisor -->
    <div style="width:100%;height:1px;background:rgba(255,255,255,0.08);margin-bottom:24px;" />

    <!-- Dias da semana -->
    <div style="display:flex;justify-content:space-between;align-items:flex-start;">
      <div
        v-for="day in props.weekDays"
        :key="day.date"
        style="display:flex;flex-direction:column;align-items:center;gap:8px;"
      >
        <span :style="day.isToday ? 'color:#ffffff;font-size:12px;font-weight:700;line-height:1;' : 'color:#374151;font-size:12px;font-weight:500;line-height:1;'">
          {{ day.label }}
        </span>
        <div :style="getDayBoxStyle(day)">
          <svg
            v-if="day.hasWorkout"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#22c55e"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            style="display:block;"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Rodapé: contador -->
    <div style="margin-top:24px;text-align:center;color:#4b5563;font-size:13px;font-weight:500;line-height:1;">
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
  logoSrc?: string
  weekLabel?: string
}>(), {
  weekDays: () => [],
  workoutCount: 0,
  logoSrc: '',
  weekLabel: '',
})

function getDayBoxStyle(day: WeekDay): string {
  const base = 'width:78px;height:78px;border-radius:14px;display:flex;align-items:center;justify-content:center;'
  if (day.hasWorkout)
    return `${base}background:rgba(34,197,94,0.12);border:2px solid rgba(34,197,94,0.5);`
  if (day.isToday)
    return `${base}background:rgba(255,255,255,0.06);border:2px solid rgba(255,255,255,0.2);`
  return `${base}background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);`
}
</script>
