<template>
  <Card class="p-4 md:p-6">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold md:text-xl">
        Novo Treino
      </h2>
      <Button variant="ghost" size="icon" class="h-9 w-9" @click="emit('close')">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </Button>
    </div>

    <div class="space-y-4">
      <div class="space-y-2">
        <Label for="template-select">Template</Label>
        <select
          id="template-select"
          v-model="selectedTemplateId"
          class="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          @change="onTemplateSelected"
        >
          <option value="empty">
            Treino vazio
          </option>
          <option
            v-for="template in props.templates"
            :key="template.id"
            :value="template.id"
          >
            {{ template.name }} ({{ template.exercises?.length || 0 }} exercícios)
          </option>
        </select>
        <p v-if="props.templates.length === 0" class="text-xs text-muted-foreground">
          <NuxtLink to="/templates" class="text-primary hover:underline">
            Crie um template
          </NuxtLink>
          para reutilizar treinos.
        </p>
      </div>

      <template v-if="selectedTemplateId === 'empty'">
        <div class="space-y-2">
          <Label for="workout-name" required>Nome</Label>
          <Input
            id="workout-name"
            v-model="newWorkoutName"
            placeholder="Ex: Treino A - Peito"
            required
            class="h-11 text-base"
          />
        </div>
        <div class="space-y-2">
          <Label for="workout-date">Data</Label>
          <Input
            id="workout-date"
            v-model="newWorkoutDate"
            type="date"
            class="h-11 text-base"
          />
        </div>
      </template>

      <div v-else-if="selectedTemplate" class="space-y-3">
        <div class="rounded-lg border bg-muted/30 p-3">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-sm">
                {{ selectedTemplate.name }}
              </p>
              <p v-if="selectedTemplate.description" class="text-xs text-muted-foreground mt-0.5">
                {{ selectedTemplate.description }}
              </p>
            </div>
            <Badge variant="outline" class="font-mono text-xs">
              {{ selectedTemplate.exercises?.length || 0 }} exercícios
            </Badge>
          </div>
        </div>
        <div v-if="selectedTemplate.exercises?.length" class="space-y-1.5">
          <div
            v-for="(ex, idx) in selectedTemplate.exercises"
            :key="ex.id"
            class="flex items-center gap-2 text-sm px-3 py-1.5 rounded-md bg-muted/50"
          >
            <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-medium text-primary">
              {{ idx + 1 }}
            </span>
            <span class="truncate flex-1">{{ ex.name }}</span>
            <span v-if="ex.exercise_type === 'reps'" class="text-xs font-mono text-muted-foreground shrink-0">
              {{ ex.default_sets }}s × {{ ex.default_reps }} reps
            </span>
            <span v-else class="text-xs font-mono text-muted-foreground shrink-0">
              {{ ex.default_sets }}s × {{ ex.default_duration_seconds }}sec
            </span>
          </div>
        </div>
      </div>

      <div class="flex gap-2 pt-2">
        <Button type="button" variant="outline" class="flex-1" @click="emit('close')">
          Cancelar
        </Button>
        <Button
          type="submit"
          class="flex-1"
          :disabled="props.creating || (selectedTemplateId === 'empty' && !newWorkoutName)"
          @click="onSubmit"
        >
          <svg v-if="props.creating" class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {{ props.creating ? 'Criando...' : 'Criar Treino' }}
        </Button>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import type { WorkoutTemplateWithExercises } from '~/types'

const props = withDefaults(defineProps<{
  templates: WorkoutTemplateWithExercises[]
  creating?: boolean
}>(), {
  creating: false,
})

const emit = defineEmits<{
  close: []
  createEmpty: [name: string, date: string]
  createFromTemplate: [templateId: string]
}>()

const { getTodayString } = useDate()

const selectedTemplateId = ref<string | 'empty'>('empty')
const newWorkoutName = ref('')
const newWorkoutDate = ref(getTodayString())

const selectedTemplate = computed(() => {
  if (selectedTemplateId.value === 'empty')
    return null
  return props.templates.find(t => t.id === selectedTemplateId.value) || null
})

function onTemplateSelected() {
  if (selectedTemplateId.value !== 'empty' && selectedTemplate.value) {
    newWorkoutName.value = selectedTemplate.value.name
  }
  else {
    newWorkoutName.value = ''
  }
}

function onSubmit() {
  if (selectedTemplateId.value === 'empty') {
    emit('createEmpty', newWorkoutName.value, newWorkoutDate.value)
  }
  else {
    emit('createFromTemplate', selectedTemplateId.value)
  }
}
</script>
