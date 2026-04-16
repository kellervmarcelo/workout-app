<template>
  <div class="rest-timer space-y-4">
    <!-- Tempo configurado (readonly: exibe como texto; editável: exibe input) -->
    <div class="flex items-center justify-center gap-3">
      <div v-if="!props.readonly" class="relative">
        <input
          v-model.number="totalSeconds"
          type="number"
          min="5"
          max="999"
          step="5"
          class="w-32 h-16 text-center text-4xl font-mono font-bold rounded-lg border-2 border-input bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
          @keydown.enter="startTimer(totalSeconds)"
        >
        <span class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
          s
        </span>
      </div>
      <div v-else class="text-5xl font-mono font-bold tabular-nums">
        {{ isRunning ? displayTime : displayTotal }}
      </div>
    </div>

    <!-- Start Button -->
    <Button
      size="lg"
      class="w-full h-14 text-lg font-semibold"
      :class="isRunning ? 'bg-destructive hover:bg-destructive/90' : ''"
      @click="isRunning ? stopTimer() : startTimer(totalSeconds)"
    >
      <svg v-if="!isRunning" class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z" />
      </svg>
      <svg v-else class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
      </svg>
      {{ isRunning ? displayTime : 'Iniciar' }}
    </Button>

    <!-- Progress Bar -->
    <div
      v-if="isRunning && totalSeconds > 0"
      class="h-2 rounded-full bg-muted overflow-hidden"
    >
      <div
        class="h-full rounded-full transition-all duration-1000 ease-linear bg-primary"
        :style="{ width: `${progressPercent}%` }"
      />
    </div>

    <!-- Preset Times (somente no modo editável) -->
    <div v-if="!props.readonly" class="grid grid-cols-4 gap-2">
      <Button
        v-for="preset in presetTimes"
        :key="preset"
        variant="outline"
        size="sm"
        class="font-mono font-semibold"
        :class="{ 'border-primary bg-primary/10 text-primary': totalSeconds === preset }"
        @click="totalSeconds = preset"
      >
        {{ preset }}s
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

const props = defineProps<{
  defaultSeconds?: number
  readonly?: boolean
}>()

const presetTimes = [30, 60, 90, 120]

const totalSeconds = ref(props.defaultSeconds ?? 60)
const remainingSeconds = ref(0)
const isRunning = ref(false)

const displayTime = computed(() => {
  const mins = Math.floor(remainingSeconds.value / 60)
  const secs = remainingSeconds.value % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
})

const displayTotal = computed(() => {
  const mins = Math.floor(totalSeconds.value / 60)
  const secs = totalSeconds.value % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
})

const progressPercent = computed(() => {
  if (totalSeconds.value === 0)
    return 0
  return ((totalSeconds.value - remainingSeconds.value) / totalSeconds.value) * 100
})

let intervalId: ReturnType<typeof setInterval> | null = null

function startTimer(seconds: number) {
  if (isRunning.value)
    return

  totalSeconds.value = seconds
  remainingSeconds.value = seconds
  isRunning.value = true

  intervalId = setInterval(() => {
    if (remainingSeconds.value <= 0) {
      stopTimer()
      playBeep()
      return
    }
    remainingSeconds.value--
  }, 1000)
}

function stopTimer() {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
  isRunning.value = false
  remainingSeconds.value = 0
}

function playBeep() {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

    // Play 3 beeps to be more noticeable over music
    for (let i = 0; i < 3; i++) {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 880 // Higher pitch
      oscillator.type = 'square' // More piercing sound

      const startTime = audioContext.currentTime + (i * 0.3)
      gainNode.gain.setValueAtTime(1.0, startTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.25)

      oscillator.start(startTime)
      oscillator.stop(startTime + 0.25)
    }
  }
  catch (e) {
    console.warn('Não foi possível reproduzir o beep:', e)
  }
}
onBeforeUnmount(() => {
  if (intervalId)
    clearInterval(intervalId)
})
</script>
