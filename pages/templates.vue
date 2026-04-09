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
      <Card
        v-for="template in templates"
        :key="template.id"
        class="p-4 hover:shadow-md transition-shadow cursor-pointer md:p-6"
        @click="navigateTo(`/templates/${template.id}`)"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="space-y-1.5 flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-1.5">
              <h3 class="text-base font-semibold truncate md:text-lg">
                {{ template.name }}
              </h3>
              <Badge variant="outline" class="font-mono text-[10px] shrink-0">
                {{ totalExercises(template) }}
              </Badge>
            </div>
            <p v-if="template.description" class="text-xs text-muted-foreground truncate md:text-sm">
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
    </div>
  </div>
</template>

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
    navigateTo(`/templates/${data.id}`)
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
    await fetchTemplates()
  }
  catch (error: any) {
    console.error('Erro ao deletar template:', error)
  }
}

function totalExercises(template: WorkoutTemplateWithExercises) {
  return template.exercises?.length || 0
}
</script>
