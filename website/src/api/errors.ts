import axios from 'axios'

export type ErrorKind = 'network' | 'unauthorized' | 'forbidden' | 'not-found' | 'validation' | 'server' | 'unknown'

export type ApiError = {
  kind: ErrorKind
  status?: number
  message: string
  /** Field-level messages from DRF validation responses, keyed by field name. */
  fieldErrors: Record<string, string>
}

const MESSAGES: Record<ErrorKind, string> = {
  network: "We couldn't reach our servers. Please check your connection and try again.",
  unauthorized: 'Please sign in to continue.',
  forbidden: "You don't have access to this.",
  'not-found': "We couldn't find what you were looking for.",
  validation: 'Please review the highlighted fields.',
  server: 'Something went wrong on our side. Please try again shortly.',
  unknown: 'Something went wrong. Please try again.',
}

function firstMessage(value: unknown): string | undefined {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return firstMessage(value[0])
  return undefined
}

export function toApiError(error: unknown): ApiError {
  if (!axios.isAxiosError(error)) return { kind: 'unknown', message: MESSAGES.unknown, fieldErrors: {} }
  const status = error.response?.status
  if (!error.response) return { kind: 'network', message: MESSAGES.network, fieldErrors: {} }
  const data: unknown = error.response.data
  if (status === 400 && data && typeof data === 'object') {
    const fieldErrors: Record<string, string> = {}
    let general: string | undefined
    for (const [field, value] of Object.entries(data)) {
      const message = firstMessage(value)
      if (!message) continue
      if (field === 'non_field_errors' || field === 'detail') general = message
      else fieldErrors[field] = message
    }
    return { kind: 'validation', status, message: general ?? MESSAGES.validation, fieldErrors }
  }
  const detail = data && typeof data === 'object' && 'detail' in data ? firstMessage((data as { detail: unknown }).detail) : undefined
  const kind: ErrorKind = status === 401 ? 'unauthorized' : status === 403 ? 'forbidden' : status === 404 ? 'not-found' : status && status >= 500 ? 'server' : 'unknown'
  // Server-side detail strings are only shown for auth errors, where they are written for users.
  return { kind, status, message: kind === 'unauthorized' && detail ? detail : MESSAGES[kind], fieldErrors: {} }
}

export function isNotFound(error: unknown) {
  return toApiError(error).kind === 'not-found'
}
