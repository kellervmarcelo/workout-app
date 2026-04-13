# Spec: Social Login (GitHub + Google)

## Objetivo

Adicionar login social via GitHub e Google na página de login, permitindo que usuários criem conta e façam login sem precisar de email/senha.

### User Stories

1. **Como usuário**, quero fazer login com minha conta Google para não precisar lembrar de senha.
2. **Como usuário**, quero fazer login com minha conta GitHub para acessar rapidamente.
3. **Como usuário**, ao criar conta via social login, quero que meu perfil seja criado automaticamente no banco.

### Success Criteria

- Botões "Entrar com Google" e "Entrar com GitHub" visíveis na página de login
- Botões posicionados abaixo do separador "Ou"
- Ao clicar, redireciona para o provider correspondente
- Após auth bem-sucedida, redireciona para `/`
- Profile criado automaticamente via trigger `on_auth_user_created`
- Funciona em modo SPA (pkce flow)
- Loading state nos botões durante redirect
- Botões com ícones oficiais dos providers (SVG inline)

## Assumptions

1. Supabase Auth está configurado com `flowType: 'pkce'` (já está no nuxt.config)
2. O trigger `on_auth_user_created` já existe e cria profile automaticamente (já existe no schema)
3. Não precisamos de permissões extras dos providers — apenas auth básica
4. Local development: Supabase local precisa de redirect URLs configuradas
5. Produção: precisa configurar OAuth apps no GitHub e Google Cloud

## Tech Stack

| Categoria | Tecnologia |
|-----------|-----------|
| Framework | Nuxt 3 (SPA mode) |
| Auth | Supabase Auth (OAuth via PKCE) |
| UI | shadcn-vue + TailwindCSS |
| Ícones | SVG inline (oficiais dos providers) |

## Commands

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run lint` | Verificar linting |

## Configuração do Supabase (manual)

### 1. GitHub OAuth

1. Ir em https://github.com/settings/developers → **OAuth Apps** → **New OAuth App**
2. **Application name**: `Workout Tracker`
3. **Homepage URL**: `http://localhost:3000` (dev) ou `https://seu-dominio.com` (prod)
4. **Authorization callback URL**:
   - Dev local: `http://127.0.0.1:54321/auth/v1/callback`
   - Produção: `https://qghehvbpgwspmpzivrlv.supabase.co/auth/v1/callback`
5. Copiar **Client ID** e gerar **Client Secret**
6. No Supabase Dashboard → **Authentication** → **Providers** → **GitHub**
   - Ativar provider
   - Colar **Client ID** e **Client Secret**
   - **Redirect URL**: mesma do callback acima

### 2. Google OAuth

1. Ir em https://console.cloud.google.com/apis/credentials → **Create Credentials** → **OAuth client ID**
2. **Application type**: Web application
3. **Name**: `Workout Tracker`
4. **Authorized JavaScript origins**:
   - Dev local: `http://127.0.0.1:3000`, `http://localhost:3000`
   - Produção: `https://seu-dominio.com`
5. **Authorized redirect URIs**:
   - Dev local: `http://127.0.0.1:54321/auth/v1/callback`
   - Produção: `https://qghehvbpgwspmpzivrlv.supabase.co/auth/v1/callback`
6. Copiar **Client ID** e **Client Secret**
7. No Supabase Dashboard → **Authentication** → **Providers** → **Google**
   - Ativar provider
   - Colar **Client ID** e **Client Secret**

### 3. Supabase Local (Docker)

Para dev local, o Supabase já configura o callback automaticamente. Só precisa ativar os providers no dashboard local (`http://127.0.0.1:54323`) com as credenciais dos OAuth apps.

## Code Style

### Botões sociais

```vue
<Button
  type="button"
  variant="outline"
  class="w-full h-11 text-base"
  :disabled="loading"
  @click="signInWithProvider('github')"
>
  <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
    <!-- GitHub icon path -->
  </svg>
  Entrar com GitHub
</Button>
```

### Função de auth social

```typescript
async function signInWithProvider(provider: 'github' | 'google') {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  if (error) {
    // handle error
  }
}
```

## Testing Strategy

- Verificação manual:
  1. Clicar "Entrar com GitHub" → redirect para GitHub → auth → redirect de volta para `/`
  2. Clicar "Entrar com Google" → redirect para Google → auth → redirect de volta para `/`
  3. Verificar que profile foi criado na tabela `profiles`
  4. Verificar que session persiste após refresh

## Boundaries

### Always
- Usar `signInWithOAuth` do Supabase com `redirectTo` configurado
- Manter ícones oficiais dos providers (SVG inline, sem dependência externa)
- Mostrar loading state durante auth
- Tratar erros de auth com mensagem clara

### Ask First
- Adicionar escopos extras ao OAuth (ex: `user:email` do GitHub)
- Mudar flowType de `pkce` para outro

### Never
- Armazenar tokens manualmente (Supabase gerencia)
- Commitar Client ID ou Client Secret
- Usar bibliotecas externas para ícones dos providers

## Open Questions

- ~~Avatar: sincronizar com GitHub/Google?~~ ✅ Sim, sincronizar com `avatar_url` do profile
- ~~Nome: sincronizar com display_name?~~ ✅ Sim, sincronizar com `full_name` (GitHub) e `name` (Google)
- ~~Dev local ou cloud?~~ ✅ Testar localmente primeiro

## Database Changes

### Migration: `007_social_login_avatar_sync.sql`

Atualizar a trigger `handle_new_user` para capturar `avatar_url` e `display_name` do metadata de OAuth:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, avatar_url, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    -- Extrair avatar_url do metadata de OAuth
    CASE
      WHEN NEW.raw_user_meta_data->>'avatar_url' IS NOT NULL
        THEN NEW.raw_user_meta_data->>'avatar_url'
      WHEN NEW.raw_user_meta_data->>'picture' IS NOT NULL
        THEN NEW.raw_user_meta_data->>'picture'
      ELSE NULL
    END,
    -- Extrair display_name do metadata de OAuth
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',  -- GitHub
      NEW.raw_user_meta_data->>'name',       -- Google
      NULL
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Nota:** GitHub usa `avatar_url` + `full_name`, Google usa `picture` + `name` no metadata.
