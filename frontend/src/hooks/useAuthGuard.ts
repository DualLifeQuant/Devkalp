import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore, type UserRole } from '@/lib/store'

interface AuthGuardOptions {
  allowedRoles?: UserRole[]
  redirectTo?: string
}

/**
 * Redirects to login if unauthenticated.
 * Redirects to /dashboard if authenticated but role not allowed.
 */
export function useAuthGuard({
  allowedRoles,
  redirectTo = '/auth/login',
}: AuthGuardOptions = {}) {
  const navigate = useNavigate()
  const { isLoggedIn, user } = useAuthStore()

  useEffect(() => {
    if (!isLoggedIn || !user) {
      navigate(redirectTo, { replace: true })
      return
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      navigate('/dashboard', { replace: true })
    }
  }, [isLoggedIn, user, allowedRoles, redirectTo, navigate])

  return { user, isAuthenticated: isLoggedIn }
}
