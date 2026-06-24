'use client'
import { useState } from 'react'
import { Plus, School, Users, CheckCircle, Calendar, X, Camera } from 'lucide-react'
import { HeartHandshake, Briefcase, Leaf, Heart } from 'lucide-react'
import AdminLayout from '@/components/layout/AdminLayout'
import { Badge, Button, Card, StatsCard, EmptyState } from '@/components/ui'
import { SkeletonGrid, SkeletonList, InlineError } from '@/components/common/LoadingStates'
import { useAuthGuard } from '@/hooks/useAuthGuard'
import {
  useCampaigns, useCreateCampaignSession, useRecordAttendance,
} from '@/hooks/useApiQueries'
import { sessionApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

export default function AdminCampaignsPage() {
  useAuthGuard({ allowedRoles: ['admin'] })

  const [selected, setSelected] = useState<any>(null)
  const [sessions, setSessions] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [sessionLoading, setSessionLoading] = useState(false)
  const [showNewSession, setShowNewSession] = useState(false)
  const [showAttendance, setShowAttendance] = useState<any>(null)
  const [newSession, setNewSession] = useState({ title: '', school_name: '', session_date: '', duration_minutes: 90, facilitator_name: '', topics_covered: '' })
  const [attendance, setAttendance] = useState({ girls: 0, boys: 0, teachers: 0, notes: '', outcomes: '', challenges: '' })

  const { data, isLoading: loading, isError, refetch } = useCampaigns({ limit: 30 })
  const campaigns: any[] = (data as any)?.items || []
  const createSessionMutation = useCreateCampaignSession()
  const recordAttendanceMutation = useRecordAttendance()

  const loadCampaignSessions = async (campaign: any) => {
    setSelected(campaign)
    setSessionLoading(true)
    try {
      const [sRes, aRes] = await Promise.allSettled([
        sessionApi.byCampaign(campaign.id),
        sessionApi.analytics(campaign.id),
      ])
      if (sRes.status === 'fulfilled') setSessions(sRes.value.data || [])
      if (aRes.status === 'fulfilled') setAnalytics(aRes.value.data)
    } catch { toast.error('Failed to load sessions') }
    finally { setSessionLoading(false) }
  }

  const createSession = async () => {
    if (!newSession.title || !newSession.session_date) { toast.error('Title and date required'); return }
    try {
      await createSessionMutation.mutateAsync({
        ...newSession,
        campaign_id: selected.id,
        topics_covered: newSession.topics_covered ? newSession.topics_covered.split(',').map((s: string) => s.trim()) : [],
        session_number: sessions.length + 1,
      })
      toast.success('Session created!')
      setShowNewSession(false)
      setNewSession({ title: '', school_name: '', session_date: '', duration_minutes: 90, facilitator_name: '', topics_covered: '' })
      loadCampaignSessions(selected)
    } catch (e: any) { toast.error(e?.response?.data?.detail || 'Failed') }
  }

  const recordAttendance = async () => {
    try {
      await recordAttendanceMutation.mutateAsync({ id: showAttendance.id, data: attendance })
      toast.success('Attendance recorded!')
      setShowAttendance(null)
      setAttendance({ girls: 0, boys: 0, teachers: 0, notes: '', outcomes: '', challenges: '' })
      loadCampaignSessions(selected)
    } catch { toast.error('Failed to record attendance') }
  }

  return (
    <AdminLayout>
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl text-trust-900">Campaigns & Sessions</h1>
            <p className="text-slate-500 text-sm mt-1">Track school visits, attendance, and impact.</p>
          </div>
          {!selected && (
            <Button size="sm" variant="secondary" onClick={() => toast('Create campaign from main campaigns page.')}>
              <Plus size={15} /> New Campaign
            </Button>
          )}
          {selected && (
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => { setSelected(null); setSessions([]); setAnalytics(null) }}>← All Campaigns</Button>
              <Button size="sm" variant="secondary" onClick={() => setShowNewSession(true)}>
                <Plus size={15} /> New Session
              </Button>
            </div>
          )}
        </div>

        {loading ? <SkeletonGrid count={6} cols={3} /> : !selected ? (
          /* Campaign List */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaigns.map(c => (
              <Card key={c.id} className="p-5" hover>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-display text-base text-trust-900 leading-tight flex-1 mr-2">{c.title}</h3>
                  <Badge status={c.status} />
                </div>
                <p className="text-sm text-slate-500 mb-3 capitalize">{c.category}</p>
                <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                  {c.city && <span className="flex items-center gap-1"><School size={12} /> {c.city}</span>}
                  <span className="flex items-center gap-1"><Users size={12} /> {c.registration_count || 0} registered</span>
                </div>
                <Button size="sm" variant="ghost" className="w-full justify-center" onClick={() => loadCampaignSessions(c)}>
                  View Sessions →
                </Button>
              </Card>
            ))}
            {campaigns.length === 0 && <EmptyState icon={<Leaf size={24} />} title="No campaigns yet" />}
          </div>
        ) : (
          /* Campaign Sessions View */
          <div className="space-y-6">
            {/* Campaign header */}
            <Card className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center shrink-0">
                  <Leaf size={18} className="text-sage-700" />
                </div>
                <div>
                  <h2 className="font-display text-xl text-trust-900">{selected.title}</h2>
                  <p className="text-xs text-slate-400 capitalize">{selected.category}</p>
                </div>
              </div>
            </Card>

            {/* Analytics */}
            {analytics && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard label="Total Sessions" value={analytics.total_sessions} icon={<Calendar size={18} />} color="trust" />
                <StatsCard label="Completed" value={analytics.completed_sessions} icon={<CheckCircle size={18} />} color="sage" />
                <StatsCard label="Students Reached" value={(analytics.total_students_reached || 0).toLocaleString('en-IN')} icon={<Users size={18} />} color="saffron" />
                <StatsCard label="Unique Schools" value={analytics.unique_schools} icon={<School size={18} />} color="trust" />
              </div>
            )}

            {/* Gender breakdown */}
            {analytics && (analytics.girls_reached > 0 || analytics.boys_reached > 0) && (
              <Card className="p-5">
                <p className="font-semibold text-slate-700 text-sm mb-4">Attendance Breakdown</p>
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <p className="font-display text-2xl text-trust-800">{(analytics.girls_reached || 0).toLocaleString()}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Girls</p>
                  </div>
                  <div>
                    <p className="font-display text-2xl text-sage-700">{(analytics.boys_reached || 0).toLocaleString()}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Boys</p>
                  </div>
                  <div>
                    <p className="font-display text-2xl text-saffron-700">{(analytics.teachers_reached || 0).toLocaleString()}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Teachers</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Sessions List */}
            {sessionLoading ? <SkeletonList count={3} /> : (
              <div className="space-y-3">
                {sessions.length === 0 ? (
                  <EmptyState icon={<Calendar size={24} />} title="No sessions yet" description="Create your first session." action={<Button size="sm" onClick={() => setShowNewSession(true)}>Add Session</Button>} />
                ) : sessions.map((s: any) => (
                  <Card key={s.id} className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={clsx(
                        'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg',
                        s.status === 'completed' ? 'bg-sage-100 text-sage-600' : 'bg-saffron-100 text-saffron-600'
                      )}>
                        {s.status === 'completed' ? <CheckCircle size={18} /> : <Calendar size={18} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-semibold text-slate-800 text-sm">{s.title}</p>
                          <span className={clsx('badge text-xs', s.status === 'completed' ? 'badge-approved' : 'badge-pending')}>
                            {s.status}
                          </span>
                        </div>
                        {s.school_name && (
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <School size={11} /> {s.school_name}
                          </p>
                        )}
                        <div className="flex gap-4 mt-2 text-xs text-slate-400">
                          <span>📅 {new Date(s.session_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          <span>⏱ {s.duration_minutes} mins</span>
                          {s.total_attended > 0 && <span>👥 {s.total_attended} attended</span>}
                        </div>
                        {s.topics_covered?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {s.topics_covered.map((t: string) => (
                              <span key={t} className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-lg">{t}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      {s.status !== 'completed' && (
                        <Button size="sm" variant="secondary" onClick={() => setShowAttendance(s)}>
                          Record Attendance
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* New Session Modal */}
        {showNewSession && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowNewSession(false)}>
            <div className="bg-white rounded-3xl shadow-float w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-display text-xl text-trust-900">Create Session</h2>
                <button onClick={() => setShowNewSession(false)}><X size={18} /></button>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { label: 'Session Title *', key: 'title', placeholder: 'e.g. Menstrual Hygiene Awareness – Day 1' },
                  { label: 'School Name', key: 'school_name', placeholder: 'Government Middle School, Wardha' },
                  { label: 'Facilitator', key: 'facilitator_name', placeholder: 'Name of facilitator / volunteer' },
                  { label: 'Topics Covered (comma-separated)', key: 'topics_covered', placeholder: 'hygiene, nutrition, awareness' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="label">{f.label}</label>
                    <input className="input text-sm" placeholder={f.placeholder}
                      value={(newSession as any)[f.key]} onChange={e => setNewSession(prev => ({ ...prev, [f.key]: e.target.value }))} />
                  </div>
                ))}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input type="datetime-local" className="input text-sm"
                      value={newSession.session_date} onChange={e => setNewSession(prev => ({ ...prev, session_date: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">Duration (min)</label>
                    <input type="number" className="input text-sm" value={newSession.duration_minutes}
                      onChange={e => setNewSession(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) }))} />
                  </div>
                </div>
                <Button onClick={createSession} className="w-full justify-center">Create Session</Button>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Modal */}
        {showAttendance && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowAttendance(null)}>
            <div className="bg-white rounded-3xl shadow-float w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="font-display text-xl text-trust-900">Record Attendance</h2>
                  <p className="text-xs text-slate-400 mt-0.5">{showAttendance.title}</p>
                </div>
                <button onClick={() => setShowAttendance(null)}><X size={18} /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Girls', key: 'girls', emoji: '👧' },
                    { label: 'Boys', key: 'boys', emoji: '👦' },
                    { label: 'Teachers', key: 'teachers', emoji: '👩‍🏫' },
                  ].map(f => (
                    <div key={f.key} className="text-center">
                      <p className="text-2xl mb-1">{f.emoji}</p>
                      <label className="label text-center">{f.label}</label>
                      <input type="number" min="0" className="input text-center text-lg font-semibold"
                        value={(attendance as any)[f.key]}
                        onChange={e => setAttendance(prev => ({ ...prev, [f.key]: parseInt(e.target.value) || 0 }))} />
                    </div>
                  ))}
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-slate-500">Total</p>
                  <p className="font-display text-3xl font-semibold text-trust-800">
                    {attendance.girls + attendance.boys + attendance.teachers}
                  </p>
                </div>
                {[
                  { label: 'Session Notes', key: 'notes', placeholder: 'How did the session go?' },
                  { label: 'Key Outcomes', key: 'outcomes', placeholder: 'What was achieved?' },
                  { label: 'Challenges', key: 'challenges', placeholder: 'Any difficulties faced?' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="label">{f.label}</label>
                    <textarea className="input resize-none text-sm" rows={2} placeholder={f.placeholder}
                      value={(attendance as any)[f.key]}
                      onChange={e => setAttendance(prev => ({ ...prev, [f.key]: e.target.value }))} />
                  </div>
                ))}
                <Button onClick={recordAttendance} variant="sage" className="w-full justify-center">
                  <CheckCircle size={16} /> Save Attendance
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
