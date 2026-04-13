# Configuração de Social Login (GitHub + Google)

Guia passo a passo para configurar os OAuth providers para desenvolvimento local e produção.

---

## 🔧 GitHub OAuth

### 1. Criar OAuth App no GitHub

1. Acesse https://github.com/settings/developers
2. Clique em **OAuth Apps** → **New OAuth App**
3. Preencha os campos:

| Campo | Valor (Dev Local) | Valor (Produção) |
|-------|-------------------|------------------|
| Application name | `Workout Tracker (Dev)` | `Workout Tracker` |
| Homepage URL | `http://localhost:3000` | `https://seu-dominio.com` |
| Authorization callback URL | `http://127.0.0.1:54321/auth/v1/callback` | `https://qghehvbpgwspmpzivrlv.supabase.co/auth/v1/callback` |

4. Clique **Register application**
5. Copie o **Client ID** exibido
6. Clique **Generate a new client secret** e copie o **Client Secret**

### 2. Adicionar ao `.env`

```env
GITHUB_CLIENT_ID=seu_client_id_aqui
GITHUB_CLIENT_SECRET=seu_client_secret_aqui
```

### 3. Reiniciar Supabase local

```bash
npm run db:stop
npm run db:start
```

---

## 🔧 Google OAuth

### 1. Criar Projeto no Google Cloud

1. Acesse https://console.cloud.google.com/
2. Clique no seletor de projetos no topo → **New Project**
3. Nome: `Workout Tracker` → **Create**
4. Aguarde a criação (pode levar 30 segundos)

### 2. Configurar OAuth Consent Screen

1. No menu lateral: **APIs & Services** → **OAuth consent screen**
2. Selecione **External** → **Create**
3. Preencha:

| Campo | Valor |
|-------|-------|
| App name | `Workout Tracker` |
| User support email | seu@email.com |
| Developer contact email | seu@email.com |

4. Clique **Save and Continue**
5. Em **Scopes**, clique **Save and Continue** (não precisa adicionar escopos extras)
6. Em **Test users**, adicione seu email de teste → **Save and Continue**
7. Clique **Back to Dashboard**

### 3. Criar OAuth Client ID

1. No menu lateral: **APIs & Services** → **Credentials**
2. Clique **+ Create Credentials** → **OAuth client ID**
3. **Application type**: `Web application`
4. Nome: `Workout Tracker`
5. **Authorized JavaScript origins**:

```
http://localhost:3000
http://127.0.0.1:3000
http://192.168.0.180:3000
http://192.168.0.180:3001
```

6. **Authorized redirect URIs**:

```
http://127.0.0.1:54321/auth/v1/callback
https://qghehvbpgwspmpzivrlv.supabase.co/auth/v1/callback
```

7. Clique **Create**
8. Copie o **Client ID** e **Client Secret**

### 4. Adicionar ao `.env`

```env
GOOGLE_CLIENT_ID=seu_client_id_aqui
GOOGLE_CLIENT_SECRET=seu_client_secret_aqui
```

### 5. Reiniciar Supabase local

```bash
npm run db:stop
npm run db:start
```

---

## ✅ Verificação

Após configurar ambos os providers:

1. Inicie o app: `npm run dev`
2. Acesse `http://localhost:3000/login`
3. Você deve ver os botões "Entrar com GitHub" e "Entrar com Google"
4. Clique em um deles → você será redirecionado para o provider
5. Após autorizar, será redirecionado de volta para o dashboard
6. Verifique no Supabase Studio (`http://127.0.0.1:54323`) que o profile foi criado com avatar e nome

---

## ⚠️ Notas Importantes

- **Google `skip_nonce_check = true`**: Necessário para dev local porque o nonce validation falha com `http://` em vez de `https://`
- **Callback URL do Supabase local**: Sempre `http://127.0.0.1:54321/auth/v1/callback` — **não** use `localhost` (o Supabase usa IP direto)
- **Nunca commitar** Client Secrets no `.env` — use `.env` no `.gitignore`
- **Produção**: Configurar no Supabase Dashboard → Authentication → Providers → GitHub/Google

---

## 🐛 Troubleshooting

| Problema | Solução |
|----------|---------|
| `Invalid redirect_uri` | Verifique se o callback URL no OAuth App bate exatamente com o `redirect_uri` no `config.toml` |
| `Provider not enabled` | Verifique se `enabled = true` no `config.toml` e reinicie o Supabase |
| Google não redireciona | Verifique se seu email está em **Test users** no consent screen |
| `Client ID não encontrado` | Verifique se as variáveis `GITHUB_CLIENT_ID` e `GOOGLE_CLIENT_ID` estão no `.env` |
| Após auth, volta para login sem erro | Verifique o console do navegador por erros de CORS ou redirect |
