import { api } from './api'
export interface User {
  id: number
  name: string
  email: string
  role: 'user' | 'admin'
  created_at: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
}

export const authService = {
  async register(name: string, email: string, password: string): Promise<User> {
    const res = await api.post<User>('/api/auth/register', { name, email, password })
    return res.data
  },

  async login(email: string, password: string): Promise<LoginResponse> {
    const res = await api.post<LoginResponse>('/api/auth/login', { email, password })
    return res.data
  },

  async me(): Promise<User> {
    const res = await api.get<User>('/api/auth/me')
    return res.data
  },

  logout() {
    localStorage.removeItem('token')
  },

  setToken(token: string) {
    localStorage.setItem('token', token)
  },

  getToken(): string | null {
    return localStorage.getItem('token')
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token')
  },
}