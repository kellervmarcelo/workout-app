# Spec: Template Comments and Default Sets

## Objective

Adicionar duas funcionalidades à feature de templates de treino:

1. **Comentários gerais no template** — Campo de texto livre para notas/dicas sobre como usar o template (ex: "Descansar 2min entre séries", "Focar na forma"). Diferente do `description` (que explica o propósito do template), o `comments` é uma nota de uso durante a execução.

2. **Número padrão de séries por exercício** — Campo `default_sets` (INTEGER, default 3) em cada exercício do template.

3. **Geração automática de séries ao carregar template** — Quando o usuário carrega um template num treino, gerar automaticamente as `workout_sets` com os valores de reps, carga e número de séries do template.

### User Stories

1. **Como usuário**, quero adicionar comentários/dicas a um template para lembrar como executá-lo corretamente.
2. **Como usuário**, quero definir um número padrão de séries por exercício para não precisar preencher manualmente toda vez.
3. **Como usuário**, ao carregar um template num treino, quero que as séries já venham preenchidas com reps, carga e número de séries configurados.

### Success Criteria

- Campo `comments` (TEXT, nullable) na tabela `workout_templates`
- Campo `default_sets` (INTEGER, default 3) na tabela `template_exercises`
- Formulário de template permite editar comentários gerais
- Formulário de adicionar exercício ao template permite definir número de séries (default: 3)
- Painel inline de template exibe e permite editar comentários
- Ao carregar template num treino (`loadTemplate` em `workouts/[id].vue`), gerar `workout_sets` automaticamente baseado em `default_sets`, `default_reps` e `default_weight_kg`

## Tech Stack

| Categoria | Tecnologia |
|-----------|-----------|
| Framework | Nuxt 3 (SPA mode) |
| UI | shadcn-vue + TailwindCSS |
| Backend | Supabase (PostgreSQL + Auth) |

## Commands

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run lint` | Verificar linting |
| `npm run lint:fix` | Corrigir linting |

## Project Structure

```
supabase/
  migrations/
    006_template_comments_and_default_sets.sql   # Nova migração

pages/
  templates.vue          # Modificar (adicionar campo comments + default_sets)

pages/workouts/
  [id].vue               # Modificar (gerar sets ao carregar template)

types/
  index.ts               # Adicionar campos aos types
```

## Code Style

Mesmo padrão do projeto:
- `withDefaults(defineProps<Props>(), { ... })` + acessar via `props.xxx`
- `cn()` de `~/lib/utils` para merge de classes
- Formulários com `@submit.prevent`, estados de loading/error

## Testing Strategy

- Verificação manual:
  1. Criar template com comentários → verificar persistência
  2. Adicionar exercício com `default_sets=4` → verificar persistência
  3. Carregar template num treino → verificar que sets foram gerados automaticamente

## Boundaries

### Always
- Usar `withDefaults` em componentes com props
- Manter consistência visual com design system existente (shadcn-vue)
- Validar inputs antes de enviar ao Supabase
- `default_sets` mínimo: 1

### Ask First
- Alterar schema do banco (além do especificado aqui)
- Adicionar novas dependências

### Never
- Commitar secrets
- Usar `any` sem justificativa
- Remover policies RLS

## Database Changes

### Migration: `006_template_comments_and_default_sets.sql`

```sql
-- Adicionar campo de comentários gerais no template
ALTER TABLE workout_templates
  ADD COLUMN IF NOT EXISTS comments TEXT;

-- Adicionar número padrão de séries por exercício
ALTER TABLE template_exercises
  ADD COLUMN IF NOT EXISTS default_sets INTEGER NOT NULL DEFAULT 3;
```

## Implementation Order

1. **Migração** — Adicionar `comments` e `default_sets`
2. **Types** — Atualizar interfaces TypeScript
3. **templates.vue** — Adicionar campo de comentários + campo de séries no formulário
4. **workouts/[id].vue** — Modificar `loadTemplate` para gerar `workout_sets` automaticamente

## Open Questions

- Nenhuma no momento.
