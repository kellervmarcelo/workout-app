// Middleware de autenticação bidirecional
// - Páginas protegidas: redireciona para /login se não autenticado
// - Página /login: redireciona para / se já estiver autenticado
export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server)
    return

  const supabase = useSupabaseClient()
  const { data } = await supabase.auth.getSession()
  const session = data.session

  // Se está na página de login e já está autenticado → vai para dashboard
  if (to.path === '/login' && session) {
    return navigateTo('/')
  }

  // Se está em página protegida e NÃO está autenticado → vai para login
  // (páginas que usam este middleware mas não são /login)
  if (to.path !== '/login' && !session) {
    return navigateTo('/login')
  }
})
