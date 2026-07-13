<template>
  <div class="space-y-6 md:space-y-8">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <NuxtLink to="/" class="text-muted-foreground hover:text-primary transition-colors min-h-[44px] flex items-center">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </NuxtLink>
      <div>
        <h1 class="text-xl font-bold tracking-tight md:text-3xl">
          Perfil
        </h1>
        <p class="text-sm text-muted-foreground mt-0.5">
          Gerencie suas informações pessoais
        </p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
        <p class="text-muted-foreground">
          Carregando...
        </p>
      </div>
    </div>

    <div v-else class="space-y-6 md:space-y-8 max-w-2xl">
      <!-- Avatar Section -->
      <Card class="p-4 md:p-6">
        <h2 class="text-base font-semibold mb-4 md:text-lg">
          Foto de Perfil
        </h2>
        <AvatarUpload
          :avatar-url="avatarUrl"
          :initials="initials"
          @update:avatar-url="onAvatarUpdate"
        />
      </Card>

      <!-- Display Name Section -->
      <Card class="p-4 md:p-6">
        <h2 class="text-base font-semibold mb-4 md:text-lg">
          Nome de Exibição
        </h2>
        <form class="space-y-4" @submit.prevent="updateDisplayName">
          <div class="space-y-2">
            <Label for="display-name" required>Nome</Label>
            <Input
              id="display-name"
              v-model="displayName"
              placeholder="Seu nome"
              required
              class="h-11"
              maxlength="50"
            />
            <p class="text-xs text-muted-foreground">
              Este nome será exibido no app
            </p>
          </div>
          <div class="flex gap-2 justify-end">
            <Button
              type="submit"
              :disabled="savingName || !displayName.trim()"
            >
              <svg v-if="savingName" class="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {{ savingName ? 'Salvando...' : 'Salvar' }}
            </Button>
          </div>
          <p v-if="nameSuccess" class="text-sm text-green-600 dark:text-green-400">
            Nome atualizado com sucesso!
          </p>
          <p v-if="nameError" class="text-sm text-destructive">
            {{ nameError }}
          </p>
        </form>
      </Card>

      <!-- Email (read-only) -->
      <Card class="p-4 md:p-6">
        <h2 class="text-base font-semibold mb-4 md:text-lg">
          Email
        </h2>
        <div class="space-y-2">
          <Label for="email">Email da conta</Label>
          <Input
            id="email"
            :model-value="email"
            disabled
            class="h-11 bg-muted/50"
          />
          <p class="text-xs text-muted-foreground">
            O email não pode ser alterado
          </p>
        </div>
      </Card>

      <!-- Weekly Goal Section -->
      <Card class="p-4 md:p-6">
        <h2 class="text-base font-semibold mb-4 md:text-lg">
          Frequência Semanal
        </h2>
        <div class="space-y-4">
          <p class="text-sm text-muted-foreground">
            Quantos dias por semana você pretende treinar?
          </p>
          <div class="flex items-center gap-4">
            <button
              type="button"
              class="w-10 h-10 rounded-full border border-input flex items-center justify-center text-lg font-medium hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              :disabled="pendingGoal <= 1"
              @click="pendingGoal = Math.max(1, pendingGoal - 1)"
            >
              −
            </button>
            <span class="text-2xl font-bold w-8 text-center">{{ pendingGoal }}</span>
            <button
              type="button"
              class="w-10 h-10 rounded-full border border-input flex items-center justify-center text-lg font-medium hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              :disabled="pendingGoal >= 7"
              @click="pendingGoal = Math.min(7, pendingGoal + 1)"
            >
              +
            </button>
            <span class="text-sm text-muted-foreground">{{ pendingGoal === 1 ? 'dia por semana' : 'dias por semana' }}</span>
          </div>
          <div class="flex gap-2 justify-end">
            <Button
              type="button"
              :disabled="savingGoal || pendingGoal === weeklyGoal"
              @click="updateWeeklyGoal"
            >
              <svg v-if="savingGoal" class="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {{ savingGoal ? 'Salvando...' : 'Salvar' }}
            </Button>
          </div>
          <p v-if="goalSuccess" class="text-sm text-green-600 dark:text-green-400">
            Meta atualizada com sucesso!
          </p>
          <p v-if="goalError" class="text-sm text-destructive">
            {{ goalError }}
          </p>
        </div>
      </Card>

      <!-- Change Password Section -->
      <Card class="p-4 md:p-6">
        <h2 class="text-base font-semibold mb-4 md:text-lg">
          Alterar Senha
        </h2>
        <form class="space-y-4" @submit.prevent="updatePassword">
          <div class="space-y-2">
            <Label for="new-password" required>Nova Senha</Label>
            <Input
              id="new-password"
              v-model="newPassword"
              type="password"
              placeholder="Mínimo 6 caracteres"
              required
              class="h-11"
              minlength="6"
            />
          </div>
          <div class="space-y-2">
            <Label for="confirm-password" required>Confirmar Senha</Label>
            <Input
              id="confirm-password"
              v-model="confirmPassword"
              type="password"
              placeholder="Repita a nova senha"
              required
              class="h-11"
              minlength="6"
            />
          </div>
          <div class="flex gap-2 justify-end">
            <Button
              type="submit"
              :disabled="savingPassword || !passwordsMatch || !newPassword"
            >
              <svg v-if="savingPassword" class="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {{ savingPassword ? 'Salvando...' : 'Alterar Senha' }}
            </Button>
          </div>
          <p v-if="!passwordsMatch && confirmPassword" class="text-sm text-destructive">
            As senhas não coincidem
          </p>
          <p v-if="passwordSuccess" class="text-sm text-green-600 dark:text-green-400">
            Senha alterada com sucesso!
          </p>
          <p v-if="passwordError" class="text-sm text-destructive">
            {{ passwordError }}
          </p>
        </form>
      </Card>

      <!-- Danger Zone -->
      <Card class="p-4 md:p-6 border-destructive/20">
        <h2 class="text-base font-semibold mb-2 text-destructive md:text-lg">
          Zona de Perigo
        </h2>
        <p class="text-sm text-muted-foreground mb-4">
          Ações irreversíveis. Tenha cuidado.
        </p>
        <Button
          variant="destructive"
          size="sm"
          @click="showDeleteDialog = true"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Excluir Conta
        </Button>
      </Card>
    </div>

    <!-- Delete Account Confirmation Dialog -->
    <Card v-if="showDeleteDialog" class="p-4 md:p-6 border-destructive">
      <div class="flex items-center gap-3 mb-4">
        <svg class="w-6 h-6 text-destructive shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h2 class="text-lg font-semibold text-destructive">
          Excluir Conta
        </h2>
      </div>
      <p class="text-sm text-muted-foreground mb-4">
        Tem certeza que deseja excluir sua conta? Esta ação é <strong>irreversível</strong> e todos os seus dados (treinos, templates, exercícios) serão perdidos permanentemente.
      </p>
      <div class="flex gap-2 justify-end">
        <Button variant="outline" @click="showDeleteDialog = false">
          Cancelar
        </Button>
        <Button variant="destructive" :disabled="deleting" @click="deleteAccount">
          <svg v-if="deleting" class="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {{ deleting ? 'Excluindo...' : 'Sim, Excluir Conta' }}
        </Button>
      </div>
      <p v-if="deleteError" class="text-sm text-destructive mt-3">
        {{ deleteError }}
      </p>
    </Card>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useHead({ title: 'YAFA — Perfil' })

const supabase = useSupabaseClient()
const { session } = useAuth()
const { goal: weeklyGoal, saveGoal } = useWeeklyGoal()

// Profile data
const loading = ref(true)
const email = ref('')
const displayName = ref('')
const avatarUrl = ref('')

// Display name form
const savingName = ref(false)
const nameSuccess = ref(false)
const nameError = ref('')

// Weekly goal form
const pendingGoal = ref(3)
const savingGoal = ref(false)
const goalSuccess = ref(false)
const goalError = ref('')

// Password form
const newPassword = ref('')
const confirmPassword = ref('')
const savingPassword = ref(false)
const passwordSuccess = ref(false)
const passwordError = ref('')

// Delete account
const showDeleteDialog = ref(false)
const deleting = ref(false)
const deleteError = ref('')

const initials = computed(() => {
  const name = displayName.value || email.value
  return name
    .split(/[\s.@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0].toUpperCase())
    .join('')
})

const passwordsMatch = computed(() => {
  return newPassword.value === confirmPassword.value && newPassword.value.length >= 6
})

onMounted(async () => {
  if (session.value?.user) {
    await loadProfile()
  }
})

async function loadProfile() {
  if (!session.value?.user)
    return

  loading.value = true
  try {
    email.value = session.value.user.email || ''

    const { data, error } = await supabase
      .from('profiles')
      .select('display_name, avatar_url, weekly_workout_goal')
      .eq('id', session.value.user.id)
      .single()

    if (error)
      throw error

    displayName.value = data.display_name || ''
    avatarUrl.value = data.avatar_url || ''
    weeklyGoal.value = data.weekly_workout_goal ?? 3
    pendingGoal.value = weeklyGoal.value
  }
  catch (err: any) {
    console.error('Erro ao carregar perfil:', err)
  }
  finally {
    loading.value = false
  }
}

async function updateWeeklyGoal() {
  if (!session.value?.user)
    return

  savingGoal.value = true
  goalSuccess.value = false
  goalError.value = ''

  try {
    await saveGoal(session.value.user.id, pendingGoal.value)
    goalSuccess.value = true
    setTimeout(() => {
      goalSuccess.value = false
    }, 3000)
  }
  catch (err: any) {
    console.error('Erro ao atualizar meta:', err)
    goalError.value = err.message || 'Erro ao salvar meta'
  }
  finally {
    savingGoal.value = false
  }
}

async function updateDisplayName() {
  if (!session.value?.user || !displayName.value.trim())
    return

  savingName.value = true
  nameSuccess.value = false
  nameError.value = ''

  try {
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName.value.trim() })
      .eq('id', session.value.user.id)

    if (error)
      throw error

    nameSuccess.value = true
    setTimeout(() => {
      nameSuccess.value = false
    }, 3000)
  }
  catch (err: any) {
    console.error('Erro ao atualizar nome:', err)
    nameError.value = err.message || 'Erro ao salvar nome'
  }
  finally {
    savingName.value = false
  }
}

function onAvatarUpdate(newUrl: string) {
  avatarUrl.value = newUrl
}

async function updatePassword() {
  if (!passwordsMatch.value || !newPassword.value)
    return

  savingPassword.value = true
  passwordSuccess.value = false
  passwordError.value = ''

  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword.value,
    })

    if (error)
      throw error

    passwordSuccess.value = true
    newPassword.value = ''
    confirmPassword.value = ''
    setTimeout(() => {
      passwordSuccess.value = false
    }, 3000)
  }
  catch (err: any) {
    console.error('Erro ao atualizar senha:', err)
    passwordError.value = err.message || 'Erro ao alterar senha'
  }
  finally {
    savingPassword.value = false
  }
}

async function deleteAccount() {
  if (!session.value?.user)
    return

  deleting.value = true
  deleteError.value = ''

  try {
    const userId = session.value.user.id

    // Deletar avatar do storage se existir
    if (avatarUrl.value) {
      const match = avatarUrl.value.match(/\/avatars\/(.+)$/)
      if (match) {
        const path = decodeURIComponent(match[1])
        await supabase.storage.from('avatars').remove([path])
      }
    }

    // Deletar profile (CASCADE deleta workouts, templates, etc.)
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (error)
      throw error

    // Sign out
    await supabase.auth.signOut()
    navigateTo('/login')
  }
  catch (err: any) {
    console.error('Erro ao excluir conta:', err)
    deleteError.value = err.message || 'Erro ao excluir conta'
    deleting.value = false
  }
}
</script>
