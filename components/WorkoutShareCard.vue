<template>
  <div
    aria-label="`${props.workoutCount} treinos na semana de ${props.weekLabel}`"
    style="display:inline-flex;align-items:center;gap:18px;background:rgba(10,20,43,0.94);border:1px solid rgba(255,255,255,0.14);border-radius:22px;padding:22px 26px;box-shadow:0 12px 36px rgba(0,0,0,0.5);font-family:'Inter',system-ui,sans-serif;color:#f4f8fc;box-sizing:border-box;"
  >
    <!-- Mascote -->
    <img
      v-if="props.logoSrc"
      :src="props.logoSrc"
      alt=""
      style="width:110px;height:110px;object-fit:contain;flex-shrink:0;display:block;"
    >

    <!-- Coluna central: contagem + data -->
    <div style="display:flex;flex-direction:column;gap:6px;padding-right:24px;border-right:1px solid rgba(255,255,255,0.12);min-width:220px;">
      <div style="display:flex;align-items:baseline;gap:12px;">
        <span :style="countStyle">{{ props.workoutCount }}</span>
        <span style="font-family:'Inter',system-ui,sans-serif;font-size:19px;font-weight:600;color:#e6eef8;line-height:1;">treinos</span>
      </div>
      <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:13px;font-weight:600;color:#a8d4f0;letter-spacing:0.04em;text-transform:uppercase;line-height:1;">
        {{ props.weekLabel }} · {{ props.weekYear }}
      </div>
    </div>

    <!-- Coluna direita: semana + dots -->
    <div style="display:flex;flex-direction:column;align-items:center;gap:12px;padding-left:8px;">
      <div style="font-family:'Inter',system-ui,sans-serif;font-size:11px;font-weight:700;color:#7fb8e0;letter-spacing:0.4em;line-height:1;">
        {{ isFullWeek ? 'SEMANA CHEIA' : 'SEMANA' }}
      </div>
      <div style="display:flex;gap:9px;align-items:center;">
        <span
          v-for="day in props.weekDays"
          :key="day.date"
          :style="day.hasWorkout ? dotOnStyle : dotOffStyle"
        />
      </div>
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
  weekYear?: number
}>(), {
  weekDays: () => [],
  workoutCount: 0,
  logoSrc: '',
  weekLabel: '',
  weekYear: new Date().getFullYear(),
})

const isFullWeek = computed(() => props.workoutCount === 7)

const countStyle = computed(() => {
  const base = `font-family:'Inter Tight',system-ui,sans-serif;font-size:60px;font-weight:800;letter-spacing:-0.02em;line-height:1;background:linear-gradient(180deg,#ffffff 0%,#a8d4f0 100%);-webkit-background-clip:text;background-clip:text;color:transparent;`
  if (props.workoutCount === 0)
    return base.replace('#ffffff 0%,#a8d4f0', '#7fb8e0 0%,#7fb8e0')
  return base
})

const dotOnStyle = 'width:14px;height:14px;border-radius:50%;background:#a8d4f0;box-shadow:0 0 10px rgba(168,212,240,0.6);flex-shrink:0;display:inline-block;'
const dotOffStyle = 'width:14px;height:14px;border-radius:50%;background:rgba(255,255,255,0.20);flex-shrink:0;display:inline-block;'
</script>
