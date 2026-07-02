/**
 * Security utilities — XSS prevention, input sanitization, rate limiting
 * Production-hardened: no external DOMPurify dependency needed
 */

// ── HTML escaping ─────────────────────────────────────────────────────────────
const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;', '<': '&lt;', '>': '&gt;',
  '"': '&quot;', "'": '&#39;', '/': '&#x2F;',
  '`': '&#x60;', '=': '&#x3D;',
}

export function escapeHtml(str: string): string {
  return String(str).replace(/[&<>"'`=/]/g, (c) => HTML_ESCAPE_MAP[c] ?? c)
}

export function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, '').trim()
}

export function sanitizeText(str: unknown, maxLength = 1000): string {
  if (typeof str !== 'string') return ''
  return stripHtml(str.trim()).slice(0, maxLength)
}

// ── Attribute sanitization ────────────────────────────────────────────────────
/**
 * Sanitize an HTML attribute value to prevent attribute injection.
 * Strips quotes, angle brackets, and event handler patterns.
 */
export function sanitizeAttr(value: string): string {
  return value
    .replace(/["'<>]/g, '')           // remove quotes and angle brackets
    .replace(/on\w+\s*=/gi, '')       // remove event handlers (onclick=, onerror=)
    .replace(/javascript\s*:/gi, '')  // remove javascript: URIs
    .replace(/data\s*:/gi, '')        // remove data: URIs
    .trim()
    .slice(0, 500)
}

// ── URL whitelist enforcement ─────────────────────────────────────────────────
const ALLOWED_URL_PROTOCOLS = new Set(['https:', 'http:', 'mailto:', 'tel:'])

const TRUSTED_DOMAINS = new Set([
  'devkalpfoundation.org',
  'res.cloudinary.com',
  'images.unsplash.com',
  'picsum.photos',
  'api.devkalpfoundation.org',
])

export function isSafeUrl(url: string): boolean {
  try {
    const u = new URL(url)
    return ALLOWED_URL_PROTOCOLS.has(u.protocol)
  } catch {
    return false
  }
}

export function isTrustedDomain(url: string): boolean {
  try {
    const hostname = new URL(url).hostname
    return TRUSTED_DOMAINS.has(hostname) || hostname.endsWith('.devkalpfoundation.org')
  } catch { return false }
}

export function sanitizeUrl(url: string): string {
  if (!url) return '#'
  const trimmed = url.trim()
  // Allow relative URLs
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) return trimmed
  if (!isSafeUrl(trimmed)) return '#'
  return trimmed
}

// ── Deep object sanitization ──────────────────────────────────────────────────
type Primitive = string | number | boolean | null | undefined

/**
 * Recursively sanitize an object's string values.
 * Use before rendering untrusted API data in innerHTML or attribute contexts.
 */
export function deepSanitize<T>(input: T, maxDepth = 5): T {
  if (maxDepth <= 0) return input
  if (typeof input === 'string') return sanitizeText(input) as unknown as T
  if (Array.isArray(input)) return input.map((i) => deepSanitize(i, maxDepth - 1)) as unknown as T
  if (input !== null && typeof input === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
      out[sanitizeAttr(k)] = deepSanitize(v, maxDepth - 1)
    }
    return out as unknown as T
  }
  return input
}

// ── Masking helpers ───────────────────────────────────────────────────────────
export function maskPhone(phone: string): string {
  if (phone.length < 6) return '***'
  return phone.slice(0, 2) + '****' + phone.slice(-4)
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!local || !domain) return '***'
  const visible = local.length > 2 ? local.slice(0, 2) : local[0] ?? ''
  return `${visible}***@${domain}`
}

// ── Rate limit handling ───────────────────────────────────────────────────────
export interface RateLimitInfo {
  limited: boolean
  retryAfterMs?: number
  message: string
}

export function parseRateLimit(error: unknown): RateLimitInfo {
  const e = error as any
  const status = e?.response?.status
  if (status !== 429) return { limited: false, message: '' }
  const retryAfter = e?.response?.headers?.['retry-after']
  const retryAfterMs = retryAfter ? parseInt(retryAfter) * 1000 : 60_000
  return {
    limited: true,
    retryAfterMs,
    message: `Too many requests. Please wait ${Math.ceil(retryAfterMs / 1000)} seconds before trying again.`,
  }
}

// ── File upload validation ────────────────────────────────────────────────────
export function validateFileUpload(
  file: File,
  opts: { maxSizeMb?: number; allowedTypes?: string[] } = {}
): string | null {
  const { maxSizeMb = 5, allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'] } = opts
  if (!allowedTypes.includes(file.type)) return `File type not allowed. Allowed: ${allowedTypes.join(', ')}`
  if (file.size > maxSizeMb * 1024 * 1024) return `File must be under ${maxSizeMb}MB`
  if (/[<>:"\/\\|?*\x00-\x1F]/.test(file.name)) return 'Invalid file name'
  return null
}

// ── Sensitive data detection ──────────────────────────────────────────────────
const SENSITIVE_PATTERNS = [
  /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/, // credit card
  /\b[A-Z]{5}[0-9]{4}[A-Z]\b/,                 // PAN card
  /password/i, /token/i, /secret/i,
]

export function containsSensitiveData(str: string): boolean {
  return SENSITIVE_PATTERNS.some((p) => p.test(str))
}

// ── CSP nonce (server-side) ───────────────────────────────────────────────────
/**
 * Generate a cryptographically random nonce for Content-Security-Policy.
 * Use in Next.js middleware to inject into CSP headers.
 */
export function generateNonce(): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const arr = new Uint8Array(16)
    crypto.getRandomValues(arr)
    return Buffer.from(arr).toString('base64')
  }
  // Fallback (Node)
  return require('crypto').randomBytes(16).toString('base64')
}
