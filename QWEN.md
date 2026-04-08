# 💪 Workout Tracker - QWEN.md

Contexto de desenvolvimento para o **Workout Tracker**, um app SPA para gerenciar treinos, exercícios e séries.

---

## Visão Geral

App SPA (Single Page Application) construído com **Nuxt 3**, **Vue 3**, **TypeScript**, **Supabase** (PostgreSQL + Auth) e componentes estilo **shadcn-vue** com **TailwindCSS**.

### Funcionalidades
- Autenticação via Supabase Auth (email/senha)
- CRUD completo de treinos (nome, data, notas)
- Adicionar exercícios com séries, repetições e carga (kg)
- Edição inline de reps e carga
- Estatísticas: volume total, total de séries, número de exercícios
- Row Level Security (RLS) no PostgreSQL para isolamento de dados por usuário

---

## Stack Tecnológica

| Categoria | Tecnologia |
|-----------|-----------|
| Framework | Nuxt 3 + Vue 3 |
| Linguagem | TypeScript (strict mode) |
| UI | TailwindCSS + componentes shadcn-vue (Button, Card, Input, Label, Badge) |
| Backend | Supabase (PostgreSQL + Auth) |
| State | Pinia + VueUse |
| Linting | ESLint (@antfu/eslint-config) + Prettier |
| Ícones | SVG inline (Heroicons-style) + lucide-vue-next |

---

## Estrutura do Projeto

```
workout-app/
├── assets/css/main.css       # CSS global + variáveis CSS shadcn (tema light/dark)
├── components/ui/            # Componentes base estilo shadcn
│   ├── Badge.vue
│   ├── Button.vue
│   ├── Card.vue
│   ├── Input.vue
│   └── Label.vue
├── composables/              # Composables Vue reutilizáveis
├── layouts/
│   └── default.vue           # Layout principal com header, main, footer
├── lib/
│   └── utils.ts              # Função `cn()` (clsx + tailwind-merge)
├── middleware/
│   └── auth.ts               # Middleware de rota (server-side skip)
├── pages/
│   ├── index.vue             # Dashboard: lista de treinos
│   ├── login.vue             # Tela de login/registro
│   ├── auth/callback.vue     # Callback de autenticação
│   └── workouts/[id].vue     # Detalhes do treino (exercícios + séries)
├── stores/                   # Stores Pinia (vazio por enquanto, auth é via Supabase)
├── supabase/
│   └── schema.sql            # Schema completo com RLS, triggers e índices
├── types/
│   └── index.ts              # Types TypeScript (User, Workout, Exercise, WorkoutSet)
├── app.vue                   # Entry point da aplicação
├── nuxt.config.ts            # Configuração do Nuxt
├── tailwind.config.js        # Configuração do Tailwind com tema shadcn
├── eslint.config.js          # ESLint flat config (@antfu)
├── .prettierrc               # Configuração Prettier
└── .env                      # Variáveis de ambiente (SUPABASE_URL, SUPABASE_KEY)
```

---

## Comandos

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento (http://localhost:3000) |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build de produção |
| `npm run lint` | Verificar linting (ESLint) |
| `npm run lint:fix` | Corrigir linting automaticamente |
| `npm run format` | Formatar código (Prettier) |
| `npm run type-check` | Verificar tipos TypeScript |
| `npm run lint:all` | Rodar lint + format check + type check |

---

## Configuração de Ambiente

### Variáveis de Ambiente (`.env`)

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Banco de Dados

O schema SQL (`supabase/schema.sql`) deve ser executado no SQL Editor do Supabase. Ele cria:
- 4 tabelas: `profiles`, `workouts`, `exercises`, `workout_sets`
- Row Level Security (RLS) em todas as tabelas
- Políticas RLS para CRUD completo por usuário
- Trigger `on_auth_user_created` para criar perfil automaticamente
- Índices de performance

---

## Arquitetura e Padrões

### Modo SPA
O app roda em modo **SPA** (`ssr: false`) para evitar problemas de hidratação com Supabase Auth no servidor.

### Ambientes: Dev Local vs Produção

O projeto usa **Supabase Local** para desenvolvimento e um projeto Supabase cloud para produção.

| Ambiente | URL | Como ativar |
|----------|-----|-------------|
| **Local (dev)** | `http://127.0.0.1:54321` | Padrno no `.env` |
| **Produção** | `https://qghehvbpgwspmpzivrlv.supabase.co` | `npm run db:use-prod` |

### Comandos de Banco de Dados

| Comando | Descrição |
|---------|-----------|
| `npm run db:start` | Sobe Supabase local (requer Docker) |
| `npm run db:stop` | Para Supabase local |
| `npm run db:reset` | Reseta banco local + aplica migrações + seed |
| `npm run db:studio` | Abre Supabase Studio em `http://localhost:54323` |
| `npm run db:push` | Aplica migrações locais no projeto de produção |
| `npm run db:link` | Link com projeto de produção no Supabase CLI |
| `npm run db:diff` | Gera diff entre schema local e remoto |
| `npm run db:use-prod` | Troca `.env` para credenciais de produção |
| `npm run db:use-local` | Troca `.env` para Supabase local |

### Estrutura do Supabase

```
supabase/
├── config.toml                     # Config do Supabase CLI
├── migrations/
│   └── 001_initial_schema.sql      # Migração inicial (profiles, workouts, exercises, workout_sets)
├── seed.sql                        # Dados de teste (dev)
├── schema.sql                      # Schema original (legado)
└── .gitignore                      # Ignora .temp e .branches
```

### Workflow Típico

```bash
# 1. Sobe Supabase local (primeira vez ou após reset)
npm run db:start

# 2. Roda o app apontando para Supabase local
npm run dev

# 3. Abre dashboard local para inspecionar dados
npm run db:studio

# 4. Para finalizar
npm run db:stop
```

### Pré-requisitos para Dev Local
- **Docker Desktop** instalado e rodando
- ~2-3GB RAM disponível para os containers

### Autenticação
- Usa `useSupabaseClient()` diretamente em vez de `useSupabaseSession()` (que causa erros de timing)
- Session é obtida via `client.auth.getSession()` dentro de `onMounted`
- `onAuthStateChange` listener mantém a sessão sincronizada
- Middleware de auth simplificado com `import.meta.server` guard

### Componentes UI
- Componentes em `components/ui/` seguem o padrão shadcn-vue
- **Sempre** usar `withDefaults(defineProps<Props>(), { ... })` com defaults explícitos
- **Sempre** acessar props via `props.xxx` no template (não usar destructuring)
- Usar função `cn()` de `~/lib/utils` para merge de classes Tailwind
- Importar `cn` explicitamente onde necessário

### Padrão de Props nos Componentes

```typescript
interface Props {
  variant?: 'default' | 'secondary'
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  class: '',
})
```

No template, usar `props.variant`, `props.class`, etc.

### TypeScript
- `strict: true` habilitado
- `typeCheck: false` no Nuxt (rodar `npm run type-check` manualmente)
- Types definidos em `types/index.ts`

### CSS
- TailwindCSS com variáveis CSS customizadas para tema shadcn
- Tema light/dark com variáveis HSL em `assets/css/main.css`

---

## Páginas e Rotas

| Rota | Arquivo | Descrição |
|------|---------|-----------|
| `/login` | `pages/login.vue` | Login/Registro (sem auth required) |
| `/` | `pages/index.vue` | Lista de treinos (requer auth) |
| `/workouts/[id]` | `pages/workouts/[id].vue` | Detalhes do treino (requer auth) |
| `/auth/callback` | `pages/auth/callback.vue` | Callback OAuth |

---

## Notas Importantes

1. **Componentes UI**: Sempre usar `withDefaults` + acessar via `props.xxx` no template
2. **Função `cn`**: Importar de `~/lib/utils` explicitamente em cada componente/página
3. **Auth**: Usar `useSupabaseClient()` + `getSession()` dentro de `onMounted`
4. **SSR**: Desabilitado (`ssr: false`) — app é SPA
5. **Env**: Nunca commitar `.env` — usar `.env.example` como template

## Qwen Added Memories
- Sempre criar branches novas para novas features seguindo o padrão: feat/fix/chore:<título-descritivo>. Exemplo: feat: add-dark-mode, fix: auth-redirect-loop, chore: update-dependencies
- Ao finalizar uma feature, fazer push para o repositório remoto e criar automaticamente uma Pull Request (PR) com uma descrição detalhada das mudanças feitas
