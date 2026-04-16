<template>
  <div v-if="template" class="space-y-6">
    <!-- Header -->
    <div class="space-y-4">
      <NuxtLink to="/templates" class="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Voltar aos templates
      </NuxtLink>

      <div class="flex items-start justify-between">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">
            {{ template.name }}
          </h1>
          <p v-if="template.description" class="text-muted-foreground mt-1">
            {{ template.description }}
          </p>
        </div>
        <Button @click="showExerciseForm = true">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Exercício
        </Button>
      </div>
    </div>

    <!-- Exercise Form -->
    <Card v-if="showExerciseForm" class="p-6">
      <h2 class="text-xl font-semibold mb-4">
        Adicionar Exercício ao Template
      </h2>
      <form class="space-y-4" @submit.prevent="addExercise">
        <div class="space-y-2">
          <Label for="exercise-name" required>Nome do Exercício</Label>
          <Input
            id="exercise-name"
            v-model="newExerciseName"
            placeholder="Ex: Supino Reto"
            required
          />
        </div>

        <!-- Tipo -->
        <div class="flex gap-1 bg-muted rounded-md p-1">
          <button
            type="button"
            class="flex-1 rounded px-2 py-1 text-xs font-medium transition-colors"
            :class="newExerciseType === 'reps' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'"
            @click="newExerciseType = 'reps'"
          >
            Reps
          </button>
          <button
            type="button"
            class="flex-1 rounded px-2 py-1 text-xs font-medium transition-colors"
            :class="newExerciseType === 'time' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'"
            @click="newExerciseType = 'time'"
          >
            Tempo
          </button>
        </div>

        <div class="grid grid-cols-3 gap-4">
          <div class="space-y-2">
            <Label :for="newExerciseType === 'time' ? 'exercise-duration' : 'exercise-reps'">
              {{ newExerciseType === 'time' ? 'Duração Padrão (s)' : 'Reps Padrão' }}
            </Label>
            <Input
              v-if="newExerciseType === 'time'"
              id="exercise-duration"
              :model-value="String(newExerciseDuration)"
              type="number"
              min="5"
              step="5"
              @update:model-value="newExerciseDuration = Number($event)"
            />
            <Input
              v-else
              id="exercise-reps"
              :model-value="String(newExerciseReps)"
              type="number"
              min="1"
              @update:model-value="newExerciseReps = Number($event)"
            />
          </div>
          <div class="space-y-2">
            <Label for="exercise-weight">Carga Padrão (kg)</Label>
            <Input
              id="exercise-weight"
              :model-value="String(newExerciseWeight)"
              type="number"
              step="0.5"
              min="0"
              @update:model-value="newExerciseWeight = Number($event)"
            />
          </div>
          <div class="space-y-2">
            <Label for="exercise-rest">Descanso (s)</Label>
            <Input
              id="exercise-rest"
              :model-value="String(newExerciseRest)"
              type="number"
              step="5"
              min="0"
              @update:model-value="newExerciseRest = Number($event)"
            />
          </div>
        </div>
        <div class="flex gap-2 justify-end">
          <Button type="button" variant="outline" @click="showExerciseForm = false">
            Cancelar
          </Button>
          <Button type="submit">
            Adicionar
          </Button>
        </div>
      </form>
    </Card>

    <!-- Exercises -->
    <div v-if="template.exercises?.length" class="space-y-4">
      <Collapsible
        v-for="(exercise, idx) in template.exercises"
        :key="exercise.id"
      >
        <template #title>
          <div class="flex items-center gap-3">
            <Badge variant="outline" class="font-mono">
              {{ idx + 1 }}
            </Badge>
            <h3 class="text-lg font-semibold">
              {{ exercise.name }}
            </h3>
          </div>
        </template>

        <div class="space-y-3 pt-2">
          <div class="grid grid-cols-3 gap-4">
            <div class="space-y-2">
              <Label class="text-sm text-muted-foreground">
                {{ exercise.exercise_type === 'time' ? 'Duração Padrão (s)' : 'Reps Padrão' }}
              </Label>
              <Input
                v-if="exercise.exercise_type === 'time'"
                :model-value="String(exercise.default_duration_seconds ?? 30)"
                type="number"
                min="5"
                step="5"
                class="font-mono"
                @update:model-value="updateExerciseDefaults(exercise.id, 'default_duration_seconds', Number($event))"
              />
              <Input
                v-else
                :model-value="String(exercise.default_reps)"
                type="number"
                min="1"
                class="font-mono"
                @update:model-value="updateExerciseDefaults(exercise.id, 'default_reps', Number($event))"
              />
            </div>
            <div class="space-y-2">
              <Label class="text-sm text-muted-foreground">Carga Padrão (kg)</Label>
              <Input
                :model-value="String(exercise.default_weight_kg)"
                type="number"
                step="0.5"
                min="0"
                class="font-mono"
                @update:model-value="updateExerciseDefaults(exercise.id, 'default_weight_kg', Number($event))"
              />
            </div>
            <div class="space-y-2">
              <Label class="text-sm text-muted-foreground">Descanso (s)</Label>
              <Input
                :model-value="String(exercise.default_rest_seconds)"
                type="number"
                step="5"
                min="0"
                class="font-mono"
                @update:model-value="updateExerciseDefaults(exercise.id, 'default_rest_seconds', Number($event))"
              />
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            class="text-destructive hover:text-destructive"
            @click="deleteExercise(exercise.id)"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Remover Exercício
          </Button>
        </div>
      </Collapsible>
    </div>

    <!-- Empty State -->
    <Card v-else class="p-12 text-center">
      <div class="text-5xl mb-4">
        📋
      </div>
      <h3 class="text-xl font-semibold mb-2">
        Nenhum exercício
      </h3>
      <p class="text-muted-foreground">
        Adicione exercícios ao seu template!
      </p>
    </Card>
  </div>

  <!-- Loading -->
  <div v-else class="flex justify-center py-12">
    <div class="text-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
      <p class="text-muted-foreground">
        Carregando...
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const route = useRoute()
const templateId = computed(() => route.params.id as string)

const supabase = useSupabaseClient()

const template = ref<WorkoutTemplateWithExercises | null>(null)

useHead(() => ({ title: template.value?.name ? `YAFA — ${template.value.name}` : 'YAFA — Template' }))
const loading = ref(false)
const showExerciseForm = ref(false)
const newExerciseName = ref('')
const newExerciseReps = ref(10)
const newExerciseWeight = ref(0)
const newExerciseRest = ref(60)
const newExerciseType = ref<'reps' | 'time'>('reps')
const newExerciseDuration = ref(30)

async function fetchTemplate() {
  if (!templateId.value)
    return

  loading.value = true
  try {
    const { data, error } = await supabase
      .from('workout_templates')
      .select(`
        *,
        exercises:template_exercises(*)
      `)
      .eq('id', templateId.value)
      .single()

    if (error)
      throw error
    template.value = data
  }
  catch (error: any) {
    console.error('Erro ao buscar template:', error)
  }
  finally {
    loading.value = false
  }
}

// Watch para reagir a mudanças de rota em SPA
watch(() => route.params.id, () => {
  fetchTemplate()
})

onMounted(fetchTemplate)

async function addExercise() {
  if (!template.value || !newExerciseName.value)
    return

  const order = template.value.exercises?.length || 0

  try {
    const isTime = newExerciseType.value === 'time'
    const { data: _data, error } = await supabase
      .from('template_exercises')
      .insert({
        template_id: templateId.value,
        name: newExerciseName.value,
        order,
        default_reps: isTime ? 0 : newExerciseReps.value,
        default_weight_kg: newExerciseWeight.value,
        default_rest_seconds: newExerciseRest.value,
        exercise_type: newExerciseType.value,
        default_duration_seconds: isTime ? newExerciseDuration.value : null,
      })
      .select()
      .single()

    if (error)
      throw error

    newExerciseName.value = ''
    newExerciseReps.value = 10
    newExerciseWeight.value = 0
    newExerciseRest.value = 60
    newExerciseType.value = 'reps'
    newExerciseDuration.value = 30
    showExerciseForm.value = false
    await fetchTemplate()
  }
  catch (error: any) {
    console.error('Erro ao adicionar exercício:', error)
  }
}

async function deleteExercise(exerciseId: string) {
  try {
    const { error } = await supabase.from('template_exercises').delete().eq('id', exerciseId)
    if (error)
      throw error
    await fetchTemplate()
  }
  catch (error: any) {
    console.error('Erro ao deletar exercício:', error)
  }
}

async function updateExerciseDefaults(exerciseId: string, field: keyof TemplateExercise, value: number) {
  try {
    const { error } = await supabase
      .from('template_exercises')
      .update({ [field]: value })
      .eq('id', exerciseId)

    if (error)
      throw error
  }
  catch (error: any) {
    console.error('Erro ao atualizar exercício:', error)
  }
}
</script>
