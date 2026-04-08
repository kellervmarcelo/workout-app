<script setup lang="ts">
import { cn } from '~/lib/utils'

interface Props {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  disabled?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'default',
  disabled: false,
  class: '',
})

const variants: Record<string, string> = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/90',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  link: 'text-primary underline-offset-4 hover:underline',
}

const sizes: Record<string, string> = {
  default: 'h-11 px-4 py-2 md:h-10',
  sm: 'h-11 rounded-md px-3 md:h-9',
  lg: 'h-12 rounded-md px-8 md:h-11',
  icon: 'h-11 w-11 md:h-10 md:w-10',
}
</script>

<template>
  <button
    :class="cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
      variants[props.variant],
      sizes[props.size],
      props.class,
    )"
    :disabled="props.disabled"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>
