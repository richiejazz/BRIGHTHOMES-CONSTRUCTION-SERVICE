// Client-side checks matching the website forms. The API remains the authority; its field
// errors are mapped back onto the same fields.

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE = /^[+\d][\d\s()-]{6,}$/

export function validateEmail(value: string) {
  if (!value.trim()) return 'Please enter your email address.'
  if (!EMAIL.test(value.trim())) return 'Please enter a valid email address.'
  return undefined
}

export function validatePhone(value: string) {
  const phone = value.trim()
  if (!phone) return undefined
  if (phone.length > 40) return 'Please enter a shorter phone number.'
  if (!PHONE.test(phone)) return 'Please enter a valid phone number.'
  return undefined
}

export function validateName(value: string, label = 'your name', max = 150) {
  if (!value.trim()) return `Please enter ${label}.`
  if (value.trim().length > max) return `Please use ${max} characters or fewer.`
  return undefined
}

export function validateMessage(value: string, required: boolean) {
  if (required && !value.trim()) return 'Please tell us a little about your project.'
  if (value.length > 4000) return 'Please keep your message under 4,000 characters.'
  return undefined
}

export type FieldErrors<T extends string> = Partial<Record<T, string>>

/** Drop undefined entries so `Object.keys(errors).length` tells whether the form is valid. */
export function compact<T extends string>(errors: FieldErrors<T>): FieldErrors<T> {
  return Object.fromEntries(Object.entries(errors).filter(([, message]) => message)) as FieldErrors<T>
}
