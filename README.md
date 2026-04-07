# 💪 Workout Tracker

App para gerenciar seus treinos de forma simples e eficiente, construído com **Nuxt 3**, **Supabase** e **shadcn-vue**.

## 🚀 Features

- ✅ Autenticação com Supabase Auth
- ✅ CRUD completo de treinos
- ✅ Adicionar exercícios com séries, repetições e carga
- ✅ Edição inline de séries
- ✅ Visualização de estatísticas (volume total, séries, exercícios)
- ✅ Row Level Security (RLS) no banco de dados
- ✅ UI moderna com componentes shadcn
- ✅ TypeScript em todo o código
- ✅ ESLint + Prettier para qualidade de código

## 🛠️ Tech Stack

- **Frontend:** Nuxt 3, Vue 3, TypeScript
- **UI:** TailwindCSS, shadcn-vue
- **Backend:** Supabase (PostgreSQL + Auth)
- **State:** Pinia, VueUse
- **Linting:** ESLint (@antfu/eslint-config), Prettier

## 📦 Instalação

### 1. Clone o repositório

```bash
cd workout-app
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Execute o SQL em `supabase/schema.sql` no SQL Editor do Supabase
3. Copie as credenciais (URL e Anon Key)

### 4. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` com suas credenciais:

```env
SUPABASE_URL=sua_url_aqui
SUPABASE_KEY=sua_key_aqui
```

### 5. Rode o projeto

```bash
npm run dev
```

Acesse `http://localhost:3000`

## 📁 Estrutura

```
workout-app/
├── assets/css/main.css     # CSS global com variáveis shadcn
├── components/ui/          # Componentes base (Button, Input, Card, etc.)
├── composables/            # Composables Vue
├── layouts/                # Layouts da aplicação
├── middleware/             # Middleware de rotas (auth)
├── pages/                  # Páginas do app
│   ├── index.vue           # Lista de treinos
│   ├── login.vue           # Login/Registro
│   ├── auth/callback.vue   # Callback de auth
│   └── workouts/[id].vue   # Detalhes do treino
├── stores/                 # Stores Pinia
├── supabase/schema.sql     # Schema do banco de dados
├── types/index.ts          # Types TypeScript
└── lib/utils.ts            # Utilitários
```

## 🗄️ Banco de Dados

O schema inclui 4 tabelas principais:

- **profiles** - Dados do usuário
- **workouts** - Treinos com nome e data
- **exercises** - Exercícios de cada treino
- **workout_sets** - Séries de cada exercício (reps, carga, etc.)

Todas as tabelas têm **Row Level Security (RLS)** ativado para garantir que cada usuário veja apenas seus próprios dados.

## 📝 Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run lint` | Verificar linting |
| `npm run lint:fix` | Corrigir linting |
| `npm run format` | Formatar código |
| `npm run type-check` | Verificar tipos |
| `npm run lint:all` | Rodar todas as verificações |

## 🎨 UI Components

Componentes shadcn incluídos:

- `Button` - Com variants (default, destructive, outline, secondary, ghost, link)
- `Input` - Input estilizado com focus ring
- `Card` - Container com borda e sombra
- `Label` - Label para formulários
- `Badge` - Badges para status e tags

## 🔐 Autenticação

O app usa Supabase Auth com email/senha. Ao se registrar, um perfil é automaticamente criado via trigger no banco.

## 📄 License

MIT
