import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  jobsApi, matrimonyApi, campaignsApi, donationsApi,
  volunteersApi, counselorsApi, emotionalApi, familyApi,
  adminApi, sessionApi,
} from '@/lib/api'
import { queryKeys } from '@/lib/api/client'

// ── Jobs ──────────────────────────────────────────────────────────────────────
export function useJobs(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.jobs(params),
    queryFn: () => jobsApi.list(params).then(r => r.data),
    placeholderData: { items: [], total: 0 },
  })
}

export function useJob(id: string) {
  return useQuery({
    queryKey: queryKeys.job(id),
    queryFn: () => jobsApi.get(id).then(r => r.data),
    enabled: !!id,
  })
}

export function useMyApplications() {
  return useQuery({
    queryKey: queryKeys.myApplications,
    queryFn: () => jobsApi.myApplications().then(r => r.data || []),
    placeholderData: [],
  })
}

export function useApplyToJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) => jobsApi.apply(id, data),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: queryKeys.myApplications })
    },
    onError: () => {
      qc.invalidateQueries({ queryKey: queryKeys.myApplications })
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.myApplications })
    },
  })
}

// ── Matrimony ─────────────────────────────────────────────────────────────────
export function useMyMatrimonyProfile() {
  return useQuery({
    queryKey: queryKeys.myMatrimonyProfile,
    queryFn: () => matrimonyApi.getMyProfile().then(r => r.data),
  })
}

export function useMyMatches() {
  return useQuery({
    queryKey: queryKeys.myMatches,
    queryFn: () => matrimonyApi.getMyMatches().then(r => r.data || []),
    placeholderData: [],
  })
}

export function useRespondToMatch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, interested }: { id: string; interested: boolean }) =>
      matrimonyApi.respondMatch(id, interested),
    onMutate: async ({ id, interested }) => {
      await qc.cancelQueries({ queryKey: queryKeys.myMatches })
      const prev = qc.getQueryData(queryKeys.myMatches)
      qc.setQueryData(queryKeys.myMatches, (old: any[]) =>
        (old ?? []).map(m =>
          m.match_id === id
            ? { ...m, status: interested ? 'interested' : 'declined' }
            : m
        )
      )
      return { prev }
    },
    onError: (_err, _vars, ctx: any) => {
      if (ctx?.prev !== undefined) qc.setQueryData(queryKeys.myMatches, ctx.prev)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.myMatches })
    },
  })
}

// ── Campaigns ─────────────────────────────────────────────────────────────────
export function useCampaigns(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.campaigns(params),
    queryFn: () => campaignsApi.list(params).then(r => r.data),
    placeholderData: { items: [], total: 0 },
  })
}

export function useRegisterForCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      campaignsApi.register(id, data),
    onMutate: async ({ id }) => {
      await qc.cancelQueries({ queryKey: queryKeys.campaign(id) })
      const prev = qc.getQueryData(queryKeys.campaign(id))
      qc.setQueryData(queryKeys.campaign(id), (old: any) =>
        old ? { ...old, registration_count: (old.registration_count ?? 0) + 1 } : old
      )
      return { prev, id }
    },
    onError: (_err, _vars, ctx: any) => {
      if (ctx?.prev !== undefined) qc.setQueryData(queryKeys.campaign(ctx.id), ctx.prev)
    },
    onSettled: (_data, _err, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.campaign(id) })
    },
  })
}

// ── Donations ─────────────────────────────────────────────────────────────────
export function useDonationCampaigns(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.campaigns_donations(params),
    queryFn: () => donationsApi.getCampaigns(params).then(r => r.data),
    placeholderData: { items: [], total: 0 },
  })
}

export function useTransparencyData() {
  return useQuery({
    queryKey: queryKeys.transparency,
    queryFn: () => donationsApi.transparency().then(r => r.data),
    staleTime: 5 * 60 * 1000,
  })
}

export function useMyDonations() {
  return useQuery({
    queryKey: queryKeys.myDonations,
    queryFn: () => donationsApi.myDonations().then(r => r.data),
  })
}

// ── Volunteers ────────────────────────────────────────────────────────────────
export function useMyVolunteerProfile() {
  return useQuery({
    queryKey: queryKeys.myVolunteer,
    queryFn: () => volunteersApi.myProfile().then(r => r.data),
  })
}

export function useMyTasks() {
  return useQuery({
    queryKey: queryKeys.myTasks,
    queryFn: () => volunteersApi.myTasks().then(r => r.data || []),
    placeholderData: [],
  })
}

export function useCompleteTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      volunteersApi.completeTask(id, data),
    onMutate: async ({ id }) => {
      await qc.cancelQueries({ queryKey: queryKeys.myTasks })
      const prev = qc.getQueryData(queryKeys.myTasks)
      qc.setQueryData(queryKeys.myTasks, (old: any[]) =>
        (old ?? []).map(t => t.id === id ? { ...t, is_completed: true } : t)
      )
      return { prev }
    },
    onError: (_err, _vars, ctx: any) => {
      if (ctx?.prev !== undefined) qc.setQueryData(queryKeys.myTasks, ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.myTasks }),
  })
}

// ── Counselors ────────────────────────────────────────────────────────────────
export function useCounselorSessions(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.counselorSessions(params),
    queryFn: () => counselorsApi.mySessions(params).then(r => r.data || []),
    placeholderData: [],
  })
}

export function useCounselorProfiles(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.counselorProfiles(params),
    queryFn: () => counselorsApi.profiles(params).then(r => r.data?.items || []),
    placeholderData: [],
  })
}

export function useAddSessionNotes() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      counselorsApi.addNotes(id, data),
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: queryKeys.counselorSessions() })
      const prev = qc.getQueryData(queryKeys.counselorSessions())
      qc.setQueryData(queryKeys.counselorSessions(), (old: any[]) =>
        (old ?? []).map(s => s.id === id ? { ...s, ...(data as object), status: 'completed' } : s)
      )
      return { prev }
    },
    onError: (_err, _vars, ctx: any) => {
      if (ctx?.prev !== undefined) qc.setQueryData(queryKeys.counselorSessions(), ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.counselorSessions() }),
  })
}

// ── Emotional Evaluation ──────────────────────────────────────────────────────
export function useEvalQuestions() {
  return useQuery({
    queryKey: queryKeys.evalQuestions,
    queryFn: () => emotionalApi.questions().then(r => r.data || []),
    placeholderData: [],
    staleTime: 10 * 60 * 1000,
  })
}

export function useMyEvalResponse() {
  return useQuery({
    queryKey: queryKeys.myEvalResponse,
    queryFn: () => emotionalApi.myResponse().then(r => r.data),
    retry: (count, err: any) => err?.response?.status === 404 ? false : count < 2,
  })
}

// ── Family ────────────────────────────────────────────────────────────────────
export function useFamilyMembers() {
  return useQuery({
    queryKey: queryKeys.familyMembers,
    queryFn: () => familyApi.getMembers().then(r => r.data || []),
    placeholderData: [],
  })
}

export function useAddFamilyMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: unknown) => familyApi.add(data),
    onMutate: async (data) => {
      await qc.cancelQueries({ queryKey: queryKeys.familyMembers })
      const prev = qc.getQueryData(queryKeys.familyMembers)
      qc.setQueryData(queryKeys.familyMembers, (old: any[]) => [
        ...(old ?? []),
        { id: `temp-${Date.now()}`, ...(data as object) },
      ])
      return { prev }
    },
    onError: (_err, _vars, ctx: any) => {
      if (ctx?.prev !== undefined) qc.setQueryData(queryKeys.familyMembers, ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.familyMembers }),
  })
}

export function useUpdateFamilyMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) => familyApi.update(id, data),
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: queryKeys.familyMembers })
      const prev = qc.getQueryData(queryKeys.familyMembers)
      qc.setQueryData(queryKeys.familyMembers, (old: any[]) =>
        (old ?? []).map(m => m.id === id ? { ...m, ...(data as object) } : m)
      )
      return { prev }
    },
    onError: (_err, _vars, ctx: any) => {
      if (ctx?.prev !== undefined) qc.setQueryData(queryKeys.familyMembers, ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.familyMembers }),
  })
}

export function useRemoveFamilyMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => familyApi.remove(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: queryKeys.familyMembers })
      const prev = qc.getQueryData(queryKeys.familyMembers)
      qc.setQueryData(queryKeys.familyMembers, (old: any[]) =>
        (old ?? []).filter(m => m.id !== id)
      )
      return { prev }
    },
    onError: (_err, _vars, ctx: any) => {
      if (ctx?.prev !== undefined) qc.setQueryData(queryKeys.familyMembers, ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.familyMembers }),
  })
}

// ── Admin ─────────────────────────────────────────────────────────────────────
export function useAdminStats() {
  return useQuery({
    queryKey: queryKeys.adminStats,
    queryFn: () => adminApi.stats().then(r => r.data),
    staleTime: 2 * 60 * 1000,
  })
}

export function useAdminUsers(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.adminUsers(params),
    queryFn: () => adminApi.users(params).then(r => r.data),
    placeholderData: { items: [], total: 0 },
  })
}

export function useAdminMatrimonyProfiles(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.matrimonyProfiles(params),
    queryFn: () => matrimonyApi.adminProfiles(params).then(r => r.data),
    placeholderData: { items: [], total: 0 },
  })
}

export function useAdminJobs() {
  return useQuery({
    queryKey: queryKeys.adminJobs,
    queryFn: () => jobsApi.adminList().then(r => r.data?.items || []),
    placeholderData: [],
  })
}

export function useAdminApplications(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.adminApps(params),
    queryFn: () => jobsApi.adminApps(params).then(r => r.data?.items || []),
    placeholderData: [],
  })
}

export function useAdminLogs(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.adminLogs(params),
    queryFn: () => adminApi.logs(params).then(r => r.data || []),
    placeholderData: [],
  })
}

export function useAdminVolunteers(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['volunteers', 'admin', 'all', params],
    queryFn: () => volunteersApi.adminAll(params).then(r => r.data?.items || []),
    placeholderData: [],
  })
}

export function useAdminCounselors() {
  return useQuery({
    queryKey: ['counselors', 'admin', 'all'],
    queryFn: () => counselorsApi.adminAll().then(r => r.data || []),
    placeholderData: [],
  })
}

export function useAdminDonations(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['donations', 'admin', 'all', params],
    queryFn: () => donationsApi.adminAll(params).then(r => r.data),
    placeholderData: { items: [], total: 0, total_amount: 0 },
  })
}

export function useApproveMatrimonyProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      matrimonyApi.adminApprove(id, data),
    onMutate: async ({ id }) => {
      await qc.cancelQueries({ queryKey: queryKeys.matrimonyProfiles() })
      const prev = qc.getQueryData(queryKeys.matrimonyProfiles())
      qc.setQueryData(queryKeys.matrimonyProfiles(), (old: any) => ({
        ...old,
        items: (old?.items ?? []).filter((p: any) => p.id !== id),
      }))
      return { prev }
    },
    onError: (_err, _vars, ctx: any) => {
      if (ctx?.prev !== undefined) qc.setQueryData(queryKeys.matrimonyProfiles(), ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.matrimonyProfiles() }),
  })
}

export function useToggleUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminApi.toggleUser(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: queryKeys.adminUsers() })
      const prev = qc.getQueryData(queryKeys.adminUsers())
      qc.setQueryData(queryKeys.adminUsers(), (old: any) => ({
        ...old,
        items: (old?.items ?? []).map((u: any) =>
          u.id === id ? { ...u, is_active: !u.is_active } : u
        ),
      }))
      return { prev }
    },
    onError: (_err, _vars, ctx: any) => {
      if (ctx?.prev !== undefined) qc.setQueryData(queryKeys.adminUsers(), ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.adminUsers() }),
  })
}

export function useApproveVolunteer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      volunteersApi.approve(id, data),
    onMutate: async ({ id }) => {
      await qc.cancelQueries({ queryKey: ['volunteers', 'admin', 'all'] })
      const prev = qc.getQueryData(['volunteers', 'admin', 'all'])
      qc.setQueryData(['volunteers', 'admin', 'all'], (old: any[]) =>
        (old ?? []).map(v => v.id === id ? { ...v, status: 'active' } : v)
      )
      return { prev }
    },
    onError: (_err, _vars, ctx: any) => {
      if (ctx?.prev !== undefined) qc.setQueryData(['volunteers', 'admin', 'all'], ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['volunteers', 'admin', 'all'] }),
  })
}

// ── Volunteer registration ─────────────────────────────────────────────────────
export function useRegisterVolunteer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: unknown) => volunteersApi.register(data),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.myVolunteer })
    },
  })
}

// ── Emotional evaluation submit ────────────────────────────────────────────────
export function useSubmitEvaluation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: unknown) => emotionalApi.submit(data),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.myEvalResponse })
    },
  })
}

// ── Matrimony profile creation ─────────────────────────────────────────────────
export function useCreateMatrimonyProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: unknown) => matrimonyApi.createProfile(data),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.myMatrimonyProfile })
    },
  })
}

export function useUpdateMatrimonyProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: unknown) => matrimonyApi.updateProfile(data),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.myMatrimonyProfile })
    },
  })
}

export function useUploadMatrimonyPhoto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (form: FormData) => matrimonyApi.uploadPhoto(form),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.myMatrimonyProfile })
    },
  })
}

export function useDeleteMatrimonyPhoto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (photoUrl: string) => matrimonyApi.deletePhoto(photoUrl),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.myMatrimonyProfile })
    },
  })
}

// ── Job application (list page) ────────────────────────────────────────────────
export function useApplyFromList() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) => jobsApi.apply(id, data),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: queryKeys.myApplications })
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.myApplications })
    },
  })
}

// ── Matrimony suggest match (admin) ────────────────────────────────────────────
export function useSuggestMatch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: unknown) => matrimonyApi.adminSuggest(data),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.matrimonyProfiles() })
    },
  })
}

// ── Assign counselor session (admin) ───────────────────────────────────────────
export function useAssignCounselorSession() {
  return useMutation({
    mutationFn: (data: unknown) => counselorsApi.assignSession(data),
  })
}

// ── Create session (admin campaigns) ──────────────────────────────────────────
export function useCreateCampaignSession() {
  return useMutation({
    mutationFn: (data: unknown) => sessionApi.create(data),
  })
}

// ── Record attendance (admin campaigns) ────────────────────────────────────────
export function useRecordAttendance() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      sessionApi.bulkAttendance(id, data),
  })
}

// ── Admin jobs: create ─────────────────────────────────────────────────────────
export function useCreateJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: unknown) => jobsApi.create(data),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.adminJobs })
      qc.invalidateQueries({ queryKey: queryKeys.adminApps() })
    },
  })
}

// ── Admin jobs: shortlist / schedule interview ─────────────────────────────────
export function useShortlistApplication() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      jobsApi.shortlist(id, data),
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: queryKeys.adminApps() })
      const prev = qc.getQueryData(queryKeys.adminApps())
      qc.setQueryData(queryKeys.adminApps(), (old: any[]) =>
        (old ?? []).map((a: any) =>
          a.id === id ? { ...a, ...(data as object) } : a
        )
      )
      return { prev }
    },
    onError: (_err, _vars, ctx: any) => {
      if (ctx?.prev !== undefined) qc.setQueryData(queryKeys.adminApps(), ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.adminApps() }),
  })
}

export function useScheduleInterview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: unknown) => jobsApi.scheduleInterview(data),
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.adminApps() }),
  })
}

// ── Admin donations: create campaign ──────────────────────────────────────────
export function useCreateDonationCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: unknown) => donationsApi.createCampaign(data),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['donations', 'campaigns'] })
      qc.invalidateQueries({ queryKey: queryKeys.campaigns_donations() })
    },
  })
}
