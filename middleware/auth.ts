export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return

  const client = useSupabaseClient()
  const { data } = client.auth.getSession()

  if (!data.session) {
    return navigateTo('/login')
  }
})
