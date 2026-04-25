<template>
  <div style="width:800px;height:400px;background:#0c0c0c;border-radius:28px;border:1.5px solid rgba(255,255,255,0.1);padding:36px 48px;box-sizing:border-box;font-family:system-ui,-apple-system,sans-serif;display:flex;flex-direction:column;justify-content:space-between;">

    <!-- Header: logo (esq) + stat de destaque (dir) -->
    <div style="display:flex;align-items:flex-start;justify-content:space-between;">
      <img
        v-if="props.logoSrc"
        :src="props.logoSrc"
        alt="YAFA"
        style="height:40px;width:auto;display:block;"
      >
      <div style="text-align:right;">
        <div style="color:#ffffff;font-size:40px;font-weight:800;letter-spacing:-0.04em;line-height:1;">
          {{ props.workoutCount }}
        </div>
        <div style="color:#6b7280;font-size:12px;font-weight:500;margin-top:4px;line-height:1;">
          {{ props.workoutCount === 1 ? 'treino' : 'treinos' }} essa semana
        </div>
      </div>
    </div>

    <!-- Divisor -->
    <div style="width:100%;height:1px;background:rgba(255,255,255,0.08);" />

    <!-- Dias da semana -->
    <div style="display:flex;justify-content:space-between;align-items:flex-start;">
      <div
        v-for="day in props.weekDays"
        :key="day.date"
        style="display:flex;flex-direction:column;align-items:center;gap:8px;"
      >
        <span :style="day.isToday ? 'color:#9ca3af;font-size:11px;font-weight:700;line-height:1;letter-spacing:0.05em;' : 'color:#374151;font-size:11px;font-weight:600;line-height:1;letter-spacing:0.05em;'">
          {{ day.label }}
        </span>
        <div :style="getDayBoxStyle(day)">
          <svg
            v-if="day.hasWorkout"
            width="26"
            height="26"
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

    <!-- Rodapé: data da semana (detalhe secundário) -->
    <div style="display:flex;justify-content:flex-end;">
      <span style="color:#374151;font-size:12px;font-weight:500;line-height:1;">{{ props.weekLabel }}</span>
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
  const base = 'width:76px;height:76px;border-radius:16px;display:flex;align-items:center;justify-content:center;'
  if (day.hasWorkout)
    return `${base}background:rgba(34,197,94,0.18);border:2px solid rgba(34,197,94,0.7);`
  if (day.isToday)
    return `${base}background:rgba(255,255,255,0.07);border:2px solid rgba(255,255,255,0.2);`
  return `${base}background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);`
}
</script>
