/**
 * @jest-environment node
 */
import { hasPermission, hasAllPermissions, hasAnyPermission, validateAccess, can } from '@/lib/permissions'
import type { UserRole } from '@/lib/store'

describe('Permission matrix', () => {
  // ── Admin ────────────────────────────────────────────────────────────────
  describe('admin', () => {
    const role: UserRole = 'admin'
    it('can access admin dashboard', () => expect(hasPermission(role, 'admin:dashboard')).toBe(true))
    it('can manage users', () => expect(hasPermission(role, 'admin:manage_users')).toBe(true))
    it('can approve matrimony profiles', () => expect(hasPermission(role, 'matrimony:admin_approve')).toBe(true))
    it('can create jobs', () => expect(hasPermission(role, 'jobs:create')).toBe(true))
    it('can create donation campaigns', () => expect(hasPermission(role, 'donations:create_campaign')).toBe(true))
  })

  // ── Matrimony ────────────────────────────────────────────────────────────
  describe('matrimony role', () => {
    const role: UserRole = 'matrimony'
    it('can view profiles', () => expect(hasPermission(role, 'matrimony:view_profiles')).toBe(true))
    it('can create own profile', () => expect(hasPermission(role, 'matrimony:create_profile')).toBe(true))
    it('can express interest', () => expect(hasPermission(role, 'matrimony:express_interest')).toBe(true))
    it('CANNOT approve profiles', () => expect(hasPermission(role, 'matrimony:admin_approve')).toBe(false))
    it('CANNOT access admin dashboard', () => expect(hasPermission(role, 'admin:dashboard')).toBe(false))
    it('CANNOT create jobs', () => expect(hasPermission(role, 'jobs:create')).toBe(false))
    it('CANNOT manage users', () => expect(hasPermission(role, 'admin:manage_users')).toBe(false))
  })

  // ── Candidate ────────────────────────────────────────────────────────────
  describe('candidate', () => {
    const role: UserRole = 'candidate'
    it('can view jobs', () => expect(hasPermission(role, 'jobs:view')).toBe(true))
    it('can apply for jobs', () => expect(hasPermission(role, 'jobs:apply')).toBe(true))
    it('CANNOT create jobs', () => expect(hasPermission(role, 'jobs:create')).toBe(false))
    it('CANNOT schedule interviews', () => expect(hasPermission(role, 'jobs:schedule_interview')).toBe(false))
    it('CANNOT view admin logs', () => expect(hasPermission(role, 'admin:view_logs')).toBe(false))
    it('CANNOT view all donations', () => expect(hasPermission(role, 'donations:admin_view')).toBe(false))
  })

  // ── Donor ────────────────────────────────────────────────────────────────
  describe('donor', () => {
    const role: UserRole = 'donor'
    it('can make donations', () => expect(hasPermission(role, 'donations:make')).toBe(true))
    it('can view own donations', () => expect(hasPermission(role, 'donations:view_own')).toBe(true))
    it('CANNOT create campaigns', () => expect(hasPermission(role, 'donations:create_campaign')).toBe(false))
    it('CANNOT apply for jobs', () => expect(hasPermission(role, 'jobs:apply')).toBe(false))
    it('CANNOT access admin', () => expect(hasPermission(role, 'admin:dashboard')).toBe(false))
  })

  // ── Unauthenticated ───────────────────────────────────────────────────────
  describe('unauthenticated (null role)', () => {
    it('CANNOT access any permission', () => {
      expect(hasPermission(null, 'jobs:view')).toBe(false)
      expect(hasPermission(undefined, 'donations:make')).toBe(false)
    })
  })

  // ── validateAccess ────────────────────────────────────────────────────────
  describe('validateAccess', () => {
    it('returns allowed:true for authorized role', () => {
      const result = validateAccess('admin', 'admin:dashboard')
      expect(result.allowed).toBe(true)
    })

    it('returns allowed:false with reason for unauthorized role', () => {
      const result = validateAccess('candidate', 'admin:dashboard')
      expect(result.allowed).toBe(false)
      expect(result.reason).toContain('candidate')
    })

    it('returns unauthenticated for null', () => {
      const result = validateAccess(null, 'jobs:view')
      expect(result.allowed).toBe(false)
      expect(result.reason).toBe('Unauthenticated')
    })
  })

  // ── hasAllPermissions / hasAnyPermission ──────────────────────────────────
  describe('compound permission checks', () => {
    it('hasAllPermissions: true when role has all', () => {
      expect(hasAllPermissions('admin', ['jobs:create', 'jobs:view', 'admin:dashboard'])).toBe(true)
    })

    it('hasAllPermissions: false when missing one', () => {
      expect(hasAllPermissions('candidate', ['jobs:view', 'jobs:create'])).toBe(false)
    })

    it('hasAnyPermission: true when has at least one', () => {
      expect(hasAnyPermission('donor', ['admin:dashboard', 'donations:make'])).toBe(true)
    })

    it('hasAnyPermission: false when has none', () => {
      expect(hasAnyPermission('volunteer', ['admin:dashboard', 'jobs:create'])).toBe(false)
    })
  })

  // ── can() shorthand ───────────────────────────────────────────────────────
  describe('can() shorthand', () => {
    it('returns true for valid permission', () => expect(can('matrimony', 'matrimony:view_profiles')).toBe(true))
    it('returns false for invalid permission', () => expect(can('matrimony', 'admin:dashboard')).toBe(false))
  })
})
