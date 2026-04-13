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
const supabase = useSupabaseClient()
const route = useRoute()

const loading = ref(true)
const errorMessage = ref('')

onMounted(async () => {
  console.log('[callback] URL atual:', window.location.href)
  console.log('[callback] route.query:', route.query)
  console.log('[callback] route.hash:', route.hash)

  // 1. Verificar se há erro na URL (query params ou hash)
  const queryError = route.query.error as string
  const queryErrorDescription = route.query.error_description as string
  const hash = route.hash

  if (queryError || hash?.includes('error=')) {
    let error = queryError
    let errorDescription = queryErrorDescription

    if (hash && !error) {
      const params = new URLSearchParams(hash.replace('#', '&'))
      error = params.get('error') || undefined
      errorDescription = params.get('error_description') || undefined
    }

    if (error) {
      errorMessage.value = errorDescription || 'Erro na autenticação social'
      loading.value = false
      setTimeout(() => navigateTo('/login'), 3000)
      return
    }
  }

  // 2. Verificar se há código OAuth na URL (PKCE flow)
  const code = route.query.code as string
  const providerToken = route.query.provider_token as string
  const providerRefreshToken = route.query.provider_refresh_token as string

  if (code) {
    console.log('[callback] Código OAuth encontrado:', code.substring(0, 10) + '...')

    try {
      // Verificar se o @nuxtjs/supabase já processou a sessão
      // O módulo tem detectSessionInUrl: true que faz isso automaticamente
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.error('[callback] Erro ao trocar código por sessão:', exchangeError.message)
        console.error('[callback] Detalhes:', exchangeError)
        errorMessage.value = 'Erro ao completar autenticação: ' + exchangeError.message
        loading.value = false
        setTimeout(() => navigateTo('/login'), 3000)
        return
      }

      if (data?.session) {
        console.log('[callback] Sessão criada com sucesso:', data.session.user.email)
        navigateTo('/')
      }
      else {
        errorMessage.value = 'Sessão não criada'
        loading.value = false
        setTimeout(() => navigateTo('/login'), 3000)
      }
      return
    }
    catch (err) {
      console.error('[callback] Erro inesperado ao trocar código:', err)
      errorMessage.value = 'Erro inesperado ao processar login'
      loading.value = false
      setTimeout(() => navigateTo('/login'), 3000)
      return
    }
  }

  // 3. Fallback: verificar se já tem sessão
  try {
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.error('[callback] Erro ao obter sessão:', error.message)
      errorMessage.value = 'Erro ao completar autenticação'
      loading.value = false
      setTimeout(() => navigateTo('/login'), 3000)
      return
    }

    if (data.session) {
      console.log('[callback] Sessão já existente:', data.session.user.email)
      navigateTo('/')
    }
    else {
      errorMessage.value = 'Sessão não encontrada'
      loading.value = false
      setTimeout(() => navigateTo('/login'), 3000)
    }
  }
  catch (err) {
    console.error('[callback] Erro inesperado:', err)
    errorMessage.value = 'Erro inesperado ao processar login'
    loading.value = false
    setTimeout(() => navigateTo('/login'), 3000)
  }
})
</script>
