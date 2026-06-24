'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { HeartHandshake, FileText, Heart, Bell, CheckCircle, Clock, User, ChevronRight, Star } from 'lucide-react'

import { StatsCard, Badge, Card, Button, EmptyState, Spinner } from '@/components/ui'
import { matrimonyApi, emotionalApi } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import toast from 'react-hot-toast'

const NAV = [
  { href: '/dashboard/matrimony',              icon: <HeartHandshake size={18} />, label: 'Overview' },
  { href: '/dashboard/matrimony/profile',      icon: <User size={18} />,           label: 'My Profile' },
  { href: '/dashboard/matrimony/matches',      icon: <Heart size={18} />,          label: 'Matches' },
  { href: '/dashboard/matrimony/evaluation',   icon: <Star size={18} />,           label: 'Readiness Eval.' },
  { href: '/dashboard/matrimony/family',       icon: <User size={18} />,           label: 'Family Details' },
]

export default function OverviewSection({ id }: { id?: string }) {
  const { user } = useAuthStore()
  const [profile, setProfile] = useState<any>(null)
  const [matches, setMatches] = useState<any[]>([])
  const [evalStatus, setEvalStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [profileRes, matchesRes, evalRes] = await Promise.allSettled([
          matrimonyApi.getMyProfile(),
          matrimonyApi.getMyMatches(),
          emotionalApi.myResponse(),
        ])
        if (profileRes.status === 'fulfilled') setProfile(profileRes.value.data)
        if (matchesRes.status === 'fulfilled') setMatches(matchesRes.value.data)
        if (evalRes.status === 'fulfilled') setEvalStatus(evalRes.value.data)
      } catch {/* ok */}
      finally { setLoading(false) }
    }
    load()
  }, [])

  const statusColor = profile?.status === 'approved' ? 'sage' : profile?.status === 'rejected' ? 'red' : 'saffron'

  return (
    <div id={id} className="scroll-mt-32 w-full">
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
        
        {/* Header Greeting Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-trust-900 via-trust-800 to-indigo-950 p-4 md:p-5 text-white shadow-md">
          <div className="absolute top-0 right-0 w-64 h-64 bg-saffron-400/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-pink-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-sm font-bold shadow-inner shrink-0">
                {user?.full_name ? user.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : '👤'}
              </div>
              <div>
                <h1 className="font-display text-lg md:text-xl font-bold">
                  Welcome back, {user?.full_name?.split(' ')[0]} 🙏
                </h1>
                <p className="text-indigo-200/80 text-xs mt-0.5">
                  Your personalized dashboard to guide and track your matchmaking process.
                </p>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : (
          <>
            {/* Action Card: Start Profile Registration */}
            {!profile && (
              <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-100 p-4 md:p-5 shadow-card hover:shadow-md transition-shadow">
                <div className="absolute top-0 right-0 w-40 h-40 bg-saffron-100/50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-trust-50 flex items-center justify-center shrink-0 border border-trust-100 text-trust-700">
                      <HeartHandshake size={20} />
                    </div>
                    <div>
                      <h3 className="font-display text-sm font-bold text-trust-900">Step 1: Set Up Matrimony Profile</h3>
                      <p className="text-slate-500 text-xs mt-0.5">
                        Register your background and family details to activate counselor-guided suggestions.
                      </p>
                      <div className="flex gap-3 mt-1.5 text-[10px] text-slate-400 font-semibold">
                        <span>⏱️ ~10 mins</span>
                        <span>🔒 Secured</span>
                        <span>🤝 Counselor Reviewed</span>
                      </div>
                    </div>
                  </div>
                  <Link href="/matrimony/register" className="shrink-0 w-full lg:w-auto">
                    <Button size="sm" variant="secondary" className="w-full justify-center group text-xs h-9">
                      Begin Setup <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Profile Status Banner */}
            {profile && (
              <div className={`rounded-2xl p-3 px-4 border flex items-center justify-between gap-3 text-xs ${
                profile.status === 'approved' ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800' :
                profile.status === 'rejected' ? 'bg-rose-50/50 border-rose-100 text-rose-800' :
                'bg-amber-50/50 border-amber-100 text-amber-800'
              }`}>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="shrink-0 text-sm">
                    {profile.status === 'approved' ? '✨' : profile.status === 'rejected' ? '❌' : '⏳'}
                  </span>
                  <p className="font-semibold text-slate-700 truncate">
                    <span className="font-bold text-slate-900 capitalize">Status: {profile.status}</span> —{' '}
                    {profile.status === 'approved' && 'Your profile is live. Our counselors will contact you when a suitable match is found.'}
                    {profile.status === 'pending' && 'Our team is reviewing your profile details. This process usually takes 1–2 working days.'}
                    {profile.status === 'rejected' && `Reason: ${profile.rejection_reason || 'Please contact support for details.'}`}
                  </p>
                </div>
                <Link href="/dashboard/matrimony/profile" className="shrink-0">
                  <Button size="sm" variant="ghost" className="h-8 py-0 px-3 text-xs font-semibold shadow-none">
                    View Profile
                  </Button>
                </Link>
              </div>
            )}

            {/* Stats Dashboard Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Profile Views', val: profile ? '—' : 0, sub: 'Unique visits', icon: <User size={16} />, color: 'bg-trust-50 text-trust-600 border-trust-100' },
                { label: 'Suggested Matches', val: matches.length, sub: 'Curated by team', icon: <Heart size={16} />, color: 'bg-saffron-50 text-saffron-600 border-saffron-100' },
                { label: 'Awaiting Response', val: matches.filter(m => m.status === 'suggested').length, sub: 'Pending decisions', icon: <Clock size={16} />, color: 'bg-amber-50 text-amber-600 border-amber-100' },
                { label: 'Readiness Score', val: evalStatus?.overall_score ? `${Math.round(evalStatus.overall_score)}%` : 'N/A', sub: 'From evaluation', icon: <Star size={16} />, color: 'bg-sage-50 text-sage-600 border-sage-100' },
              ].map((card, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-card hover:shadow-md transition-shadow flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{card.label}</p>
                    <p className="font-display text-2xl font-bold text-slate-800 mt-0.5">{card.val}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{card.sub}</p>
                  </div>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${card.color}`}>
                    {card.icon}
                  </div>
                </div>
              ))}
            </div>

            {/* Emotional Readiness Evaluation Promo */}
            {!evalStatus?.completed && (
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50/20 via-trust-50/10 to-saffron-50/20 border border-trust-100/50 p-4 shadow-card">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-saffron-100 flex items-center justify-center shrink-0 border border-saffron-200 text-saffron-700">
                      <Star size={18} className="stroke-[2.5]" />
                    </div>
                    <div>
                      <h3 className="font-display text-sm font-bold text-trust-900">Complete Emotional Readiness Assessment</h3>
                      <p className="text-slate-500 text-xs mt-0.5">
                        Answer 15 value questions to help our matchmakers pair you with highly compatible candidates.
                      </p>
                    </div>
                  </div>
                  <Link href="/dashboard/matrimony/evaluation" className="shrink-0 w-full lg:w-auto">
                    <Button size="sm" variant="secondary" className="w-full justify-center text-xs h-9">Start Evaluation →</Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Matches Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display text-xl text-trust-900 font-bold">Your Curated Matches</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Handpicked profiles reviewed by your counselor</p>
                </div>
                <Link href="/dashboard/matrimony/matches" className="text-sm font-semibold text-trust-600 hover:text-trust-800 flex items-center gap-1 transition-colors">
                  View all Matches <ChevronRight size={14} />
                </Link>
              </div>
              
              {matches.length === 0 ? (
                <EmptyState
                  icon={<Heart size={28} className="text-slate-400" />}
                  title="Curating your matches"
                  description="Our counselors are currently hand-reviewing profiles to find the most compatible matches for you. We will alert you here as soon as they are ready."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {matches.slice(0, 4).map((match: any) => (
                    <div key={match.match_id} className="relative overflow-hidden bg-white rounded-3xl border border-slate-100 p-5 md:p-6 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col sm:flex-row gap-5 group">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-trust-50 border border-slate-100 overflow-hidden shrink-0 relative">
                        {match.other_profile.photo ? (
                          <img src={match.other_profile.photo} alt={match.other_profile.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-trust-700 font-display text-2xl font-bold bg-gradient-to-br from-trust-100 to-indigo-50">
                            {match.other_profile.name[0]}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <h3 className="font-semibold text-slate-800 text-sm truncate">{match.other_profile.name}</h3>
                            <Badge status={match.status} />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-500 mb-3">
                            <p>🎂 {match.other_profile.age} years</p>
                            <p>📍 {match.other_profile.city}</p>
                            <p className="col-span-2 truncate">🎓 {match.other_profile.education}</p>
                            <p className="col-span-2 truncate">💼 {match.other_profile.occupation}</p>
                          </div>
                        </div>
                        
                        {match.status === 'suggested' ? (
                          <div className="flex gap-2.5 mt-2">
                            <button onClick={() => handleMatchResponse(match.match_id, true)}
                              className="flex-1 py-2 px-3 rounded-xl bg-trust-800 text-white text-xs font-semibold hover:bg-trust-700 hover:shadow-trust transition-all duration-200">
                              Yes, I'm Interested
                            </button>
                            <button onClick={() => handleMatchResponse(match.match_id, false)}
                              className="flex-1 py-2 px-3 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:border-slate-300 hover:bg-slate-50 transition-all duration-200">
                              Not Now
                            </button>
                          </div>
                        ) : (
                          <div className="text-xs text-slate-500 mt-2 bg-slate-50 rounded-2xl p-2.5 text-center border border-slate-100 font-medium">
                            {match.status === 'interested' && '💖 You expressed interest. Waiting for response.'}
                            {match.status === 'declined' && '❌ You passed on this match.'}
                            {match.status === 'accepted' && '🎉 Match connected! Exchange contact details.'}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )

  async function handleMatchResponse(matchId: string, interested: boolean) {
    try {
      await matrimonyApi.respondMatch(matchId, interested)
      toast.success(interested ? 'Interest expressed! Counselor will be in touch.' : 'Response recorded.')
      setMatches(m => m.map(x => x.match_id === matchId ? { ...x, status: interested ? 'interested' : 'declined' } : x))
    } catch { toast.error('Failed. Please try again.') }
  }
}
