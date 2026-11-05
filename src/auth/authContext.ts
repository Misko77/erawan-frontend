import { createContext } from 'react'

export type User = { id: string; name: string; email: string }

export type AuthContextValue = {
  user: User | null
  /** True until the stored session has been restored on startup. */
  loading: boolean
  /** Resolves on success; throws with a user-facing message on failure. */
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
