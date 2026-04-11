# Spec: User Profile Page

## Objective

Criar uma página dedicada de perfil do usuário (`/profile`) onde usuários autenticados podem gerenciar suas informações pessoais.

### User Stories

1. **Como usuário**, quero alterar meu nome de exibição para que o app me chame pelo nome que eu escolher.
2. **Como usuário**, quero alterar minha senha para manter minha conta segura.
3. **Como usuário**, quero fazer upload de uma foto de perfil para personalizar minha experiência.
4. **Como usuário**, quero excluir minha conta permanentemente quando eu não quiser mais usar o app.

### Success Criteria

- Página `/profile` acessível apenas para usuários autenticados (middleware de auth)
- Usuário pode alterar `display_name` (campo novo na tabela `profiles`)
- Usuário pode alterar senha via Supabase Auth `updateUser({ password })`
- Usuário pode fazer upload de foto (armazenada em Supabase Storage)
- Usuário pode excluir conta (deleta profile + auth user + cascade)
- No desktop, o header exibe link para o perfil (substituindo o email + ícone de logout)
- No mobile, o ícone "Perfil" na bottom nav navega para `/profile`
- Diálogo de confirmação antes de excluir conta

## Assumptions

1. Foto será armazenada em **Supabase Storage** (bucket `avatars`)
2. `display_name` é um campo novo na tabela `profiles` (separado do `email`)
3. Mesmo padrão visual: shadcn-vue + TailwindCSS + tema dark/light
4. Excluir conta = deletar profile (CASCADE deleta todos os dados) + deletar auth user
5. Senha atual **não** é necessária para alterar — só a nova senha + confirmação

## Tech Stack

| Categoria | Tecnologia |
|-----------|-----------|
| Framework | Nuxt 3 (SPA mode) |
| UI | shadcn-vue + TailwindCSS |
| Backend | Supabase (PostgreSQL + Auth + Storage) |
| State | Vue composables + Pinia |

## Commands

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run lint` | Verificar linting |
| `npm run lint:fix` | Corrigir linting |
| `npm run type-check` | Verificar tipos |

## Project Structure

```
pages/
  profile.vue              # Página de perfil do usuário (nova)

components/
  ui/
    AlertDialog.vue        # Componente de confirmação (existente ou novo)
  AvatarUpload.vue         # Componente de upload de foto (novo)

supabase/
  migrations/
    005_add_display_name_and_avatar.sql   # Nova migração

types/
  index.ts                 # Adicionar campos ao type Profile
```

## Database Changes

### Migration: `005_add_display_name_and_avatar.sql`

```sql
-- Adicionar campo display_name
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Adicionar campo avatar_url
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Criar bucket de storage para avatares (via SQL Admin)
-- Ou criar manualmente no dashboard Supabase
-- Bucket: avatars (public = false, file size limit = 2MB)
-- RLS policies no storage.objects para permitir upload/download do próprio avatar
```

### RLS Policies para Storage (avatars bucket)

```sql
-- Permitir upload apenas para o próprio avatar
CREATE POLICY "Usuários podem fazer upload do próprio avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Permitir update (overwrite) do próprio avatar
CREATE POLICY "Usuários podem atualizar o próprio avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Permitir delete do próprio avatar
CREATE POLICY "Usuários podem deletar o próprio avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Permitir leitura pública de avatares
CREATE POLICY "Avatares são públicos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');
```

## Code Style

### Padrão de componentes

```typescript
interface Props {
  variant?: 'default' | 'destructive'
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  class: '',
})
```

- Sempre usar `withDefaults` + acessar via `props.xxx` no template
- Importar `cn` de `~/lib/utils` para merge de classes
- Sem destructuring de props no template

### Padrão de formulários

```vue
<form class="space-y-4" @submit.prevent="handleSubmit">
  <div class="space-y-2">
    <Label for="field-id" required>Campo</Label>
    <Input id="field-id" v-model="fieldValue" />
  </div>
  <div class="flex gap-2 justify-end">
    <Button type="button" variant="outline" @click="cancel">Cancelar</Button>
    <Button type="submit" :disabled="loading || !isValid">Salvar</Button>
  </div>
</form>
```

## Testing Strategy

- Sem testes automatizados nesta fase (o projeto atual não possui testes unitários)
- Verificação manual:
  1. Criar conta → acessar `/profile` → alterar display_name → verificar no header
  2. Alterar senha → fazer logout → login com nova senha
  3. Upload de foto → verificar no header e na página
  4. Excluir conta → verificar que dados foram deletados

## Boundaries

### Always
- Usar `withDefaults` em todos os componentes com props
- Usar `cn()` para merge de classes Tailwind
- Validar inputs do usuário antes de enviar ao Supabase
- Manter consistência visual com o design system existente (shadcn-vue)
- Adicionar estados de loading e error em todas as operações assíncronas
- Usar `onMounted` + `supabase.auth.getSession()` para carregar dados do usuário

### Ask First
- Adicionar novas dependências npm
- Alterar schema do banco de dados (além do especificado aqui)
- Mudar a estrutura de pastas do projeto
- Alterar configurações de CI/CD

### Never
- Commitar variáveis de ambiente ou secrets
- Remover políticas RLS existentes
- Usar `any` como tipo TypeScript sem justificativa
- Usar `navigateTo` sem `await` em mode SPA

## Implementation Order

1. **Migração do banco** — Adicionar `display_name` e `avatar_url` na tabela `profiles`
2. **Types** — Atualizar interface `User`/`Profile` em `types/index.ts`
3. **Layout** — Adicionar link de perfil no header desktop + corrigir bottom nav mobile
4. **Página de perfil** — Criar `pages/profile.vue` com todas as seções
5. **Componente AvatarUpload** — Criar `components/AvatarUpload.vue`
6. **Excluir conta** — Função com confirmação e cleanup

## Open Questions

- ~~Tamanho máximo do avatar~~ ✅ 2MB
- ~~Formatos aceitos~~ ✅ JPEG, PNG, WebP
- ~~Avatar default~~ ✅ Iniciais do display_name (ou email)
- ~~Confirmação excluir conta~~ ✅ Diálogo simples "Tem certeza?"

## Configuração do Supabase (manual)

Após aplicar a migração, será necessário criar o bucket `avatars` no Supabase Dashboard:

1. Ir para **Storage** → **Create bucket**
2. Nome: `avatars`
3. **Public bucket:** ✅ Sim (para permitir leitura dos avatares)
4. **File size limit:** 2MB (2097152 bytes)
5. **Allowed MIME types:** `image/jpeg`, `image/png`, `image/webp`

As RLS policies do bucket serão criadas pela migração `005`.
