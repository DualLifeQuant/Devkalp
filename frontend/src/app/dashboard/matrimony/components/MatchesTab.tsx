'use client'
import { useState } from 'react'
import { Heart, Star, User, AlertCircle, MessageCircle } from 'lucide-react'
import { Badge, Card, EmptyState, Button } from '@/components/ui'
import { SkeletonList, InlineError } from '@/components/common/LoadingStates'
import { useMyMatches, useRespondToMatch } from '@/hooks/useApiQueries'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

const STATUS_INFO: Record<string, { label: string; color: string; desc: string }> = {
  suggested:         { label: 'New Match Suggestion', color: 'bg-amber-100 text-amber-800 border-amber-200',  desc: 'Our counselor suggests this connection might be mutually compatible based on background, education, and values.' },
  interested:        { label: 'Mutual Match',         color: 'bg-sage-100 text-sage-800 border-sage-200',    desc: 'Both profiles have expressed interest in connecting. A counselor will contact you shortly to coordinate introduction steps.' },
  meeting_scheduled: { label: 'Introduction Scheduled', color: 'bg-trust-100 text-trust-800 border-trust-200',  desc: 'A coordinated family introduction meeting is scheduled.' },
  declined:          { label: 'Passed',               color: 'bg-slate-100 text-slate-600 border-slate-200',  desc: '' },
  accepted:          { label: 'Accepted',             color: 'bg-sage-100 text-sage-800 border-sage-200',    desc: 'This match suggestion has been accepted.' },
}

export default function MatchesTab() {
  const [responding, setResponding] = useState<string | null>(null)

  const { data: matches = [], isLoading: loading, isError, refetch } = useMyMatches()
  const respondMutation = useRespondToMatch()

  const respond = async (matchId: string, interested: boolean) => {
    setResponding(matchId)
    try {
      await respondMutation.mutateAsync({ id: matchId, interested })
      toast.success(interested
        ? '❤️ Interest expressed! Our counselors will reach out to both sides.'
        : 'Response recorded. Thank you for your feedback.')
      refetch()
    } catch { 
      toast.error('Failed to register response. Please check your internet connection.') 
    } finally { 
      setResponding(null) 
    }
  }

  const active = matches.filter((m: any) => !['declined', 'closed'].includes(m.status))
  const past = matches.filter((m: any) => ['declined', 'closed'].includes(m.status))

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header Info */}
      <div className="border-b border-slate-100 pb-5">
        <h2 className="font-display text-2xl text-trust-900 font-bold">My Matches</h2>
        <p className="text-slate-500 text-sm mt-1 max-w-lg">
          Each potential candidate suggestion is curated manually by our counselor team — no automated matching scripts.
        </p>
      </div>

      {isError && (
        <InlineError 
          message="Failed to load match suggestions." 
          onRetry={() => refetch()} 
          className="mb-4" 
        />
      )}

      {loading ? (
        <SkeletonList count={2} />
      ) : matches.length === 0 ? (
        <EmptyState
          icon={<Heart size={32} className="text-trust-300 animate-pulse" />}
          title="No matches suggested yet"
          description="Our counseling specialists are looking for candidates who match your background, compatibility criteria, and expectations. You will receive an alert once a match is selected."
        />
      ) : (
        <div className="space-y-8">
          
          {/* Active Suggested Matches */}
          {active.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-display text-lg text-slate-800 font-bold">Active Suggestions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {active.map((m: any) => {
                  const statusInfo = STATUS_INFO[m.status] || { label: m.status, color: 'bg-slate-100 text-slate-600 border-slate-200', desc: '' }
                  return (
                    <Card key={m.match_id} className="p-6 hover:shadow-card-hover border-slate-100 transition-all duration-300 rounded-3xl flex flex-col justify-between">
                      <div>
                        {/* Profile Info Row */}
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-trust-50 to-saffron-50 flex items-center justify-center text-trust-700 font-display text-xl font-semibold shrink-0 overflow-hidden border border-slate-100 shadow-sm">
                            {m.other_profile.photos?.[0] ? (
                              <img src={m.other_profile.photos[0]} alt="" className="w-full h-full object-cover" />
                            ) : (
                              m.other_profile.name?.[0]
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                              <p className="font-display text-lg text-trust-900 font-bold truncate pr-2">
                                {m.other_profile.name}
                              </p>
                              <span className={clsx('text-[10px] font-bold px-2.5 py-0.5 rounded-full border tracking-wide uppercase shrink-0 whitespace-nowrap', statusInfo.color)}>
                                {statusInfo.label}
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-slate-500">
                              {m.other_profile.age} yrs · {m.other_profile.city}, {m.other_profile.state}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-1 truncate">
                              {m.other_profile.education} · {m.other_profile.occupation}
                            </p>
                          </div>
                        </div>

                        {/* Counselor's Assessment */}
                        {statusInfo.desc && (
                          <div className="text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-5 flex gap-2">
                            <MessageCircle size={16} className="text-trust-600 shrink-0 mt-0.5" />
                            <p className="leading-relaxed italic">
                              "{statusInfo.desc}"
                            </p>
                          </div>
                        )}

                        {/* Scheduled meeting indicators */}
                        {m.meeting_date && (
                          <div className="bg-trust-50/50 border border-trust-100 rounded-2xl p-3 flex items-center gap-2 text-xs text-trust-800 font-semibold mb-4">
                            📅 Introduction Date: {new Date(m.meeting_date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                          </div>
                        )}
                      </div>

                      {/* Response actions */}
                      <div>
                        {m.status === 'suggested' && (
                          <div className="flex gap-3 pt-3 border-t border-slate-100">
                            <button
                              disabled={responding === m.match_id}
                              onClick={() => respond(m.match_id, true)}
                              className="flex-1 py-3 bg-trust-800 text-white text-xs font-bold rounded-xl hover:bg-trust-700 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60 shadow-sm"
                            >
                              <Heart size={14} className="fill-white/60 text-white/60" />
                              I'm Interested
                            </button>
                            <button
                              disabled={responding === m.match_id}
                              onClick={() => respond(m.match_id, false)}
                              className="flex-1 py-3 border border-slate-200 hover:border-red-300 text-slate-600 hover:text-red-700 text-xs font-bold rounded-xl hover:bg-red-50/20 transition-all disabled:opacity-60"
                            >
                              Not This Time
                            </button>
                          </div>
                        )}
                        {m.status === 'interested' && (
                          <div className="flex items-center gap-2 text-sage-700 text-xs font-semibold bg-sage-50 border border-sage-100 rounded-2xl p-3">
                            <Heart size={14} className="fill-sage-500 text-sage-500 shrink-0" />
                            Mutual interest declared! A counselor is currently coordinating the next steps.
                          </div>
                        )}
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {/* Past Suggestions */}
          {past.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h3 className="font-display text-base text-slate-400 font-bold">Previous Suggestions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {past.map((m: any) => (
                  <div key={m.match_id} className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 opacity-60">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 font-semibold text-sm flex items-center justify-center shrink-0 overflow-hidden">
                      {m.other_profile.photos?.[0] ? (
                        <img src={m.other_profile.photos[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        m.other_profile.name?.[0]
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-700 truncate">{m.other_profile.name}</p>
                      <p className="text-xs text-slate-400 truncate">{m.other_profile.city}, {m.other_profile.state}</p>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
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
  )
}
