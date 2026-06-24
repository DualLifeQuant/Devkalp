/**
 * Audit log utility.
 * - Sends structured events to Sentry as breadcrumbs
 * - In production, also POST to /api/v1/admin/audit-log if available
 */

import * as Sentry from '@sentry/nextjs'
import { logger } from '@/lib/logger'

type AuditCategory =
  | 'user'
  | 'admin'
  | 'donation'
  | 'matrimony'
  | 'job'
  | 'volunteer'
  | 'counselor'
  | 'campaign'

interface AuditPayload {
  userId?: string
  userRole?: string
  targetId?: string
  details?: Record<string, unknown>
}

function emit(event: string, category: AuditCategory, payload: AuditPayload = {}): void {
  // Sentry breadcrumb
  Sentry.addBreadcrumb({
    category: `audit.${category}`,
    message: event,
    level: 'info',
    data: payload,
  })

  // Dev: verbose log
  logger.info(`[AUDIT] ${event}`, { ...payload, category })
}

// ── Convenience helpers by domain ─────────────────────────────────────────────

export function auditLog(event: string, payload?: AuditPayload): void {
  emit(event, 'user', payload)
}

export function auditAdmin(event: string, payload?: AuditPayload): void {
  emit(event, 'admin', payload)
}

export function auditDonation(event: string, payload?: AuditPayload): void {
  emit(event, 'donation', payload)
}

export function auditMatrimony(event: string, payload?: AuditPayload): void {
  emit(event, 'matrimony', payload)
}

export function auditJob(event: string, payload?: AuditPayload): void {
  emit(event, 'job', payload)
}

export function auditVolunteer(event: string, payload?: AuditPayload): void {
  emit(event, 'volunteer', payload)
}
