interface WeekDay {
  date: string
  label: string
  hasWorkout: boolean
  isToday: boolean
}

interface ShareCardData {
  weekDays: WeekDay[]
  workoutCount: number
  logoSrc: string
  weekLabel: string
}

export function useShareCard() {
  const supabase = useSupabaseClient()
  const session = useSupabaseSession()
  const sharing = ref(false)
  const shareCardData = ref<ShareCardData>({ weekDays: [], workoutCount: 0, logoSrc: '', weekLabel: '' })

  function toDateString(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  function getWeekRange() {
    const now = new Date()
    const todayStr = toDateString(now)
    const dayOfWeek = now.getDay()
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1

    const monday = new Date(now)
    monday.setDate(now.getDate() - daysFromMonday)
    monday.setHours(12, 0, 0, 0)

    const labels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
    const days = labels.map((label, i) => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      const dateStr = toDateString(d)
      return { date: dateStr, label, isToday: dateStr === todayStr }
    })

    return { start: days[0].date, end: days[6].date, days }
  }

  function getWeekLabel(start: string, end: string): string {
    const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
    const s = new Date(`${start}T12:00:00`)
    const e = new Date(`${end}T12:00:00`)
    const endStr = `${e.getDate()} ${months[e.getMonth()]}`
    if (s.getMonth() === e.getMonth())
      return `${s.getDate()} a ${endStr}`
    return `${s.getDate()} ${months[s.getMonth()]} a ${endStr}`
  }

  async function loadLogoAsDataUrl(): Promise<string> {
    try {
      const response = await fetch('/yafa_logo_final_transparent.png')
      const blob = await response.blob()
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
    }
    catch {
      return ''
    }
  }

  async function generateAndShare(cardEl: HTMLElement) {
    if (!session.value?.user)
      return
    sharing.value = true

    try {
      const { start, end, days } = getWeekRange()

      const [{ data }, logoSrc] = await Promise.all([
        supabase.from('workouts').select('date').gte('date', start).lte('date', end),
        loadLogoAsDataUrl(),
      ])

      const workoutDates = new Set((data || []).map((w: { date: string }) => w.date))

      shareCardData.value = {
        weekDays: days.map(d => ({ ...d, hasWorkout: workoutDates.has(d.date) })),
        workoutCount: workoutDates.size,
        logoSrc,
        weekLabel: getWeekLabel(start, end),
      }

      await nextTick()

      const { default: html2canvas } = await import('html2canvas')
      const canvas = await html2canvas(cardEl, {
        width: 800,
        height: 400,
        backgroundColor: '#0f0f0f',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      })

      await new Promise<void>((resolve) => {
        canvas.toBlob(async (blob) => {
          if (!blob) {
            resolve()
            return
          }
          const file = new File([blob], 'yafa-semana.png', { type: 'image/png' })

          if (navigator.canShare?.({ files: [file] })) {
            await navigator.share({ files: [file], title: 'YAFA — Treino da semana' })
          }
          else {
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `yafa-semana-${start}.png`
            a.click()
            URL.revokeObjectURL(url)
          }
          resolve()
        }, 'image/png')
      })
    }
    catch {}
    finally {
      sharing.value = false
    }
  }

  return { sharing, shareCardData, generateAndShare }
}
