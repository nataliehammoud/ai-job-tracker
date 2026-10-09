import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { authService } from '../services/auth'
import type { User } from '../services/auth'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<User>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      if (authService.isAuthenticated()) {
        try {
          const me = await authService.me()
          setUser(me)
        } catch {
          authService.logout()
        }
      }
      setLoading(false)
    }
    init()
  }, [])

  const login = async (email: string, password: string): Promise<User> => {
    const res = await authService.login(email, password)
    authService.setToken(res.access_token)
    const me = await authService.me()
    setUser(me)
    return me
  }

  const register = async (name: string, email: string, password: string) => {
    await authService.register(name, email, password)
    await login(email, password)
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}