# Spec: Markdown Import for Templates

## Objetivo

Permitir a criação rápida de templates a partir de texto markdown, como alternativa ao formulário individual de exercícios. O usuário cola o markdown e os exercícios são parseados e adicionados automaticamente.

### User Stories

1. **Como usuário**, quero colar um treino em formato markdown para criar um template rapidamente, sem adicionar exercício por exercício.
2. **Como usuário**, quero que o nome e descrição do template sejam extraídos automaticamente do cabeçalho do markdown.
3. **Como usuário**, quero poder alternar entre o modo individual e o modo markdown no painel do template.

### Exemplo de entrada

```markdown
### **🔹 FULL BODY A (Segunda)**

**Força + densidade | Descanso: 45-60s**

- [ ]  Agachamento com Barra .......... 4x6-8
- [ ]  Supino Retto com Halteres ....... 3x8-10
- [ ]  Remada Curvada ................. 3x8-10
- [ ]  Desenvolvimento Militar ......... 3x10-12
- [ ]  Prancha com Toque no Ombro ..... 3x30s
- [ ]  Finisher (5 rounds): 10 Agachamento Livre + 10 Flexão
```

### Regras de parsing

| Padrão | Comportamento |
|--------|--------------|
| `4x6-8` | `default_sets=4`, `default_reps=6` (menor do range) |
| `3x10-12` | `default_sets=3`, `default_reps=10` |
| `3x30s` | `default_sets=3`, `default_reps=0`, `default_weight_kg=0` (baseado em tempo) |
| `3x30` | `default_sets=3`, `default_reps=30` (número normal) |
| Linha sem padrão `NxM` | Adicionada ao campo `comments` do template |
| Cabeçalho `### **🔹 NOME**` | Extraído como `name` do template |
| Linha `**descrição**` logo após cabeçalho | Extraída como `description` do template |
| Carga não especificada | `default_weight_kg=0` |

### Padrão regex para exercícios

```regex
- \[.\]\s*([^-]+?)[\s.]+(\d+)x(\d+)(?:-(\d+))?(s)?
```

Grupos capturados:
1. Nome do exercício
2. Número de séries
3. Reps (menor valor)
4. Reps maior (opcional, ignorado)
5. Flag `s` para exercícios baseados em tempo

## Tech Stack

| Categoria | Tecnologia |
|-----------|-----------|
| Framework | Nuxt 3 (SPA mode) |
| UI | shadcn-vue + TailwindCSS |
| Parsing | Regex nativo (sem dependência externa) |

## Commands

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run lint` | Verificar linting |
| `npm run lint:fix` | Corrigir linting |

## Project Structure

```
composables/
  useMarkdownTemplate.ts    # Novo: lógica de parsing de markdown

pages/
  templates.vue             # Modificar: adicionar toggle + textarea markdown
```

## Code Style

Mesmo padrão do projeto:
- `withDefaults(defineProps<Props>(), { ... })` + acessar via `props.xxx`
- `cn()` de `~/lib/utils` para merge de classes
- Sem dependências externas desnecessárias

## Testing Strategy

- Verificação manual:
  1. Colar o markdown de exemplo no textarea
  2. Clicar em "Importar" → verificar preview dos exercícios parseados
  3. Confirmar → verificar que exercícios foram adicionados ao template
  4. Verificar que nome/descrição foram extraídos do cabeçalho
  5. Verificar que linhas sem padrão foram adicionadas aos comentários

## Boundaries

### Always
- Usar regex nativo (sem bibliotecas externas)
- Validar parsing antes de inserir no banco
- Mostrar preview dos exercícios antes de confirmar importação
- Tratar gracefulmente linhas mal formatadas

### Ask First
- Adicionar novas dependências
- Alterar schema do banco (além do especificado)

### Never
- Usar `eval()` ou `new Function()` para parsing
- Descartar exercícios parseados sem confirmar
- Sobrescrever exercícios existentes sem aviso

## Success Criteria

- [ ] Composable `useMarkdownTemplate` parseia corretamente o formato de exemplo
- [ ] Toggle entre modo individual e modo markdown no painel do template
- [ ] Textarea markdown com botão "Importar"
- [ ] Preview dos exercícios parseados antes de confirmar
- [ ] Nome extraído do cabeçalho `### **...**`
- [ ] Descrição extraída da linha `**...**` após cabeçalho
- [ ] Exercícios com range (`6-8`) usam menor valor para reps
- [ ] Exercícios com `s` (`30s`) têm reps=0 e weight=0
- [ ] Linhas sem padrão NxM vão para comments
- [ ] Build e lint passam sem errors

## Open Questions

- Nenhuma no momento.
