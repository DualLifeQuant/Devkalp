import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole =
  | 'admin'
  | 'counselor'
  | 'matrimony'
  | 'donor'
  | 'candidate'
  | 'volunteer'
  | 'user'

export interface AuthUser {
  id: string
  full_name: string
  email: string
  phone?: string
  role: UserRole
  is_active: boolean
  profile_photo?: string
  created_at?: string
}

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  setAuth: (user: AuthUser, accessToken: string, refreshToken: string) => void
  clearAuth: () => void
  updateUser: (partial: Partial<AuthUser>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken, refreshToken) => {
        // Also mirror tokens to localStorage for the API interceptor
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', accessToken)
          localStorage.setItem('refresh_token', refreshToken)
        }
        set({ user, accessToken, refreshToken, isAuthenticated: true })
      },

      clearAuth: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
        }
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false })
      },

      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),
    }),
    {
      name: 'devkalp-auth',
      partialize: (s) => ({
        user: s.user,
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        isAuthenticated: s.isAuthenticated,
      }),
    }
  )
)

// ── Route helpers ─────────────────────────────────────────────────────────────

export function getDashboardPath(role: UserRole): string {
  switch (role) {
    case 'admin':     return '/admin'
    case 'counselor': return '/dashboard/counselor'
    case 'matrimony': return '/dashboard/matrimony/matches'
    case 'donor':     return '/dashboard/donate'
    case 'candidate': return '/dashboard/jobs'
    case 'volunteer': return '/dashboard/volunteer'
    default:          return '/dashboard'
  }
}
