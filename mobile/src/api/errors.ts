import axios from 'axios'

export type ErrorKind = 'network' | 'unauthorized' | 'forbidden' | 'not-found' | 'validation' | 'server' | 'unknown'

export type ApiError = {
  kind: ErrorKind
  status?: number
  message: string
  /** Field-level messages from DRF validation responses, keyed by field name. */
  fieldErrors: Record<string, string>
}

// Friendly copy shared with the website. Raw server text is only shown where it is written for
// users: DRF field validation messages and authentication errors.
const MESSAGES: Record<ErrorKind, string> = {
  network: "We couldn't reach our servers. Check your connection and try again.",
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
  return { kind, status, message: kind === 'unauthorized' && detail ? detail : MESSAGES[kind], fieldErrors: {} }
}

/** Copy for a screen or section whose data could not be loaded. */
export function loadErrorMessage(error: unknown) {
  const { kind, message } = toApiError(error)
  if (kind === 'network') return 'Check your connection and try again.'
  return message
}

export const isNotFound = (error: unknown) => toApiError(error).kind === 'not-found'
