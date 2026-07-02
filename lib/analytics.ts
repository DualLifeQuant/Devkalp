/**
 * Internal analytics layer.
 * - trackEvent() — user interactions
 * - trackPage() — page views
 * - trackError() — JS errors + API failures
 * - trackTiming() — performance measurements
 *
 * Currently: Sentry breadcrumbs + console in dev
 * Swap: Replace the _send() call to push to any analytics backend
 */

import * as Sentry from '@sentry/nextjs'

export type EventCategory =
  | 'auth'
  | 'matrimony'
  | 'donation'
  | 'jobs'
  | 'campaigns'
  | 'navigation'
  | 'performance'
  | 'error'
  | 'admin'

export interface AnalyticsEvent {
  category: EventCategory
  action: string
  label?: string
  value?: number
  metadata?: Record<string, unknown>
  timestamp: number
}

// ── Internal dispatch ─────────────────────────────────────────────────────────
function _send(event: AnalyticsEvent): void {
  // In development: log to console
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.debug(`[ANALYTICS] ${event.category}::${event.action}`, event.metadata ?? '')
  }

  // Always add as Sentry breadcrumb
  try {
    Sentry.addBreadcrumb({
      category: event.category,
      message: event.action,
      level: 'info',
      data: {
        label: event.label,
        value: event.value,
        ...event.metadata,
      },
    })
  } catch { /* Sentry not initialised in tests */ }

  // TODO: push to your analytics backend (GA4, Posthog, Mixpanel, etc.)
  // Example: fetch('/api/analytics', { method: 'POST', body: JSON.stringify(event) })
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Track a user interaction event.
 */
export function trackEvent(
  category: EventCategory,
  action: string,
  metadata?: Record<string, unknown>
): void {
  _send({ category, action, metadata, timestamp: Date.now() })
}

/**
 * Track a page view.
 */
export function trackPage(path: string, metadata?: Record<string, unknown>): void {
  _send({
    category: 'navigation',
    action: 'page_view',
    label: path,
    metadata: { path, ...metadata },
    timestamp: Date.now(),
  })
}

/**
 * Track an error (non-fatal, for analytics — fatal errors go through logger.error).
 */
export function trackError(
  message: string,
  context?: Record<string, unknown>
): void {
  _send({
    category: 'error',
    action: 'ui_error',
    label: message,
    metadata: context,
    timestamp: Date.now(),
  })
}

/**
 * Track an API timing measurement.
 */
export function trackTiming(
  operation: string,
  durationMs: number,
  metadata?: Record<string, unknown>
): void {
  _send({
    category: 'performance',
    action: 'api_timing',
    label: operation,
    value: durationMs,
    metadata,
    timestamp: Date.now(),
  })
}

// ── Journey helpers ───────────────────────────────────────────────────────────

export const journey = {
  login:             (userId: string, role: string)    => trackEvent('auth', 'login_success', { userId, role }),
  logout:            ()                                 => trackEvent('auth', 'logout'),
  register:          (role: string)                     => trackEvent('auth', 'register_success', { role }),
  donationStarted:   (amount: number, campaignId?: string) => trackEvent('donation', 'initiated', { amount, campaignId }),
  donationCompleted: (amount: number, receiptNo?: string)  => trackEvent('donation', 'completed', { amount, receiptNo }),
  donationFailed:    (reason: string)                   => trackEvent('donation', 'failed', { reason }),
  jobApplied:        (jobId: string, title: string)     => trackEvent('jobs', 'applied', { jobId, title }),
  interestExpressed: (profileId: string)                => trackEvent('matrimony', 'interest_expressed', { profileId }),
  campaignRegistered:(campaignId: string)               => trackEvent('campaigns', 'registered', { campaignId }),
}
