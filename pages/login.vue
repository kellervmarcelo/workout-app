<template>
  <div class="min-h-screen flex items-center justify-center bg-background p-4">
    <Card class="w-full max-w-md">
      <div class="p-4 space-y-5 md:p-6 md:space-y-6">
        <!-- Header -->
        <div class="text-center space-y-2">
          <div class="text-4xl mb-1 md:text-5xl md:mb-2">
            💪
          </div>
          <h1 class="text-2xl font-bold tracking-tight md:text-3xl">
            Workout Tracker
          </h1>
          <p class="text-sm text-muted-foreground">
            {{ isLogin ? 'Entre na sua conta para continuar' : 'Crie sua conta para começar' }}
          </p>
        </div>

        <!-- Error/Success -->
        <div
          v-if="error" :class="cn(
            'p-3 rounded-md text-sm border',
            error.includes('sucesso') ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-destructive/10 text-destructive border-destructive/20',
          )"
        >
          {{ error }}
        </div>

        <!-- Form -->
        <form class="space-y-4" @submit.prevent="handleSubmit">
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

          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <Label for="password" required>Senha</Label>
              <a v-if="isLogin" href="#" class="text-xs text-primary hover:underline">
                Esqueceu a senha?
              </a>
            </div>
            <Input
              id="password"
              v-model="password"
              type="password"
              placeholder="••••••••"
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
            {{ loading ? 'Processando...' : (isLogin ? 'Entrar' : 'Criar conta') }}
          </Button>
        </form>

        <!-- Divider -->
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <span class="w-full border-t" />
          </div>
          <div class="relative flex justify-center text-xs uppercase">
            <span class="bg-card px-2 text-muted-foreground">Ou</span>
          </div>
        </div>

        <!-- Toggle -->
        <p class="text-center text-sm text-muted-foreground">
          {{ isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?' }}
          <button class="text-primary hover:underline font-medium min-h-[44px] px-2" @click="toggleMode">
            {{ isLogin ? 'Criar conta' : 'Entrar' }}
          </button>
        </p>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { cn } from '~/lib/utils'

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const isLogin = ref(true)

const supabase = useSupabaseClient()

async function handleSubmit() {
  loading.value = true
  error.value = ''

  try {
    if (isLogin.value) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value,
      })
      if (signInError)
        throw signInError
      navigateTo('/')
    }
    else {
      const { error: signUpError } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (signUpError)
        throw signUpError
      error.value = 'Conta criada com sucesso! Verifique seu email ou faça login.'
      isLogin.value = true
    }
  }
  catch (err: any) {
    error.value = err.message || 'Erro ao processar requisição'
  }
  finally {
    loading.value = false
  }
}

function toggleMode() {
  isLogin.value = !isLogin.value
  error.value = ''
}
</script>
