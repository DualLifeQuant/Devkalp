import { NextResponse, type NextRequest } from 'next/server'

/**
 * Next.js Edge Middleware
 * - Injects Content-Security-Policy header with nonce
 * - Adds security headers (X-Frame-Options, HSTS, etc.)
 * - CSRF token double-submit pattern for state-changing requests
 */

function generateNonce(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return btoa(String.fromCharCode(...array))
}

export function middleware(request: NextRequest) {
  const nonce = generateNonce()
  const isDev = process.env.NODE_ENV === 'development'

  // ── Content Security Policy ──────────────────────────────────────────────
  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' ${isDev ? "'unsafe-eval'" : ''} https://checkout.razorpay.com https://*.sentry.io`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `font-src 'self' https://fonts.gstatic.com`,
    `img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com https://picsum.photos`,
    `connect-src 'self' ${process.env.NEXT_PUBLIC_API_URL ?? ''} https://*.sentry.io wss:`,
    `frame-src 'none'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `upgrade-insecure-requests`,
  ].filter(Boolean).join('; ')

  const response = NextResponse.next({
    request: {
      headers: new Headers({
        ...Object.fromEntries(request.headers),
        'x-nonce': nonce,
      }),
    },
  })

  // ── Security headers ─────────────────────────────────────────────────────
  response.headers.set('Content-Security-Policy', csp)
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  if (!isDev) {
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  }

  // ── CSRF double-submit cookie ────────────────────────────────────────────
  // On GET requests to pages, set a CSRF token cookie that API calls must echo back
  if (request.method === 'GET' && !request.nextUrl.pathname.startsWith('/api/')) {
    const existing = request.cookies.get('csrf_token')
    if (!existing) {
      const csrfToken = generateNonce()
      response.cookies.set('csrf_token', csrfToken, {
        httpOnly: false, // Must be readable by JS to send in header
        sameSite: 'strict',
        secure: !isDev,
        path: '/',
        maxAge: 60 * 60 * 8, // 8 hours
      })
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
