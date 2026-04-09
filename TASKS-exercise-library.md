# Tasks: Biblioteca de Exercícios

## Task 1: Tipos e Dados Estáticos

- [ ] **Task:** Adicionar tipos e criar arquivo com ~50 exercícios
- **Acceptance:**
  - `ExerciseLibraryItem` e `MuscleGroup` exportados em `types/index.ts`
  - `data/exercises.ts` exporta `exerciseLibrary` com 50 exercícios
  - Cada exercício tem: id (slug), name, description, muscleGroup, gifUrl (Giphy)
  - Todos os 9 grupos musculares representados
- **Verify:** `npm run type-check` passa sem erros
- **Files:** `types/index.ts`, `data/exercises.ts`

---

## Task 2: Composable de Busca e Filtro

- [ ] **Task:** Criar `useExerciseLibrary` composable
- **Acceptance:**
  - `searchQuery` ref reativo
  - `selectedGroup` ref reativo (null = todos)
  - `filteredExercises` computed com busca + filtro
  - `resetFilters()` função
  - Busca case-insensitive por nome
  - Filtro exato por grupo muscular
- **Verify:** Testar manualmente no devtools ou com console.log
- **Files:** `composables/useExerciseLibrary.ts`

---

## Task 3: Componente Drawer

- [ ] **Task:** Criar `ExercisePickerDrawer.vue`
- **Acceptance:**
  - Props: `open` (boolean), `addedExerciseIds` (string[])
  - Emits: `close`, `select` (com exercício selecionado)
  - Barra de busca no topo (input com ícone)
  - Filtro por grupo muscular (badges clicáveis, scroll horizontal)
  - Lista scrollável com nome + descrição + GIF
  - Exercícios já adicionados mostram badge "Adicionado" e ficam disabled
  - Botão "Exercício customizado" no rodapé (fallback para input livre)
  - Fecha com ESC, botão X, ou click outside
  - Animação suave de entrada/saída
- **Verify:** Abrir/fechar drawer, testar busca, filtro, seleção e teclas
- **Files:** `components/ExercisePickerDrawer.vue`

---

## Task 4: Integração na Página de Treino

- [ ] **Task:** Integrar drawer em `pages/workouts/[id].vue`
- **Acceptance:**
  - Botão "Exercício" abre o `ExercisePickerDrawer` (em vez do form simples)
  - `onExerciseSelect` recebe o exercício e chama `addExerciseFromLibrary`
  - `addExerciseFromLibrary` insere no Supabase com nome do exercício da biblioteca
  - Exercícios já presentes no treino são marcados como "Adicionado" no drawer
  - Exercício customizado mantém comportamento atual (input de texto)
  - `npm run lint:all` passa sem erros
- **Verify:**
  1. Abrir treino existente → clicar "Exercício" → drawer abre
  2. Buscar "supino" → filtra corretamente
  3. Clicar em exercício → adicionado ao treino
  4. Tentar adicionar mesmo exercício → mostra "Adicionado"
  5. Salvar → exercício aparece no treino
  6. `npm run lint:all` limpo
- **Files:** `pages/workouts/[id].vue`
