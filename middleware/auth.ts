// Middleware simplificado - apenas skip no server
// A verificação real é feita nas páginas
export default defineNuxtRouteMiddleware((_to) => {
  if (import.meta.server)
    return
})
