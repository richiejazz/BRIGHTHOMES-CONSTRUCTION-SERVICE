import { secureStorage } from './secureStorage'

// Session token storage shared by the API client and the auth provider.
// The short-lived access token lives in memory only. The refresh token is mirrored to secure
// device storage so a session survives app restarts; it is read once at launch (hydrate).
// Tokens are never logged.

const REFRESH_KEY = 'brighthomes.refresh'

let accessToken: string | null = null
let refreshToken: string | null = null
let hydrated = false
let expired = false
const listeners = new Set<() => void>()

const notify = () => listeners.forEach((listener) => listener())

function persist(token: string | null) {
  const write = token ? secureStorage.set(REFRESH_KEY, token) : secureStorage.remove(REFRESH_KEY)
  // Storage failures only cost persistence across restarts; the in-memory session still works.
  write.catch(() => undefined)
}

export const tokenStore = {
  getAccess: () => accessToken,
  getRefresh: () => refreshToken,
  isHydrated: () => hydrated,
  hasSession: () => accessToken !== null || refreshToken !== null,

  /** Load the persisted refresh token. Safe to call more than once. */
  async hydrate() {
    if (hydrated) return
    try {
      refreshToken ??= await secureStorage.get(REFRESH_KEY)
    } catch {
      refreshToken = null
    }
    hydrated = true
    notify()
  },

  set(tokens: { access: string; refresh?: string }) {
    accessToken = tokens.access
    expired = false
    if (tokens.refresh) {
      refreshToken = tokens.refresh
      persist(tokens.refresh)
    }
    notify()
  },

  /** End the session. `expired` marks a session the server rejected rather than a sign-out. */
  clear(options: { expired?: boolean } = {}) {
    const hadSession = tokenStore.hasSession()
    expired = hadSession && Boolean(options.expired)
    accessToken = null
    refreshToken = null
    persist(null)
    if (hadSession) notify()
  },

  /** True once after a session expires, so the app can tell the user exactly once. */
  consumeExpiry() {
    const value = expired
    expired = false
    return value
  },

  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
}
