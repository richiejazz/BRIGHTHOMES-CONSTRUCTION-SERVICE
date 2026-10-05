import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from 'axios'

import { tokenStore } from './tokens'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
})

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean }

apiClient.interceptors.request.use((config) => {
  const token = tokenStore.getAccess()
  if (token && !config.headers.has('Authorization')) config.headers.set('Authorization', `Bearer ${token}`)
  return config
})

// A single in-flight refresh shared by every request that hits an expired access token.
let refreshing: Promise<string | null> | null = null

export function refreshAccessToken(): Promise<string | null> {
  const refresh = tokenStore.getRefresh()
  if (!refresh) return Promise.resolve(null)
  refreshing ??= axios
    .post<{ access: string }>(`${import.meta.env.VITE_API_BASE_URL}/auth/token/refresh/`, { refresh })
    .then(({ data }) => {
      tokenStore.set({ access: data.access })
      return data.access
    })
    .catch((error: unknown) => {
      // Only an explicit rejection ends the session; network failures keep the refresh token.
      if (axios.isAxiosError(error) && error.response && [400, 401].includes(error.response.status)) tokenStore.clear()
      return null
    })
    .finally(() => {
      refreshing = null
    })
  return refreshing
}

apiClient.interceptors.response.use(undefined, async (error: unknown) => {
  if (!axios.isAxiosError(error) || error.response?.status !== 401 || !error.config) throw error
  const config = error.config as RetriableConfig
  const sentToken = config.headers.get('Authorization')
  if (config._retried || !sentToken) throw error
  config._retried = true
  const access = await refreshAccessToken()
  const headers = AxiosHeaders.from(config.headers)
  if (access) {
    headers.set('Authorization', `Bearer ${access}`)
    return apiClient({ ...config, headers } as RetriableConfig)
  }
  // Refresh failed for a transient reason: keep the session and surface the error.
  if (tokenStore.getRefresh()) throw error
  // The session has ended; retry once anonymously so public content still loads.
  headers.delete('Authorization')
  return apiClient({ ...config, headers } as RetriableConfig)
})
