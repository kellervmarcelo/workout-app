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

const DEFAULT_SETS = 3
const DEFAULT_REPS = 10

// ---------------------------------------------------------------------------
// Helpers compartilhados
// ---------------------------------------------------------------------------

/**
 * Extrai o padrão NxM do final de uma string.
 * Aceita: 4x8, 3x10-12 (range → pega o menor), 3x30s (tempo → reps=0), case-insensitive.
 */
function extractNxM(text: string): { sets: number, reps: number, index: number } | null {
  const m = text.match(/(\d+)[xX](\d+)(?:-\d+)?(s)?\s*$/)
  if (!m)
    return null
  return {
    sets: Number.parseInt(m[1], 10),
    reps: m[3] ? 0 : Number.parseInt(m[2], 10), // "s" = baseado em tempo → reps=0
    index: text.lastIndexOf(m[0]),
  }
}

function makeExercise(name: string, sets: number, reps: number): ParsedExercise {
  return { name, default_sets: sets, default_reps: reps, default_weight_kg: 0 }
}

// ---------------------------------------------------------------------------
// Formato 1 — Markdown estruturado: - [ ] nome ... NxM
// ---------------------------------------------------------------------------

function parseMarkdownFormat(lines: string[]): ParsedTemplate {
  let name = ''
  let description = ''
  const comments: string[] = []
  const exercises: ParsedExercise[] = []
  let headerFound = false

  for (const trimmed of lines) {
    // Header: ### ** NOME **
    if (!headerFound) {
      if (/^#{1,6}\s/.test(trimmed) && /\*{2}/.test(trimmed)) {
        name = trimmed
          .replace(/^#{1,6}\s/, '')
          .replace(/\*+/g, '')
          .replace(/[^\w\s()-]/g, '')
          .trim()
        headerFound = true
        continue
      }
    }

    // Descrição: **texto** logo após o header
    if (headerFound && !description) {
      const boldMatch = trimmed.match(/^\*{2}(.+)\*{2}$/)
      if (boldMatch) {
        description = boldMatch[1].trim()
        continue
      }
    }

    // Exercício: - [ ] nome ... NxM
    if (/^-\s*\[.?\]\s/.test(trimmed)) {
      const rest = trimmed.replace(/^-\s*\[.?\]\s+/, '')
      const nxm = extractNxM(rest)
      if (nxm) {
        const rawName = rest.slice(0, nxm.index).trim().replace(/[.\s]+$/, '')
        if (rawName)
          exercises.push(makeExercise(rawName, nxm.sets, nxm.reps))
        continue
      }
    }

    // Resto → comments
    if (headerFound)
      comments.push(trimmed)
  }

  return { name, description, comments: comments.join('\n'), exercises }
}

// ---------------------------------------------------------------------------
// Formato 2 — Lista com dash: - nome NxM  (sem checkbox)
// ---------------------------------------------------------------------------

function parseDashList(lines: string[]): ParsedTemplate {
  let name = ''
  let description = ''
  const comments: string[] = []
  const exercises: ParsedExercise[] = []

  // Estados: header (antes dos exercícios), exercises, comments
  let state: 'header' | 'exercises' | 'comments' = 'header'

  for (const trimmed of lines) {
    const isDash = /^-\s+\S/.test(trimmed)

    if (state === 'header') {
      if (isDash) {
        state = 'exercises'
        // cai no bloco abaixo intencionalmente — processa a linha de exercício
      }
      else {
        if (!name)
          name = trimmed
        else if (!description)
          description = trimmed
        // mais de 2 linhas de cabeçalho → ignoradas (edge case improvável)
        continue
      }
    }

    if (state === 'exercises') {
      if (isDash) {
        const rest = trimmed.replace(/^-\s+/, '')
        const nxm = extractNxM(rest)
        if (nxm) {
          const exName = rest.slice(0, nxm.index).trim()
          if (exName)
            exercises.push(makeExercise(exName, nxm.sets, nxm.reps))
        }
        else {
          // Linha "- nome" sem NxM → exercício com default
          const exName = rest.trim()
          if (exName)
            exercises.push(makeExercise(exName, DEFAULT_SETS, DEFAULT_REPS))
        }
      }
      else {
        // Linha sem dash após exercícios → comments
        state = 'comments'
        comments.push(trimmed)
      }
      continue
    }

    if (state === 'comments') {
      comments.push(trimmed)
    }
  }

  return { name, description, comments: comments.join('\n'), exercises }
}

// ---------------------------------------------------------------------------
// Formato 3 — Lista plain: nome NxM  (sem prefixo)
// ---------------------------------------------------------------------------

function parsePlainList(lines: string[]): ParsedTemplate {
  let name = ''
  let description = ''
  const comments: string[] = []
  const exercises: ParsedExercise[] = []

  // Estados: header (antes dos exercícios), exercises, comments
  let state: 'header' | 'exercises' | 'comments' = 'header'

  for (const trimmed of lines) {
    const nxm = extractNxM(trimmed)

    if (state === 'header') {
      if (nxm) {
        // Primeira linha com NxM → começa os exercícios (nome fica vazio)
        state = 'exercises'
        const exName = trimmed.slice(0, nxm.index).trim()
        if (exName)
          exercises.push(makeExercise(exName, nxm.sets, nxm.reps))
      }
      else {
        if (!name) {
          name = trimmed
        }
        else if (!description) {
          description = trimmed
          state = 'exercises' // após nome + descrição, próxima linha já é exercício
        }
      }
      continue
    }

    if (state === 'exercises') {
      if (nxm) {
        const exName = trimmed.slice(0, nxm.index).trim()
        if (exName)
          exercises.push(makeExercise(exName, nxm.sets, nxm.reps))
      }
      else {
        // Linha sem NxM após exercícios → comments
        state = 'comments'
        comments.push(trimmed)
      }
      continue
    }

    if (state === 'comments') {
      comments.push(trimmed)
    }
  }

  return { name, description, comments: comments.join('\n'), exercises }
}

// ---------------------------------------------------------------------------
// Detecção automática de formato
// ---------------------------------------------------------------------------

function detectFormat(lines: string[]): 'markdown' | 'dash' | 'plain' {
  if (lines.some(l => /^-\s*\[.?\]/.test(l)))
    return 'markdown'
  if (lines.some(l => /^-\s+\S/.test(l)))
    return 'dash'
  return 'plain'
}

// ---------------------------------------------------------------------------
// Composable público
// ---------------------------------------------------------------------------

export function useMarkdownTemplate() {
  function parse(markdown: string): ParsedTemplate {
    const lines = markdown.split('\n').map(l => l.trim()).filter(Boolean)
    const format = detectFormat(lines)
    if (format === 'markdown')
      return parseMarkdownFormat(lines)
    if (format === 'dash')
      return parseDashList(lines)
    return parsePlainList(lines)
  }

  return { parse }
}
