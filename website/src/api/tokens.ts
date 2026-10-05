// Session token storage shared by the API client and AuthContext.
// The short-lived access token lives in memory only; the refresh token is kept in
// localStorage so a session survives page reloads.

const REFRESH_KEY = 'brighthomes.refresh'

let accessToken: string | null = null
const listeners = new Set<() => void>()

function readRefresh(): string | null {
  try {
    return localStorage.getItem(REFRESH_KEY)
  } catch {
    return null
  }
}

function writeRefresh(token: string | null) {
  try {
    if (token) localStorage.setItem(REFRESH_KEY, token)
    else localStorage.removeItem(REFRESH_KEY)
  } catch {
    // Storage can be unavailable (private mode); the session then lasts for this tab only.
  }
}

let refreshToken: string | null = readRefresh()

export const tokenStore = {
  getAccess: () => accessToken,
  getRefresh: () => refreshToken,
  set(tokens: { access: string; refresh?: string }) {
    accessToken = tokens.access
    if (tokens.refresh) {
      refreshToken = tokens.refresh
      writeRefresh(tokens.refresh)
    }
    listeners.forEach((listener) => listener())
  },
  clear() {
    const hadSession = accessToken !== null || refreshToken !== null
    accessToken = null
    refreshToken = null
    writeRefresh(null)
    if (hadSession) listeners.forEach((listener) => listener())
  },
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
}
