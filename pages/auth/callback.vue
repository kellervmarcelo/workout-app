<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center space-y-4">
      <svg v-if="loading" class="animate-spin mx-auto h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <p class="text-muted-foreground">
        {{ loading ? 'Processando autenticação...' : errorMessage }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const supabase = useSupabaseClient()

const loading = ref(true)
const errorMessage = ref('')

onMounted(async () => {
  // 1. Verificar se há erro na URL (query params ou hash)
  const queryError = route.query.error as string
  const queryErrorDescription = route.query.error_description as string
  const hash = route.hash

  if (queryError || hash?.includes('error=')) {
    let error: string | undefined = queryError || undefined
    let errorDescription: string | undefined = queryErrorDescription || undefined

    if (hash && !error) {
      const params = new URLSearchParams(hash.replace('#', '&'))
      error = params.get('error') ?? undefined
      errorDescription = params.get('error_description') ?? undefined
    }

    if (error) {
      errorMessage.value = errorDescription || 'Erro na autenticação social'
      loading.value = false
      setTimeout(() => navigateTo('/login'), 3000)
      return
    }
  }

  const next = route.query.next as string
  const redirect = next?.startsWith('/') && !next.startsWith('//') ? next : '/'

  // 2. @supabase/ssr (createBrowserClient) faz o exchange PKCE automaticamente no init.
  //    Só precisamos aguardar a sessão ser estabelecida.
  const { data } = await supabase.auth.getSession()
  if (data?.session) {
    navigateTo(redirect)
    return
  }

  // 3. Exchange ainda em progresso — aguardar evento SIGNED_IN
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
      subscription.unsubscribe()
      navigateTo(redirect)
    }
  })

  // 4. Safety timeout
  const timeout = setTimeout(() => {
    subscription.unsubscribe()
    errorMessage.value = 'Tempo limite de autenticação'
    loading.value = false
    setTimeout(() => navigateTo('/login'), 3000)
  }, 10000)

  // Limpar timeout se redirecionar antes
  onUnmounted(() => {
    clearTimeout(timeout)
    subscription.unsubscribe()
  })
})
</script>
