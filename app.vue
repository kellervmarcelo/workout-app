<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <!-- Tag de modo de desenvolvimento -->
    <div
      v-if="isDevMode"
      class="fixed bottom-4 right-4 z-50 rounded-md bg-red-600 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg"
    >
      DEV
    </div>
  </div>
</template>

<script setup lang="ts">
const isDevMode = process.env.NODE_ENV !== 'production'

if (isDevMode) {
  console.log(
    '%c⚠️ MODO DE DESENVOLVIMENTO ⚠️',
    'color: #fff; background: #dc2626; padding: 8px 16px; font-size: 16px; font-weight: bold; border-radius: 4px;',
  )
  console.log(
    '%cEsta aplicação está rodando em ambiente de desenvolvimento. Não use dados reais.',
    'color: #fbbf24; background: #1f2937; padding: 6px 12px; font-size: 12px;',
  )
}
</script>
