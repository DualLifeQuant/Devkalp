# Rollback Strategy — Devkalp Foundation

## Decision Framework

```
Bug severity:
  CRITICAL (data loss / payment failure / auth broken) → Immediate rollback (< 5 min)
  HIGH (feature broken for many users)                 → Fast rollback (< 15 min)
  MEDIUM (minor UI issue / degraded feature)           → Hotfix PR (< 2 hours)
  LOW (cosmetic issue)                                 → Next release
```

---

## Option 1: Vercel Instant Rollback (fastest)

```bash
# List recent deployments
vercel list

# Roll back to specific deployment
vercel rollback <deployment-url>
# OR
vercel rollback  # rolls back to previous deployment
```

**Time to recovery:** ~2 minutes  
**Risk:** None — Vercel switches routing atomically

---

## Option 2: Git Revert + Redeploy

```bash
# Find the last known-good commit
git log --oneline -20

# Revert the bad commit(s)
git revert <bad-commit-hash> --no-commit
git commit -m "revert: rollback <feature> due to <issue>"
git push origin main
```

CI will auto-deploy on push to `main`.

**Time to recovery:** ~8–12 minutes (CI pipeline)

---

## Option 3: Docker / Custom Server

```bash
# Tag current (broken) image
docker tag devkalp-frontend:latest devkalp-frontend:broken-$(date +%Y%m%d%H%M)

# Pull and deploy previous stable image
docker pull devkalp-frontend:stable
docker service update --image devkalp-frontend:stable devkalp_frontend

# Verify
curl -s https://devkalpfoundation.org/api/health
```

---

## Partial Rollback (Feature Flags via ENV)

Disable specific integrations without full rollback:

| Feature | How to disable |
|---------|---------------|
| ERP sync | Remove `NEXT_PUBLIC_ERP_URL` → auto-disabled |
| Sentry | Remove `NEXT_PUBLIC_SENTRY_DSN` → degrades silently |
| Razorpay | Switch `NEXT_PUBLIC_RAZORPAY_KEY_ID` to test key |

---

## Database Rollback

If a migration caused the issue:
```bash
# Backend — run in backend repo
alembic downgrade -1   # roll back one migration
# OR
alembic downgrade <revision-id>
```

---

## Post-Rollback Checklist

- [ ] Confirm site loads correctly
- [ ] Test login/logout flow
- [ ] Test a donation (use test Razorpay key)
- [ ] Check Sentry error rate is below baseline
- [ ] Notify team in Slack `#incidents`
- [ ] Create post-mortem issue in GitHub

---

## Contacts

| Role | Action |
|------|--------|
| DevOps | Execute rollback |
| Backend lead | DB rollback if needed |
| Product | User communication |
| Sentry | Monitor error rate after rollback |
