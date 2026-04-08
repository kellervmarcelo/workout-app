<script setup lang="ts">
const supabase = useSupabaseClient()
const user = ref<User | null>(null)

onMounted(async () => {
  const { data } = await supabase.auth.getSession()
  user.value = data.session?.user ?? null

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
  <div class="min-h-screen bg-background flex flex-col">
    <!-- Header - compacto em mobile, expandido em desktop -->
    <header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="flex h-14 items-center justify-between px-4 md:h-16 md:px-6">
        <NuxtLink to="/" class="flex items-center gap-2 font-bold text-lg md:text-xl">
          <span>💪</span>
          <span class="hidden sm:inline">Workout Tracker</span>
          <span class="sm:hidden">WT</span>
        </NuxtLink>

        <div v-if="user" class="flex items-center gap-2">
          <span class="text-xs text-muted-foreground hidden md:inline truncate max-w-[200px]">{{ user.email }}</span>
          <Button variant="ghost" size="icon" class="h-9 w-9" @click="logout" title="Sair">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v0a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v0" />
            </svg>
          </Button>
        </div>
      </div>
    </header>

    <!-- Main Content - padding bottom para bottom nav em mobile -->
    <main class="flex-1 px-4 py-4 pb-20 md:px-6 md:py-6 md:pb-6">
      <slot />
    </main>

    <!-- Bottom Navigation - mobile only -->
    <nav v-if="user" class="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden safe-bottom">
      <div class="flex h-16 items-center justify-around px-2">
        <NuxtLink
          to="/"
          class="flex flex-col items-center justify-center gap-1 min-w-[64px] flex-1 py-1 text-xs font-medium transition-colors"
          :class="$route.path === '/' ? 'text-primary' : 'text-muted-foreground'"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span>Treinos</span>
        </NuxtLink>

        <NuxtLink
          to="/templates"
          class="flex flex-col items-center justify-center gap-1 min-w-[64px] flex-1 py-1 text-xs font-medium transition-colors"
          :class="$route.path.startsWith('/templates') ? 'text-primary' : 'text-muted-foreground'"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
          <span>Templates</span>
        </NuxtLink>

        <!-- FAB central para novo treino -->
        <div class="relative -mt-8">
          <NuxtLink
            to="/"
            class="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-95"
            @click.native.prevent="$emit('new-workout')"
          >
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </NuxtLink>
        </div>

        <div class="flex flex-col items-center justify-center gap-1 min-w-[64px] flex-1 py-1 text-xs font-medium text-muted-foreground">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span>Stats</span>
        </div>

        <div class="flex flex-col items-center justify-center gap-1 min-w-[64px] flex-1 py-1 text-xs font-medium text-muted-foreground">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>Perfil</span>
        </div>
      </div>
    </nav>

    <!-- Footer - desktop only -->
    <footer class="hidden border-t py-4 md:block">
      <div class="container mx-auto px-6">
        <p class="text-center text-sm text-muted-foreground">
          &copy; {{ new Date().getFullYear() }} Workout Tracker
        </p>
      </div>
    </footer>
  </div>
</template>
