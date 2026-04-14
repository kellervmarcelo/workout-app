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
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="exercise-reps">Reps Padrão</Label>
            <Input
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
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label class="text-sm text-muted-foreground">Reps Padrão</Label>
              <Input
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
const loading = ref(false)
const showExerciseForm = ref(false)
const newExerciseName = ref('')
const newExerciseReps = ref(10)
const newExerciseWeight = ref(0)

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
    const { data: _data, error } = await supabase
      .from('template_exercises')
      .insert({
        template_id: templateId.value,
        name: newExerciseName.value,
        order,
        default_reps: newExerciseReps.value,
        default_weight_kg: newExerciseWeight.value,
      })
      .select()
      .single()

    if (error)
      throw error

    newExerciseName.value = ''
    newExerciseReps.value = 10
    newExerciseWeight.value = 0
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
