<template>
  <SwipeToDelete
    ref="swipeRef"
    @delete="emit('delete', props.exercise.id)"
    @swipe-open="emit('swipeOpen', props.exercise.id)"
  >
    <Collapsible
      ref="collapsibleRef"
      :default-open="!props.exercise.sets?.every(s => s.completed)"
    >
      <template #title>
        <div class="flex items-center gap-2 md:gap-3 min-w-0">
          <Badge variant="outline" class="font-mono text-xs shrink-0">
            {{ props.idx + 1 }}
          </Badge>
          <h3 class="text-sm font-semibold md:text-lg truncate min-w-0">
            {{ props.exercise.name }}
          </h3>
          <Badge variant="secondary" class="text-[10px] shrink-0">
            {{ completedCount }}/{{ props.exercise.sets?.length || 0 }}
          </Badge>
        </div>
      </template>

      <div class="overflow-x-auto -mx-1 px-1">
        <table class="w-full text-sm table-fixed">
          <colgroup>
            <col class="w-8">
            <col class="w-24">
            <col class="w-24">
          </colgroup>
          <thead>
            <tr class="text-muted-foreground border-b">
              <th class="py-3 px-1 text-center">
                <input
                  type="checkbox"
                  :checked="props.exercise.sets?.length ? props.exercise.sets.every(s => s.completed) : false"
                  :indeterminate.prop="props.exercise.sets?.length ? props.exercise.sets.some(s => s.completed) && !props.exercise.sets.every(s => s.completed) : false"
                  class="h-4 w-4 rounded border-input text-primary focus:ring-primary cursor-pointer mx-auto"
                  @change="emit('toggleAllSets', props.exercise.id, props.exercise.sets || [])"
                >
              </th>
              <th class="py-3 px-1 text-center font-medium text-xs">
                {{ props.exercise.exercise_type === 'time' ? 'Tempo' : 'Reps' }}
              </th>
              <th class="py-3 px-1 text-center font-medium text-xs">
                Kg
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="set in props.exercise.sets" :key="set.id" class="border-b last:border-0 hover:bg-muted/20">
              <td class="py-3 px-1 text-center">
                <input
                  type="checkbox"
                  :checked="!!set.completed"
                  class="h-4 w-4 rounded border-input text-primary focus:ring-primary cursor-pointer"
                  @change="emit('toggleSet', set.id, set.completed)"
                >
              </td>
              <td class="py-3 px-1">
                <SetTimer
                  v-if="props.exercise.exercise_type === 'time'"
                  :duration-seconds="set.duration_seconds || 30"
                  @complete="emit('toggleSet', set.id, false)"
                />
                <Input
                  v-else
                  :model-value="String(set.reps)"
                  type="number"
                  min="1"
                  class="h-9 text-center text-sm font-mono"
                  @update:model-value="emit('updateSet', set.id, 'reps', Number($event))"
                />
              </td>
              <td class="py-3 px-1">
                <Input
                  :model-value="String(set.weight_kg)"
                  type="number"
                  step="0.5"
                  min="0"
                  class="h-9 text-center text-sm font-mono"
                  @update:model-value="emit('updateSet', set.id, 'weight_kg', Number($event))"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <Button variant="outline" size="sm" class="mt-3 w-full h-10" @click="emit('addSet', props.exercise.id)">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Adicionar Série
      </Button>

      <Button variant="outline" size="sm" class="mt-2 w-full h-10" @click="emit('openTimer', props.exercise)">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Timer de Descanso
      </Button>

      <Button
        variant="outline"
        size="sm"
        class="mt-2 w-full h-10 text-destructive hover:text-destructive"
        @click="emit('delete', props.exercise.id)"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Remover Exercício
      </Button>
    </Collapsible>
  </SwipeToDelete>
</template>

<script setup lang="ts">
import type { ExerciseWithSets, WorkoutSet } from '~/types'

const props = defineProps<{
  exercise: ExerciseWithSets
  idx: number
}>()

const emit = defineEmits<{
  addSet: [exerciseId: string]
  updateSet: [setId: string, field: keyof WorkoutSet, value: number]
  toggleSet: [setId: string, currentCompleted: boolean | undefined]
  toggleAllSets: [exerciseId: string, sets: WorkoutSet[]]
  delete: [exerciseId: string]
  openTimer: [exercise: ExerciseWithSets]
  swipeOpen: [exerciseId: string]
}>()

const swipeRef = ref<{ close: () => void } | null>(null)
const collapsibleRef = ref<{ close: () => void } | null>(null)

const completedCount = computed(() =>
  (props.exercise.sets || []).filter(s => s.completed).length,
)

function closeSwipe() {
  swipeRef.value?.close()
}

function collapseAccordion() {
  collapsibleRef.value?.close()
}

defineExpose({ closeSwipe, collapseAccordion })
</script>
