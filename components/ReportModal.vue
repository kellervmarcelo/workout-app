<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="$emit('close')">
    <Card class="w-full max-w-sm mx-4 p-6">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-semibold">
          Gerar Relatório
        </h3>
        <Button variant="ghost" size="icon" class="h-8 w-8" @click="$emit('close')">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Button>
      </div>

      <div class="space-y-4">
        <div>
          <label class="text-sm font-medium mb-1.5 block">Mês</label>
          <input
            v-model="selectedMonth"
            type="month"
            class="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:h-10 md:text-sm"
          >
        </div>

        <p class="text-sm text-muted-foreground min-h-[1.25rem]">
          <template v-if="loadingCount">
            Verificando treinos...
          </template>
          <template v-else-if="reportData && reportData.summary.count === 0">
            Nenhum treino neste mês.
          </template>
          <template v-else-if="reportData">
            {{ reportData.summary.count }} {{ reportData.summary.count === 1 ? 'treino encontrado' : 'treinos encontrados' }}
          </template>
        </p>

        <div class="flex gap-2 pt-2">
          <Button variant="outline" class="flex-1" @click="$emit('close')">
            Fechar
          </Button>
          <Button
            class="flex-1"
            :disabled="!reportData || reportData.summary.count === 0 || generating"
            @click="handleDownload"
          >
            <template v-if="generating">
              <svg class="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Gerando...
            </template>
            <template v-else>
              Baixar PDF
            </template>
          </Button>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import type { WorkoutReportData } from '~/composables/useWorkoutReport'

defineEmits<{ close: [] }>()

const { fetchReport, generatePdf } = useWorkoutReport()

const now = new Date()
const selectedMonth = ref(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)

const reportData = ref<WorkoutReportData | null>(null)
const loadingCount = ref(false)
const generating = ref(false)

watch(selectedMonth, async (val) => {
  if (!val)
    return
  const [year, month] = val.split('-').map(Number)
  loadingCount.value = true
  reportData.value = null
  try {
    reportData.value = await fetchReport(year, month)
  }
  catch {
    reportData.value = null
  }
  finally {
    loadingCount.value = false
  }
}, { immediate: true })

async function handleDownload() {
  if (!reportData.value)
    return
  const [year, month] = selectedMonth.value.split('-').map(Number)
  generating.value = true
  try {
    await generatePdf(reportData.value, year, month)
  }
  catch {
    console.error('Erro ao gerar PDF')
  }
  finally {
    generating.value = false
  }
}
</script>
