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

const fetchTemplates = async () => {
  if (!session.value?.user) return

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

    if (error) throw error
    templates.value = data || []
  } catch (error: any) {
    console.error('Erro ao buscar templates:', error)
  } finally {
    loading.value = false
  }
}

const createTemplate = async () => {
  if (!session.value?.user || !newTemplateName.value) return

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

    if (error) throw error

    showCreateDialog.value = false
    newTemplateName.value = ''
    newTemplateDescription.value = ''

    await fetchTemplates()
    navigateTo(`/templates/${data.id}`)
  } catch (error: any) {
    console.error('Erro ao criar template:', error)
  }
}

const deleteTemplate = async (id: string) => {
  try {
    const { error } = await supabase.from('workout_templates').delete().eq('id', id)
    if (error) throw error
    await fetchTemplates()
  } catch (error: any) {
    console.error('Erro ao deletar template:', error)
  }
}

const totalExercises = (template: WorkoutTemplateWithExercises) => {
  return template.exercises?.length || 0
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <div class="flex items-center gap-2">
          <NuxtLink to="/" class="text-muted-foreground hover:text-primary transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </NuxtLink>
          <div>
            <h1 class="text-3xl font-bold tracking-tight">Meus Templates</h1>
            <p class="text-muted-foreground mt-1">Templates de treino salvos para reutilizar</p>
          </div>
        </div>
      </div>
      <Button @click="showCreateDialog = true">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Novo Template
      </Button>
    </div>

    <!-- Create Dialog -->
    <Card v-if="showCreateDialog" class="p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold">Novo Template</h2>
        <Button variant="ghost" size="icon" class="h-8 w-8" @click="showCreateDialog = false">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Button>
      </div>
      <form @submit.prevent="createTemplate" class="space-y-4">
        <div class="space-y-2">
          <Label for="template-name" required>Nome</Label>
          <Input
            id="template-name"
            v-model="newTemplateName"
            placeholder="Ex: Treino A - Peito e Tríceps"
            required
          />
        </div>
        <div class="space-y-2">
          <Label for="template-description">Descrição (opcional)</Label>
          <Input
            id="template-description"
            v-model="newTemplateDescription"
            placeholder="Ex: Foco em hipertrofia"
          />
        </div>
        <div class="flex gap-2 justify-end">
          <Button type="button" variant="outline" @click="showCreateDialog = false">
            Cancelar
          </Button>
          <Button type="submit">Criar Template</Button>
        </div>
      </form>
    </Card>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p class="text-muted-foreground">Carregando...</p>
      </div>
    </div>

    <!-- Empty State -->
    <Card v-else-if="templates.length === 0" class="p-12 text-center">
      <div class="text-5xl mb-4">📋</div>
      <h3 class="text-xl font-semibold mb-2">Nenhum template ainda</h3>
      <p class="text-muted-foreground">Crie templates para reutilizar seus treinos!</p>
    </Card>

    <!-- Template List -->
    <div v-else class="space-y-4">
      <Card
        v-for="template in templates"
        :key="template.id"
        class="p-6 hover:shadow-md transition-shadow cursor-pointer"
        @click="navigateTo(`/templates/${template.id}`)"
      >
        <div class="flex items-start justify-between">
          <div class="space-y-2 flex-1">
            <div class="flex items-center gap-2">
              <h3 class="text-lg font-semibold">{{ template.name }}</h3>
              <Badge variant="outline" class="font-mono text-xs">
                {{ totalExercises(template) }} exercícios
              </Badge>
            </div>
            <p v-if="template.description" class="text-sm text-muted-foreground">
              {{ template.description }}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            class="h-8 w-8 text-muted-foreground hover:text-destructive"
            @click.stop="deleteTemplate(template.id)"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </Button>
        </div>
      </Card>
    </div>
  </div>
</template>
