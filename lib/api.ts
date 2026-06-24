import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import * as Sentry from '@sentry/nextjs'
import { trackTiming } from '@/lib/analytics'
import { getRequestId } from '@/lib/logger'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

// ── Shared refresh promise — prevents thundering herd on 401 ──────────────────
// All concurrent 401 requests share one refresh call; none fires a second one.
let _refreshPromise: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  if (_refreshPromise) return _refreshPromise

  _refreshPromise = (async () => {
    const refresh = localStorage.getItem('refresh_token')
    if (!refresh) throw new Error('NO_REFRESH_TOKEN')
    const res = await axios.post(`${BASE}/auth/refresh`, { refresh_token: refresh })
    const { access_token, refresh_token } = res.data
    localStorage.setItem('access_token', access_token)
    localStorage.setItem('refresh_token', refresh_token)
    return access_token
  })().finally(() => {
    _refreshPromise = null
  })

  return _refreshPromise
}

export const api: AxiosInstance = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

// ── Request interceptor ───────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  // Auth token
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    // CSRF double-submit
    const csrf = document.cookie.match(/csrf_token=([^;]+)/)?.[1]
    if (csrf) config.headers['X-CSRF-Token'] = csrf
  }
  // Request ID for distributed tracing
  config.headers['X-Request-ID'] = getRequestId()
  // Perf timing start
  ;(config as any)._startTime = Date.now()
  return config
})

// ── Response interceptor ──────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => {
    // Track API latency
    const duration = Date.now() - ((response.config as any)._startTime ?? Date.now())
    const url = response.config.url ?? 'unknown'
    trackTiming(url, duration, { status: response.status, method: response.config.method })

    // Add Sentry breadcrumb for successful API calls
    Sentry.addBreadcrumb({
      category: 'http',
      message: `${response.config.method?.toUpperCase()} ${url}`,
      level: 'info',
      data: { status: response.status, duration },
    })

    return response
  },
  async (error) => {
    const status = error.response?.status
    const url = error.config?.url ?? 'unknown'
    const duration = Date.now() - ((error.config as any)?._startTime ?? Date.now())

    // Track failed request
    trackTiming(url, duration, { status, method: error.config?.method, failed: true })

    // Add Sentry breadcrumb for failed requests
    Sentry.addBreadcrumb({
      category: 'http',
      message: `${error.config?.method?.toUpperCase()} ${url} FAILED`,
      level: 'error',
      data: { status, duration, message: error.response?.data?.detail },
    })

    // ── Token refresh on 401 — shared promise prevents thundering herd ──────
    if (status === 401 && typeof window !== 'undefined' && !error.config._retry) {
      error.config._retry = true
      const refresh = localStorage.getItem('refresh_token')
      if (refresh) {
        try {
          const newToken = await refreshAccessToken()
          error.config.headers.Authorization = `Bearer ${newToken}`
          return axios(error.config)
        } catch {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          window.location.href = '/auth/login'
        }
      } else {
        localStorage.clear()
        window.location.href = '/auth/login'
      }
    }

    return Promise.reject(error)
  }
)

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login:          (email: string, password: string) => api.post('/auth/login', { email, password }),
  register:       (data: any)  => api.post('/auth/register', data),
  me:             ()           => api.get('/auth/me'),
  changePassword: (data: any)  => api.post('/auth/change-password', data),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword:  (data: any)  => api.post('/auth/reset-password', data),
  createAdmin:    (data: any)  => api.post('/setup/create-admin', data),
}

// ── Matrimony ─────────────────────────────────────────────────────────────────
export const matrimonyApi = {
  createProfile: (data: any)               => api.post('/matrimony/profile', data),
  getMyProfile:  ()                         => api.get('/matrimony/profile/me'),
  updateProfile: (data: any)               => api.put('/matrimony/profile/me', data),
  uploadPhoto:   (form: FormData)          => api.post('/matrimony/profile/photo', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deletePhoto:   (photoUrl: string)        => api.delete('/matrimony/profile/photo', { params: { photo_url: photoUrl } }),
  uploadIdProof: (form: FormData, t: string) => api.post(`/matrimony/profile/id-proof?id_type=${t}`, form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getMyMatches:  ()                         => api.get('/matrimony/my-matches'),
  respondMatch:  (id: string, interested: boolean) => api.post(`/matrimony/matches/${id}/respond`, { interested }),
  adminProfiles: (params?: any)            => api.get('/matrimony/admin/profiles', { params }),
  adminApprove:  (id: string, data: any)   => api.post(`/matrimony/admin/profiles/${id}/approve`, data),
  adminSuggest:  (data: any)               => api.post('/matrimony/admin/suggest-match', data),
  adminUpdateMatch: (id: string, data: any) => api.put(`/matrimony/admin/matches/${id}`, data),
}

// ── Donations ─────────────────────────────────────────────────────────────────
export const donationsApi = {
  getCampaigns:    (p?: any)      => api.get('/donations/campaigns', { params: p }),
  getCampaign:     (slug: string) => api.get(`/donations/campaigns/${slug}`),
  createCampaign:  (data: any)    => api.post('/donations/campaigns', data),
  initiate:        (data: any)    => api.post('/donations/initiate', data),
  verify:          (data: any)    => api.post('/donations/verify-payment', data),
  mockComplete:    (id: string)   => api.post('/donations/mock-complete', { donation_id: id }),
  myDonations:     ()             => api.get('/donations/my-donations'),
  transparency:    ()             => api.get('/donations/transparency'),
  adminAll:        (p?: any)      => api.get('/donations/admin/all', { params: p }),
}

// ── Jobs ──────────────────────────────────────────────────────────────────────
export const jobsApi = {
  list:              (p?: any)              => api.get('/jobs', { params: p }),
  get:               (id: string)           => api.get(`/jobs/${id}`),
  apply:             (id: string, data: any) => api.post(`/jobs/${id}/apply`, data),
  myApplications:    ()                      => api.get('/jobs/my-applications'),
  adminList:         ()                      => api.get('/jobs/admin/list'),
  adminApps:         (p?: any)              => api.get('/jobs/admin/applications', { params: p }),
  create:            (data: any)            => api.post('/jobs', data),
  shortlist:         (id: string, data: any) => api.post(`/jobs/admin/applications/${id}/shortlist`, data),
  scheduleInterview: (data: any)            => api.post('/jobs/admin/schedule-interview', data),
}

// ── Campaigns ─────────────────────────────────────────────────────────────────
export const campaignsApi = {
  list:     (p?: any)              => api.get('/campaigns', { params: p }),
  get:      (slug: string)         => api.get(`/campaigns/${slug}`),
  register: (id: string, data: any) => api.post(`/campaigns/${id}/register`, data),
}

// ── Volunteers ────────────────────────────────────────────────────────────────
export const volunteersApi = {
  myProfile:    ()                    => api.get('/volunteers/my-profile'),
  myTasks:      ()                    => api.get('/volunteers/my-tasks'),
  register:     (data: any)          => api.post('/volunteers/register', data),
  completeTask: (id: string, d: any) => api.post(`/volunteers/tasks/${id}/complete`, d),
  approve:      (id: string, d: any) => api.post(`/volunteers/admin/${id}/approve`, d),
  adminAll:     (p?: any)            => api.get('/volunteers/admin/all', { params: p }),
}

// ── Counselors ────────────────────────────────────────────────────────────────
export const counselorsApi = {
  mySessions:    (p?: any)           => api.get('/counselors/my-sessions', { params: p }),
  profiles:      (p?: any)           => api.get('/counselors/profiles', { params: p }),
  profileDetail: (id: string)        => api.get(`/counselors/profiles/${id}`),
  addNotes:      (id: string, d: any) => api.post(`/counselors/sessions/${id}/notes`, d),
  assignSession: (data: any)         => api.post('/counselors/admin/assign-session', data),
  adminAll:      ()                  => api.get('/counselors/admin/all'),
}

// ── Emotional Evaluation ──────────────────────────────────────────────────────
export const emotionalApi = {
  questions:  () => api.get('/emotional/questions'),
  myResponse: () => api.get('/emotional/my-response'),
  submit:     (data: any) => api.post('/emotional/submit', data),
}

// ── Family ────────────────────────────────────────────────────────────────────
export const familyApi = {
  getMembers: ()                    => api.get('/family/members'),
  add:        (data: any)          => api.post('/family/members', data),
  update:     (id: string, d: any) => api.put(`/family/members/${id}`, d),
  remove:     (id: string)         => api.delete(`/family/members/${id}`),
}

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminApi = {
  stats:       ()          => api.get('/admin/stats'),
  users:       (p?: any)  => api.get('/admin/users', { params: p }),
  toggleUser:  (id: string) => api.post(`/admin/users/${id}/toggle`),
  logs:        (p?: any)  => api.get('/admin/activity-logs', { params: p }),
}

// ── Sessions (campaign attendance) ───────────────────────────────────────────
export const sessionApi = {
  byCampaign:      (id: string)          => api.get(`/campaigns/${id}/sessions`),
  analytics:       (id: string)          => api.get(`/campaigns/${id}/sessions/analytics`),
  create:          (data: any)           => api.post('/sessions', data),
  bulkAttendance:  (id: string, d: any)  => api.post(`/sessions/${id}/attendance`, d),
}
