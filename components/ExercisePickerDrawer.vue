<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="props.open" class="fixed inset-0 z-50 flex items-end md:items-center justify-center">
        <!-- Overlay -->
        <div
          ref="overlayRef"
          class="fixed inset-0 bg-black/50 backdrop-blur-sm"
          @click="handleOverlayClick"
        />

        <!-- Drawer Panel -->
        <div class="relative z-10 w-full max-h-[90vh] md:max-w-2xl bg-background border rounded-t-xl md:rounded-xl shadow-xl flex flex-col">
          <!-- Header -->
          <div class="flex items-center justify-between px-4 py-3 border-b shrink-0">
            <h2 class="text-lg font-semibold">
              Adicionar Exercício
            </h2>
            <button
              class="h-8 w-8 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              @click="handleClose"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Search Bar -->
          <div class="px-4 py-3 border-b shrink-0">
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Buscar exercício..."
                class="w-full h-10 pl-9 pr-4 rounded-md border border-input bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
              >
            </div>
          </div>

          <!-- Muscle Group Filters -->
          <div class="px-4 py-2 border-b shrink-0">
            <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
              <button
                class="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors"
                :class="!selectedGroup
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'"
                @click="setGroup(null)"
              >
                Todos
              </button>
              <button
                v-for="group in [
                  { value: 'peito' as MuscleGroup, label: 'Peito' },
                  { value: 'costas' as MuscleGroup, label: 'Costas' },
                  { value: 'pernas' as MuscleGroup, label: 'Pernas' },
                  { value: 'ombro' as MuscleGroup, label: 'Ombro' },
                  { value: 'bíceps' as MuscleGroup, label: 'Bíceps' },
                  { value: 'tríceps' as MuscleGroup, label: 'Tríceps' },
                  { value: 'core' as MuscleGroup, label: 'Core' },
                  { value: 'glúteos' as MuscleGroup, label: 'Glúteos' },
                  { value: 'panturrilha' as MuscleGroup, label: 'Panturrilha' },
                ]"
                :key="group.value"
                class="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors"
                :class="selectedGroup === group.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'"
                @click="setGroup(group.value)"
              >
                {{ group.label }}
              </button>
            </div>
          </div>

          <!-- Exercise List -->
          <div class="flex-1 overflow-y-auto">
            <div v-if="filteredExercises.length === 0" class="py-12 text-center text-muted-foreground">
              <svg class="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-sm">
                Nenhum exercício encontrado
              </p>
            </div>

            <div v-else class="divide-y">
              <button
                v-for="exercise in filteredExercises"
                :key="exercise.id"
                class="w-full px-4 py-3 flex items-start gap-3 hover:bg-muted/50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                :class="{ 'opacity-50 cursor-not-allowed': isAdded(exercise.name) }"
                :disabled="isAdded(exercise.name)"
                @click="handleSelect(exercise)"
              >
                <!-- GIF Thumbnail -->
                <div class="w-16 h-16 rounded-md overflow-hidden bg-muted shrink-0">
                  <img
                    :src="exercise.gifUrl"
                    :alt="exercise.name"
                    class="w-full h-full object-cover"
                    loading="lazy"
                    @error="($event.target as HTMLImageElement).style.display = 'none'"
                  >
                </div>

                <!-- Info -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <h3 class="text-sm font-semibold truncate">
                      {{ exercise.name }}
                    </h3>
                    <Badge v-if="isAdded(exercise.id)" variant="outline" class="text-[10px]">
                      Adicionado
                    </Badge>
                  </div>
                  <p class="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {{ exercise.description }}
                  </p>
                  <Badge variant="secondary" class="mt-1.5 text-[10px]">
                    {{ exercise.muscleGroup.charAt(0).toUpperCase() + exercise.muscleGroup.slice(1) }}
                  </Badge>
                </div>
              </button>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-4 py-3 border-t shrink-0">
            <button
              class="w-full h-10 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              @click="emit('addCustom')"
            >
              + Exercício customizado
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { ExerciseLibraryItem, MuscleGroup } from '~/types'
import { useExerciseLibrary } from '~/composables/useExerciseLibrary'

interface Props {
  open?: boolean
  addedExerciseNames?: string[]
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  addedExerciseNames: () => [],
  class: '',
})

const emit = defineEmits<{
  close: []
  select: [exercise: ExerciseLibraryItem]
  addCustom: []
}>()

const { searchQuery, selectedGroup, filteredExercises, setGroup, resetFilters } = useExerciseLibrary()

const overlayRef = ref<HTMLDivElement>()

function isAdded(exerciseName: string) {
  return props.addedExerciseNames.includes(exerciseName.toLowerCase())
}

function handleSelect(exercise: ExerciseLibraryItem) {
  if (isAdded(exercise.name))
    return
  emit('select', exercise)
}

function handleOverlayClick(e: MouseEvent) {
  if (e.target === overlayRef.value) {
    emit('close')
  }
}

function handleClose() {
  resetFilters()
  emit('close')
}

onKeyStroke('Escape', (e) => {
  if (props.open) {
    e.preventDefault()
    handleClose()
  }
})

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden'
  }
  else {
    document.body.style.overflow = ''
  }
})

onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<style scoped>
/* Drawer transitions */
.drawer-enter-active,
.drawer-leave-active {
  transition: all 0.25s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-from .bg-black\/50,
.drawer-leave-to .bg-black\/50 {
  opacity: 0;
}

.drawer-enter-from > div:last-child,
.drawer-leave-to > div:last-child {
  transform: translateY(100%);
}

.drawer-enter-active > div:last-child,
.drawer-leave-active > div:last-child {
  transition: transform 0.25s ease;
}

@media (min-width: 768px) {
  .drawer-enter-from > div:last-child,
  .drawer-leave-to > div:last-child {
    transform: scale(0.95) translateY(10px);
  }
}

/* Line clamp utility */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Thin scrollbar for filter row */
.scrollbar-thin::-webkit-scrollbar {
  height: 4px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: hsl(var(--muted));
  border-radius: 2px;
}
</style>
