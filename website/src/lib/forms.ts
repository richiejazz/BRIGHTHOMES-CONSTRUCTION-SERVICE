import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'

import { toApiError } from '../api/errors'
import { useAuth } from '../context/useAuth'

// Shared form rules and helpers (React Hook Form). Client-side checks mirror the DRF serializers;
// the server remains the authority and its field errors are applied back onto the form.

export const contactRules = {
  name: { required: 'Please tell us your name.', maxLength: { value: 160, message: 'Please keep your name under 160 characters.' } },
  email: { required: 'Enter a valid email address.', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address.' } },
  phone: { pattern: { value: /^[+\d][\d\s()-]{6,}$/, message: 'Enter a valid phone number. International numbers are welcome.' }, maxLength: { value: 40, message: 'Please enter a shorter phone number.' } },
  message: { maxLength: { value: 4000, message: 'Please keep your message under 4,000 characters.' } },
}

/** Apply DRF field errors to the form; returns the message for anything not tied to a field. */
export function applyServerErrors<T extends FieldValues>(error: unknown, fields: (keyof T)[], setError: UseFormSetError<T>) {
  const apiError = toApiError(error)
  const unmatched: string[] = []
  for (const [field, message] of Object.entries(apiError.fieldErrors)) {
    if (fields.includes(field as keyof T)) setError(field as Path<T>, { type: 'server', message })
    else unmatched.push(message)
  }
  // §21 offline: say so plainly; React Hook Form keeps what the visitor typed.
  if (apiError.kind === 'network') return 'Not sent — you’re offline or our server can’t be reached. Your message is kept; try again when you’re connected.'
  return unmatched[0] ?? (apiError.kind === 'validation' && Object.keys(apiError.fieldErrors).length ? undefined : apiError.message)
}

export function useContactDefaults() {
  const { user } = useAuth()
  return { name: user ? `${user.first_name} ${user.last_name}`.trim() : '', email: user?.email ?? '', phone: user?.phone ?? '' }
}
