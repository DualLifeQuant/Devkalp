'use client'
import { useState } from 'react'
import { HeartHandshake, Briefcase, Leaf, Heart, Users, Check, X, Eye, Link2 } from 'lucide-react'
import AdminLayout from '@/components/layout/AdminLayout'
import { Badge, Button, Card, EmptyState } from '@/components/ui'
import { SkeletonGrid , InlineError} from '@/components/common/LoadingStates'
import { useAuthGuard } from '@/hooks/useAuthGuard'
import { useAdminMatrimonyProfiles, useApproveMatrimonyProfile } from '@/hooks/useApiQueries'
import { useAuthStore } from '@/lib/store'
import { auditMatrimony } from '@/lib/audit/auditLog'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

export default function AdminMatrimonyPage() {
  useAuthGuard({ allowedRoles: ['admin'] })
  const { user: adminUser } = useAuthStore()

  const [filter, setFilter] = useState('pending')
  const [selected, setSelected] = useState<any>(null)
  const [actionNotes, setActionNotes] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [suggestMode, setSuggestMode] = useState(false)
  const [suggestPair, setSuggestPair] = useState<[string,string]>(['',''])

  const { data, isLoading: loading, isError, refetch } = useAdminMatrimonyProfiles({ status: filter, limit: 50 })
  const profiles: any[] = (data as any)?.items || []

  const approveMutation = useApproveMatrimonyProfile()

  const approveProfile = async (id: string, approve: boolean) => {
    try {
      await approveMutation.mutateAsync({ id, data: { action: approve ? 'approve' : 'reject', notes: actionNotes, reason: rejectReason } })
      toast.success(approve ? 'Profile approved! User notified.' : 'Profile rejected.')
      auditMatrimony(approve ? 'profile_approved' : 'profile_rejected', id, adminUser?.id, { notes: actionNotes, reason: rejectReason })
      setSelected(null)
    } catch { toast.error('Action failed') }
  }

  const suggestMatch = async () => {
    if (!suggestPair[0] || !suggestPair[1]) {
      toast.error('Select both profiles')
      return
    }
    try {
      await matrimonyApi.adminSuggest({ profile1_id: suggestPair[0], profile2_id: suggestPair[1], notes: actionNotes })
      toast.success('Match suggested! Both users notified.')
      setSuggestMode(false)
      setSuggestPair(['', ''])
      setActionNotes('')
    } catch (e: any) { toast.error(e?.response?.data?.detail || 'Failed') }
  }

  return (
    <AdminLayout>
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl text-trust-900">Matrimony Profiles</h1>
            <p className="text-slate-500 text-sm mt-1">Review, approve, and manage matrimony profiles.</p>
          </div>
          <Button size="sm" variant="secondary" onClick={() => setSuggestMode(true)}>
            <Link2 size={15} /> Suggest Match
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['pending', 'approved', 'rejected', 'all'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={clsx('px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors',
                filter === f ? 'bg-trust-800 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-trust-300')}>
              {f}
            </button>
          ))}
        </div>

        {loading ? <SkeletonGrid count={6} cols={3} /> : (
          <>
            {profiles.length === 0 ? (
              <EmptyState icon={<HeartHandshake size={24} />} title="No profiles" description={`No ${filter} profiles found.`} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {profiles.map((p: any) => (
                  <Card key={p.id} className="p-5" hover>
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 rounded-2xl bg-trust-100 overflow-hidden shrink-0">
                        {p.photos?.[0] ? (
                          <img src={p.photos[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-trust-700 font-display text-lg">
                            {p.user_name?.[0] || '?'}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-slate-800 text-sm truncate">{p.user_name}</p>
                          <Badge status={p.status} />
                        </div>
                        <p className="text-xs text-slate-500">{p.age} yrs · {p.gender} · {p.city}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{p.education}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 mb-4 bg-slate-50 rounded-xl p-3">
                      <span><strong className="text-slate-700">Religion:</strong> {p.religion}</span>
                      <span><strong className="text-slate-700">Caste:</strong> {p.caste || '—'}</span>
                      <span><strong className="text-slate-700">Occupation:</strong> {p.occupation}</span>
                      <span><strong className="text-slate-700">Income:</strong> {p.annual_income || '—'}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setSelected(p)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition-colors">
                        <Eye size={13} /> Details
                      </button>
                      {p.status === 'pending' && (
                        <>
                          <button onClick={() => { setSelected(p); setActionNotes('') }}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-sage-500 text-white text-xs font-medium hover:bg-sage-600 transition-colors">
                            <Check size={13} /> Approve
                          </button>
                          <button onClick={() => approveProfile(p.id, false)}
                            className="py-2 px-3 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition-colors">
                            <X size={13} />
                          </button>
                        </>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Profile Detail Modal */}
        {selected && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelected(null)}>
            <div className="bg-white rounded-3xl shadow-float w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-display text-xl text-trust-900">{selected.user_name}</h2>
                <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-slate-100"><X size={18} /></button>
              </div>
              <div className="p-6 space-y-4">
                {/* Photos */}
                {selected.photos?.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {selected.photos.map((url: string, i: number) => (
                      <img key={i} src={url} alt="" className="w-24 h-24 rounded-xl object-cover shrink-0" />
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    ['Email', selected.user_email], ['Phone', selected.user_phone],
                    ['Date of Birth', selected.date_of_birth], ['Age', selected.age + ' years'],
                    ['Height', selected.height_cm ? selected.height_cm + ' cm' : '—'],
                    ['Religion', selected.religion], ['Caste', selected.caste || '—'],
                    ['Education', selected.education], ['Occupation', selected.occupation],
                    ['City', selected.city], ['Income', selected.annual_income || '—'],
                  ].map(([label, val]) => (
                    <div key={label as string}>
                      <p className="text-xs text-slate-400">{label}</p>
                      <p className="font-medium text-slate-800">{val || '—'}</p>
                    </div>
                  ))}
                </div>
                {selected.bio && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Bio</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{selected.bio}</p>
                  </div>
                )}
                {selected.id_proof_url && (
                  <a href={selected.id_proof_url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-trust-600 hover:underline">
                    View ID Proof ({selected.id_proof_type}) →
                  </a>
                )}
                <div>
                  <label className="label">Admin Notes</label>
                  <textarea value={actionNotes} onChange={e => setActionNotes(e.target.value)}
                    className="input resize-none" rows={3} placeholder="Add internal notes…" />
                </div>
                {selected.status === 'pending' && (
                  <div>
                    <label className="label">Rejection Reason (if rejecting)</label>
                    <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                      className="input resize-none" rows={2} placeholder="Reason for rejection…" />
                  </div>
                )}
              </div>
              {selected.status === 'pending' && (
                <div className="p-6 pt-0 flex gap-3">
                  <Button onClick={() => approveProfile(selected.id, true)} variant="sage" className="flex-1 justify-center">
                    <Check size={16} /> Approve Profile
                  </Button>
                  <Button onClick={() => approveProfile(selected.id, false)} variant="danger" className="flex-1 justify-center">
                    <X size={16} /> Reject
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Suggest Match Modal */}
        {suggestMode && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSuggestMode(false)}>
            <div className="bg-white rounded-3xl shadow-float w-full max-w-md" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-display text-xl text-trust-900">Suggest a Match</h2>
                <button onClick={() => setSuggestMode(false)}><X size={18} /></button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-slate-500">Select two approved profiles to suggest as a potential match.</p>
                <div>
                  <label className="label">Profile 1 ID</label>
                  <input className="input" placeholder="Paste profile ID…"
                    value={suggestPair[0]} onChange={e => setSuggestPair([e.target.value, suggestPair[1]])} />
                </div>
                <div>
                  <label className="label">Profile 2 ID</label>
                  <input className="input" placeholder="Paste profile ID…"
                    value={suggestPair[1]} onChange={e => setSuggestPair([suggestPair[0], e.target.value])} />
                </div>
                <div>
                  <label className="label">Counselor Notes</label>
                  <textarea className="input resize-none" rows={3} placeholder="Why are these profiles compatible?"
                    value={actionNotes} onChange={e => setActionNotes(e.target.value)} />
                </div>
                <Button onClick={suggestMatch} className="w-full justify-center">
                  <Link2 size={16} /> Suggest This Match
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
