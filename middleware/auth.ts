export default defineNuxtRouteMiddleware(async (to) => {
  const { data: session } = await useSupabaseSession()
  
  if (!session.value) {
    return navigateTo('/login')
  }
})
