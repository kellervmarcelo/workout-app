export interface ParsedExercise {
  name: string
  default_sets: number
  default_reps: number
  default_weight_kg: number
}

export interface ParsedTemplate {
  name: string
  description: string
  comments: string
  exercises: ParsedExercise[]
}

/**
 * Parseia markdown de treino para estrutura de template.
 *
 * Formato esperado:
 * ### ** NOME DO TREINO **
 * **descricao**
 * - [ ] Exercicio .......... 4x6-8
 * - [ ] Prancha ............ 3x30s
 * Linhas sem padrao NxM -> comments
 */
export function useMarkdownTemplate() {
  function parseExerciseLine(line: string): ParsedExercise | null {
    // Deve comecar com "- [ ]"
    if (!/^-\s*\[.?\]\s/.test(line))
      return null

    // Remover o prefixo "- [ ] "
    const rest = line.replace(/^-\s*\[.?\]\s+/, '')

    // Encontrar o padrao NxM no final da string
    // Procura por "digitos x digitos" opcionalmente seguido de "-digitos" ou "s"
    const setRepsMatch = rest.match(/(\d+)x(\d+)(?:-(\d+))?(s)?\s*$/)
    if (!setRepsMatch)
      return null

    const [, setsStr, repsStr, , isTime] = setRepsMatch
    const matchIndex = rest.lastIndexOf(setRepsMatch[0])

    // Nome e tudo antes do padrao NxM, removendo pontos e espacos finais
    const rawName = rest.slice(0, matchIndex).trim().replace(/[.\s]+$/, '')

    if (!rawName)
      return null

    return {
      name: rawName,
      default_sets: Number.parseInt(setsStr, 10),
      default_reps: isTime ? 0 : Number.parseInt(repsStr, 10),
      default_weight_kg: 0,
    }
  }

  function parse(markdown: string): ParsedTemplate {
    const lines = markdown.split('\n')

    let name = ''
    let description = ''
    const comments: string[] = []
    const exercises: ParsedExercise[] = []

    let headerFound = false

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed)
        continue

      // Tentar extrair nome do header: ### ** texto **
      if (!headerFound) {
        if (/^#{1,6}\s/.test(trimmed) && /\*{2}/.test(trimmed)) {
          // Limpar: remover ###, **, caracteres especiais
          name = trimmed
            .replace(/^#{1,6}\s/, '')
            .replace(/\*+/g, '')
            .replace(/[^\w\s()-]/g, '')
            .trim()
          headerFound = true
          continue
        }
      }

      // Tentar extrair descricao (logo apos header): **texto**
      if (headerFound && !description) {
        const boldMatch = trimmed.match(/^\*{2}(.+)\*{2}$/)
        if (boldMatch) {
          description = boldMatch[1].trim()
          continue
        }
      }

      // Tentar parsear exercicio
      const exercise = parseExerciseLine(trimmed)
      if (exercise) {
        exercises.push(exercise)
        continue
      }

      // Linha sem padrao -> comentarios
      if (headerFound) {
        comments.push(trimmed)
      }
    }

    return {
      name,
      description,
      comments: comments.join('\n'),
      exercises,
    }
  }

  return { parse }
}
