import { useEffect, useState } from 'react'
import { UserCheck, Calendar, Users, Check, X } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Badge, Button, Card, Spinner, EmptyState, StatsCard } from '@/components/ui'
import { counselorsApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

const STATUS_STYLES: Record<string, string> = {
  scheduled:  'bg-amber-100 text-amber-800',
  completed:  'bg-sage-100 text-sage-700',
  cancelled:  'bg-red-100 text-red-700',
  'no-show':  'bg-slate-100 text-slate-600',
}

export default function CounselorSessionsPage() {
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [selected, setSelected] = useState<any>(null)
  const [notes, setNotes] = useState('')
  const [recs, setRecs] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    counselorsApi.mySessions({ status: filter || undefined, limit: 100 })
      .then(r => setSessions(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [filter])

  const saveNotes = async () => {
    if (!selected) return
    setSaving(true)
    try {
      await counselorsApi.addNotes(selected.id, {
        notes, recommendations: recs, status: 'completed'
      })
      toast.success('Session notes saved')
      setSelected(null)
      load()
    } catch { toast.error('Failed to save notes') }
    finally { setSaving(false) }
  }

  const upcoming = sessions.filter(s => s.status === 'scheduled')
  const completed = sessions.filter(s => s.status === 'completed')

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 mt-16 md:mt-20 space-y-6">
        <div>
          <h1 className="font-display text-2xl text-trust-900">Sessions</h1>
          <p className="text-slate-500 text-sm mt-1">All your counseling sessions, past and upcoming.</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <StatsCard label="Upcoming" value={upcoming.length} icon={<Calendar size={17} />} color="saffron" />
          <StatsCard label="Completed" value={completed.length} icon={<Check size={17} />} color="sage" />
          <StatsCard label="Total" value={sessions.length} icon={<UserCheck size={17} />} color="trust" />
        </div>

        <div className="flex gap-2">
          {['', 'scheduled', 'completed', 'cancelled'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={clsx('px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors',
                filter === s ? 'bg-trust-800 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-trust-300')}>
              {s || 'All'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : sessions.length === 0 ? (
          <EmptyState icon={<Calendar size={22} />} title="No sessions found"
            description="Sessions assigned to you by admin will appear here." />
        ) : (
          <div className="space-y-3">
            {sessions.map((s: any) => (
              <Card key={s.id} className="p-5">
                <div className="flex items-start gap-4">
                  <div className={clsx(
                    'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                    s.status === 'completed' ? 'bg-sage-100 text-sage-600' : 'bg-saffron-100 text-saffron-700'
                  )}>
                    <Calendar size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-slate-800 text-sm">
                        {s.user_name}{s.user2_name ? ` & ${s.user2_name}` : ''}
                      </p>
                      <span className={clsx('text-xs px-2.5 py-1 rounded-full font-medium capitalize', STATUS_STYLES[s.status] || 'bg-slate-100 text-slate-600')}>
                        {s.status}
                      </span>
                    </div>
                    <div className="flex gap-4 text-xs text-slate-400">
                      <span>📅 {new Date(s.session_date).toLocaleString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                      <span>⏱ {s.duration_minutes} min</span>
                      <span className="capitalize">📱 {s.mode}</span>
                    </div>
                    {s.topics_covered?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {s.topics_covered.map((t: string) => (
                          <span key={t} className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-lg">{t}</span>
                        ))}
                      </div>
                    )}
                    {s.session_notes && (
                      <p className="text-xs text-slate-500 mt-1 italic line-clamp-1">"{s.session_notes}"</p>
                    )}
                  </div>
                  {s.status === 'scheduled' && (
                    <Button size="sm" variant="ghost" onClick={() => { setSelected(s); setNotes(s.session_notes || ''); setRecs(s.recommendations || '') }}>
                      Add Notes
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Notes Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-3xl shadow-float w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="font-display text-xl text-trust-900">Session Notes</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selected.user_name}{selected.user2_name ? ` & ${selected.user2_name}` : ''} · {new Date(selected.session_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </p>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={16} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                🔒 These notes are confidential — visible only to you and the admin team.
              </div>
              <div>
                <label className="label">Session Notes</label>
                <textarea className="input resize-none text-sm" rows={4}
                  placeholder="Key observations, topics discussed, emotional state, significant moments..."
                  value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
              <div>
                <label className="label">Recommendations</label>
                <textarea className="input resize-none text-sm" rows={3}
                  placeholder="Suggested next steps, follow-up topics, match readiness assessment..."
                  value={recs} onChange={e => setRecs(e.target.value)} />
              </div>
              <div className="flex gap-3">
                <Button onClick={saveNotes} loading={saving} variant="sage" className="flex-1 justify-center">
                  <Check size={15} /> Save & Mark Complete
                </Button>
                <Button onClick={() => setSelected(null)} variant="ghost" className="flex-1 justify-center">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
