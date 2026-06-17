'use client'

import {
  createContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import type { User, Role } from '@guesthouse/shared'
import { hasMinimumRole } from '@guesthouse/shared'
import { clientFetch } from '@/lib/api/client'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (
    name: string,
    email: string,
    password: string,
    passwordConfirm: string,
  ) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  hasRole: (role: Role) => boolean
}

export const AuthContext = createContext<AuthContextType | null>(null)

function normalizeUser(raw: Record<string, unknown>): User {
  return {
    ...raw,
    id: (raw.id as string) || (raw._id as string),
  } as User
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    try {
      const data = await clientFetch<{ user: Record<string, unknown> }>('/auth/me')
      setUser(normalizeUser(data.user))
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await clientFetch<{ user: Record<string, unknown> }>(
        '/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        },
      )
      setUser(normalizeUser(data.user))
    },
    [],
  )

  const signup = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      passwordConfirm: string,
    ) => {
      await clientFetch('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, passwordConfirm }),
      })
    },
    [],
  )

  const logout = useCallback(async () => {
    await clientFetch('/auth/logout', { method: 'POST' })
    setUser(null)
  }, [])

  const hasRole = useCallback(
    (role: Role) => {
      if (!user?.role) return false
      return hasMinimumRole(user.role, role)
    },
    [user],
  )

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, signup, logout, refreshUser, hasRole }}
    >
      {children}
    </AuthContext.Provider>
  )
}
