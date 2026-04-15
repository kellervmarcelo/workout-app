<template>
  <div class="min-h-screen flex items-center justify-center bg-background p-4">
    <Card class="w-full max-w-md">
      <div class="p-4 space-y-5 md:p-6 md:space-y-6">
        <!-- Header -->
        <div class="text-center space-y-2">
          <div class="text-4xl mb-1 md:text-5xl md:mb-2">
            🔑
          </div>
          <h1 class="text-2xl font-bold tracking-tight md:text-3xl">
            Recuperar Senha
          </h1>
          <p class="text-sm text-muted-foreground">
            Informe seu email e enviaremos um link para redefinir sua senha.
          </p>
        </div>

        <!-- Feedback -->
        <div
          v-if="message"
          :class="cn(
            'p-3 rounded-md text-sm border',
            success
              ? 'bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400'
              : 'bg-destructive/10 text-destructive border-destructive/20',
          )"
        >
          {{ message }}
        </div>

        <!-- Form -->
        <form v-if="!success" class="space-y-4" @submit.prevent="handleSubmit">
          <div class="space-y-2">
            <Label for="email" required>Email</Label>
            <Input
              id="email"
              v-model="email"
              type="email"
              placeholder="seu@email.com"
              :disabled="loading"
              required
              class="h-11 text-base"
            />
          </div>

          <Button type="submit" class="w-full h-11 text-base" :disabled="loading">
            <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {{ loading ? 'Enviando...' : 'Enviar link de recuperação' }}
          </Button>
        </form>

        <!-- Voltar ao login -->
        <p class="text-center text-sm text-muted-foreground">
          Lembrou a senha?
          <NuxtLink to="/login" class="text-primary hover:underline font-medium">
            Voltar ao login
          </NuxtLink>
        </p>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { cn } from '~/lib/utils'

const supabase = useSupabaseClient()

const email = ref('')
const loading = ref(false)
const message = ref('')
const success = ref(false)

async function handleSubmit() {
  loading.value = true
  message.value = ''

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email.value, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
    })

    if (error)
      throw error

    success.value = true
    message.value = 'Link enviado! Verifique seu email e clique no link para redefinir sua senha.'
  }
  catch (err: any) {
    message.value = err.message || 'Erro ao enviar email de recuperação'
  }
  finally {
    loading.value = false
  }
}
</script>
