# SPEC: Cronômetro de Duração do Treino

## Problema

O app não rastreia quanto tempo dura um treino. O usuário não tem feedback sobre a duração real e não consegue ver esse dado no histórico.

## Solução

Adicionar rastreamento automático de duração do treino, exibindo-a no card da lista de treinos.

## Comportamento Esperado

### Início (`started_at`)

- `started_at` é setado automaticamente quando o **primeiro set** de qualquer exercício é marcado como concluído (via checkbox individual ou "marcar todos")
- Não requer ação manual do usuário
- Uma vez setado, `started_at` **não é limpado** se o set for desmarcado

### Fim (`completed_at`)

- `completed_at` já existe e é setado pelo mecanismo atual:
  - Automaticamente quando todos os sets do treino são concluídos
  - Manualmente via botão "Finalizar Treino"
- Nenhuma mudança no mecanismo de fim

### Duração

- Calculada como `completed_at - started_at`
- Exibida em formato humano: `45min`, `1h 23min`
- Granularidade: minutos (arredondado)
- Só exibida quando ambos `started_at` e `completed_at` estão presentes e `completed_at > started_at`

### Casos Especiais

| Situação | Comportamento |
|---|---|
| Treino finalizado manualmente sem nenhum set marcado | `started_at` permanece `null` → duração não exibida |
| Set desmarcado após ser o único completo | `started_at` não é limpado — duração calculada do início real |
| `completed_at ≤ started_at` (clock skew ou bug) | Duração não exibida |
| Treino em andamento (sem `completed_at`) | Duração não exibida |

## Mudanças no Banco

### Migration 012

```sql
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;
```

Sem backfill de produção — dados históricos terão `started_at = null` e não exibirão duração.

## Mudanças no Código

| Arquivo | Mudança |
|---|---|
| `types/index.ts` | Adiciona `started_at?: string \| null` em `Workout` |
| `composables/useWorkoutMetrics.ts` | Adiciona `formatDuration(started, completed)` |
| `components/WorkoutCard.vue` | Exibe duração com ícone de relógio |
| `pages/workouts/[id].vue` | Seta `started_at` no primeiro set marcado como completo |
| `supabase/seed.sql` | Backfill de `completed_at` e `started_at` com durações realistas |
| `supabase/seed-workouts.sql` | Atualiza backfill existente para incluir `started_at` |

## Acceptance Criteria

- [ ] Marcar o primeiro set de um treino persiste `started_at` no banco
- [ ] Marcar sets subsequentes não altera `started_at`
- [ ] Usar "marcar todos" como primeiro set também persiste `started_at`
- [ ] Desmarcar sets não limpa `started_at`
- [ ] Finalizar treino (automático ou manual) persiste `completed_at`
- [ ] Card na lista exibe duração quando treino está completo e `started_at` disponível
- [ ] Card na lista não exibe duração para treinos sem `started_at` ou incompletos
- [ ] Seeds incluem `started_at` em treinos completos — duração visível imediatamente após `npm run db:reset`
- [ ] `npm run type-check` passa sem erros relacionados à feature
- [ ] `npm run lint` passa sem erros

## Fora do Escopo

- Timer em tempo real durante o treino
- Pausar/retomar o cronômetro
- Duração dentro da tela de detalhe do treino (só na lista)
- Notificações ou alertas de tempo
- Edição manual de `started_at` pelo usuário
