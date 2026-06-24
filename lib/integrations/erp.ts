import { logger } from '@/lib/logger'
import * as Sentry from '@sentry/nextjs'

const ERP_BASE  = process.env.NEXT_PUBLIC_ERP_URL ?? ''
const ERP_TOKEN = process.env.ERP_API_TOKEN ?? ''
const ERP_KEY   = process.env.ERP_API_KEY   ?? ''

// ── Types ──────────────────────────────────────────────────────────────────────
export type SyncStatus = 'pending' | 'processing' | 'success' | 'failed' | 'skipped'

export interface SyncRecord {
  id: string
  entity: string
  operation: 'POST' | 'PUT'
  idempotencyKey: string
  requestHash: string
  status: SyncStatus
  attempts: number
  maxAttempts: number
  createdAt: string
  lastAttemptAt: string
  nextRetryAt?: string
  error?: string
  erpDocName?: string
}

interface QueueJob {
  syncRecord: SyncRecord
  payload: unknown
}

// ── Queue interface (BullMQ-compatible contract) ───────────────────────────────
export interface ErpQueue {
  enqueue(job: QueueJob): void
  getAll(): QueueJob[]
  remove(id: string): void
  clear(): void
  size(): number
}

// ── In-memory queue (default, production-swappable for Redis/BullMQ) ──────────
class MemoryErpQueue implements ErpQueue {
  private _active: Map<string, QueueJob> = new Map()
  private _failed: Map<string, QueueJob> = new Map()

  enqueue(job: QueueJob): void {
    this._active.set(job.syncRecord.id, job)
  }
  getAll(): QueueJob[] {
    return Array.from(this._active.values())
  }
  remove(id: string): void {
    this._active.delete(id)
  }
  getFailed(): QueueJob[] {
    return Array.from(this._failed.values())
  }
  moveFailed(job: QueueJob): void {
    this._active.delete(job.syncRecord.id)
    this._failed.set(job.syncRecord.id, job)
  }
  getFailedById(id: string): QueueJob | undefined {
    return this._failed.get(id)
  }
  removeFromFailed(id: string): void {
    this._failed.delete(id)
  }
  clear(): void {
    this._active.clear()
  }
  size(): number {
    return this._active.size
  }
}

const _queue = new MemoryErpQueue()

// ── Sync registry (in-process; swap Map for Redis HSET in production) ─────────
const _registry = new Map<string, SyncRecord>()

function setRecord(r: SyncRecord): void {
  _registry.set(r.idempotencyKey, r)
}
function getRecord(key: string): SyncRecord | undefined {
  return _registry.get(key)
}

// ── Idempotency + deduplication ────────────────────────────────────────────────
function buildKey(entity: string, id: string): string {
  return `${entity}:${id}`
}

function hashPayload(payload: unknown): string {
  const str = JSON.stringify(payload, Object.keys(payload as object).sort())
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i) | 0
  }
  return (h >>> 0).toString(16)
}

function shouldSkip(key: string, newHash: string): boolean {
  const existing = getRecord(key)
  if (!existing) return false
  if (existing.status === 'success' && existing.requestHash === newHash) return true
  if (existing.status === 'processing') return true
  return false
}

function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

// ── Backoff ────────────────────────────────────────────────────────────────────
function backoffMs(attempt: number): number {
  const base = Math.pow(2, attempt) * 1000          // 1s, 2s, 4s, 8s, 16s
  const jitter = Math.random() * 500                 // 0-500ms jitter
  return Math.min(base + jitter, 30_000)             // cap at 30s
}

// ── HTTP fetch ─────────────────────────────────────────────────────────────────
async function erpFetch(
  method: 'POST' | 'PUT',
  path: string,
  body: unknown,
): Promise<{ ok: boolean; docName?: string; error?: string }> {
  if (!ERP_BASE) return { ok: false, error: 'ERP_URL_NOT_CONFIGURED' }
  try {
    const res = await fetch(`${ERP_BASE}/api/resource/${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `token ${ERP_TOKEN}:${ERP_KEY}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      return { ok: false, error: `HTTP_${res.status}: ${text.slice(0, 200)}` }
    }
    const data = await res.json()
    return { ok: true, docName: data?.data?.name }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { ok: false, error: msg }
  }
}

// ── Worker loop ────────────────────────────────────────────────────────────────
let _running = false

async function processQueue(): Promise<void> {
  if (_running) return
  _running = true

  try {
    while (true) {
      const jobs = _queue.getAll()
      const due = jobs.filter(j => {
        const r = j.syncRecord
        if (r.status === 'processing') return false
        if (!r.nextRetryAt) return true
        return Date.now() >= new Date(r.nextRetryAt).getTime()
      })

      if (due.length === 0) break

      for (const job of due) {
        const r = job.syncRecord
        r.status = 'processing'
        r.lastAttemptAt = new Date().toISOString()
        r.attempts++
        setRecord(r)

        const result = await erpFetch(r.operation, r.entity, job.payload)

        if (result.ok) {
          r.status = 'success'
          r.erpDocName = result.docName
          setRecord(r)
          _queue.remove(r.id)
          logger.info('ERP sync success', {
            entity: r.entity, idempotencyKey: r.idempotencyKey,
            attempts: r.attempts, docName: result.docName,
          })
        } else {
          r.error = result.error
          if (r.attempts >= r.maxAttempts) {
            r.status = 'failed'
            setRecord(r)
            _queue.moveFailed(job)
            logger.error('ERP sync failed — max retries exceeded', undefined, {
              entity: r.entity, idempotencyKey: r.idempotencyKey,
              attempts: r.attempts, error: result.error,
            })
            Sentry.captureMessage(`ERP sync failed: ${r.entity} ${r.idempotencyKey}`, {
              level: 'error',
              extra: { ...r, error: result.error },
            })
          } else {
            r.status = 'pending'
            r.nextRetryAt = new Date(Date.now() + backoffMs(r.attempts)).toISOString()
            setRecord(r)
            logger.warn('ERP sync will retry', {
              entity: r.entity, attempt: r.attempts, nextRetry: r.nextRetryAt,
            })
          }
        }
      }
    }
  } finally {
    // CRITICAL: always release lock — prevents permanent deadlock on throw
    _running = false
  }
}

// ── Public enqueue ─────────────────────────────────────────────────────────────
function enqueue(
  entity: string,
  operation: 'POST' | 'PUT',
  id: string,
  payload: unknown,
  maxAttempts = 4,
): void {
  const idempotencyKey = buildKey(entity, id)
  const requestHash = hashPayload(payload)

  if (shouldSkip(idempotencyKey, requestHash)) {
    logger.debug('ERP enqueue skipped (idempotent)', { entity, id })
    return
  }

  const record: SyncRecord = {
    id: newId(),
    entity,
    operation,
    idempotencyKey,
    requestHash,
    status: 'pending',
    attempts: 0,
    maxAttempts,
    createdAt: new Date().toISOString(),
    lastAttemptAt: '',
  }

  setRecord(record)
  _queue.enqueue({ syncRecord: record, payload })

  // Fire-and-forget — never blocks caller
  Promise.resolve().then(processQueue).catch((err) => {
    logger.error('ERP queue processor error', err)
  })
}

// ── Public sync API ─────────────────────────────────────────────────────────────

export async function syncUserToERP(user: {
  id: string; full_name: string; email: string; phone?: string; role: string
}): Promise<void> {
  const [first_name, ...rest] = user.full_name.trim().split(' ')
  enqueue('Contact', 'POST', user.id, {
    doctype: 'Contact',
    first_name,
    last_name: rest.join(' ') || undefined,
    email_id: user.email,
    mobile_no: user.phone,
    custom_platform_role: user.role,
    custom_platform_user_id: user.id,
  })
}

export async function pushDonationToERP(donation: {
  id: string; amount: number; donor_name?: string; donor_email?: string;
  campaign_id?: string; receipt_number?: string;
}): Promise<void> {
  enqueue('Payment Entry', 'POST', donation.id, {
    doctype: 'Payment Entry',
    payment_type: 'Receive',
    party_type: 'Customer',
    party: donation.donor_email ?? donation.donor_name ?? 'Anonymous',
    paid_amount: donation.amount,
    received_amount: donation.amount,
    custom_campaign_id: donation.campaign_id,
    custom_receipt_number: donation.receipt_number,
    custom_platform_donation_id: donation.id,
    remarks: `Platform donation ${donation.receipt_number ?? donation.id}`,
  }, 5) // 5 retries for financial records
}

export async function syncCampaignToERP(campaign: {
  id: string; title: string; category?: string; description?: string;
  is_active: boolean; event_date?: string;
}): Promise<void> {
  enqueue('Project', 'POST', campaign.id, {
    doctype: 'Project',
    project_name: campaign.title,
    status: campaign.is_active ? 'Open' : 'Completed',
    custom_campaign_id: campaign.id,
    custom_category: campaign.category,
    description: campaign.description,
    expected_end_date: campaign.event_date,
  })
}

export async function syncVolunteerToERP(volunteer: {
  id: string; full_name: string; email?: string; phone?: string; city?: string;
}): Promise<void> {
  const [first_name, ...rest] = volunteer.full_name.trim().split(' ')
  enqueue('Employee', 'POST', volunteer.id, {
    doctype: 'Employee',
    first_name,
    last_name: rest.join(' ') || undefined,
    company_email: volunteer.email,
    cell_number: volunteer.phone,
    employment_type: 'Volunteer',
    custom_platform_volunteer_id: volunteer.id,
    custom_city: volunteer.city,
  })
}

// ── Status + admin APIs ─────────────────────────────────────────────────────────

export function getSyncStatus(entity: string, id: string): SyncRecord | undefined {
  return getRecord(buildKey(entity, id))
}

export function getFailedJobs(): SyncRecord[] {
  return _queue.getFailed().map(j => j.syncRecord)
}

export async function retryFailedJob(syncId: string): Promise<boolean> {
  const job = _queue.getFailedById(syncId)
  if (!job) return false
  const r = job.syncRecord
  r.status = 'pending'
  r.attempts = 0
  r.error = undefined
  r.nextRetryAt = undefined
  setRecord(r)
  // Remove from failed FIRST, then enqueue to active — prevents re-adding to failed
  _queue.removeFromFailed(r.id)
  _queue.enqueue(job)
  await processQueue()
  return true
}

export function getQueueStats(): {
  active: number; failed: number; registrySize: number
} {
  return {
    active: _queue.size(),
    failed: _queue.getFailed().length,
    registrySize: _registry.size,
  }
}
