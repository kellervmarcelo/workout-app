import type jsPDFType from 'jspdf'
import type { WorkoutWithExercises } from '~/types'

export interface WorkoutReportData {
  month: string
  prevMonth: string
  workouts: WorkoutWithExercises[]
  summary: {
    count: number
    daysInMonth: number
    totalVolume: number
    avgVolume: number
  }
  prev: {
    count: number
    totalVolume: number
  }
}

function calcVolume(workouts: Array<{ exercises?: Array<{ sets?: Array<{ reps?: number | null, weight_kg?: number | null, completed?: boolean }> }> }>): number {
  let vol = 0
  for (const w of workouts) {
    for (const e of w.exercises ?? []) {
      for (const s of e.sets ?? []) {
        if (s.completed && s.weight_kg && s.reps) {
          vol += Number(s.weight_kg) * Number(s.reps)
        }
      }
    }
  }
  return vol
}

function formatMonthLabel(year: number, month: number): string {
  const label = new Date(year, month - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

function fmt(n: number): string {
  return Math.round(n).toLocaleString('pt-BR')
}

function lastY(doc: jsPDFType): number {
  return (doc as jsPDFType & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY
}

export function useWorkoutReport() {
  const supabase = useSupabaseClient()
  const session = useSupabaseSession()

  async function fetchReport(year: number, month: number): Promise<WorkoutReportData> {
    const userId = session.value?.user?.id
    if (!userId)
      throw new Error('Usuário não autenticado')

    const mm = String(month).padStart(2, '0')
    const daysInMonth = new Date(year, month, 0).getDate()
    const startDate = `${year}-${mm}-01`
    const endDate = `${year}-${mm}-${String(daysInMonth).padStart(2, '0')}`

    const { data: currentData, error: currentError } = await supabase
      .from('workouts')
      .select(`*, exercises(*, sets:workout_sets(*))`)
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true })

    if (currentError)
      throw currentError

    const prevDate = new Date(year, month - 1, 0)
    const prevYear = prevDate.getFullYear()
    const prevMonthNum = prevDate.getMonth() + 1
    const prevMm = String(prevMonthNum).padStart(2, '0')
    const prevDays = new Date(prevYear, prevMonthNum, 0).getDate()
    const prevStart = `${prevYear}-${prevMm}-01`
    const prevEnd = `${prevYear}-${prevMm}-${String(prevDays).padStart(2, '0')}`

    const { data: prevData } = await supabase
      .from('workouts')
      .select(`id, exercises(id, sets:workout_sets(reps, weight_kg, completed))`)
      .eq('user_id', userId)
      .gte('date', prevStart)
      .lte('date', prevEnd)

    const current = (currentData ?? []) as WorkoutWithExercises[]
    const currentVolume = calcVolume(current)
    const prevVolume = calcVolume(prevData ?? [])

    return {
      month: formatMonthLabel(year, month),
      prevMonth: formatMonthLabel(prevYear, prevMonthNum),
      workouts: current,
      summary: {
        count: current.length,
        daysInMonth,
        totalVolume: currentVolume,
        avgVolume: current.length > 0 ? Math.round(currentVolume / current.length) : 0,
      },
      prev: {
        count: (prevData ?? []).length,
        totalVolume: prevVolume,
      },
    }
  }

  async function generatePdf(report: WorkoutReportData, year: number, month: number): Promise<void> {
    const { default: JsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')

    const doc = new JsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 15
    let y = 20

    // Header
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text('Relatório de Treinos', margin, y)
    y += 9

    doc.setFontSize(13)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 100, 100)
    doc.text(report.month, margin, y)
    y += 6

    doc.setFontSize(9)
    doc.text('YAFA — Yet Another Fitness App', margin, y)
    doc.setTextColor(0, 0, 0)
    y += 10

    doc.setDrawColor(200, 200, 200)
    doc.line(margin, y, pageWidth - margin, y)
    y += 8

    // Summary
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.text('Resumo do Mês', margin, y)
    y += 5

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
      head: [['Métrica', 'Valor']],
      body: [
        ['Treinos realizados', String(report.summary.count)],
        ['Dias treinados', `${report.summary.count} / ${report.summary.daysInMonth}`],
        ['Volume total', `${fmt(report.summary.totalVolume)} kg`],
        ['Média por treino', `${fmt(report.summary.avgVolume)} kg`],
      ],
      columnStyles: { 0: { cellWidth: 80 } },
    })
    y = lastY(doc) + 10

    // Comparison
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.text(`Comparação com ${report.prevMonth}`, margin, y)
    y += 5

    const diffCount = report.summary.count - report.prev.count
    const diffVol = report.summary.totalVolume - report.prev.totalVolume
    const diffCountStr = diffCount === 0 ? '—' : (diffCount > 0 ? `+${diffCount}` : String(diffCount))
    const diffVolStr = report.prev.totalVolume === 0
      ? 'N/A'
      : `${diffVol >= 0 ? '+' : ''}${((diffVol / report.prev.totalVolume) * 100).toFixed(1)}%`

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
      head: [['Métrica', report.prevMonth, report.month, 'Variação']],
      body: [
        ['Treinos', String(report.prev.count), String(report.summary.count), diffCountStr],
        ['Volume total', `${fmt(report.prev.totalVolume)} kg`, `${fmt(report.summary.totalVolume)} kg`, diffVolStr],
      ],
    })
    y = lastY(doc) + 10

    // Workouts detail
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.text('Treinos Detalhados', margin, y)
    y += 5

    for (const workout of report.workouts) {
      const dateStr = new Date(`${workout.date}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      const sortedExercises = [...(workout.exercises ?? [])].sort((a, b) => a.order - b.order)

      const rows: string[][] = []
      for (const exercise of sortedExercises) {
        const completedSets = (exercise.sets ?? [])
          .filter(s => s.completed)
          .sort((a, b) => a.set_number - b.set_number)
        if (!completedSets.length)
          continue

        completedSets.forEach((s, idx) => {
          const exerciseName = idx === 0 ? exercise.name : ''
          const repsOrTime = exercise.exercise_type === 'time'
            ? `${s.duration_seconds ?? 0}s`
            : String(s.reps ?? 0)
          const peso = s.weight_kg != null ? `${s.weight_kg} kg` : '—'
          rows.push([exerciseName, String(s.set_number), repsOrTime, peso])
        })
      }

      if (!rows.length)
        continue

      autoTable(doc, {
        startY: y,
        margin: { left: margin, right: margin },
        theme: 'striped',
        headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255], fontSize: 9 },
        head: [[`${dateStr} — ${workout.name}`, 'Série', 'Reps/Tempo', 'Peso']],
        body: rows,
        styles: { fontSize: 9 },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 20, halign: 'center' },
          2: { cellWidth: 30, halign: 'center' },
          3: { cellWidth: 30, halign: 'center' },
        },
      })
      y = lastY(doc) + 6
    }

    const mm = String(month).padStart(2, '0')
    doc.save(`relatorio-treinos-${year}-${mm}.pdf`)
  }

  return { fetchReport, generatePdf }
}
