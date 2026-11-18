const dateFormatter = new Intl.DateTimeFormat('sv-SE', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

const longDateFormatter = new Intl.DateTimeFormat('sv-SE', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

export function formatDate(value: string | null): string {
  if (!value) return 'Inget datum'
  const date = parseDate(value)
  if (Number.isNaN(date.getTime())) return value
  return dateFormatter.format(date)
}

export function formatLongDate(value: Date): string {
  const formatted = longDateFormatter.format(value)
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

export function dueLabel(due: string | null, today = new Date()): string | null {
  if (!due) return null
  const target = parseDate(due)
  if (Number.isNaN(target.getTime())) return null
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const diff = Math.round((target.getTime() - start.getTime()) / 86_400_000)
  if (diff < 0) return 'Försenad'
  if (diff === 0) return 'Idag'
  if (diff === 1) return 'Imorgon'
  return formatDate(due)
}

export function dueTone(due: string | null, today = new Date()): 'overdue' | 'soon' | 'normal' {
  if (!due) return 'normal'
  const target = parseDate(due)
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const diff = Math.round((target.getTime() - start.getTime()) / 86_400_000)
  if (diff < 0) return 'overdue'
  if (diff <= 2) return 'soon'
  return 'normal'
}

function parseDate(value: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date(`${value}T00:00:00`)
  return new Date(value)
}
