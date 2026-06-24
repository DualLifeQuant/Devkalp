'use client'
import { useState } from 'react'
import Link from 'next/link'
import { UserCheck, Calendar, Users, FileText, Clock, Check, MessageSquare } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { StatsCard, Badge, Card, Button, EmptyState } from '@/components/ui'
import { SkeletonStats, SkeletonList, InlineError } from '@/components/common/LoadingStates'
import { useAuthStore } from '@/lib/store'
import { useAuthGuard } from '@/hooks/useAuthGuard'
import { useCounselorSessions, useCounselorProfiles } from '@/hooks/useApiQueries'
import { counselorsApi } from '@/lib/api'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/api/client'
import toast from 'react-hot-toast'

const NAV = [
  { href: '/dashboard/counselor',          icon: <UserCheck size={18} />, label: 'Overview' },
  { href: '/dashboard/counselor/profiles', icon: <Users size={18} />,     label: 'My Clients' },
  { href: '/dashboard/counselor/sessions', icon: <Calendar size={18} />,  label: 'Sessions' },
]

export default function CounselorDashboard() {
  useAuthGuard({ allowedRoles: ['counselor', 'admin'] })
  const { user } = useAuthStore()
  const qc = useQueryClient()

  const [selectedSession, setSelectedSession] = useState<any>(null)
  const [notes, setNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)

  const { data: sessions = [], isLoading: sessionsLoading, isError: sessionsError, refetch: refetchSessions } = useCounselorSessions({ limit: 10 })
  const { data: profiles = [], isLoading: profilesLoading, isError: profilesError, refetch: refetchProfiles } = useCounselorProfiles({ limit: 10 })
  const loading = sessionsLoading || profilesLoading

  const saveNotes = async () => {
    if (!selectedSession) return
    setSavingNotes(true)
    try {
      await counselorsApi.addNotes(selectedSession.id, { notes, status: 'completed' })
      toast.success('Notes saved!')
      qc.invalidateQueries({ queryKey: queryKeys.counselorSessions() })
      setSelectedSession(null)
    } catch { toast.error('Failed to save') }
    finally { setSavingNotes(false) }
  }

  const upcomingSessions = (sessions as any[]).filter((s: any) => s.status === 'scheduled')
  const completedSessions = (sessions as any[]).filter((s: any) => s.status === 'completed')

  return (
    <DashboardLayout navItems={NAV} title="Counselor">
      <div className="p-6 md:p-8 space-y-8">
        <div>
          <h1 className="font-display text-2xl text-trust-900">
            Namaste, {user?.full_name?.split(' ')[0]} 🙏
          </h1>
          <p className="text-slate-500 text-sm mt-1">Your counseling sessions and client overview.</p>
        </div>

        {(sessionsError || profilesError) && <InlineError message="Some data failed to load." onRetry={() => { refetchSessions(); refetchProfiles() }} className="mb-4" />}
        {loading ? <div className="space-y-4"><SkeletonStats count={4} /><SkeletonList count={3} /></div> : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatsCard label="Total Clients"     value={profiles.length}          icon={<Users size={18} />}    color="trust"   />
              <StatsCard label="Upcoming Sessions" value={upcomingSessions.length}  icon={<Calendar size={18} />} color="saffron" />
              <StatsCard label="Completed"         value={completedSessions.length} icon={<Check size={18} />}    color="sage"    />
              <StatsCard label="Pending Notes"     value={sessions.filter(s => s.status === 'completed' && !s.session_notes).length} icon={<FileText size={18} />} color="saffron" />
            </div>

            {/* Upcoming */}
            <div>
              <h2 className="font-display text-xl text-trust-900 mb-4">Upcoming Sessions</h2>
              {upcomingSessions.length === 0 ? (
                <EmptyState icon={<Calendar size={20} />} title="No upcoming sessions" description="Your scheduled sessions will appear here." />
              ) : (
                <div className="space-y-3">
                  {upcomingSessions.map((s: any) => (
                    <Card key={s.id} className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-trust-50 flex items-center justify-center shrink-0">
                          <Calendar size={20} className="text-trust-700" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-800 text-sm">{s.user_name}</p>
                          <div className="flex gap-3 text-xs text-slate-400 mt-0.5">
                            <span>📅 {new Date(s.session_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                            <span>⏰ {new Date(s.session_date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                            <span>📱 {s.mode}</span>
                            <span>⏱ {s.duration_minutes} mins</span>
                          </div>
                          {s.topics_covered?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {s.topics_covered.map((t: string) => (
                                <span key={t} className="px-2 py-0.5 bg-trust-50 text-trust-600 text-xs rounded-lg">{t}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => { setSelectedSession(s); setNotes(s.session_notes || '') }}>
                          <MessageSquare size={14} /> Add Notes
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Clients */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl text-trust-900">Recent Clients</h2>
                <Link href="/dashboard/counselor/profiles" className="text-xs text-trust-600 hover:text-trust-800">View all →</Link>
              </div>
              {profiles.length === 0 ? (
                <EmptyState icon={<Users size={20} />} title="No clients yet" description="Profiles you counsel will appear here." />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profiles.slice(0, 4).map((p: any) => (
                    <Link key={p.id} href={`/dashboard/counselor/profiles/${p.id}`}>
                      <Card className="p-4 cursor-pointer" hover>
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-trust-100 text-trust-700 font-display font-semibold flex items-center justify-center text-lg shrink-0">
                            {p.user_name?.[0] || '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-slate-800 truncate">{p.user_name}</p>
                            <p className="text-xs text-slate-400">{p.age} yrs · {p.gender} · {p.city}</p>
                          </div>
                          <Badge status={p.status} />
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Notes Modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-float w-full max-w-md max-h-[90vh] overflow-y-auto">
              <p className="text-xs text-slate-400 mt-0.5">For: {selectedSession.user_name}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="label">Session Notes (confidential)</label>
                <textarea className="input resize-none" rows={5}
                  placeholder="Observations, key topics discussed, emotional state, recommendations…"
                  value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
              <div className="flex gap-3">
                <Button onClick={saveNotes} loading={savingNotes} variant="sage" className="flex-1 justify-center">
                  <Check size={15} /> Save & Complete
                </Button>
                <Button onClick={() => setSelectedSession(null)} variant="ghost" className="flex-1 justify-center">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
