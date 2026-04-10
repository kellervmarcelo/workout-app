<template>
  <div class="space-y-4 md:space-y-6">
    <!-- Header -->
    <div class="space-y-3 md:flex md:items-start md:justify-between md:space-y-0">
      <div>
        <div class="flex items-center gap-2">
          <NuxtLink to="/" class="text-muted-foreground hover:text-primary transition-colors min-h-[44px] flex items-center">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </NuxtLink>
          <div>
            <h1 class="text-xl font-bold tracking-tight md:text-3xl">
              Meus Templates
            </h1>
            <p class="text-sm text-muted-foreground mt-0.5">
              Templates para reutilizar
            </p>
          </div>
        </div>
      </div>
      <Button size="sm" class="w-full md:w-auto" @click="showCreateDialog = true">
        <svg class="w-4 h-4 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        <span class="hidden sm:inline">Novo Template</span>
        <span class="sm:hidden">Novo</span>
      </Button>
    </div>

    <!-- Create Dialog -->
    <Card v-if="showCreateDialog" class="p-4 md:p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold md:text-xl">
          Novo Template
        </h2>
        <Button variant="ghost" size="icon" class="h-9 w-9" @click="showCreateDialog = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Button>
      </div>
      <form class="space-y-4" @submit.prevent="createTemplate">
        <div class="space-y-2">
          <Label for="template-name" required>Nome</Label>
          <Input
            id="template-name"
            v-model="newTemplateName"
            placeholder="Ex: Treino A - Peito"
            required
            class="h-11 text-base"
          />
        </div>
        <div class="space-y-2">
          <Label for="template-description">Descrição (opcional)</Label>
          <Input
            id="template-description"
            v-model="newTemplateDescription"
            placeholder="Ex: Foco em hipertrofia"
            class="h-11 text-base"
          />
        </div>
        <div class="flex gap-2">
          <Button type="button" variant="outline" class="flex-1" @click="showCreateDialog = false">
            Cancelar
          </Button>
          <Button type="submit" class="flex-1">
            Criar Template
          </Button>
        </div>
      </form>
    </Card>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
        <p class="text-muted-foreground">
          Carregando...
        </p>
      </div>
    </div>

    <!-- Empty State -->
    <Card v-else-if="templates.length === 0" class="p-8 text-center md:p-12">
      <div class="text-5xl mb-4">
        📋
      </div>
      <h3 class="text-lg font-semibold mb-2 md:text-xl">
        Nenhum template ainda
      </h3>
      <p class="text-sm text-muted-foreground">
        Crie templates para reutilizar seus treinos!
      </p>
    </Card>

    <!-- Template List -->
    <div v-else class="space-y-3 md:space-y-4">
      <div
        v-for="template in templates"
        :key="template.id"
      >
        <Card
          class="p-4 transition-all duration-200 md:p-6"
          :class="activeTemplateId === template.id
            ? 'ring-2 ring-primary ring-offset-2 shadow-md'
            : 'hover:shadow-md'"
        >
          <div class="flex items-start justify-between gap-3">
            <div
              class="space-y-1.5 flex-1 min-w-0 cursor-pointer"
              :class="activeTemplateId === template.id ? '' : 'hover:opacity-80'"
              @click="openTemplate(template.id)"
              role="button"
              :aria-expanded="activeTemplateId === template.id"
              :aria-label="`Exercícios de ${template.name}`"
            >
              <div class="flex items-center gap-2">
                <!-- Chevron indicator -->
                <svg
                  class="w-4 h-4 shrink-0 transition-transform duration-200 text-muted-foreground"
                  :class="{ 'rotate-90': activeTemplateId === template.id }"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
                <div class="flex flex-wrap items-center gap-1.5">
                  <h3 class="text-base font-semibold truncate md:text-lg">
                    {{ template.name }}
                  </h3>
                  <Badge
                    variant="outline"
                    class="font-mono text-[10px] shrink-0"
                    :class="activeTemplateId === template.id ? 'bg-primary/10 border-primary/30' : ''"
                  >
                    {{ totalExercises(template) }}
                  </Badge>
                </div>
              </div>
              <p v-if="template.description" class="text-xs text-muted-foreground truncate pl-6 md:text-sm">
                {{ template.description }}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              class="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
              @click.stop="deleteTemplate(template.id)"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </Button>
          </div>
        </Card>

        <!-- Template Detail Panel - slide down with distinct style -->
        <div
          v-if="activeTemplateId === template.id"
          class="overflow-hidden"
          style="animation: slideDown 0.3s ease-out"
        >
          <div class="ml-6 md:ml-8 mt-2 p-4 md:p-6 rounded-lg border-l-4 border-l-primary bg-muted/30 border border-t-0">
            <!-- Section header with distinct styling -->
            <div class="flex items-center justify-between mb-5 pb-3 border-b border-border/50">
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <h2 class="text-base font-semibold md:text-lg">
                  Exercícios
                </h2>
              </div>
              <Button variant="ghost" size="icon" class="h-8 w-8" @click="activeTemplateId = null" aria-label="Fechar painel">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>

            <!-- Add Exercise Form -->
            <form class="space-y-4 mb-6" @submit.prevent="addExercise">
              <div class="space-y-2">
                <Label for="exercise-name" required>Nome do Exercício</Label>
                <Input
                  id="exercise-name"
                  v-model="newExerciseName"
                  placeholder="Ex: Supino Reto"
                  required
                  class="h-10"
                />
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-2">
                  <Label for="exercise-reps">Reps Padrão</Label>
                  <Input
                    id="exercise-reps"
                    v-model.number="newExerciseReps"
                    type="number"
                    min="1"
                    class="h-10 font-mono"
                  />
                </div>
                <div class="space-y-2">
                  <Label for="exercise-weight">Carga (kg)</Label>
                  <Input
                    id="exercise-weight"
                    v-model.number="newExerciseWeight"
                    type="number"
                    step="0.5"
                    min="0"
                    class="h-10 font-mono"
                  />
                </div>
              </div>
              <Button type="submit" size="sm" class="w-full md:w-auto">
                <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Adicionar
              </Button>
            </form>

            <!-- Exercises List -->
            <div v-if="activeTemplate?.exercises?.length" class="space-y-2">
              <div
                v-for="(exercise, idx) in activeTemplate.exercises"
                :key="exercise.id"
                class="group flex items-center justify-between gap-3 px-3 py-2.5 rounded-md bg-background/80 border border-border/50 hover:border-primary/30 hover:bg-background transition-colors"
              >
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                    {{ idx + 1 }}
                  </span>
                  <div class="min-w-0">
                    <p class="font-medium text-sm truncate">{{ exercise.name }}</p>
                    <p class="text-xs text-muted-foreground font-mono">
                      {{ exercise.default_reps }} reps × {{ exercise.default_weight_kg }} kg
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  @click="deleteExercise(exercise.id)"
                  aria-label="Remover exercício"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else class="text-center py-8">
              <svg class="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p class="text-sm font-medium text-muted-foreground">Nenhum exercício</p>
              <p class="text-xs text-muted-foreground/70 mt-1">Adicione exercícios ao template!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

<script setup lang="ts">
import type { Session } from '@supabase/supabase-js'

definePageMeta({ middleware: 'auth' })

const supabase = useSupabaseClient()
const session = ref<Session | null>(null)
const templates = ref<WorkoutTemplateWithExercises[]>([])
const loading = ref(false)
const showCreateDialog = ref(false)
const newTemplateName = ref('')
const newTemplateDescription = ref('')

// Template detail state
const activeTemplateId = ref<string | null>(null)
const newExerciseName = ref('')
const newExerciseReps = ref(10)
const newExerciseWeight = ref(0)

const activeTemplate = computed(() => {
  if (!activeTemplateId.value)
    return null
  return templates.value.find(t => t.id === activeTemplateId.value) || null
})

onMounted(async () => {
  const { data } = await supabase.auth.getSession()
  session.value = data.session

  supabase.auth.onAuthStateChange((_event, newSession) => {
    session.value = newSession
  })

  if (!data.session) {
    navigateTo('/login')
    return
  }

  await fetchTemplates()
})

async function fetchTemplates() {
  if (!session.value?.user)
    return

  loading.value = true
  try {
    const { data, error } = await supabase
      .from('workout_templates')
      .select(`
        *,
        exercises:template_exercises(*)
      `)
      .eq('user_id', session.value.user.id)
      .order('created_at', { ascending: false })

    if (error)
      throw error
    templates.value = data || []
  }
  catch (error: any) {
    console.error('Erro ao buscar templates:', error)
  }
  finally {
    loading.value = false
  }
}

async function createTemplate() {
  if (!session.value?.user || !newTemplateName.value)
    return

  try {
    const { data, error } = await supabase
      .from('workout_templates')
      .insert({
        user_id: session.value.user.id,
        name: newTemplateName.value,
        description: newTemplateDescription.value || null,
      })
      .select()
      .single()

    if (error)
      throw error

    showCreateDialog.value = false
    newTemplateName.value = ''
    newTemplateDescription.value = ''

    await fetchTemplates()

    // Abre o template recém-criado automaticamente
    if (data?.id) {
      activeTemplateId.value = data.id
    }
  }
  catch (error: any) {
    console.error('Erro ao criar template:', error)
  }
}

async function deleteTemplate(id: string) {
  try {
    const { error } = await supabase.from('workout_templates').delete().eq('id', id)
    if (error)
      throw error
    if (activeTemplateId.value === id)
      activeTemplateId.value = null
    await fetchTemplates()
  }
  catch (error: any) {
    console.error('Erro ao deletar template:', error)
  }
}

function totalExercises(template: WorkoutTemplateWithExercises) {
  return template.exercises?.length || 0
}

function openTemplate(id: string) {
  if (activeTemplateId.value === id)
    activeTemplateId.value = null
  else
    activeTemplateId.value = id
}

async function addExercise() {
  if (!activeTemplateId.value || !newExerciseName.value)
    return

  const template = activeTemplate.value
  if (!template)
    return

  const order = template.exercises?.length || 0

  try {
    const { error } = await supabase
      .from('template_exercises')
      .insert({
        template_id: activeTemplateId.value,
        name: newExerciseName.value,
        order,
        default_reps: newExerciseReps.value,
        default_weight_kg: newExerciseWeight.value,
      })

    if (error)
      throw error

    newExerciseName.value = ''
    newExerciseReps.value = 10
    newExerciseWeight.value = 0

    // Recarrega apenas o template ativo
    await fetchTemplates()
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
    await fetchTemplates()
  }
  catch (error: any) {
    console.error('Erro ao deletar exercício:', error)
  }
}
</script>
