import type { ExerciseType } from '~/types'

export interface ParsedExercise {
  name: string
  default_sets: number
  default_reps: number
  default_weight_kg: number
  default_rest_seconds: number
  exercise_type: ExerciseType
  default_duration_seconds?: number
}

export interface ParsedTemplate {
  name: string
  description: string
  comments: string
  exercises: ParsedExercise[]
}

const DEFAULT_SETS = 3
const DEFAULT_REPS = 10
const DEFAULT_REST = 60

// ---------------------------------------------------------------------------
// Helpers compartilhados
// ---------------------------------------------------------------------------

/**
 * Extrai o padrão NxM e o descanso opcional do final de uma string.
 * Aceita: 4x8, 3x10-12 (range → pega o menor), 3x30s (tempo → reps=0), case-insensitive.
 * O sufixo "Ns" separado ao final indica descanso em segundos: "3x10 30s" → rest=30.
 * Combinado: "3x30s 30s" → isTime=true, durationSeconds=30, restSeconds=30.
 */
function extractNxM(text: string): { sets: number, reps: number, durationSeconds: number | undefined, restSeconds: number, index: number } | null {
  const m = text.match(/(\d+)[xX](\d+)(?:-\d+)?(s)?(?:\s+(\d+)s)?\s*$/)
  if (!m)
    return null
  const isTime = !!m[3]
  return {
    sets: Number.parseInt(m[1], 10),
    reps: isTime ? 0 : Number.parseInt(m[2], 10),
    durationSeconds: isTime ? Number.parseInt(m[2], 10) : undefined,
    restSeconds: m[4] ? Number.parseInt(m[4], 10) : DEFAULT_REST,
    index: text.lastIndexOf(m[0]),
  }
}

function makeExercise(name: string, sets: number, reps: number, durationSeconds?: number, restSeconds: number = DEFAULT_REST): ParsedExercise {
  return {
    name,
    default_sets: sets,
    default_reps: reps,
    default_weight_kg: 0,
    default_rest_seconds: restSeconds,
    exercise_type: durationSeconds !== undefined ? 'time' : 'reps',
    default_duration_seconds: durationSeconds,
  }
}

// ---------------------------------------------------------------------------
// Formato 1 — Markdown estruturado: - [ ] nome ... NxM [Ns]
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

    // Exercício: - [ ] nome ... NxM [Ns]
    if (/^-\s*\[.?\]\s/.test(trimmed)) {
      const rest = trimmed.replace(/^-\s*\[.?\]\s+/, '')
      const nxm = extractNxM(rest)
      if (nxm) {
        const rawName = rest.slice(0, nxm.index).trim().replace(/[.\s]+$/, '')
        if (rawName)
          exercises.push(makeExercise(rawName, nxm.sets, nxm.reps, nxm.durationSeconds, nxm.restSeconds))
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
// Formato 2 — Lista com dash: - nome NxM [Ns]  (sem checkbox)
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
            exercises.push(makeExercise(exName, nxm.sets, nxm.reps, nxm.durationSeconds, nxm.restSeconds))
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
// Formato 3 — Lista plain: nome NxM [Ns]  (sem prefixo)
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
          exercises.push(makeExercise(exName, nxm.sets, nxm.reps, nxm.durationSeconds, nxm.restSeconds))
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
          exercises.push(makeExercise(exName, nxm.sets, nxm.reps, nxm.durationSeconds, nxm.restSeconds))
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
