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
  // Verificar se há erro na URL (hash fragment do OAuth)
  const hash = route.hash
  if (hash) {
    const params = new URLSearchParams(hash.replace('#', '&'))
    const error = params.get('error')
    const errorDescription = params.get('error_description')

    if (error) {
      errorMessage.value = errorDescription || 'Erro na autenticação social'
      loading.value = false
      // Redirecionar para login após 3 segundos
      setTimeout(() => {
        navigateTo('/login')
      }, 3000)
      return
    }
  }

  try {
    // Aguardar o Supabase processar a sessão do OAuth
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.error('Erro ao obter sessão:', error.message)
      errorMessage.value = 'Erro ao completar autenticação'
      loading.value = false
      setTimeout(() => {
        navigateTo('/login')
      }, 3000)
      return
    }

    if (data.session) {
      // Sessão válida, redirecionar para dashboard
      navigateTo('/')
    }
    else {
      // Sem sessão, redirecionar para login
      errorMessage.value = 'Sessão não encontrada'
      loading.value = false
      setTimeout(() => {
        navigateTo('/login')
      }, 3000)
    }
  }
  catch (err) {
    console.error('Erro inesperado no callback:', err)
    errorMessage.value = 'Erro inesperado ao processar login'
    loading.value = false
    setTimeout(() => {
      navigateTo('/login')
    }, 3000)
  }
})
</script>
