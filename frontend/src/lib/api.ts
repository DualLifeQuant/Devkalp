import axios, { AxiosInstance } from 'axios'
import mockData from './mockData.json'

const BASE = import.meta.env.VITE_API_URL

export const api: AxiosInstance = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

const replaceLocalhost = (data: any, replacement: string): any => {
  if (!data) return data
  if (typeof data === 'string') {
    return data.replace(/https?:\/\/(localhost|127\.0\.0\.1):8000/g, replacement)
  }
  if (Array.isArray(data)) {
    return data.map(item => replaceLocalhost(item, replacement))
  }
  if (typeof data === 'object' && Object.prototype.toString.call(data) === '[object Object]') {
    const copy: any = {}
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        copy[key] = replaceLocalhost(data[key], replacement)
      }
    }
    return copy
  }
  return data
}

api.interceptors.response.use(
  (r) => {
    const apiBase = import.meta.env.VITE_API_URL
    const backendBase = apiBase.replace('/api/v1', '')
    if (backendBase && r.data) {
      r.data = replaceLocalhost(r.data, backendBase)
    }
    return r
  },
  async (error) => {
    const isNetworkError = !error.response || error.code === 'ERR_NETWORK' || error.message === 'Network Error';
    if (isNetworkError && error.config) {
      const url = error.config.url || '';
      let mockResponseData: any = null;

      if (url.includes('/matrimony/public-profiles')) {
        mockResponseData = mockData.profiles;
      } else if (url.endsWith('/campaigns') || url.endsWith('/campaigns/')) {
        mockResponseData = {
          items: mockData.campaigns,
          total: mockData.campaigns.length
        };
      } else if (url.includes('/campaigns/')) {
        const parts = url.split('/campaigns/');
        const slug = parts[parts.length - 1].split('?')[0];
        const campaign = mockData.campaigns.find((c: any) => c.slug === slug);
        if (campaign) {
          mockResponseData = campaign;
        }
      } else if (url.endsWith('/jobs') || url.endsWith('/jobs/')) {
        mockResponseData = {
          items: mockData.jobs,
          total: mockData.jobs.length
        };
      } else if (url.includes('/jobs/')) {
        const parts = url.split('/jobs/');
        const id = parts[parts.length - 1].split('?')[0];
        const job = mockData.jobs.find((j: any) => j.id === id);
        if (job) {
          mockResponseData = job;
        }
      } else if (url.includes('/donations/campaigns')) {
        if (url.endsWith('/donations/campaigns') || url.endsWith('/donations/campaigns/')) {
          mockResponseData = {
            items: mockData.donations,
            total: mockData.donations.length
          };
        } else {
          const parts = url.split('/donations/campaigns/');
          const slug = parts[parts.length - 1].split('?')[0];
          const campaign = mockData.donations.find((c: any) => c.slug === slug);
          if (campaign) {
            mockResponseData = campaign;
          }
        }
      } else if (url.includes('/donations/transparency')) {
        mockResponseData = {
          total_collected: mockData.donations.reduce((sum: number, c: any) => sum + (c.collected_amount || 0), 0),
          total_donors: 0,
          campaigns: mockData.donations
        };
      }

      if (mockResponseData !== null) {
        console.warn(`[API] Backend offline. Loaded local mock data for: ${url}`);
        return {
          data: mockResponseData,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config
        };
      }
    }

    const isAuthRoute = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register')
    if (error.response?.status === 401 && !isAuthRoute && typeof window !== 'undefined') {
      const refresh = localStorage.getItem('refresh_token')
      if (refresh) {
        try {
          const res = await axios.post(`${BASE}/auth/refresh`, { refresh_token: refresh })
          const { access_token, refresh_token } = res.data
          localStorage.setItem('access_token', access_token)
          localStorage.setItem('refresh_token', refresh_token)
          error.config.headers.Authorization = `Bearer ${access_token}`
          return axios(error.config)
        } catch {
          localStorage.clear()
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

// ── Auth
export const authApi = {
  login:          (email: string, password: string) => api.post('/auth/login', { email, password }),
  register:       (data: any)  => api.post('/auth/register', data),
  me:             ()           => api.get('/auth/me'),
  changePassword: (data: any)  => api.post('/auth/change-password', data),
  createAdmin:    (data: any)  => api.post('/setup/create-admin', data),
}

// ── Matrimony
export const matrimonyApi = {
  createProfile: (data: any)              => api.post('/matrimony/profile', data),
  getMyProfile:  ()                        => api.get('/matrimony/profile/me'),
  updateProfile: (data: any)              => api.put('/matrimony/profile/me', data),
  uploadPhoto:   (form: FormData)         => api.post('/matrimony/profile/photo', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deletePhoto:   (photoUrl: string)       => api.delete('/matrimony/profile/photo', { params: { photo_url: photoUrl } }),
  uploadIdProof: (form: FormData, t: string) => api.post(`/matrimony/profile/id-proof?id_type=${t}`, form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadBiodata: (form: FormData)         => api.post('/matrimony/profile/biodata', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getMyMatches:  ()                        => api.get('/matrimony/my-matches'),
  getProfiles:   ()                        => api.get('/matrimony/profiles'),
  getPublicProfiles: ()                    => api.get('/matrimony/public-profiles'),
  getProfile:    (profileId: string)       => api.get(`/matrimony/profiles/${profileId}`),
  expressInterest: (profileId: string)     => api.post(`/matrimony/interest/${profileId}`),
  removeInterest:  (profileId: string)     => api.delete(`/matrimony/interest/${profileId}`),
  respondMatch:  (id: string, interested: boolean) => api.post(`/matrimony/matches/${id}/respond`, { interested }),
  // Admin
  adminProfiles: (params?: any)           => api.get('/matrimony/admin/profiles', { params }),
  adminApprove:  (id: string, data: any)  => api.post(`/matrimony/admin/profiles/${id}/approve`, data),
  adminSuggest:  (data: any)              => api.post('/matrimony/admin/suggest-match', data),
  adminUpdateMatch: (id: string, data: any) => api.put(`/matrimony/admin/matches/${id}`, data),
  adminMatches:     ()                    => api.get('/matrimony/admin/matches'),
  adminInterestsSummary: ()               => api.get('/matrimony/admin/interests-summary'),
  adminNotifySuggest: (id: string)        => api.post(`/matrimony/admin/matches/${id}/notify-suggest`),
  adminDeleteProfile: (id: string)        => api.delete(`/matrimony/admin/profiles/${id}`),
}

// ── Donations
export const donationsApi = {
  getCampaigns:    (p?: any)    => api.get('/donations/campaigns', { params: p }),
  getCampaign:     (slug: string) => api.get(`/donations/campaigns/${slug}`),
  createCampaign:  (data: any)  => api.post('/donations/campaigns', data),
  initiate:        (data: any)  => api.post('/donations/initiate', data),
  verify:          (data: any)  => api.post('/donations/verify-payment', data),
  mockComplete:    (donation_id: string) => api.post('/donations/mock-complete', { donation_id }),
  myDonations:     ()           => api.get('/donations/my-donations'),
  transparency:    ()           => api.get('/donations/transparency'),
  adminAll:        (p?: any)    => api.get('/donations/admin/all', { params: p }),
}

// ── Jobs
export const jobsApi = {
  list:            (p?: any)    => api.get('/jobs/', { params: p }),
  get:             (id: string) => api.get(`/jobs/${id}`),
  apply:           (id: string, data: any) => api.post(`/jobs/${id}/apply`, data),
  uploadResume:    (id: string, form: FormData) => api.post(`/jobs/${id}/upload-resume`, form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  myApplications:  ()           => api.get('/jobs/my/applications'),
  submitGeneral:   (data: any)  => api.post('/jobs/general-apply', data),
  uploadGeneralResume: (form: FormData) => api.post('/jobs/upload-general-resume', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  // Admin
  adminList:       (p?: any)    => api.get('/jobs/admin/list', { params: p }),
  create:          (data: any)  => api.post('/jobs/admin/create', data),
  update:          (id: string, data: any) => api.put(`/jobs/admin/${id}`, data),
  delete:          (id: string) => api.delete(`/jobs/admin/${id}`),
  adminApps:       (p?: any)    => api.get('/jobs/admin/applications', { params: p }),
  shortlist:       (id: string, data: any) => api.post(`/jobs/admin/shortlist/${id}`, data),
  scheduleInterview: (data: any) => api.post('/jobs/admin/schedule-interview', data),
  adminGeneralList: ()          => api.get('/jobs/admin/general-applications'),
}

// ── Campaigns
export const campaignsApi = {
  list:     (p?: any)    => api.get('/campaigns/', { params: p }),
  adminAll: (p?: any)    => api.get('/campaigns/admin/all', { params: p }),
  get:      (slug: string) => api.get(`/campaigns/${slug}`),
  register: (id: string, data: any) => api.post(`/campaigns/${id}/register`, data),
  create:   (data: any)  => api.post('/campaigns/admin/create', data),
  update:   (id: string, data: any) => api.put(`/campaigns/admin/${id}`, data),
  registrations: (id: string) => api.get(`/campaigns/admin/registrations/${id}`),
  uploadImage: (form: FormData) => api.post('/campaigns/admin/upload-image', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadVideo: (form: FormData) => api.post('/campaigns/admin/upload-video', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  categories:  ()           => api.get('/campaigns/categories'),
}

// ── Campaign Sessions
export const sessionApi = {
  create:          (data: any)  => api.post('/campaign-sessions/', data),
  byCampaign:      (id: string) => api.get(`/campaign-sessions/campaign/${id}`),
  get:             (id: string) => api.get(`/campaign-sessions/${id}`),
  update:          (id: string, data: any) => api.put(`/campaign-sessions/${id}`, data),
  bulkAttendance:  (id: string, data: any) => api.post(`/campaign-sessions/${id}/bulk-attendance`, data),
  analytics:       (id: string) => api.get(`/campaign-sessions/admin/analytics/${id}`),
}

// ── Volunteers
export const volunteersApi = {
  register:  (data: any)  => api.post('/volunteers/register', data),
  myProfile: ()            => api.get('/volunteers/my-profile'),
  myTasks:   ()            => api.get('/volunteers/my-tasks'),
  completeTask: (id: string, data: any) => api.post(`/volunteers/tasks/${id}/complete`, data),
  adminAll:  (p?: any)    => api.get('/volunteers/admin/all', { params: p }),
  approve:   (id: string, data: any) => api.post(`/volunteers/admin/${id}/approve`, data),
  assignTask: (data: any) => api.post('/volunteers/admin/assign-task', data),
}

// ── Counselors
export const counselorsApi = {
  createProfile: (data: any)  => api.post('/counselors/profile', data),
  myProfile:     ()            => api.get('/counselors/profile/me'),
  profiles:      (p?: any)    => api.get('/counselors/matrimony-profiles', { params: p }),
  profileDetail: (id: string) => api.get(`/counselors/matrimony-profiles/${id}`),
  createSession: (data: any)  => api.post('/counselors/sessions', data),
  updateSession: (id: string, data: any) => api.put(`/counselors/sessions/${id}`, data),
  mySessions:    (p?: any)    => api.get('/counselors/sessions/my', { params: p }),
  addNotes:      (id: string, data: any) => api.post(`/counselors/sessions/${id}/notes`, data),
  adminAll:      ()            => api.get('/counselors/admin/all'),
  assignSession: (data: any)  => api.post('/counselors/admin/assign-session', data),
}

// ── Family
export const familyApi = {
  getMembers: ()                          => api.get('/family/my-members'),
  add:        (data: any)                 => api.post('/family/my-members', data),
  update:     (id: string, data: any)     => api.put(`/family/my-members/${id}`, data),
  remove:     (id: string)                => api.delete(`/family/my-members/${id}`),
  participate: (data: any)               => api.post('/family/participation', data),
  adminGet:   (profileId: string)        => api.get(`/family/admin/profile/${profileId}`),
}

// ── Emotional Readiness
export const emotionalApi = {
  questions:  ()            => api.get('/emotional-readiness/questions'),
  submit:     (data: any)   => api.post('/emotional-readiness/submit', data),
  myResponse: ()            => api.get('/emotional-readiness/my-response'),
  adminAll:   (p?: any)    => api.get('/emotional-readiness/admin/all-responses', { params: p }),
  addNotes:   (id: string, data: any) => api.post(`/emotional-readiness/admin/responses/${id}/notes`, data),
  seedQuestions: ()         => api.post('/emotional-readiness/admin/seed-questions', {}),
}

// ── Admin
export const adminApi = {
  stats:      ()            => api.get('/admin/dashboard/stats'),
  users:      (p?: any)    => api.get('/admin/users', { params: p }),
  toggleUser: (id: string) => api.post(`/admin/users/${id}/toggle-active`),
  logs:       (p?: any)    => api.get('/admin/activity-logs', { params: p }),
  uploadImage:(form: FormData) => api.post('/admin/upload-image', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
}

// ── Contact Enquiries / Messages
export const enquiriesApi = {
  submit: (data: any)       => api.post('/enquiries/', data),
  list:   (params?: any)    => api.get('/enquiries/', { params }),
  delete: (id: string)      => api.delete(`/enquiries/${id}`),
}

// ── Awards & Achievements
export const awardsApi = {
  list:   (params?: any)    => api.get('/awards/', { params }),
  create: (data: any)       => api.post('/awards/', data),
  update: (id: string, data: any) => api.put(`/awards/${id}`, data),
  delete: (id: string)      => api.delete(`/awards/${id}`),
}

// ── CSR Partnerships
export const csrApi = {
  submit: (data: any)       => api.post('/csr/', data),
  list:   ()                => api.get('/csr/'),
}

// ── Press & Media Coverage
export const pressApi = {
  list:   (params?: any)    => api.get('/press/', { params }),
  create: (data: any)       => api.post('/press/', data),
  update: (id: string, data: any) => api.put(`/press/${id}`, data),
  delete: (id: string)      => api.delete(`/press/${id}`),
}

// ── Media & Gallery
export const galleryApi = {
  list:   (params?: any)    => api.get('/gallery/', { params }),
  create: (data: any)       => api.post('/gallery/', data),
  update: (id: string, data: any) => api.put(`/gallery/${id}`, data),
  delete: (id: string)      => api.delete(`/gallery/${id}`),
  // Categories
  categories:       ()                     => api.get('/gallery/categories/'),
  createCategory:   (data: any)            => api.post('/gallery/categories/', data),
  updateCategory:   (id: string, data: any) => api.put(`/gallery/categories/${id}`, data),
  deleteCategory:   (id: string)           => api.delete(`/gallery/categories/${id}`),
}

// ── Partners & Sponsors
export const partnersApi = {
  list:   (params?: any)    => api.get('/partners/', { params }),
  create: (data: any)       => api.post('/partners/', data),
  update: (id: string, data: any) => api.put(`/partners/${id}`, data),
  delete: (id: string)      => api.delete(`/partners/${id}`),
}

// ── Instagram Posts
export const instagramApi = {
  list:   (params?: any)    => api.get('/instagram/', { params }),
  create: (data: any)       => api.post('/instagram/', data),
  update: (id: string, data: any) => api.put(`/instagram/${id}`, data),
  delete: (id: string)      => api.delete(`/instagram/${id}`),
}




