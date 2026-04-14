export interface User {
  id: string
  email: string
  display_name?: string
  avatar_url?: string
  created_at: string
}

export interface Workout {
  id: string
  user_id: string
  name: string
  notes?: string
  date: string
  created_at: string
  updated_at: string
}

export interface Exercise {
  id: string
  workout_id: string
  name: string
  notes?: string
  order: number
  created_at: string
}

export interface WorkoutSet {
  id: string
  exercise_id: string
  set_number: number
  reps: number
  weight_kg: number
  rest_seconds?: number
  completed: boolean
  created_at: string
}

export type WorkoutWithExercises = Workout & {
  exercises: ExerciseWithSets[]
}

export type ExerciseWithSets = Exercise & {
  sets: WorkoutSet[]
}

export interface WorkoutTemplate {
  id: string
  user_id: string
  name: string
  description?: string
  comments?: string
  created_at: string
  updated_at: string
}

export interface TemplateExercise {
  id: string
  template_id: string
  name: string
  order: number
  default_reps: number
  default_weight_kg: number
  default_sets: number
  created_at: string
}

export type WorkoutTemplateWithExercises = WorkoutTemplate & {
  exercises: TemplateExercise[]
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

export interface ExerciseLibraryItem {
  id: string
  name: string
  description: string
  muscleGroup: MuscleGroup
  imageUrl: string
}
