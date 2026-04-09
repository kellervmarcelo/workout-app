# Spec: Biblioteca de Exercícios

## Objective

Adicionar uma biblioteca de exercícios (~50 exercícios comuns) em arquivo estático, acessível via drawer/modal ao criar/editar treinos. O usuário pode buscar, filtrar por grupo muscular, visualizar descrição + GIF e adicionar exercícios ao treino atual. Ao salvar o treino, os exercícios são persistidos no banco para reuso.

### User Stories

1. **Como usuário**, ao criar um treino, quero abrir uma lista de exercícios, buscar por nome ou filtrar por grupo muscular, e clicar para adicionar ao meu treino.
2. **Como usuário**, quero ver uma breve descrição e um GIF demonstrativo de como executar o exercício antes de adicioná-lo.
3. **Como usuário**, quero que os exercícios adicionados ao meu treino sejam salvos no banco para que eu possa reutilizá-los em treinos futuros.

### Success Criteria

- Drawer/modal abre ao clicar "Adicionar exercício" na página de treino
- Lista com ~50 exercícios pré-cadastrados (nome, descrição, grupo muscular, GIF URL)
- Busca por nome funciona em tempo real
- Filtro por grupo muscular (peito, costas, pernas, ombro, bíceps, tríceps, core, glúteos, panturrilha)
- Ao clicar num exercício, ele é adicionado ao treino atual com feedback visual
- Exercícios salvos no banco ao salvar o treino (tabela `exercises` existente)
- GIFs exibidos corretamente no drawer
- Todo fluxo acessível via teclado (tab + enter)
- LLS (Row Level Security) garante que dados são isolados por usuário

## Tech Stack

| Categoria | Tecnologia |
|-----------|-----------|
| Framework | Nuxt 3 + Vue 3 |
| Linguagem | TypeScript (strict mode) |
| UI | shadcn-vue + TailwindCSS |
| Estado | Pinia + VueUse |
| Dados estáticos | `data/exercises.ts` (array tipado) |
| Backend | Supabase (PostgreSQL + RLS) |
| Animações | Vue Transition (nativo) ou `@vueuse/motion` |

## Commands

```bash
# Dev
npm run dev

# Build
npm run build

# Lint + Format + Type Check
npm run lint:all

# Type check only
npm run type-check
```

## Project Structure

```
workout-app/
├── data/
│   └── exercises.ts              # Array estático com ~50 exercícios
├── types/
│   └── index.ts                  # Adicionar tipo ExerciseLibraryItem
├── components/
│   ├── ExercisePickerDrawer.vue  # Drawer com busca + filtro + lista
│   └── ui/
│       └── Drawer.vue            # Componente base (shadcn-style)
├── pages/
│   └── workouts/[id].vue         # Integração com o picker (botão "Adicionar exercício")
├── composables/
│   └── useExerciseLibrary.ts     # Busca, filtro e estado do picker
└── assets/
    └── gifs/                     # GIFs dos exercícios (ou CDN externo)
```

## Code Style

### Tipo do Exercício

```typescript
// types/index.ts
export interface ExerciseLibraryItem {
  id: string // slug único: "bench-press", "squat", etc.
  name: string // "Supino Reto com Barra"
  description: string // "Deite no banco, segure a barra..."
  muscleGroup: MuscleGroup // "peito" | "costas" | "pernas" | "ombro" | "bíceps" | "tríceps" | "core" | "glúteos" | "panturrilha"
  gifUrl: string // "/gifs/bench-press.gif" ou URL externa
}

export type MuscleGroup
  = | 'peito'
    | 'costas'
    | 'pernas'
    | 'ombro'
    | 'bíceps'
    | 'tríceps'
    | 'core'
    | 'glúteos'
    | 'panturrilha'
```

### Composable de Busca/Filtro

```typescript
// composables/useExerciseLibrary.ts
import { computed, ref } from 'vue'
import { exerciseLibrary } from '~/data/exercises'

export function useExerciseLibrary() {
  const searchQuery = ref('')
  const selectedGroup = ref<string | null>(null)

  const filteredExercises = computed(() => {
    return exerciseLibrary.filter((ex) => {
      const matchesSearch = ex.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      const matchesGroup = !selectedGroup.value || ex.muscleGroup === selectedGroup.value
      return matchesSearch && matchesGroup
    })
  })

  const resetFilters = () => {
    searchQuery.value = ''
    selectedGroup.value = null
  }

  return { searchQuery, selectedGroup, filteredExercises, resetFilters }
}
```

### Padrão de Componente

- Usar `withDefaults(defineProps<Props>(), { ... })` sempre
- Acessar props via `props.xxx` no template (sem destructuring)
- Usar função `cn()` de `~/lib/utils` para merge de classes Tailwind
- Drawer usa `<Transition>` nativo do Vue para animação

### Convenções de Nomenclatura

- Arquivos: `PascalCase.vue` para componentes, `camelCase.ts` para utilitários
- Composables: `useXxx.ts` → `useXxx()`
- Types: `PascalCase` (interfaces e tipos)
- IDs de exercícios: kebab-case (`"bench-press"`, `"squat"`)

## Testing Strategy

**Framework:** Sem framework de testes automatizados configurado no projeto atual.

**Verificação manual:**
- Abrir página de treino → clicar "Adicionar exercício" → drawer abre
- Digitar na busca → lista filtra em tempo real
- Selecionar grupo muscular → lista filtra corretamente
- Clicar exercício → adicionado ao treino com feedback visual
- Salvar treino → exercícios persistidos no Supabase
- Reabrir treino → exercícios carregados do banco

**Testes futuros (se adicionar Vitest/Playwright):**
- `composables/useExerciseLibrary.test.ts` — teste de busca e filtro
- `components/ExercisePickerDrawer.test.ts` — teste de interação
- `e2e/exercise-picker.spec.ts` — teste de fluxo completo

## Boundaries

### Always
- Usar `withDefaults` em todos os componentes com props
- Acessar props via `props.xxx` no template
- Rodar `npm run lint:all` antes de commits
- Criar branch nova: `feat:exercise-library`
- Validar inputs do usuário (busca, seleção)
- Manter GIFs otimizados (< 1MB cada)
- Usar RLS no Supabase para isolar dados por usuário

### Ask First
- Adicionar mais de 100 exercícios ao arquivo estático
- Trocar GIFs por CDN externo
- Mudar estrutura do schema do Supabase
- Adicionar novas dependências (bibliotecas de animação, etc.)

### Never
- Usar `useSupabaseSession()` (usar `useSupabaseClient().auth.getSession()`)
- Commitar `.env` com credenciais
- Editar `node_modules/` ou `.nuxt/` manualmente
- Remover testes ou linting sem aprovação
- Hardcodar URLs do Supabase (usar variáveis de ambiente)

## Implementation Order

1. **Tipos e dados estáticos** — `types/index.ts` + `data/exercises.ts` (~50 exercícios)
2. **Composable** — `composables/useExerciseLibrary.ts` (busca + filtro)
3. **Componente Drawer** — `components/ExercisePickerDrawer.vue` (UI completa)
4. **Integração** — `pages/workouts/[id].vue` (botão + estado + salvar no banco)
5. **GIFs** — Assets ou URLs externas

## Decisions

1. **GIFs:** CDN externo (Giphy ou similar) — sem necessidade de hospedar localmente
2. **Duplicação:** NÃO permitir adicionar o mesmo exercício duas vezes no mesmo treino (feedback visual: "Exercício já adicionado")
3. **Ordem:** Exercício novo sempre adicionado ao final da lista
4. **Lista de exercícios:** ~50 exercícios comuns definidos pelo agente (supino, agachamento, terra, desenvolvimento, remada, etc.)

## Open Questions

*(Todas resolvidas)*

## Success Criteria Checklist

- [ ] `data/exercises.ts` com ~50 exercícios (id, nome, descrição, grupo muscular, gifUrl)
- [ ] `composables/useExerciseLibrary.ts` com busca + filtro funcionais
- [ ] `components/ExercisePickerDrawer.vue` abre/fecha com animação
- [ ] Busca por nome filtra em tempo real
- [ ] Filtro por grupo muscular funciona
- [ ] GIF exibido corretamente para cada exercício
- [ ] Ao clicar, exercício adicionado ao treino com feedback visual
- [ ] Exercícios salvos no Supabase ao salvar treino
- [ ] RLS garante isolamento por usuário
- [ ] `npm run lint:all` passa sem erros
- [ ] Branch `feat:exercise-library` com commit message clara
