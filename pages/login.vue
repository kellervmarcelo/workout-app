<script setup lang="ts">
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const isLogin = ref(true)

const supabase = useSupabaseClient()

const handleSubmit = async () => {
  loading.value = true
  error.value = ''

  try {
    if (isLogin.value) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value,
      })
      if (signInError) throw signInError
      navigateTo('/')
    } else {
      const { error: signUpError } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (signUpError) throw signUpError
      error.value = 'Conta criada com sucesso! Faça login.'
      isLogin.value = true
    }
  } catch (err: any) {
    error.value = err.message || 'Erro ao processar requisição'
  } finally {
    loading.value = false
  }
}

const toggleMode = () => {
  isLogin.value = !isLogin.value
  error.value = ''
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
    <Card class="w-full max-w-md mx-4">
      <div class="p-6 space-y-6">
        <!-- Header -->
        <div class="text-center space-y-2">
          <h1 class="text-3xl font-bold">💪 Workout Tracker</h1>
          <p class="text-muted-foreground">
            {{ isLogin ? 'Entre na sua conta' : 'Crie sua conta' }}
          </p>
        </div>

        <!-- Error/Success -->
        <div v-if="error" :class="cn(
          'p-3 rounded-md text-sm',
          error.includes('sucesso') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-destructive/10 text-destructive',
        )">
          {{ error }}
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="space-y-2">
            <Label for="email" required>Email</Label>
            <Input
              id="email"
              v-model="email"
              type="email"
              placeholder="seu@email.com"
              :disabled="loading"
              required
            />
          </div>

          <div class="space-y-2">
            <Label for="password" required>Senha</Label>
            <Input
              id="password"
              v-model="password"
              type="password"
              placeholder="••••••••"
              :disabled="loading"
              required
            />
          </div>

          <Button type="submit" class="w-full" :disabled="loading">
            {{ loading ? 'Processando...' : (isLogin ? 'Entrar' : 'Criar conta') }}
          </Button>
        </form>

        <!-- Toggle -->
        <p class="text-center text-sm text-muted-foreground">
          {{ isLogin ? 'Não tem conta?' : 'Já tem conta?' }}
          <button class="text-primary hover:underline font-medium" @click="toggleMode">
            {{ isLogin ? 'Criar conta' : 'Entrar' }}
          </button>
        </p>
      </div>
    </Card>
  </div>
</template>
