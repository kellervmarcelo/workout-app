# YAFA — Yet Another Fitness App

App para registrar e acompanhar treinos de academia, construído com **Nuxt 3**, **Supabase** e **TailwindCSS**. Interface mobile-first em pt-BR.

## Features

- Autenticação com email/senha e login social (Google, GitHub)
- CRUD completo de treinos com data
- Exercícios com séries, repetições e carga — ou baseados em tempo (duração)
- Biblioteca de exercícios com 49 ícones SVG e filtro por grupo muscular
- Templates de treino: crie, edite e aplique em novos treinos
- Importação de template via markdown
- Timer de descanso configurável por exercício
- Timer de duração de série (exercícios baseados em tempo)
- Relatório mensal exportável em PDF
- Share card para Instagram/redes sociais
- Calendário de histórico e estatísticas de streak
- Onboarding tour para novos usuários
- Perfil com avatar customizável
- Row Level Security (RLS) — dados isolados por usuário no banco

## Tech Stack

- **Frontend:** Nuxt 3 (SPA, SSR desabilitado), Vue 3, TypeScript
- **UI:** TailwindCSS, componentes shadcn customizados, VueUse
- **Backend:** Supabase (PostgreSQL + Auth)
- **Extras:** Driver.js (onboarding), jsPDF (relatórios PDF), html-to-image (share card)
- **Linting:** ESLint (`@antfu/eslint-config`), Prettier

## Instalação

**Pré-requisitos:** Node.js 20+, Docker (para Supabase local)

### 1. Clone e instale dependências

```bash
git clone <repo>
cd workout-app
npm install
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

### 3. Inicie o Supabase local

```bash
npm run db:start   # sobe o Docker com Postgres + Auth local
npm run db:reset   # aplica todas as migrations
```

As credenciais locais são preenchidas automaticamente via `npm run db:use-local`.

### 4. (Opcional) Popule com dados de teste

```bash
npm run seed:all
```

### 5. Rode o projeto

```bash
npm run dev        # http://localhost:3000
```

Para testar em dispositivo móvel na mesma rede:

```bash
npm run dev:mobile # http://192.168.x.x:3001
```

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento (porta 3000) |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build de produção |
| `npm run lint` | Verificar linting |
| `npm run lint:fix` | Corrigir linting automaticamente |
| `npm run format` | Formatar código com Prettier |
| `npm run type-check` | Verificar tipos TypeScript |
| `npm run lint:all` | lint + format:check + type-check |
| `npm run db:start` | Iniciar Supabase local (Docker) |
| `npm run db:stop` | Parar Supabase local |
| `npm run db:reset` | Resetar banco e reaplicar migrations |
| `npm run db:studio` | Abrir Supabase Studio (UI do banco) |
| `npm run db:push` | Enviar migrations para produção |
| `npm run db:use-local` | Apontar `.env` para Supabase local |
| `npm run db:use-prod` | Apontar `.env` para Supabase de produção |
| `npm run seed:all` | Criar usuários de teste + seed de treinos |
| `npm run dev:mobile` | Dev server no IP da rede local (porta 3001) |

## Estrutura

```
workout-app/
├── assets/css/            # CSS global e variáveis de tema
├── components/
│   ├── ui/                # Componentes base: Button, Card, Input, Badge…
│   └── *.vue              # Componentes de feature: WorkoutShareCard, RestTimer…
├── composables/           # useAuth, useExerciseLibrary, useWorkoutReport…
├── middleware/            # auth.ts (proteção de rotas)
├── pages/
│   ├── index.vue          # Lista de treinos + criação
│   ├── login.vue          # Login e registro
│   ├── workouts/[id].vue  # Editor de treino (exercícios, séries, timers)
│   ├── templates.vue      # Gerenciamento de templates
│   ├── status.vue         # Calendário de histórico + streak
│   └── profile.vue        # Perfil e avatar
├── public/exercises/      # 49 ícones SVG de exercícios
├── supabase/migrations/   # Migrations SQL (11 arquivos)
├── types/index.ts         # Interfaces TypeScript
└── lib/utils.ts           # cn() e utilitários
```

## Banco de dados

Schema com 4 tabelas principais, todas com RLS ativado:

| Tabela | Descrição |
|--------|-----------|
| `profiles` | Dados do usuário (display name, avatar) |
| `workouts` | Treinos com nome, data e template de origem |
| `exercises` | Exercícios de cada treino (ordem, tempo de descanso) |
| `workout_sets` | Séries de cada exercício (reps, carga, duração) |
| `workout_templates` | Templates reutilizáveis de treino |
| `template_exercises` | Exercícios padrão de cada template |

Migrations ficam em `supabase/migrations/`. Para adicionar alterações ao schema, crie uma nova migration — nunca edite arquivos existentes.

## Licença

MIT
