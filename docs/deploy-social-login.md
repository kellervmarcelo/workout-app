# Deploy — Social Login para Produção

Guia completo para habilitar login social (GitHub + Google) no ambiente de produção do Workout Tracker.

---

## 1. Criar GitHub OAuth App

1. Acesse: https://github.com/settings/developers
2. **OAuth Apps** → **New OAuth App**
3. Preencha:

| Campo | Valor |
|-------|-------|
| Application name | `Workout Tracker` |
| Homepage URL | URL do seu domínio (ex: `https://workout-app.example.com`) |
| Authorization callback URL | `https://qghehvbpgwspmpzivrlv.supabase.co/auth/v1/callback` |

4. Copie o **Client ID**
5. Clique **Generate a new client secret** → copie o **Client Secret**

---

## 2. Criar Google OAuth Client ID

1. Acesse: https://console.cloud.google.com/apis/credentials
2. **+ Create Credentials** → **OAuth client ID**
3. **Application type**: `Web application`
4. Preencha:

| Campo | Valor |
|-------|-------|
| Name | `Workout Tracker` |

5. **Authorized JavaScript origins**:

```
https://workout-app.example.com
https://workout-app.example.com:443
```

> Substitua pela URL real do seu domínio.

6. **Authorized redirect URIs**:

```
https://qghehvbpgwspmpzivrlv.supabase.co/auth/v1/callback
```

7. Copie o **Client ID** e **Client Secret**

---

## 3. Configurar no Supabase Cloud

1. Acesse: https://app.supabase.com/project/qghehvbpgwspmpzivrlv/auth/providers

### 3.1 GitHub

1. Clique em **GitHub**
2. Ative o toggle **Enabled**
3. Cole o **Client ID** e **Client Secret**
4. **Site URL**: `https://workout-app.example.com`
5. Clique **Save**

### 3.2 Google

1. Clique em **Google**
2. Ative o toggle **Enabled**
3. Cole o **Client ID** e **Client Secret**
4. Clique **Save**

---

## 4. Atualizar o `site_url` no Supabase

1. No Supabase Dashboard → **Authentication** → **URL Configuration**
2. **Site URL**: `https://workout-app.example.com`
3. **Redirect URLs**: adicione a URL do seu domínio:

```
https://workout-app.example.com
https://workout-app.example.com/auth/callback
```

---

## 5. Deploy do App

### 5.1 Build

```bash
npm run build
```

### 5.2 Deploy (exemplo com Vercel)

```bash
npx vercel --prod
```

Variáveis de ambiente no Vercel:
```
SUPABASE_URL=https://qghehvbpgwspmpzivrlv.supabase.co
SUPABASE_KEY=sua_chave_anon_key_aqui
```

### 5.3 Deploy (exemplo com Node.js)

```bash
npm ci
npm run build
node .output/server/index.mjs
```

---

## 6. Verificação

1. Acesse seu domínio de produção: `https://workout-app.example.com/login`
2. Verifique que os botões "Entrar com GitHub" e "Entrar com Google" aparecem
3. Teste o login com GitHub:
   - Clique no botão → autorize no GitHub → deve redirecionar para o dashboard
4. Teste o login com Google:
   - Clique no botão → autorize no Google → deve redirecionar para o dashboard
5. Verifique no Supabase Studio:
   - Tabela `profiles` — o novo usuário deve ter `avatar_url` e `display_name` preenchidos

---

## ⚠️ Notas Importantes

### PKCE + `localStorage`

O app usa um cliente Supabase customizado (`composables/useSupabaseAuth.ts`) com `localStorage` explícito para o fluxo OAuth. Isso é necessário porque o `@nuxtjs/supabase` module usa um storage que não persiste o PKCE code verifier entre redirects.

**Funciona em produção** porque:
- O `localStorage` é persistente entre redirects na mesma origem
- A origem do callback (`https://workout-app.example.com/auth/callback`) é a mesma de onde o OAuth foi iniciado

### `skip_nonce_check`

No dev local, o Google OAuth precisa de `skip_nonce_check = true` porque `http://` não passa nonce validation. Em produção com `https://`, isso **não é necessário** — o Supabase Cloud pode manter o padrão.

### Mobile (Caddy)

Se estiver usando o acesso mobile via Caddy (IP `192.168.0.180`), o `site_url` no `config.toml` local precisa ser ajustado. Mas isso **não afeta produção**.

---

## 🔧 Troubleshooting

| Problema | Solução |
|----------|---------|
| `invalid_client` no Google | Verifique se Client ID e Secret estão corretos no Supabase Dashboard |
| `redirect_uri_mismatch` | Verifique se o callback URL no OAuth App bate com o do Supabase |
| OAuth funciona no dev mas não em produção | Verifique `site_url` e `additional_redirect_urls` no Supabase Cloud |
| Avatar/nome não são salvos | Verifique se a migração `007` foi aplicada (`npm run db:push`) |
| PKCE error em produção | Verifique se o callback URL é na mesma origem do login |
