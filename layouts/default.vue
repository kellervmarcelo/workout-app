<script setup lang="ts">
const supabase = useSupabaseClient()
const user = ref<User | null>(null)

onMounted(async () => {
  const { data } = await supabase.auth.getSession()
  user.value = data.session?.user ?? null

  // Listen para mudanças de auth
  supabase.auth.onAuthStateChange((_event, session) => {
    user.value = session?.user ?? null
  })
})

const logout = async () => {
  await supabase.auth.signOut()
  navigateTo('/login')
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="container mx-auto flex h-16 items-center justify-between px-4">
        <NuxtLink to="/" class="flex items-center gap-2 font-bold text-xl">
          <span class="text-primary">💪</span>
          <span>Workout Tracker</span>
        </NuxtLink>
        
        <div v-if="user" class="flex items-center gap-4">
          <span class="text-sm text-muted-foreground hidden sm:inline">{{ user.email }}</span>
          <Button variant="outline" size="sm" @click="logout">
            Sair
          </Button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-6">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="border-t py-6 md:py-0">
      <div class="container mx-auto flex h-9 items-center justify-between px-4">
        <p class="text-sm text-muted-foreground">
          &copy; {{ new Date().getFullYear() }} Workout Tracker
        </p>
      </div>
    </footer>
  </div>
</template>
