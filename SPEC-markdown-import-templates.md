# Spec: Markdown Import for Templates

## Objetivo

Permitir a criação rápida de templates a partir de texto markdown, como alternativa ao formulário individual de exercícios.

### Regras de parsing

| Entrada | Resultado |
|---------|-----------|
| `4x6-8` | 4 séries, 6 reps (menor do range), carga=0 |
| `3x30s` | 3 séries, reps=0, carga=0 (baseado em tempo) |
| `3x30` | 3 séries, 30 reps, carga=0 |
| Linha sem padrão NxM | Vai para `comments` |
| `### ** FULL BODY A **` | Nome do template |
| `**Força + densidade**` | Descrição do template |

### Arquivos

| Arquivo | Ação |
|---------|------|
| `composables/useMarkdownTemplate.ts` | **Novo** — lógica de parsing com abordagem manual |
| `pages/templates.vue` | Toggle + textarea + preview no create dialog e inline panel |

### Fluxo

1. **Create dialog**: tabs Manual/Markdown → cola → parse → preview → cria template
2. **Inline panel**: toggle Individual/Markdown → cola → parse → preview → adiciona exercícios
