export function useOnboardingTour() {
  const supabase = useSupabaseClient()
  const tourCompleted = ref(false)
  const loading = ref(true)
  let driverInstance: any = null

  const steps = [
    {
      element: '[data-tour="workout-list"]',
      popover: {
        title: 'Seus Treinos',
        description: 'Aqui você vê todos os seus treinos organizados por data. Clique em um treino para ver os detalhes.',
        side: 'bottom' as const,
        align: 'start' as const,
      },
    },
    {
      element: '[data-tour="create-workout"]',
      popover: {
        title: 'Criar Novo Treino',
        description: 'Clique aqui para criar um novo treino rapidamente. Dê um nome e escolha a data.',
        side: 'bottom' as const,
        align: 'start' as const,
      },
    },
    {
      element: '[data-tour="templates"]',
      popover: {
        title: 'Templates',
        description: 'Use templates para reaproveitar treinos que você já fez e economizar tempo.',
        side: 'bottom' as const,
        align: 'start' as const,
      },
    },
    {
      element: '[data-tour="stats"]',
      popover: {
        title: 'Estatísticas',
        description: 'Veja o volume total, número de séries e exercícios de cada treino.',
        side: 'top' as const,
        align: 'start' as const,
      },
    },
  ]

  async function checkTourStatus(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', userId)
        .single()

      if (error)
        throw error
      tourCompleted.value = data?.onboarding_completed || false
    }
    catch (error) {
      console.error('Erro ao verificar status do tour:', error)
    }
    finally {
      loading.value = false
    }
  }

  function markTourCompleted(userId: string) {
    supabase
      .from('profiles')
      .update({ onboarding_completed: true })
      .eq('id', userId)
      .then(({ error }) => {
        if (error) {
          console.error('Erro ao salvar status do tour:', error)
        }
        else {
          tourCompleted.value = true
        }
      })
  }

  async function startTour() {
    if (tourCompleted.value || loading.value)
      return

    // Dynamic import to avoid Vite SSR bundling issues
    const { driver } = await import('driver.js')
    await import('driver.js/dist/driver.css')

    driverInstance = driver({
      animate: true,
      showProgress: true,
      overlayOpacity: 0.7,
      allowClose: true,
      stagePadding: 8,
      nextBtnText: 'Próximo',
      prevBtnText: 'Anterior',
      doneBtnText: 'Entendi!',
      onDestroyed: () => {
        const { data } = supabase.auth.getSession()
        if (data.session?.user) {
          markTourCompleted(data.session.user.id)
        }
      },
    })

    driverInstance.setSteps(steps)
    driverInstance.drive()
  }

  return { tourCompleted, loading, checkTourStatus, startTour }
}
