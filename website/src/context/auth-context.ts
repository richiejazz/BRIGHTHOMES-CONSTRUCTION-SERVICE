import { createContext } from 'react'

import type { RegisterInput, User } from '../api/types'

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous' | 'unavailable'

export type AuthContextValue = {
  status: AuthStatus
  user: User | null
  /** True after the user signs out deliberately (as opposed to a session expiring). */
  signedOut: boolean
  login: (email: string, password: string) => Promise<User>
  register: (input: RegisterInput) => Promise<User>
  logout: () => void
  /** Clear `signedOut` once the visitor has left the account area. */
  acknowledgeSignOut: () => void
  /** Retry loading the session after a transient failure. */
  retry: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
