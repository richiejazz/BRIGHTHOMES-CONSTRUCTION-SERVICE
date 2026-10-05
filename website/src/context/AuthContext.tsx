import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react'

import { accountKeys, authApi } from '../api/account'
import { refreshAccessToken } from '../api/client'
import { contentKeys } from '../api/content'
import { tokenStore } from '../api/tokens'
import type { RegisterInput } from '../api/types'
import { AuthContext, type AuthContextValue, type AuthStatus } from './auth-context'

const hasSession = () => tokenStore.getAccess() !== null || tokenStore.getRefresh() !== null
const PRIVATE_KEYS = [accountKeys.me, accountKeys.saved, accountKeys.enquiries, accountKeys.appointments]

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const sessionActive = useSyncExternalStore(tokenStore.subscribe, hasSession)
  const [signedOut, setSignedOut] = useState(false)

  const me = useQuery({
    queryKey: accountKeys.me,
    queryFn: async () => {
      if (!tokenStore.getAccess() && !(await refreshAccessToken())) throw new Error('Session unavailable')
      return authApi.me()
    },
    enabled: sessionActive,
    retry: false,
    staleTime: 5 * 60_000,
  })

  // When the session ends (logout or a rejected refresh), drop every private cache entry and
  // refresh public content, which staff accounts see differently.
  useEffect(() => {
    if (sessionActive) return
    PRIVATE_KEYS.forEach((queryKey) => queryClient.removeQueries({ queryKey }))
    void queryClient.invalidateQueries({ queryKey: contentKeys.allProjects })
  }, [sessionActive, queryClient])

  const login = useCallback(
    async (email: string, password: string) => {
      tokenStore.set(await authApi.login(email, password))
      setSignedOut(false)
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

  const logout = useCallback(() => {
    setSignedOut(true)
    tokenStore.clear()
  }, [])
  const acknowledgeSignOut = useCallback(() => setSignedOut(false), [])
  const { refetch } = me
  const retry = useCallback(() => void refetch(), [refetch])

  let status: AuthStatus = 'anonymous'
  if (sessionActive) status = me.isSuccess ? 'authenticated' : me.isError ? 'unavailable' : 'loading'

  const value = useMemo<AuthContextValue>(
    () => ({ status, user: status === 'authenticated' ? (me.data ?? null) : null, signedOut, login, register, logout, acknowledgeSignOut, retry }),
    [status, me.data, signedOut, login, register, logout, acknowledgeSignOut, retry],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
