import type { WorkoutTemplateWithExercises } from '~/types'

export function useTemplates() {
  const supabase = useSupabaseClient()
  const session = useSupabaseSession()
  const templates = ref<WorkoutTemplateWithExercises[]>([])
  const loading = ref(false)

  async function fetchTemplates() {
    if (!session.value?.user)
      return

    loading.value = true
    try {
      const { data, error } = await supabase
        .from('workout_templates')
        .select(`*, exercises:template_exercises(*)`)
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

  return { templates, loading, fetchTemplates }
}
