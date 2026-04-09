# Spec: Onboarding Tour Interativo

## Objective

Apresentar um tour guiado automático para novos usuários no primeiro login após o cadastro, mostrando as funcionalidades principais da dashboard. O tour usa `driver.js` e persiste o status no banco (Supabase).

### User Stories

1. **Como novo usuário**, ao fazer meu primeiro login, quero ver um tour guiado pela dashboard para entender rapidamente como usar o app.
2. **Como usuário**, após completar o tour, não quero vê-lo novamente (status salvo no banco).

### Success Criteria

- Após criar conta + primeiro login, tour dispara automaticamente na dashboard (`/`)
- Tour tem 4-5 passos destacando elementos da UI da dashboard
- Status "tour completed" é salvo no banco (tabela `profiles`)
- Tour não aparece em logins subsequentes
- Tour é responsivo (funciona em mobile e desktop)
- `npm run lint:all` passa sem erros
- Build funciona sem warnings

## Tech Stack

| Categoria | Tecnologia |
|-----------|-----------|
| Biblioteca de Tour | `driver.js` (v1.3+) — leve, sem dependências, highlight via DOM |
| Framework | Nuxt 3 + Vue 3 |
| Linguagem | TypeScript (strict mode) |
| Backend | Supabase (adicionar campo `onboarding_completed` na tabela `profiles`) |
| State | Composable Vue reativo |
| UI | shadcn-vue + TailwindCSS (driver.js usa estilos próprios) |

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
├── composables/
│   └── useOnboardingTour.ts     # Composable: detecta primeiro login, inicia tour, salva status
├── pages/
│   └── index.vue                # Dashboard: integra o tour (referência aos elementos DOM)
├── types/
│   └── index.ts                 # Atualizar tipo Profile (campo onboarding_completed)
└── supabase/
    └── migrations/
        └── 002_add_onboarding_field.sql  # Migração: adicionar coluna em profiles
```

## Code Style

### Composable de Tour

```typescript
// composables/useOnboardingTour.ts
import { Driver } from 'driver.js'
import 'driver.js/dist/driver.css'

export function useOnboardingTour() {
  const supabase = useSupabaseClient()
  const tourCompleted = ref(false)
  const loading = ref(true)

  const driver = new Driver({
    animate: true,
    showProgress: true,
    overlayOpacity: 0.7,
    allowClose: true,
    stagePadding: 8,
    nextBtnText: 'Próximo',
    prevBtnText: 'Anterior',
    doneBtnText: 'Entendi!',
  })

  const steps = [
    {
      element: '[data-tour="workout-list"]',
      popover: {
        title: 'Seus Treinos',
        description: 'Aqui você vê todos os seus treinos organizados por data.',
        side: 'bottom' as const,
        align: 'start' as const,
      },
    },
    {
      element: '[data-tour="create-workout"]',
      popover: {
        title: 'Criar Novo Treino',
        description: 'Clique aqui para criar um novo treino rapidamente.',
        side: 'bottom' as const,
        align: 'start' as const,
      },
    },
    {
      element: '[data-tour="templates"]',
      popover: {
        title: 'Templates',
        description: 'Use templates para reaproveitar treinos que você já fez.',
        side: 'bottom' as const,
        align: 'start' as const,
      },
    },
    {
      element: '[data-tour="stats"]',
      popover: {
        title: 'Estatísticas',
        description: 'Veja o volume total, número de séries e exercícios de cada treino.',
        side: 'top' as const,
        align: 'start' as const,
      },
    },
  ]

  const checkTourStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', userId)
        .single()

      if (error) throw error
      tourCompleted.value = data?.onboarding_completed || false
    } catch (error) {
      console.error('Erro ao verificar status do tour:', error)
    } finally {
      loading.value = false
    }
  }

  const markTourCompleted = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', userId)

      if (error) throw error
      tourCompleted.value = true
    } catch (error) {
      console.error('Erro ao salvar status do tour:', error)
    }
  }

  const startTour = () => {
    if (tourCompleted.value || loading.value) return
    driver.setSteps(steps)
    driver.drive()
    driver.onDestroyed(() => {
      // Salva status quando o tour termina (completou ou fechou)
      const { data } = supabase.auth.getSession()
      if (data.session?.user) {
        markTourCompleted(data.session.user.id)
      }
    })
  }

  return { tourCompleted, loading, checkTourStatus, startTour }
}
```

### Integração na Dashboard

```vue
<!-- pages/index.vue -->
<script setup lang="ts">
// ... existing code ...
const { checkTourStatus, startTour } = useOnboardingTour()

onMounted(async () => {
  // ... existing auth + fetch logic ...
  if (session.value?.user) {
    await checkTourStatus(session.value.user.id)
    startTour()
  }
})
</script>

<template>
  <!-- Elementos com data-tour attributes -->
  <div data-tour="workout-list">
    <!-- Lista de treinos existente -->
  </div>

  <Button data-tour="create-workout" ...>
    Novo Treino
  </Button>

  <Button data-tour="templates" ...>
    Templates
  </Button>

  <Card data-tour="stats" ...>
    <!-- Stats existentes -->
  </Card>
</template>
```

### Migração SQL

```sql
-- 002_add_onboarding_field.sql
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE;
```

### Convenções

- `data-tour="..."` para identificar elementos alvo do tour
- Textos em pt-BR hardcoded (sem i18n)
- `onDestroyed` do driver.js para salvar status (captura both completar e fechar)
- Composable segue padrão do projeto: `useXxx.ts` → `useXxx()`

## Testing Strategy

**Sem framework de testes automatizados configurado.**

**Verificação manual:**

1. Criar conta nova → fazer login → tour aparece automaticamente na dashboard
2. Navegar pelos passos (Próximo, Anterior) → textos em pt-BR
3. Fechar o tour antes de terminar → status salvo como completed
4. Completar o tour → status salvo como completed
5. Fazer logout → login novamente → tour NÃO aparece
6. Testar responsividade (mobile + desktop)
7. `npm run lint:all` passa sem erros

**Testes futuros (se adicionar Vitest):**
- `composables/useOnboardingTour.test.ts` — mock Supabase, verificar checkTourStatus e markTourCompleted

## Boundaries

### Always
- Usar `data-tour` attributes nos elementos da dashboard
- Salvar status no banco ao fechar/completar o tour
- Verificar status do banco antes de iniciar o tour
- Rodar `npm run lint:all` antes de commits
- Criar branch nova: `feat/onboarding-tour`

### Ask first
- Adicionar opção de "refazer tour" nas configurações
- Adicionar mais páginas ao tour (além da dashboard)
- Trocar `driver.js` por outra biblioteca
- Adicionar i18n ao tour

### Never
- Usar `localStorage` como única fonte de verdade (sempre usar banco)
- Mostrar o tour para usuários que já completaram
- Commitar `.env` com credenciais
- Hardcodar URLs do Supabase

## Implementation Order

1. **Migração do banco** — Adicionar `onboarding_completed` em `profiles`
2. **Adicionar driver.js** — `npm install driver.js`
3. **Composable** — `useOnboardingTour.ts` (lógica completa)
4. **Integração na dashboard** — `data-tour` attributes + chamada do composable
5. **Teste manual** — Verificar fluxo completo

## Decisions

1. **driver.js** — Escolhida por ser leve (~4kb), sem dependências, funciona com qualquer framework, highlights via DOM overlay
2. **Persistência no banco** — Campo `onboarding_completed` na tabela `profiles` existente (sem tabela nova)
3. **Disparo automático** — Após `onMounted` + verificação de auth na dashboard
4. **Sem opção de refazer** — Fora do escopo MVP; pode ser adicionado depois

## Open Questions

*(Todas resolvidas)*

## Success Criteria Checklist

- [ ] `driver.js` instalado como dependência
- [ ] Migração SQL adiciona `onboarding_completed` em `profiles`
- [ ] `composables/useOnboardingTour.ts` com lógica completa
- [ ] `pages/index.vue` com `data-tour` attributes nos elementos
- [ ] Tour dispara automaticamente no primeiro login
- [ ] Tour não aparece em logins subsequentes
- [ ] Status salvo no banco ao fechar/completar
- [ ] Textos em pt-BR (Próximo, Anterior, Entendi!)
- [ ] Responsivo (mobile + desktop)
- [ ] `npm run lint:all` passa sem erros
- [ ] Build funciona sem warnings
