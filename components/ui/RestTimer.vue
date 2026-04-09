<template>
  <div class="rest-timer">
    <!-- Timer Display -->
    <div
      class="flex items-center gap-2 px-3 py-2 rounded-lg border transition-all"
      :class="{
        'border-primary bg-primary/5': isRunning,
        'animate-pulse border-yellow-500 bg-yellow-500/10': isRunning && remainingSeconds <= 10 && remainingSeconds > 0,
        'border-green-500 bg-green-500/10': remainingSeconds === 0 && totalSeconds > 0,
      }"
    >
      <!-- Icon -->
      <svg
        class="w-4 h-4 text-muted-foreground"
        :class="{ 'text-primary': isRunning, 'text-green-500': remainingSeconds === 0 && totalSeconds > 0 }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>

      <!-- Time Display -->
      <span
        class="font-mono text-sm font-semibold min-w-[45px]"
        :class="{
          'text-primary': isRunning,
          'text-green-500': remainingSeconds === 0 && totalSeconds > 0,
          'text-muted-foreground': remainingSeconds === 0 && totalSeconds === 0,
        }"
      >
        {{ remainingSeconds > 0 || totalSeconds === 0 ? displayTime : '00:00' }}
      </span>

      <!-- Controls -->
      <div class="flex items-center gap-1">
        <button
          v-if="remainingSeconds > 0"
          class="h-6 w-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground transition-colors"
          @click="resetTimer"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>

        <button
          class="h-6 w-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground transition-colors"
          @click="toggleTimer"
        >
          <svg v-if="!isRunning" class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          <svg v-else class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Progress Bar -->
    <div
      v-if="totalSeconds > 0 && remainingSeconds >= 0"
      class="mt-1 h-1 rounded-full bg-muted overflow-hidden"
    >
      <div
        class="h-full rounded-full transition-all duration-1000 ease-linear"
        :class="{
          'bg-primary': isRunning,
          'bg-yellow-500': isRunning && remainingSeconds <= 10,
          'bg-green-500': !isRunning && remainingSeconds === 0,
        }"
        :style="{ width: `${progressPercent}%` }"
      />
    </div>

    <!-- Preset Times -->
    <div v-if="showPresets" class="flex gap-1 mt-2">
      <button
        v-for="preset in presetTimes"
        :key="preset"
        class="px-2 py-1 text-xs rounded-md bg-muted hover:bg-muted/80 transition-colors font-mono"
        :class="{ 'bg-primary/20 text-primary hover:bg-primary/30': totalSeconds === preset }"
        @click="startTimer(preset)"
      >
        {{ preset }}s
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

const props = defineProps<{
  defaultSeconds?: number
}>()

const presetTimes = [30, 60, 90, 120]

const totalSeconds = ref(props.defaultSeconds ?? 60)
const remainingSeconds = ref(0)
const isRunning = ref(false)
const showPresets = ref(false)

const displayTime = computed(() => {
  const mins = Math.floor(remainingSeconds.value / 60)
  const secs = remainingSeconds.value % 60
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
  showPresets.value = false

  intervalId = setInterval(() => {
    if (remainingSeconds.value <= 0) {
      stopTimer()
      playBeep()
      return
    }
    remainingSeconds.value--
  }, 1000)
}

function toggleTimer() {
  if (isRunning.value) {
    pauseTimer()
  }
  else if (remainingSeconds.value > 0) {
    resumeTimer()
  }
  else {
    showPresets.value = !showPresets.value
  }
}

function pauseTimer() {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
  isRunning.value = false
}

function resumeTimer() {
  if (remainingSeconds.value <= 0)
    return

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

function resetTimer() {
  pauseTimer()
  remainingSeconds.value = 0
  showPresets.value = false
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
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = 800
    oscillator.type = 'sine'

    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
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
