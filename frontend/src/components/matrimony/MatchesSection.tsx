import { useEffect, useState } from 'react'
import { Heart, HeartHandshake, Star, User, Calendar, ChevronRight } from 'lucide-react'
import { Badge, Card, Spinner, EmptyState, Button } from '@/components/ui'
import { matrimonyApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

const NAV = [
  { href: '/dashboard/matrimony',            icon: <HeartHandshake size={18} />, label: 'Overview' },
  { href: '/dashboard/matrimony/profile',    icon: <User size={18} />,           label: 'My Profile' },
  { href: '/dashboard/matrimony/matches',    icon: <Heart size={18} />,          label: 'Matches' },
  { href: '/dashboard/matrimony/evaluation', icon: <Star size={18} />,           label: 'Readiness Eval.' },
  { href: '/dashboard/matrimony/family',     icon: <User size={18} />,           label: 'Family Details' },
]

const STATUS_INFO: Record<string, { label: string; color: string; desc: string }> = {
  suggested:         { label: 'New Suggestion', color: 'bg-amber-50 text-amber-800 border-amber-100', desc: 'Our matchmaking counselors suggest this candidate based on your shared lifestyle and life values.' },
  interested:        { label: 'Mutual Match',   color: 'bg-emerald-50 text-emerald-800 border-emerald-100', desc: 'Both candidates have expressed interest! A Devkalp counselor is reviewing details to organize next steps.' },
  meeting_scheduled: { label: 'Meeting Set',    color: 'bg-trust-50 text-trust-800 border-trust-100', desc: 'A supervised introduction call is scheduled by your counselor.' },
  declined:          { label: 'Passed',         color: 'bg-slate-50 text-slate-500 border-slate-100', desc: '' },
  accepted:          { label: 'Accepted',       color: 'bg-emerald-50 text-emerald-800 border-emerald-100', desc: 'Match successfully finalized.' },
}

export default function MatchesSection({ id }: { id?: string }) {
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [responding, setResponding] = useState<string | null>(null)

  useEffect(() => {
    matrimonyApi.getMyMatches()
      .then(r => setMatches(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const respond = async (matchId: string, interested: boolean) => {
    setResponding(matchId)
    try {
      await matrimonyApi.respondMatch(matchId, interested)
      toast.success(interested
        ? '❤️ Interest expressed! Our counselors will follow up.'
        : 'Response recorded. Thank you for your honesty.')
      setMatches(m => m.map(x =>
        x.match_id === matchId
          ? { ...x, status: interested ? 'interested' : 'declined' }
          : x
      ))
    } catch { toast.error('Failed to respond. Please try again.') }
    finally { setResponding(null) }
  }

  const active = matches.filter(m => !['declined', 'closed'].includes(m.status))
  const past = matches.filter(m => ['declined', 'closed'].includes(m.status))

  return (
    <div id={id} className="scroll-mt-32 w-full pt-10 border-t border-slate-100 mt-10">
      <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto">
        
        {/* Title Section */}
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-trust-900">Suggested Matches</h1>
          <p className="text-slate-500 text-sm mt-1 max-w-lg">
            Handpicked profiles verified and recommended by our senior counselors to ensure values alignment.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : matches.length === 0 ? (
          <div className="max-w-md mx-auto py-12">
            <EmptyState
              icon={<Heart size={28} className="text-trust-300" />}
              title="No matches suggested yet"
              description="Counselors are currently verifying compatibility credentials against new registrants."
            />
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Active Matches */}
            {active.length > 0 && (
              <div className="space-y-4">
                <h2 className="font-display text-lg font-bold text-trust-900">Active Suggestions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {active.map((m: any) => {
                    const statusInfo = STATUS_INFO[m.status] || { label: m.status, color: 'bg-slate-50 text-slate-600 border-slate-100', desc: '' }
                    return (
                      <div key={m.match_id} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-card hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
                        
                        <div className="space-y-4">
                          <div className="flex items-start gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-trust-100 to-indigo-50 border border-slate-100 overflow-hidden flex items-center justify-center text-trust-700 font-display text-2xl font-bold shrink-0 shadow-inner">
                              {m.other_profile.photo ? (
                                <img src={m.other_profile.photo} alt="" className="w-full h-full object-cover" />
                              ) : (
                                m.other_profile.name?.[0] || 'C'
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                                <p className="font-bold text-slate-800 text-lg truncate leading-none pt-0.5">{m.other_profile.name}</p>
                                <span className={clsx('text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider', statusInfo.color)}>
                                  {statusInfo.label}
                                </span>
                              </div>
                              <p className="text-xs font-semibold text-slate-500">
                                🎂 {m.other_profile.age} yrs · 📍 {m.other_profile.city}, {m.other_profile.state}
                              </p>
                              <p className="text-[11px] text-slate-400 font-medium mt-1 truncate">
                                🎓 {m.other_profile.education} · 💼 {m.other_profile.occupation}
                              </p>
                            </div>
                          </div>

                          {statusInfo.desc && (
                            <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-4">
                              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                {statusInfo.desc}
                              </p>
                            </div>
                          )}

                          {m.meeting_date && (
                            <div className="bg-trust-50/50 border border-trust-100/50 rounded-2xl p-3 flex items-center gap-2.5 text-trust-800 text-xs font-bold">
                              <Calendar size={14} className="stroke-[2.5]" />
                              <span>Introduction call: {new Date(m.meeting_date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="mt-5 pt-4 border-t border-slate-50">
                          {m.status === 'suggested' && (
                            <div className="flex gap-3">
                              <button
                                disabled={responding === m.match_id}
                                onClick={() => respond(m.match_id, true)}
                                className="flex-1 h-10 bg-trust-800 text-white text-xs font-bold rounded-xl hover:bg-trust-700 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 disabled:opacity-60 shadow-warm">
                                <Heart size={13} className="fill-white/80" />
                                Express Interest
                              </button>
                              <button
                                disabled={responding === m.match_id}
                                onClick={() => respond(m.match_id, false)}
                                className="flex-1 h-10 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 hover:text-slate-800 active:scale-[0.98] transition-all disabled:opacity-60">
                                Pass Suggestion
                              </button>
                            </div>
                          )}
                          
                          {m.status === 'interested' && (
                            <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50/50 border border-emerald-100/50 rounded-2xl p-3 text-xs font-bold">
                              <Heart size={14} className="fill-emerald-500 text-emerald-500" />
                              <span>Both parties interested — counselor details setup in progress</span>
                            </div>
                          )}
                        </div>

                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Past Suggestions */}
            {past.length > 0 && (
              <div className="space-y-3 pt-4">
                <h2 className="font-display text-sm font-bold text-slate-400 uppercase tracking-wider">Previous Suggestions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {past.map((m: any) => (
                    <div key={m.match_id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 opacity-70 hover:opacity-100 transition-opacity">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 font-bold text-sm flex items-center justify-center shrink-0">
                          {m.other_profile.name?.[0] || 'C'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700">{m.other_profile.name}</p>
                          <p className="text-xs font-semibold text-slate-400">{m.other_profile.city}, {m.other_profile.state}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-400 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-lg capitalize">
                        {m.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
          </div>
        )}
      </div>
    </div>
  )
}
