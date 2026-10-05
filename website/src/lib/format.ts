const longDate = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
const monthYear = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' })
const clockTime = new Intl.DateTimeFormat('en-GB', { hour: 'numeric', minute: '2-digit' })

/** Parse the date part of an ISO string as a local calendar date (no timezone shift). */
function localDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number)
  return new Date(year, month - 1, day)
}

export const formatDate = (value: string) => longDate.format(localDate(value))
export const formatMonthYear = (value: string) => monthYear.format(localDate(value))

export function formatTime(value: string) {
  const [hours, minutes] = value.split(':').map(Number)
  return clockTime.format(new Date(2000, 0, 1, hours, minutes))
}

/** 0 → "01": the numbering used across editorial lists. */
export const padIndex = (index: number) => String(index + 1).padStart(2, '0')
