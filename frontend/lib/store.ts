'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'admin' | 'counselor' | 'matrimony' | 'donor' | 'candidate' | 'volunteer'

export interface AuthUser {
  id: string
  full_name: string
  email: string
  phone?: string
  role: UserRole
  is_verified: boolean
  profile_picture?: string
}

interface AuthState {
  user: AuthUser | null
  access_token: string | null
  refresh_token: string | null
  isLoggedIn: boolean
  setAuth: (user: AuthUser, access_token: string, refresh_token: string) => void
  clearAuth: () => void
  updateUser: (updates: Partial<AuthUser>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      access_token: null,
      refresh_token: null,
      isLoggedIn: false,
      setAuth: (user, access_token, refresh_token) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', access_token)
          localStorage.setItem('refresh_token', refresh_token)
        }
        set({ user, access_token, refresh_token, isLoggedIn: true })
      },
      clearAuth: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
        }
        set({ user: null, access_token: null, refresh_token: null, isLoggedIn: false })
      },
      updateUser: (updates) =>
        set((state) => ({ user: state.user ? { ...state.user, ...updates } : null })),
    }),
    { name: 'devkalp-auth', partialize: (s) => ({ user: s.user, access_token: s.access_token, refresh_token: s.refresh_token, isLoggedIn: s.isLoggedIn }) }
  )
)

export function getDashboardPath(role: UserRole): string {
  switch (role) {
    case 'admin':      return '/admin'
    case 'counselor':  return '/dashboard/counselor'
    case 'matrimony':  return '/dashboard/matrimony'
    case 'candidate':  return '/dashboard/jobs'
    case 'donor':      return '/dashboard/donate'
    case 'volunteer':  return '/dashboard/volunteer'
    default:           return '/dashboard'
  }
}
