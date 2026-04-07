<script setup lang="ts">
const supabase = useSupabaseClient()
const route = useRoute()

onMounted(async () => {
  const { hash } = route
  
  if (hash) {
    const { error } = await supabase.auth.getSession()
    if (error) {
      console.error('Erro no callback:', error)
    }
  }
  
  navigateTo('/')
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <p class="text-muted-foreground">Redirecionando...</p>
  </div>
</template>
