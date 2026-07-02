/**
 * Structured logger.
 * - Dev: formatted console output
 * - Prod: JSON structured logs (ready for Datadog/CloudWatch ingestion)
 */

import * as Sentry from '@sentry/nextjs'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'
type LogMeta = Record<string, unknown>

const IS_DEV = process.env.NODE_ENV === 'development'
const IS_SERVER = typeof window === 'undefined'

// Request ID for distributed tracing — set once per request context
let _requestId = ''

export function getRequestId(): string {
  if (!_requestId) {
    _requestId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
  }
  return _requestId
}

export function setRequestId(id: string): void {
  _requestId = id
}

function log(level: LogLevel, message: string, error?: unknown, meta?: LogMeta): void {
  const ts = new Date().toISOString()
  const reqId = _requestId || getRequestId()

  if (IS_DEV) {
    const prefix = {
      debug: '🔍 [DEBUG]',
      info:  'ℹ️  [INFO]',
      warn:  '⚠️  [WARN]',
      error: '🔴 [ERROR]',
    }[level]
    const args: unknown[] = [`${prefix} ${message}`]
    if (meta)  args.push(meta)
    if (error) args.push(error)
    console[level === 'debug' ? 'log' : level](...args)
    return
  }

  // Production: structured JSON
  const entry: Record<string, unknown> = {
    ts,
    level,
    message,
    requestId: reqId,
    env: process.env.NODE_ENV,
    ...(IS_SERVER ? { runtime: 'server' } : { runtime: 'browser' }),
    ...meta,
  }

  if (error) {
    if (error instanceof Error) {
      entry.error = { name: error.name, message: error.message, stack: error.stack }
    } else {
      entry.error = String(error)
    }
  }

  console[level === 'debug' ? 'log' : level](JSON.stringify(entry))
}

export const logger = {
  debug: (message: string, meta?: LogMeta) => log('debug', message, undefined, meta),
  info:  (message: string, meta?: LogMeta) => log('info',  message, undefined, meta),
  warn:  (message: string, meta?: LogMeta) => log('warn',  message, undefined, meta),
  error: (message: string, error?: unknown, meta?: LogMeta) => {
    log('error', message, error, meta)
    // Forward to Sentry in production
    if (!IS_DEV && error instanceof Error) {
      Sentry.captureException(error, { extra: meta })
    }
  },
}
