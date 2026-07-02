'use client'
import { useState } from 'react'
import Link from 'next/link'
import { UserCheck, Calendar, Users, Star, ChevronRight } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Badge, Card, EmptyState } from '@/components/ui'
import { SkeletonList, PageLoader, InlineError } from '@/components/common/LoadingStates'
import { useAuthGuard } from '@/hooks/useAuthGuard'
import { useCounselorProfiles } from '@/hooks/useApiQueries'
import { counselorsApi } from '@/lib/api'
import { clsx } from 'clsx'

const NAV = [
  { href: '/dashboard/counselor',          icon: <UserCheck size={18} />, label: 'Overview' },
  { href: '/dashboard/counselor/profiles', icon: <Users size={18} />,     label: 'My Clients' },
  { href: '/dashboard/counselor/sessions', icon: <Calendar size={18} />,  label: 'Sessions' },
]

export default function CounselorProfilesPage() {
  useAuthGuard({ allowedRoles: ['counselor', 'admin'] })

  const [selected, setSelected] = useState<any>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const { data: profiles = [], isLoading: loading, isError, refetch } = useCounselorProfiles({ limit: 50 })

  const openProfile = async (profileId: string) => {
    setDetailLoading(true)
    try {
      const res = await counselorsApi.profileDetail(profileId)
      setSelected(res.data)
    } catch { }
    finally { setDetailLoading(false) }
  }

  return (
    <DashboardLayout navItems={NAV} title="Counselor">
      <div className="p-6 md:p-8">
        <div className="mb-6">
          <h1 className="font-display text-2xl text-trust-900">My Clients</h1>
          <p className="text-slate-500 text-sm mt-1">Matrimony profiles assigned to you for counseling.</p>
        </div>

        {isError && <InlineError message="Failed to load client profiles." onRetry={() => refetch()} className="mb-4" />}
        {loading ? (
          <SkeletonList count={4} />
        ) : (profiles as any[]).length === 0 ? (
          <EmptyState
            icon={<Users size={24} />}
            title="No clients assigned yet"
            description="Matrimony profiles will appear here once admin assigns sessions to you."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {profiles.map((p: any) => (
              <div key={p.id} onClick={() => openProfile(p.id)} className="cursor-pointer"><Card className="p-5" hover>
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-trust-100 text-trust-700 font-display font-semibold text-lg flex items-center justify-center shrink-0 overflow-hidden">
                    {p.photos?.[0]
                      ? <img src={p.photos[0]} alt="" className="w-full h-full object-cover" />
                      : p.user_name?.[0]
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="font-semibold text-slate-800 truncate">{p.user_name}</p>
                      <Badge status={p.status} />
                    </div>
                    <p className="text-xs text-slate-500">{p.age} yrs · {p.gender} · {p.city}</p>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{p.education} · {p.occupation}</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">View full profile</span>
                  <ChevronRight size={14} className="text-slate-400" />
                </div>
              </Card></div>
            ))}
          </div>
        )}
      </div>

      {/* Profile Detail Panel */}
      {(selected || detailLoading) && (
        <div className="fixed inset-0 z-50 flex" onClick={() => setSelected(null)}>
          <div className="flex-1 bg-black/30 backdrop-blur-sm" />
          <div className="w-full max-w-lg bg-white shadow-float h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
            {detailLoading ? (
              <SkeletonList count={4} />
            ) : selected && (
              <>
                <div className="p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-display text-xl text-trust-900">{selected.profile?.user_name}</h2>
                      <p className="text-xs text-slate-400 mt-0.5">{selected.profile?.age} yrs · {selected.profile?.city}</p>
                    </div>
                    <button onClick={() => setSelected(null)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500">✕</button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Contact */}
                  <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                    {[
                      ['Email', selected.profile?.user_email],
                      ['Phone', selected.profile?.user_phone],
                      ['Education', selected.profile?.education],
                      ['Occupation', selected.profile?.occupation],
                    ].filter(([, v]) => v).map(([k, v]) => (
                      <div key={k as string} className="flex justify-between text-sm">
                        <span className="text-slate-500">{k}</span>
                        <span className="font-medium text-slate-800">{v}</span>
                      </div>
                    ))}
                  </div>

                  {/* Bio */}
                  {selected.profile?.bio && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">About</p>
                      <p className="text-sm text-slate-700 leading-relaxed">{selected.profile.bio}</p>
                    </div>
                  )}

                  {/* Emotional Readiness */}
                  {selected.emotional_readiness && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Emotional Readiness</p>
                      <div className="bg-gradient-to-r from-trust-50 to-saffron-50 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-slate-600">Overall Score</span>
                          <span className="font-display text-2xl font-semibold text-trust-800">
                            {selected.emotional_readiness.overall_score
                              ? `${Math.round(selected.emotional_readiness.overall_score)}%`
                              : 'Not completed'}
                          </span>
                        </div>
                        {selected.emotional_readiness.category_scores && (
                          <div className="space-y-2">
                            {Object.entries(selected.emotional_readiness.category_scores).map(([cat, score]: [string, any]) => (
                              <div key={cat}>
                                <div className="flex justify-between text-xs text-slate-500 mb-1">
                                  <span className="capitalize">{cat.replace(/_/g, ' ')}</span>
                                  <span>{Math.round(score)}%</span>
                                </div>
                                <div className="w-full bg-white/60 rounded-full h-1.5">
                                  <div className="h-1.5 rounded-full bg-trust-500" style={{ width: `${score}%` }} />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {selected.emotional_readiness.counselor_notes && (
                          <p className="text-xs text-slate-600 italic mt-3 pt-3 border-t border-white/50">
                            Notes: {selected.emotional_readiness.counselor_notes}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Family Members */}
                  {selected.family_members?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Family</p>
                      <div className="space-y-2">
                        {selected.family_members.map((f: any) => (
                          <div key={f.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                            <span className="text-sm capitalize text-slate-500 w-16 shrink-0">{f.relation}</span>
                            <span className="text-sm font-medium text-slate-800 flex-1">{f.full_name}</span>
                            {f.is_primary_contact && <span className="text-xs text-trust-600 font-medium">Primary</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sessions */}
                  {selected.sessions?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Sessions History</p>
                      <div className="space-y-2">
                        {selected.sessions.map((s: any) => (
                          <div key={s.id} className="p-3 border border-slate-100 rounded-xl">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-slate-700">
                                {new Date(s.session_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                              <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium',
                                s.status === 'completed' ? 'bg-sage-100 text-sage-700' : 'bg-amber-100 text-amber-700')}>
                                {s.status}
                              </span>
                            </div>
                            {s.session_notes && <p className="text-xs text-slate-500 mt-1 line-clamp-2 italic">"{s.session_notes}"</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
