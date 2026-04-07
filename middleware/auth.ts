export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return

  const { data: session } = await useSupabaseSession()
  
  if (!session.value) {
    return navigateTo('/login')
  }
})
