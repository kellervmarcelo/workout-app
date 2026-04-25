export function useDate() {
  function toDateString(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  function getTodayString(): string {
    return toDateString(new Date())
  }

  function parseSafeDate(str: string): Date {
    return new Date(`${str}T12:00:00`)
  }

  function formatDisplayDate(str: string): string {
    return parseSafeDate(str).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  return { toDateString, getTodayString, parseSafeDate, formatDisplayDate }
}
