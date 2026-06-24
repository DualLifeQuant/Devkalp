import { logger } from '@/lib/logger'

interface EnvSpec {
  key: string
  required: boolean
  validate?: (v: string) => boolean
  hint: string
  redact?: boolean
}

const SCHEMA: EnvSpec[] = [
  {
    key: 'NEXT_PUBLIC_API_URL', required: true,
    validate: v => /^https?:\/\/.+/.test(v),
    hint: 'Valid http(s) URL e.g. https://api.devkalpfoundation.org/api/v1',
  },
  {
    key: 'NEXT_PUBLIC_RAZORPAY_KEY_ID', required: true,
    validate: v => v.startsWith('rzp_'),
    hint: 'Must start with rzp_ (test or live)',
  },
  {
    key: 'NEXT_PUBLIC_APP_URL', required: true,
    validate: v => /^https?:\/\/.+/.test(v),
    hint: 'Valid http(s) URL e.g. https://devkalpfoundation.org',
  },
  {
    key: 'NEXT_PUBLIC_SENTRY_DSN', required: false,
    validate: v => v.startsWith('https://') && v.includes('@sentry.io'),
    hint: 'Valid Sentry DSN URL',
  },
  {
    key: 'NEXT_PUBLIC_ERP_URL', required: false,
    validate: v => /^https?:\/\/.+/.test(v),
    hint: 'ERPNext instance URL',
  },
]

export interface EnvValidation {
  valid: boolean
  errors: string[]
  warnings: string[]
}

export function validateEnv(): EnvValidation {
  const errors: string[] = []
  const warnings: string[] = []

  for (const spec of SCHEMA) {
    const val = process.env[spec.key]
    if (!val || !val.trim()) {
      if (spec.required) errors.push(`Missing: ${spec.key} — ${spec.hint}`)
      continue
    }
    if (spec.validate && !spec.validate(val)) {
      const msg = `Invalid ${spec.key}: "${val.slice(0, 40)}" — ${spec.hint}`
      spec.required ? errors.push(msg) : warnings.push(msg)
    }
  }

  return { valid: errors.length === 0, errors, warnings }
}

export function assertEnv(): void {
  const { valid, errors, warnings } = validateEnv()

  for (const w of warnings) logger.warn(`[ENV] ${w}`)

  if (!valid) {
    const msg = `[ENV] Validation failed:\n${errors.map(e => `  ✗ ${e}`).join('\n')}`
    if (process.env.NODE_ENV !== 'production') throw new Error(msg)
    else logger.error(msg)
  }
}

const DEFAULTS: Record<string, string> = {
  NEXT_PUBLIC_API_URL: 'http://localhost:8000/api/v1',
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  NEXT_PUBLIC_RAZORPAY_KEY_ID: '',
}

export function getEnv(key: string): string {
  return process.env[key] ?? DEFAULTS[key] ?? ''
}
