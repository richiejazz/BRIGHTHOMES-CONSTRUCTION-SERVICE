import { useQuery, useQueryClient } from '@tanstack/react-query'
import { router } from 'expo-router'
import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from 'react'

import { accountKeys, authApi, privateKeys } from '../api/account'
import { refreshAccessToken } from '../api/client'
import { contentKeys } from '../api/content'
import { tokenStore } from '../api/tokens'
import type { RegisterInput, User } from '../api/types'
import { useToast } from '../components/ui/Toast'

/**
 * - bootstrapping: the stored session has not been read yet (the splash screen is still up)
 * - loading: a stored session exists and the profile is loading
 * - unavailable: a session exists but the profile could not be loaded (usually offline)
 */
export type AuthStatus = 'bootstrapping' | 'loading' | 'authenticated' | 'anonymous' | 'unavailable'

type AuthContextValue = {
  status: AuthStatus
  user: User | null
  login: (email: string, password: string) => Promise<User>
  register: (input: RegisterInput) => Promise<User>
  logout: () => void
  /** Retry loading the profile after a transient failure. */
  retry: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const hydrated = useSyncExternalStore(tokenStore.subscribe, tokenStore.isHydrated)
  const sessionActive = useSyncExternalStore(tokenStore.subscribe, tokenStore.hasSession)

  useEffect(() => {
    void tokenStore.hydrate()
  }, [])

  const me = useQuery({
    queryKey: accountKeys.me,
    queryFn: async () => {
      if (!tokenStore.getAccess() && !(await refreshAccessToken())) throw new Error('Session unavailable')
      return authApi.me()
    },
    enabled: hydrated && sessionActive,
    retry: false,
    staleTime: 5 * 60_000,
  })

  // When a session ends (sign-out or a rejected refresh), drop every private cache entry and
  // refresh public content, which staff accounts see differently.
  useEffect(() => {
    if (!hydrated || sessionActive) return
    privateKeys.forEach((queryKey) => queryClient.removeQueries({ queryKey }))
    void queryClient.invalidateQueries({ queryKey: contentKeys.allProjects })
    if (tokenStore.consumeExpiry()) {
      toast.show({
        tone: 'info',
        title: 'Your session has ended',
        message: 'For your security, please sign in again.',
        action: { label: 'Sign in', onPress: () => router.push({ pathname: '/login', params: { reason: 'expired' } }) },
      })
    }
  }, [hydrated, sessionActive, queryClient, toast])

  const login = useCallback(
    async (email: string, password: string) => {
      tokenStore.set(await authApi.login(email, password))
      const user = await queryClient.fetchQuery({ queryKey: accountKeys.me, queryFn: authApi.me })
      void queryClient.invalidateQueries({ queryKey: contentKeys.allProjects })
      return user
    },
    [queryClient],
  )

  const register = useCallback(
    async (input: RegisterInput) => {
      await authApi.register(input)
      return login(input.email, input.password)
    },
    [login],
  )

  const logout = useCallback(() => tokenStore.clear(), [])
  const { refetch } = me
  const retry = useCallback(() => void refetch(), [refetch])

  let status: AuthStatus = 'anonymous'
  if (!hydrated) status = 'bootstrapping'
  else if (sessionActive) status = me.isSuccess ? 'authenticated' : me.isError ? 'unavailable' : 'loading'

  const value = useMemo<AuthContextValue>(
    () => ({ status, user: status === 'authenticated' ? (me.data ?? null) : null, login, register, logout, retry }),
    [status, me.data, login, register, logout, retry],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
