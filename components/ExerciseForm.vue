<template>
  <form class="space-y-4" @submit.prevent="onSubmit">
    <div class="space-y-2">
      <Label for="exercise-name" required>Nome do Exercício</Label>
      <Input
        id="exercise-name"
        v-model="form.name"
        placeholder="Ex: Supino Reto"
        required
        class="h-10"
      />
    </div>

    <div class="flex gap-1 bg-muted rounded-md p-1">
      <button
        type="button"
        class="flex-1 rounded px-2 py-1 text-xs font-medium transition-colors"
        :class="form.type === 'reps' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'"
        @click="form.type = 'reps'"
      >
        Reps
      </button>
      <button
        type="button"
        class="flex-1 rounded px-2 py-1 text-xs font-medium transition-colors"
        :class="form.type === 'time' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'"
        @click="form.type = 'time'"
      >
        Tempo
      </button>
    </div>

    <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
      <div class="space-y-2">
        <Label :for="form.type === 'time' ? 'exercise-duration' : 'exercise-reps'">
          {{ form.type === 'time' ? 'Duração (s)' : 'Reps' }}
        </Label>
        <Input
          v-if="form.type === 'time'"
          id="exercise-duration"
          :model-value="String(form.duration)"
          type="number"
          min="5"
          step="5"
          class="h-10 font-mono"
          @update:model-value="form.duration = Number($event)"
        />
        <Input
          v-else
          id="exercise-reps"
          :model-value="String(form.reps)"
          type="number"
          min="1"
          class="h-10 font-mono"
          @update:model-value="form.reps = Number($event)"
        />
      </div>
      <div class="space-y-2">
        <Label for="exercise-sets">Séries</Label>
        <Input
          id="exercise-sets"
          :model-value="String(form.sets)"
          type="number"
          min="1"
          class="h-10 font-mono"
          @update:model-value="form.sets = Number($event)"
        />
      </div>
      <div class="space-y-2">
        <Label for="exercise-weight">Carga (kg)</Label>
        <Input
          id="exercise-weight"
          :model-value="String(form.weight)"
          type="number"
          step="0.5"
          min="0"
          class="h-10 font-mono"
          @update:model-value="form.weight = Number($event)"
        />
      </div>
      <div class="space-y-2">
        <Label for="exercise-rest">Descanso (s)</Label>
        <Input
          id="exercise-rest"
          :model-value="String(form.rest)"
          type="number"
          step="5"
          min="0"
          class="h-10 font-mono"
          @update:model-value="form.rest = Number($event)"
        />
      </div>
    </div>

    <div class="flex gap-2" :class="props.showCancel ? 'justify-end' : ''">
      <Button v-if="props.showCancel" type="button" variant="outline" @click="emit('cancel')">
        Cancelar
      </Button>
      <Button type="submit" size="sm" :class="props.showCancel ? '' : 'w-full md:w-auto'">
        <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Adicionar
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
import type { ExerciseType } from '~/types'

export interface ExerciseFormValues {
  name: string
  type: ExerciseType
  sets: number
  reps: number
  duration: number
  weight: number
  rest: number
}

const props = withDefaults(defineProps<{
  showCancel?: boolean
}>(), {
  showCancel: false,
})

const emit = defineEmits<{
  submit: [values: ExerciseFormValues]
  cancel: []
}>()

const form = reactive<ExerciseFormValues>({
  name: '',
  type: 'reps',
  sets: 3,
  reps: 10,
  duration: 30,
  weight: 0,
  rest: 60,
})

function onSubmit() {
  if (!form.name)
    return
  emit('submit', { ...form })
  Object.assign(form, { name: '', type: 'reps', sets: 3, reps: 10, duration: 30, weight: 0, rest: 60 })
}
</script>
