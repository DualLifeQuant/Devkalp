# Database Safety & Query Optimization

## Indexing Strategy

### Critical indexes (backend FastAPI / SQLAlchemy)

```sql
-- Users
CREATE INDEX idx_users_email        ON users(email);
CREATE INDEX idx_users_role         ON users(role);
CREATE INDEX idx_users_is_active    ON users(is_active);

-- Matrimony
CREATE INDEX idx_matrimony_status   ON matrimony_profiles(status);
CREATE INDEX idx_matrimony_user     ON matrimony_profiles(user_id);
CREATE INDEX idx_matrimony_gender   ON matrimony_profiles(gender, status);
CREATE INDEX idx_matrimony_religion ON matrimony_profiles(religion, status);
CREATE INDEX idx_matrimony_city     ON matrimony_profiles(city);

-- Matches
CREATE INDEX idx_matches_profile1   ON matrimony_matches(profile1_id, status);
CREATE INDEX idx_matches_profile2   ON matrimony_matches(profile2_id, status);

-- Jobs
CREATE INDEX idx_jobs_status        ON jobs(status);
CREATE INDEX idx_jobs_type          ON jobs(job_type, status);
CREATE INDEX idx_applications_job   ON job_applications(job_id, status);
CREATE INDEX idx_applications_user  ON job_applications(user_id);

-- Donations
CREATE INDEX idx_donations_user     ON donations(user_id);
CREATE INDEX idx_donations_campaign ON donations(campaign_id);
CREATE INDEX idx_donations_status   ON donations(status, created_at);

-- Campaigns
CREATE INDEX idx_campaigns_category ON campaigns(category, is_registration_open);
CREATE INDEX idx_sessions_campaign  ON campaign_sessions(campaign_id);

-- Audit
CREATE INDEX idx_audit_user         ON audit_logs(user_id, created_at);
CREATE INDEX idx_audit_module       ON audit_logs(module, created_at);
```

## Safe Pagination Pattern

Always use cursor-based pagination for large datasets:

```python
# Backend — avoid OFFSET for large tables
# ❌ Bad (slow beyond page 100)
query.offset(page * limit).limit(limit)

# ✅ Good (cursor-based)
query.where(Model.id > cursor).limit(limit)
```

Frontend usage — React Query already paginates safely via `limit` params.

## N+1 Prevention

### Frontend patterns to avoid

```typescript
// ❌ N+1: fetching profile for each match
matches.map(m => useQuery({ queryKey: ['profile', m.id], ... }))

// ✅ Backend joins — fetch in one call
const { data } = useMyMatches() // returns enriched match objects
```

### Backend patterns (FastAPI reference)

```python
# ❌ N+1
for app in applications:
    app.job = db.query(Job).get(app.job_id)  # N queries

# ✅ Eager load
applications = db.query(Application).options(
    joinedload(Application.job)
).all()
```

## Query Performance Hints

| Endpoint | Optimization |
|----------|-------------|
| `GET /matrimony/admin/profiles?status=pending` | Composite index on `(status, created_at)` |
| `GET /jobs?job_type=full-time` | Index on `(job_type, status)` |
| `GET /admin/activity-logs?module=donations` | Index on `(module, created_at DESC)` |
| `GET /donations/admin/all` | Index on `(status, created_at DESC)` |

## Safe Defaults for All List Endpoints

```python
DEFAULT_LIMIT = 30
MAX_LIMIT = 200

def validate_pagination(limit: int = DEFAULT_LIMIT, offset: int = 0):
    return min(limit, MAX_LIMIT), max(offset, 0)
```
