export type ForegroundRecoveryReason = 'visibilitychange' | 'focus' | 'pageshow'

interface ForegroundRecoveryControllerOptions {
  debounceMs?: number
  now?: number
}

interface StyleLike {
  overflow?: string
  pointerEvents?: string
  touchAction?: string
}

interface OverlayNodeLike {
  getAttribute?: (name: string) => string | null
  remove?: () => void
}

interface RecoveryDocumentLike {
  body?: { style?: StyleLike | null } | null
  documentElement?: { style?: StyleLike | null } | null
  querySelectorAll?: (selector: string) => ArrayLike<OverlayNodeLike> | Iterable<OverlayNodeLike>
}

export function createForegroundRecoveryController(options: ForegroundRecoveryControllerOptions = {}) {
  const debounceMs = options.debounceMs ?? 750
  let wasHidden = false
  let lastRecoveryAt = (options.now ?? Date.now()) - debounceMs

  function canRecover(now: number) {
    return now - lastRecoveryAt >= debounceMs
  }

  function commitRecovery(now: number) {
    wasHidden = false
    lastRecoveryAt = now
    return true
  }

  return {
    onVisibilityChange(isHidden: boolean, now = Date.now()) {
      if (isHidden) {
        wasHidden = true
        return false
      }

      if (!wasHidden || !canRecover(now))
        return false

      return commitRecovery(now)
    },

    onFocus(now = Date.now(), isDocumentVisible = true) {
      if (!isDocumentVisible || !canRecover(now))
        return false

      return commitRecovery(now)
    },

    onPageShow(now = Date.now()) {
      if (!canRecover(now))
        return false

      return commitRecovery(now)
    },
  }
}

function clearStyleProperty(
  style: StyleLike | null | undefined,
  target: 'body' | 'documentElement',
  property: keyof StyleLike,
  restoredStyles: string[],
) {
  if (!style?.[property])
    return

  style[property] = ''
  restoredStyles.push(`${target}.${property}`)
}

export function clearGlobalUiSideEffects(doc?: RecoveryDocumentLike | null) {
  const restoredStyles: string[] = []
  const removedOverlayKinds: string[] = []

  if (!doc) {
    return {
      restoredStyles,
      removedOverlayCount: 0,
      removedOverlayKinds,
    }
  }

  clearStyleProperty(doc.body?.style, 'body', 'overflow', restoredStyles)
  clearStyleProperty(doc.body?.style, 'body', 'pointerEvents', restoredStyles)
  clearStyleProperty(doc.body?.style, 'body', 'touchAction', restoredStyles)

  clearStyleProperty(doc.documentElement?.style, 'documentElement', 'overflow', restoredStyles)
  clearStyleProperty(doc.documentElement?.style, 'documentElement', 'pointerEvents', restoredStyles)
  clearStyleProperty(doc.documentElement?.style, 'documentElement', 'touchAction', restoredStyles)

  const overlayNodes = doc.querySelectorAll?.('[data-transient-overlay="true"]') ?? []
  const overlays = Array.from(overlayNodes)

  for (const overlay of overlays) {
    const kind = overlay.getAttribute?.('data-overlay-kind')
    if (kind)
      removedOverlayKinds.push(kind)
    overlay.remove?.()
  }

  return {
    restoredStyles,
    removedOverlayCount: overlays.length,
    removedOverlayKinds,
  }
}
