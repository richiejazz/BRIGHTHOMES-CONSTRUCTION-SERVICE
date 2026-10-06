// Web preview (expo start --web): SecureStore has no web implementation, so the refresh token is
// kept in localStorage, matching how the BRIGHTHOMES website persists its session.
function storage(): Storage | null {
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null
  }
}

export const secureStorage = {
  get: async (key: string) => storage()?.getItem(key) ?? null,
  set: async (key: string, value: string) => storage()?.setItem(key, value),
  remove: async (key: string) => storage()?.removeItem(key),
}
