import assert from 'node:assert/strict'

import {
  clearGlobalUiSideEffects,
  createForegroundRecoveryController,
} from '../lib/foreground-recovery'

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

run('foreground recovery controller recovers once after tab becomes visible and debounces focus storms', () => {
  const controller = createForegroundRecoveryController({ debounceMs: 1000, now: 0 })

  assert.equal(controller.onVisibilityChange(true, 100), false)
  assert.equal(controller.onVisibilityChange(false, 200), true)
  assert.equal(controller.onFocus(250, true), false)
  assert.equal(controller.onPageShow(500), false)
  assert.equal(controller.onFocus(1400, true), true)
})

run('foreground recovery controller ignores focus while document is hidden', () => {
  const controller = createForegroundRecoveryController({ debounceMs: 500, now: 0 })

  assert.equal(controller.onFocus(100, false), false)
  assert.equal(controller.onVisibilityChange(true, 200), false)
  assert.equal(controller.onFocus(300, false), false)
  assert.equal(controller.onVisibilityChange(false, 900), true)
})

run('clearGlobalUiSideEffects restores global styles and removes tagged overlays', () => {
  const removedKinds: string[] = []
  const overlays = [
    {
      getAttribute(name: string) {
        return name === 'data-overlay-kind' ? 'exercise-picker-drawer' : null
      },
      remove() {
        removedKinds.push('exercise-picker-drawer')
      },
    },
    {
      getAttribute(name: string) {
        return name === 'data-overlay-kind' ? 'workout-timer-modal' : null
      },
      remove() {
        removedKinds.push('workout-timer-modal')
      },
    },
  ]

  const result = clearGlobalUiSideEffects({
    body: {
      style: {
        overflow: 'hidden',
        pointerEvents: 'none',
        touchAction: 'none',
      },
    },
    documentElement: {
      style: {
        overflow: 'hidden',
        pointerEvents: 'none',
        touchAction: 'manipulation',
      },
    },
    querySelectorAll(selector: string) {
      assert.equal(selector, '[data-transient-overlay="true"]')
      return overlays
    },
  })

  assert.deepEqual(result.restoredStyles, [
    'body.overflow',
    'body.pointerEvents',
    'body.touchAction',
    'documentElement.overflow',
    'documentElement.pointerEvents',
    'documentElement.touchAction',
  ])
  assert.equal(result.removedOverlayCount, 2)
  assert.deepEqual(result.removedOverlayKinds, ['exercise-picker-drawer', 'workout-timer-modal'])
  assert.deepEqual(removedKinds, ['exercise-picker-drawer', 'workout-timer-modal'])
})

run('clearGlobalUiSideEffects tolerates missing document-like objects', () => {
  const result = clearGlobalUiSideEffects()

  assert.equal(result.removedOverlayCount, 0)
  assert.deepEqual(result.restoredStyles, [])
  assert.deepEqual(result.removedOverlayKinds, [])
})
