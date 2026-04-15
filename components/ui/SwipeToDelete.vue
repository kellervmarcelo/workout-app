<template>
  <div ref="containerRef" class="relative overflow-hidden rounded-lg">
    <!-- Delete background layer -->
    <div class="absolute inset-0 flex items-center justify-end bg-destructive pr-4">
      <button
        type="button"
        class="flex h-10 w-10 items-center justify-center rounded-md text-destructive-foreground"
        @click.stop="onDeleteClick"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>

    <!-- Sliding content layer -->
    <div
      :style="{ transform: `translateX(${offset}px)` }"
      :class="isTransitioning ? 'transition-transform duration-300 ease-in-out' : ''"
      class="relative"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  delete: []
  swipeOpen: []
}>()
const BUTTON_WIDTH = 72
const THRESHOLD = BUTTON_WIDTH / 2

const containerRef = ref<HTMLElement | null>(null)
const offset = ref(0)
const isTransitioning = ref(false)
const isOpen = ref(false)

const { lengthX, isSwiping } = useSwipe(containerRef, {
  threshold: 5,
  onSwipe() {
    if (!isSwiping.value)
      return

    isTransitioning.value = false

    if (lengthX.value > 0) {
      // Swiping left: reveal delete button
      offset.value = -Math.min(lengthX.value, BUTTON_WIDTH)
    }
    else if (lengthX.value < 0 && isOpen.value) {
      // Swiping right: close
      offset.value = Math.min(0, -BUTTON_WIDTH + Math.abs(lengthX.value))
    }
  },
  onSwipeEnd() {
    isTransitioning.value = true

    if (Math.abs(offset.value) >= THRESHOLD) {
      offset.value = -BUTTON_WIDTH
      isOpen.value = true
      emit('swipeOpen')
    }
    else {
      offset.value = 0
      isOpen.value = false
    }
  },
})

function close() {
  isTransitioning.value = true
  offset.value = 0
  isOpen.value = false
}

function onDeleteClick() {
  close()
  emit('delete')
}

defineExpose({ close })

// Close when clicking outside
onClickOutside(containerRef, () => {
  if (isOpen.value)
    close()
})
</script>
