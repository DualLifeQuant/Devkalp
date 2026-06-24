'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()
  const { isLoggedIn, user } = useAuthStore()

  useEffect(() => {
    if (!isLoggedIn || !user) {
      router.replace(redirectTo)
      return
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.replace('/dashboard')
    }
  }, [isLoggedIn, user, allowedRoles, redirectTo, router])

  return { user, isAuthenticated: isLoggedIn }
}
