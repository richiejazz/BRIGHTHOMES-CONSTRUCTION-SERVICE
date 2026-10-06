const longDate = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
const shortDate = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
const weekdayDate = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
const monthYear = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' })
const clockTime = new Intl.DateTimeFormat('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true })

/** Parse the date part of an ISO string as a local calendar date (no timezone shift). */
export function localDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number)
  return new Date(year, month - 1, day)
}

export const formatDate = (value: string) => longDate.format(localDate(value))
export const formatShortDate = (value: string) => shortDate.format(localDate(value))
export const formatWeekdayDate = (value: string) => weekdayDate.format(localDate(value))
export const formatMonthYear = (value: string) => monthYear.format(localDate(value))

/** "14:30" or "14:30:00" → "2:30 pm". */
export function formatTime(value: string) {
  const [hours, minutes] = value.split(':').map(Number)
  return clockTime.format(new Date(2000, 0, 1, hours, minutes))
}

const pad = (value: number) => String(value).padStart(2, '0')

/** A Date as a local "YYYY-MM-DD" string, the format the API expects. */
export const toIsoDate = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

/** A Date as a local "HH:MM" string. */
export const toIsoTime = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`

export const todayIso = () => toIsoDate(new Date())

/** 0 → "01": the numbering used across editorial lists. */
export const padIndex = (index: number) => pad(index + 1)

export function greeting(now = new Date()) {
  const hour = now.getHours()
  return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
}
