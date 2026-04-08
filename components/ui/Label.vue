<script setup lang="ts">
import { cn } from '~/lib/utils'

interface Props {
  for?: string
  class?: string
  required?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  class: '',
  required: false,
  for: undefined,
})
</script>

<template>
  <label
    :for="props.for"
    :class="cn(
      'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
      props.class,
    )"
  >
    <slot />
    <span v-if="props.required" class="text-destructive ml-1">*</span>
  </label>
</template>
