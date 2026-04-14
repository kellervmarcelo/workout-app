<template>
  <div class="rounded-lg border bg-card">
    <button
      type="button"
      class="flex w-full items-center justify-between p-4 font-medium transition-all hover:bg-muted/30"
      @click="toggle"
    >
      <slot name="trigger">
        <span class="flex-1 text-left">
          <slot name="title" />
        </span>
      </slot>
      <svg
        class="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    <div
      v-show="isOpen"
      class="overflow-hidden transition-all duration-300 ease-in-out"
    >
      <div class="p-4 pt-0">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  defaultOpen?: boolean
}>()

const isOpen = ref(props.defaultOpen ?? false)

function toggle() {
  isOpen.value = !isOpen.value
}

function close() {
  isOpen.value = false
}

defineExpose({ isOpen, close })
</script>
