import type { UserRole } from '@/lib/store'

// ── Permission definitions ────────────────────────────────────────────────────

export type Permission =
  // Matrimony
  | 'matrimony:view_profiles'
  | 'matrimony:create_profile'
  | 'matrimony:express_interest'
  | 'matrimony:view_own_profile'
  | 'matrimony:admin_approve'
  | 'matrimony:admin_suggest_match'
  | 'matrimony:view_all'
  // Jobs
  | 'jobs:view'
  | 'jobs:apply'
  | 'jobs:create'
  | 'jobs:admin_review'
  | 'jobs:schedule_interview'
  // Donations
  | 'donations:make'
  | 'donations:view_own'
  | 'donations:admin_view'
  | 'donations:create_campaign'
  // Campaigns
  | 'campaigns:view'
  | 'campaigns:register'
  | 'campaigns:admin_manage'
  // Counselor
  | 'counselor:view_clients'
  | 'counselor:add_session_notes'
  // Admin
  | 'admin:dashboard'
  | 'admin:manage_users'
  | 'admin:view_logs'
  | 'admin:manage_volunteers'
  | 'admin:manage_counselors'

// ── Role → Permission matrix ──────────────────────────────────────────────────
const PERMISSIONS: Record<UserRole, Set<Permission>> = {
  admin: new Set<Permission>([
    'matrimony:view_profiles', 'matrimony:admin_approve', 'matrimony:admin_suggest_match', 'matrimony:view_all',
    'jobs:view', 'jobs:create', 'jobs:admin_review', 'jobs:schedule_interview',
    'donations:make', 'donations:admin_view', 'donations:create_campaign',
    'campaigns:view', 'campaigns:register', 'campaigns:admin_manage',
    'counselor:view_clients', 'counselor:add_session_notes',
    'admin:dashboard', 'admin:manage_users', 'admin:view_logs',
    'admin:manage_volunteers', 'admin:manage_counselors',
  ]),

  counselor: new Set<Permission>([
    'matrimony:view_profiles',
    'donations:make',
    'campaigns:view', 'campaigns:register',
    'counselor:view_clients', 'counselor:add_session_notes',
    'jobs:view',
  ]),

  matrimony: new Set<Permission>([
    'matrimony:view_profiles', 'matrimony:create_profile',
    'matrimony:express_interest', 'matrimony:view_own_profile',
    'donations:make', 'donations:view_own',
    'campaigns:view', 'campaigns:register',
    'jobs:view',
  ]),

  donor: new Set<Permission>([
    'donations:make', 'donations:view_own',
    'campaigns:view', 'campaigns:register',
    'jobs:view',
  ]),

  candidate: new Set<Permission>([
    'jobs:view', 'jobs:apply',
    'donations:make',
    'campaigns:view', 'campaigns:register',
  ]),

  volunteer: new Set<Permission>([
    'campaigns:view', 'campaigns:register',
    'donations:make',
    'jobs:view',
  ]),
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Check if a role has a specific permission.
 */
export function hasPermission(role: UserRole | null | undefined, permission: Permission): boolean {
  if (!role) return false
  return PERMISSIONS[role]?.has(permission) ?? false
}

/**
 * Check if a role has ALL of the given permissions.
 */
export function hasAllPermissions(role: UserRole | null | undefined, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p))
}

/**
 * Check if a role has ANY of the given permissions.
 */
export function hasAnyPermission(role: UserRole | null | undefined, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p))
}

/**
 * Get all permissions for a role.
 */
export function getPermissions(role: UserRole): Permission[] {
  return Array.from(PERMISSIONS[role] ?? [])
}

/**
 * Validate that a user can access an API endpoint based on permissions.
 * Returns null if allowed, or an error message if denied.
 */
export function validateAccess(
  role: UserRole | null | undefined,
  required: Permission
): { allowed: boolean; reason?: string } {
  if (!role) return { allowed: false, reason: 'Unauthenticated' }
  if (!hasPermission(role, required)) {
    return {
      allowed: false,
      reason: `Role '${role}' does not have permission '${required}'`,
    }
  }
  return { allowed: true }
}

/**
 * React hook-compatible guard — returns whether current user can do something.
 */
export function can(role: UserRole | null | undefined, permission: Permission): boolean {
  return hasPermission(role, permission)
}
