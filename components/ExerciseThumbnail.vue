<template>
  <div
    class="w-16 h-16 rounded-md overflow-hidden shrink-0 flex items-center justify-center"
    :style="{ backgroundColor: color }"
  >
    <!-- Tenta carregar imagem externa primeiro -->
    <img
      v-if="imageUrl && imageUrl.startsWith('http')"
      :src="imageUrl"
      :alt="name"
      class="w-full h-full object-cover"
      loading="lazy"
      @error="imageFailed = true"
    >

    <!-- Fallback SVG inline quando imagem falha ou é local -->
    <svg
      v-if="imageFailed || !imageUrl || !imageUrl.startsWith('http')"
      class="w-full h-full"
      viewBox="0 0 128 128"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="128" height="128" :fill="color" />
      <text
        x="64"
        y="58"
        font-family="Arial, sans-serif"
        font-size="13"
        font-weight="bold"
        fill="white"
        text-anchor="middle"
      >
        {{ name }}
      </text>
      <text
        x="64"
        y="76"
        font-family="Arial, sans-serif"
        font-size="11"
        fill="rgba(255,255,255,0.85)"
        text-anchor="middle"
      >
        {{ muscleGroup?.toUpperCase() }}
      </text>
    </svg>
  </div>
</template>

<script setup lang="ts">
import type { MuscleGroup } from '~/types'

interface Props {
  imageUrl?: string
  name?: string
  muscleGroup?: MuscleGroup
}

const props = withDefaults(defineProps<Props>(), {
  imageUrl: '',
  name: 'Exercício',
  muscleGroup: 'peito',
})

const imageFailed = ref(false)

const muscleColors: Record<MuscleGroup, string> = {
  peito: '#ef4444',
  costas: '#3b82f6',
  pernas: '#10b981',
  ombro: '#f59e0b',
  bíceps: '#8b5cf6',
  tríceps: '#ec4899',
  core: '#06b6d4',
  glúteos: '#f97316',
  panturrilha: '#14b8a6',
}

const color = muscleColors[props.muscleGroup] || '#6b7280'
</script>
