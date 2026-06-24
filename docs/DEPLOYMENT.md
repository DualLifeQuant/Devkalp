# Devkalp Foundation — Production Deployment Checklist

## Pre-deployment

### Environment Variables
- [ ] `NEXT_PUBLIC_API_URL` — points to production backend
- [ ] `NEXT_PUBLIC_RAZORPAY_KEY_ID` — use live key (`rzp_live_...`)
- [ ] `NEXT_PUBLIC_APP_URL` — production URL
- [ ] `NEXT_PUBLIC_SENTRY_DSN` — Sentry project DSN
- [ ] `SENTRY_AUTH_TOKEN` — for source map upload
- [ ] `SENTRY_ORG` + `SENTRY_PROJECT` — Sentry org/project slugs
- [ ] `NEXT_PUBLIC_ERP_URL` — ERPNext instance URL (if enabled)
- [ ] `ERP_API_TOKEN` + `ERP_API_KEY` — ERPNext credentials (server-only)

### Build Checks
- [ ] `npm run type-check` passes (zero TypeScript errors)
- [ ] `npm run lint -- --max-warnings=0` passes
- [ ] `npm test -- --ci` passes (all unit + integration tests green)
- [ ] `npm run build` completes without errors or warnings

### Security
- [ ] No `.env.local` committed to git
- [ ] Razorpay key is live (not test)
- [ ] HTTPS enforced at load balancer
- [ ] HSTS header confirmed in middleware
- [ ] CSP header confirmed in middleware
- [ ] `X-Frame-Options: DENY` confirmed

### Sentry
- [ ] Source maps uploaded to Sentry (`SENTRY_AUTH_TOKEN` set in CI)
- [ ] Sentry release created and commits attached
- [ ] Test error appears in Sentry dashboard before go-live

### Backend
- [ ] API `/health` returns 200
- [ ] Auth endpoints tested manually
- [ ] CORS allows production frontend URL
- [ ] Database migrations applied

---

## Deployment Steps

1. Merge PR to `main`
2. CI pipeline runs automatically:
   - lint → type-check → unit tests → build → E2E → deploy
3. Monitor Sentry for new errors in first 30 minutes
4. Verify Razorpay test donation completes end-to-end
5. Verify matrimony profile creation flow
6. Verify admin login and dashboard loads

---

## Rollback Strategy

### Immediate rollback (< 5 minutes)
If critical bug is detected post-deploy:

**Vercel:**
```bash
vercel rollback
```

**Custom server / Docker:**
```bash
docker pull devkalp-frontend:previous-tag
docker service update --image devkalp-frontend:previous-tag devkalp_frontend
```

**Manual:**
1. Identify last working commit: `git log --oneline -10`
2. Create hotfix branch: `git checkout -b hotfix/rollback <working-commit>`
3. Force deploy: push to `main` with `[skip e2e]` in commit message for speed

### Partial rollback
- Feature flags can disable specific features without full rollback
- Toggle ERP integration: remove `NEXT_PUBLIC_ERP_URL` env var → sync disables automatically
- Disable Sentry: remove `NEXT_PUBLIC_SENTRY_DSN` → degrades silently

---

## Post-deployment Monitoring

### First hour
- [ ] Sentry error rate < 0.1%
- [ ] P95 API latency < 2s (check Sentry performance)
- [ ] No 500/503 errors in server logs
- [ ] Razorpay webhook delivery rate 100%

### First 24 hours
- [ ] No new critical issues in Sentry
- [ ] ERP sync success rate > 95% (check admin logs)
- [ ] Audit logs populating correctly

---

## Environment-specific Configs

| Setting | Development | Staging | Production |
|---------|------------|---------|------------|
| Razorpay | `rzp_test_*` | `rzp_test_*` | `rzp_live_*` |
| Sentry traces | 100% | 50% | 10% |
| Console logs | All | warn+ | error only |
| HSTS | Off | Off | On |
| Source maps | Included | Included | Hidden |
