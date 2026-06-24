'use client'
import { useState } from 'react'
import { UserCheck, Plus, X, Calendar } from 'lucide-react'
import AdminLayout from '@/components/layout/AdminLayout'
import { Button, Card, EmptyState, StatsCard } from '@/components/ui'
import { SkeletonList, InlineError} from '@/components/common/LoadingStates'
import { useAuthGuard } from '@/hooks/useAuthGuard'
import { useAdminCounselors, useAssignCounselorSession } from '@/hooks/useApiQueries'

import { useAuthStore } from '@/lib/store'
import { auditAdmin } from '@/lib/audit/auditLog'
import toast from 'react-hot-toast'

export default function AdminCounselorsPage() {
  useAuthGuard({ allowedRoles: ['admin'] })
  const { user: adminUser } = useAuthStore()

  const [showAssign, setShowAssign] = useState(false)
  const [assignData, setAssignData] = useState({ counselor_profile_id: '', matrimony_profile_id: '', session_date: '', mode: 'video' })
  const { data: counselors = [], isLoading: loading, isError, refetch } = useAdminCounselors()
  const assignMutation = useAssignCounselorSession()

  const assignSession = async () => {
    if (!assignData.counselor_profile_id || !assignData.matrimony_profile_id || !assignData.session_date) {
      toast.error('All fields required'); return
    }
    try {
      await assignMutation.mutateAsync(assignData)
      toast.success('Session assigned!')
      auditAdmin('session_assigned', assignData.matrimony_profile_id, adminUser?.id, {
        counselor_id: assignData.counselor_profile_id,
        session_date: assignData.session_date,
        mode: assignData.mode,
      })
      setShowAssign(false)
    } catch (e: any) { toast.error(e?.response?.data?.detail || 'Failed') }
  }

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl text-trust-900">Counselors</h1>
            <p className="text-slate-500 text-sm mt-0.5">Manage counselors and assign sessions to matrimony users.</p>
          </div>
          <Button size="sm" variant="secondary" onClick={() => setShowAssign(true)}>
            <Plus size={15} /> Assign Session
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <StatsCard label="Active Counselors" value={( counselors as any[]).filter((c: any) => c.is_active).length} icon={<UserCheck size={17} />} color="trust" />
          <StatsCard label="Total Sessions" value={( counselors as any[]).reduce((s: number, c: any) => s + (c.total_sessions || 0), 0)} icon={<Calendar size={17} />} color="saffron" />
        </div>

        {isError && <InlineError message="Failed to load counselors." onRetry={() => refetch()} className="mb-4" />}
        {loading ? (
          <SkeletonList count={3} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {counselors.length === 0 ? (
              <div className="col-span-2">
                <EmptyState icon={<UserCheck size={22} />} title="No counselors yet"
                  description="Counselors register using the Counselor role and create their profile from the dashboard." />
              </div>
            ) : counselors.map((c: any) => (
              <Card key={c.id} className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-trust-100 text-trust-700 font-display font-semibold text-lg flex items-center justify-center shrink-0">
                    {c.user_name?.[0] || 'C'}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800">{c.user_name}</p>
                    <p className="text-xs text-slate-400">{c.user_email}</p>
                    {c.specialization && <p className="text-xs text-trust-600 mt-0.5 font-medium">{c.specialization}</p>}
                    <div className="flex gap-3 text-xs text-slate-400 mt-1.5">
                      <span>{c.years_experience} yrs experience</span>
                      <span className="font-medium text-trust-600">{c.total_sessions} sessions</span>
                    </div>
                    {c.languages?.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {c.languages.map((l: string) => (
                          <span key={l} className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-lg">{l}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {showAssign && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowAssign(false)}>
          <div className="bg-white rounded-3xl shadow-float w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-display text-xl text-trust-900">Assign Counseling Session</h2>
              <button onClick={() => setShowAssign(false)} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={16} /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-500 bg-slate-50 rounded-xl p-3 leading-relaxed">
                Get the Counselor Profile ID from the counselor list above, and Matrimony Profile ID from the Matrimony section.
              </p>
              {[
                { l: 'Counselor Profile ID', k: 'counselor_profile_id' },
                { l: 'Matrimony Profile ID', k: 'matrimony_profile_id' },
              ].map(f => (
                <div key={f.k}>
                  <label className="label">{f.l}</label>
                  <input className="input text-sm font-mono text-xs" placeholder="Paste UUID..."
                    value={(assignData as any)[f.k]}
                    onChange={e => setAssignData(d => ({ ...d, [f.k]: e.target.value }))} />
                </div>
              ))}
              <div>
                <label className="label">Session Date & Time</label>
                <input type="datetime-local" className="input text-sm" value={assignData.session_date}
                  onChange={e => setAssignData(d => ({ ...d, session_date: e.target.value }))} />
              </div>
              <div>
                <label className="label">Mode</label>
                <select className="input bg-white text-sm" value={assignData.mode}
                  onChange={e => setAssignData(d => ({ ...d, mode: e.target.value }))}>
                  <option value="video">Video Call</option>
                  <option value="in-person">In-Person</option>
                  <option value="phone">Phone Call</option>
                </select>
              </div>
              <Button onClick={assignSession} loading={assignMutation.isPending} className="w-full justify-center">
                <Calendar size={15} /> Assign Session
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
