/**
 * @jest-environment node
 */
import { validateEnv } from '@/lib/env'

const ORIGINAL_ENV = { ...process.env }

afterEach(() => {
  // Restore env after each test
  process.env = { ...ORIGINAL_ENV }
})

describe('validateEnv', () => {
  it('passes with all required vars set', () => {
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000/api/v1'
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID = 'rzp_test_abc123'
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
    const result = validateEnv()
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('fails when required var is missing', () => {
    delete process.env.NEXT_PUBLIC_API_URL
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID = 'rzp_test_abc'
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
    const result = validateEnv()
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('NEXT_PUBLIC_API_URL'))).toBe(true)
  })

  it('fails when API URL is invalid', () => {
    process.env.NEXT_PUBLIC_API_URL = 'not-a-url'
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID = 'rzp_test_abc'
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
    const result = validateEnv()
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('NEXT_PUBLIC_API_URL'))).toBe(true)
  })

  it('fails when Razorpay key has wrong prefix', () => {
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000/api/v1'
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID = 'invalid_key'
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
    const result = validateEnv()
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('NEXT_PUBLIC_RAZORPAY_KEY_ID'))).toBe(true)
  })

  it('warns on invalid optional Sentry DSN without failing', () => {
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000/api/v1'
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID = 'rzp_test_abc'
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
    process.env.NEXT_PUBLIC_SENTRY_DSN = 'not-a-dsn'
    const result = validateEnv()
    expect(result.valid).toBe(true) // still valid — sentry is optional
    expect(result.warnings.some((w) => w.includes('NEXT_PUBLIC_SENTRY_DSN'))).toBe(true)
  })
})
