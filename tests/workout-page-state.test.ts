import type { WorkoutWithExercises } from '../types'
import assert from 'node:assert/strict'

import {
  createWorkoutResumeController,
  updateWorkoutSetLocally,
} from '../lib/workout-page-state'

function run(name: string, fn: () => void) {
  try {
    fn()
    process.stdout.write(`ok - ${name}\n`)
  }
  catch (error) {
    process.stderr.write(`not ok - ${name}\n`)
    throw error
  }
}

function createWorkoutFixture(): WorkoutWithExercises {
  return {
    id: 'workout-1',
    user_id: 'user-1',
    name: 'Treino A',
    date: '2026-05-31',
    started_at: null,
    completed_at: null,
    created_at: '2026-05-31T00:00:00.000Z',
    updated_at: '2026-05-31T00:00:00.000Z',
    exercises: [
      {
        id: 'exercise-1',
        workout_id: 'workout-1',
        name: 'Supino',
        order: 0,
        rest_seconds: 60,
        exercise_type: 'reps',
        created_at: '2026-05-31T00:00:00.000Z',
        sets: [
          {
            id: 'set-1',
            exercise_id: 'exercise-1',
            set_number: 1,
            reps: 10,
            weight_kg: 20,
            rest_seconds: 60,
            completed: false,
            created_at: '2026-05-31T00:00:00.000Z',
          },
        ],
      },
    ],
  }
}

run('resume controller recovers once after tab becomes visible and debounces focus storms', () => {
  const controller = createWorkoutResumeController({ debounceMs: 1000, now: 0 })

  assert.equal(controller.onVisibilityChange(true, 100), false)
  assert.equal(controller.onVisibilityChange(false, 200), true)
  assert.equal(controller.onFocus(250, true), false)
  assert.equal(controller.onPageShow(500), false)
  assert.equal(controller.onFocus(1400, true), true)
})

run('resume controller ignores focus while document is hidden', () => {
  const controller = createWorkoutResumeController({ debounceMs: 500, now: 0 })

  assert.equal(controller.onFocus(100, false), false)
  assert.equal(controller.onVisibilityChange(true, 200), false)
  assert.equal(controller.onFocus(300, false), false)
  assert.equal(controller.onVisibilityChange(false, 900), true)
})

run('updateWorkoutSetLocally patches the matching set without touching others', () => {
  const workout = createWorkoutFixture()

  const updated = updateWorkoutSetLocally(workout, 'set-1', {
    reps: 12,
    weight_kg: 22.5,
    completed: true,
  })

  assert.equal(updated, true)
  assert.equal(workout.exercises[0].sets[0].reps, 12)
  assert.equal(workout.exercises[0].sets[0].weight_kg, 22.5)
  assert.equal(workout.exercises[0].sets[0].completed, true)
})

run('updateWorkoutSetLocally returns false for unknown sets', () => {
  const workout = createWorkoutFixture()

  const updated = updateWorkoutSetLocally(workout, 'missing-set', { reps: 99 })

  assert.equal(updated, false)
  assert.equal(workout.exercises[0].sets[0].reps, 10)
})
