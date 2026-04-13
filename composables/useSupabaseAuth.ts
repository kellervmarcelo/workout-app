import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let _authClient: SupabaseClient | null = null

/**
 * Cria um cliente Supabase com localStorage explícito para OAuth PKCE.
 *
 * O @nuxtjs/supabase usa um storage customizado que não persiste o
 * code_verifier entre o redirect do OAuth. Este cliente alternativo
 * usa localStorage para garantir que o PKCE funcione corretamente.
 */
export function useSupabaseAuthClient(): SupabaseClient {
  if (_authClient)
    return _authClient

  const config = useRuntimeConfig()
  const url = config.public.supabaseUrl as string
  const key = config.public.supabaseKey as string

  _authClient = createClient(url, key, {
    auth: {
      flowType: 'pkce',
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      storage: localStorage,
      storageKey: 'sb-auth-token',
    },
  })

  return _authClient
}
