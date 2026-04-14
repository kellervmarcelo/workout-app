import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase client with explicit localStorage for OAuth PKCE.
 *
 * The @nuxtjs/supabase module uses a custom storage adapter that may not
 * persist the PKCE code_verifier across browser redirects. This client
 * uses raw localStorage to ensure the verifier survives the OAuth flow.
 */
export function useOAuthClient(): SupabaseClient {
  const config = useRuntimeConfig()
  const url = config.public.supabaseUrl as string
  const key = config.public.supabaseKey as string

  return createClient(url, key, {
    auth: {
      flowType: 'pkce',
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      storage: localStorage,
      storageKey: 'sb-auth-token',
    },
  })
}
