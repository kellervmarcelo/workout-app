export function useAuth() {
  const supabase = useSupabaseClient()
  const session = useSupabaseSession()

  const user = computed(() => session.value?.user ?? null)
  const userId = computed(() => session.value?.user?.id ?? null)

  async function logout() {
    await supabase.auth.signOut()
    navigateTo('/login')
  }

  return { session, user, userId, logout }
}
