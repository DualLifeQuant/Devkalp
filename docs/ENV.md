# Environment Variables — Devkalp Foundation

## Required (app will not start without these)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `https://api.devkalpfoundation.org/api/v1` |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay publishable key | `rzp_live_XXXXXXXX` |
| `NEXT_PUBLIC_APP_URL` | Frontend canonical URL | `https://devkalpfoundation.org` |

## Optional — Monitoring

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry project DSN (client) | `https://abc@sentry.io/123` |
| `SENTRY_DSN` | Sentry project DSN (server) | `https://abc@sentry.io/123` |
| `SENTRY_ORG` | Sentry organisation slug | `devkalp-foundation` |
| `SENTRY_PROJECT` | Sentry project slug | `devkalp-frontend` |
| `SENTRY_AUTH_TOKEN` | Used by CI to upload source maps | `sntrys_...` |

## Optional — ERP Integration

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_ERP_URL` | ERPNext base URL | `https://erp.devkalpfoundation.org` |
| `ERP_API_TOKEN` | ERPNext API token (server-only, never prefix `NEXT_PUBLIC_`) | `abc123` |
| `ERP_API_KEY` | ERPNext API key (server-only) | `def456` |

## Optional — App

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_VERSION` | Version string for Sentry releases | `dev` |

---

## Environment Files

| File | Purpose | Committed? |
|------|---------|-----------|
| `.env.local` | Local development overrides | ❌ Never |
| `.env.local.example` | Template for new developers | ✅ Yes |
| `.env.production` | Production defaults | ✅ Yes (no secrets) |

---

## Validation

All required variables are validated at startup via `lib/env.ts`.

- **Development**: throws an error with clear message if any required var is missing
- **Production**: logs error but does not crash (some vars injected at runtime)

To manually test validation:
```bash
node -e "require('./lib/env').assertEnv()"
```

---

## Security Notes

- **Never** prefix server-only secrets with `NEXT_PUBLIC_`
- `ERP_API_TOKEN`, `ERP_API_KEY`, `SENTRY_AUTH_TOKEN` must stay server-side only
- Razorpay live key should only be in production environment
- Rotate all keys if accidentally committed to git
