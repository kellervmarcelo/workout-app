<template>
  <NuxtLink :to="`/workouts/${props.workout.id}`" class="block">
    <Card class="p-4 hover:shadow-md transition-shadow md:p-6">
      <div class="flex items-start justify-between gap-3">
        <div class="space-y-1.5 flex-1 min-w-0 md:space-y-2">
          <div class="flex flex-wrap items-center gap-1.5">
            <h3 class="text-base font-semibold truncate md:text-lg">
              {{ props.workout.name }}
            </h3>
            <Badge data-tour="stats" variant="outline" class="font-mono text-[10px] shrink-0">
              {{ props.workout.exercises?.length || 0 }}
            </Badge>
            <Badge
              v-if="props.workout.completed_at"
              variant="outline"
              class="text-[10px] shrink-0 border-green-500/50 text-green-600 bg-green-500/10"
            >
              ✓ Concluído
            </Badge>
          </div>
          <div class="flex flex-wrap items-center gap-2 text-xs text-muted-foreground md:gap-4 md:text-sm">
            <span class="flex items-center gap-1">
              <svg class="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {{ formatDisplayDate(props.workout.date) }}
            </span>
            <span v-if="duration" class="flex items-center gap-1">
              <svg class="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ duration }}
            </span>
            <span v-if="volume > 0" class="flex items-center gap-1">
              <svg class="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span class="truncate">{{ volume.toLocaleString('pt-BR') }} kg</span>
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          class="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
          @click.stop="emit('delete', props.workout.id)"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </Button>
      </div>
    </Card>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { WorkoutWithExercises } from '~/types'

const props = defineProps<{ workout: WorkoutWithExercises }>()
const emit = defineEmits<{ delete: [id: string] }>()

const { totalVolume, formatDuration } = useWorkoutMetrics()
const { formatDisplayDate } = useDate()

const volume = computed(() => totalVolume(props.workout.exercises || []))
const duration = computed(() => formatDuration(props.workout.started_at, props.workout.completed_at))
</script>
