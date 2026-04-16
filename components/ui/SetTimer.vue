<template>
  <div class="flex items-center justify-center gap-1.5">
    <!-- Idle -->
    <template v-if="state === 'idle'">
      <button
        type="button"
        class="flex items-center gap-1 h-9 px-2 rounded-md border border-input bg-background text-sm font-mono font-semibold hover:bg-muted transition-colors"
        @click="start"
      >
        <svg class="w-3.5 h-3.5 text-primary shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
        {{ props.durationSeconds }}s
      </button>
    </template>

    <!-- Running -->
    <template v-else-if="state === 'running'">
      <span class="text-sm font-mono font-bold tabular-nums w-10 text-center">
        {{ remaining }}s
      </span>
      <button
        type="button"
        class="h-7 w-7 flex items-center justify-center rounded-md border border-input bg-background text-muted-foreground hover:bg-muted transition-colors"
        title="Parar"
        @click="stop"
      >
        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
        </svg>
      </button>
    </template>

    <!-- Done -->
    <template v-else>
      <div class="flex items-center gap-1 h-9 px-2 text-sm font-semibold text-green-600">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
        </svg>
        Feito
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'

const props = withDefaults(defineProps<{
  durationSeconds?: number
}>(), {
  durationSeconds: 30,
})

const emit = defineEmits<{
  complete: []
}>()

type State = 'idle' | 'running' | 'done'

const state = ref<State>('idle')
const remaining = ref(props.durationSeconds)

let intervalId: ReturnType<typeof setInterval> | null = null
let resetTimeout: ReturnType<typeof setTimeout> | null = null

function start() {
  remaining.value = props.durationSeconds
  state.value = 'running'

  intervalId = setInterval(() => {
    remaining.value--
    if (remaining.value <= 0) {
      clearInterval(intervalId!)
      intervalId = null
      state.value = 'done'
      playBeep()
      emit('complete')
      resetTimeout = setTimeout(() => {
        state.value = 'idle'
        remaining.value = props.durationSeconds
      }, 2500)
    }
  }, 1000)
}

function stop() {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
  state.value = 'idle'
  remaining.value = props.durationSeconds
}

function playBeep() {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    for (let i = 0; i < 3; i++) {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      oscillator.frequency.value = 880
      oscillator.type = 'square'
      const t = audioContext.currentTime + i * 0.3
      gainNode.gain.setValueAtTime(1.0, t)
      gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.25)
      oscillator.start(t)
      oscillator.stop(t + 0.25)
    }
  }
  catch (e) {
    console.warn('Não foi possível reproduzir o beep:', e)
  }
}

onBeforeUnmount(() => {
  if (intervalId)
    clearInterval(intervalId)
  if (resetTimeout)
    clearTimeout(resetTimeout)
})
</script>
