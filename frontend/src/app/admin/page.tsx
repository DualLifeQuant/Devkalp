import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Users, HeartHandshake, HandHeart, Briefcase,
  Leaf, Heart, TrendingUp, Clock, CheckCircle, AlertCircle,
  ArrowUpRight, Activity
} from 'lucide-react'
import AdminLayout from '@/components/layout/AdminLayout'
import { StatsCard, Badge, Card, Spinner, EmptyState } from '@/components/ui'
import { adminApi, matrimonyApi, jobsApi } from '@/lib/api'

const QUICK_ACTIONS = [
  { href: '/admin/matrimony',  label: 'Review Profiles',  icon: <HeartHandshake size={18}/>, color: 'bg-trust-50 text-trust-700 hover:bg-trust-100 border-trust-100'   },
  { href: '/admin/jobs',       label: 'Post a Job',       icon: <Briefcase size={18}/>,      color: 'bg-sage-50 text-sage-700 hover:bg-sage-100 border-sage-100'         },
  { href: '/admin/donations',  label: 'View Donations',   icon: <HandHeart size={18}/>,      color: 'bg-saffron-50 text-saffron-700 hover:bg-saffron-100 border-saffron-100' },
  { href: '/admin/campaigns',  label: 'New Campaign',     icon: <Leaf size={18}/>,           color: 'bg-warm-50 text-warm-700 hover:bg-warm-100 border-warm-100'          },
]

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [pendingProfiles, setPendingProfiles] = useState<any[]>([])
  const [recentApps, setRecentApps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [sRes, pRes, aRes] = await Promise.allSettled([
          adminApi.stats(),
          matrimonyApi.adminProfiles({ status: 'pending', limit: 5 }),
          jobsApi.adminApps({ limit: 5 }),
        ])
        if (sRes.status === 'fulfilled') setStats(sRes.value.data)
        if (pRes.status === 'fulfilled') setPendingProfiles(pRes.value.data.items || [])
        if (aRes.status === 'fulfilled') setRecentApps(aRes.value.data.items || [])
      } catch {}
      finally { setLoading(false) }
    }
    load()
  }, [])

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 space-y-7">

        {/* Header */}
        <FadeIn>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl text-trust-900">Admin Dashboard</h1>
              <p className="text-slate-500 text-sm mt-0.5">Welcome back. Here's what needs your attention today.</p>
            </div>
            <Link to="/admin/activity"
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm hover:border-trust-300 hover:text-trust-700 transition-all">
              <Activity size={15} /> View Logs
            </Link>
          </div>
        </FadeIn>

        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : (
          <>
            {/* Alert banner */}
            {(stats?.pending_matrimony_profiles > 0 || stats?.pending_applications > 0 || stats?.pending_volunteers > 0) && (
              <FadeIn delay={0.05}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                  className="bg-amber-50 border border-amber-200 rounded-2xl p-4"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle size={16} className="text-amber-600" />
                    <p className="font-semibold text-amber-800 text-sm">Action Required</p>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {stats.pending_matrimony_profiles > 0 && (
                      <Link to="/admin/matrimony"
                        className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-amber-200 transition-colors">
                        {stats.pending_matrimony_profiles} matrimony profiles to review <ArrowUpRight size={12} />
                      </Link>
                    )}
                    {stats.pending_applications > 0 && (
                      <Link to="/admin/jobs"
                        className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-amber-200 transition-colors">
                        {stats.pending_applications} job applications pending <ArrowUpRight size={12} />
                      </Link>
                    )}
                    {stats.pending_volunteers > 0 && (
                      <Link to="/admin/volunteers"
                        className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-amber-200 transition-colors">
                        {stats.pending_volunteers} volunteer approvals <ArrowUpRight size={12} />
                      </Link>
                    )}
                  </div>
                </motion.div>
              </FadeIn>
            )}

            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Users',      value: stats?.users_total ?? 0,      icon: <Users size={18}/>,      color: 'trust'   },
                { label: 'Total Raised',     value: `₹${((stats?.total_donations ?? 0)/100000).toFixed(1)}L`, icon: <HandHeart size={18}/>, color: 'saffron' },
                { label: 'Active Campaigns', value: stats?.active_campaigns ?? 0, icon: <Leaf size={18}/>,       color: 'sage'    },
                { label: 'Open Jobs',        value: stats?.open_jobs ?? 0,        icon: <Briefcase size={18}/>,  color: 'trust'   },
              ].map((s, i) => (
                <FadeIn key={s.label} delay={0.1 + i * 0.06}>
                  <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
                    <StatsCard {...s} />
                  </motion.div>
                </FadeIn>
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Pending Profiles', value: stats?.pending_matrimony_profiles ?? 0, icon: <HeartHandshake size={18}/>, color: 'saffron' },
                { label: 'Pending Apps',     value: stats?.pending_applications ?? 0,       icon: <Clock size={18}/>,          color: 'saffron' },
                { label: 'Donations',        value: stats?.donations_count ?? 0,            icon: <TrendingUp size={18}/>,     color: 'trust'   },
                { label: 'Volunteers',       value: stats?.pending_volunteers ?? 0,         icon: <Heart size={18}/>,          color: 'sage'    },
              ].map((s, i) => (
                <FadeIn key={s.label} delay={0.25 + i * 0.06}>
                  <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
                    <StatsCard {...s} />
                  </motion.div>
                </FadeIn>
              ))}
            </div>

            {/* Content cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FadeIn delay={0.35}>
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-display text-lg text-trust-900">Pending Matrimony Profiles</h3>
                    <Link to="/admin/matrimony" className="text-xs text-trust-600 hover:text-trust-800 font-medium flex items-center gap-1">
                      View all <ArrowUpRight size={12}/>
                    </Link>
                  </div>
                  {pendingProfiles.length === 0 ? (
                    <EmptyState icon={<CheckCircle size={20}/>} title="All caught up!" description="No profiles awaiting review." />
                  ) : (
                    <div className="space-y-2.5">
                      {pendingProfiles.map((p: any) => (
                        <motion.div key={p.id} whileHover={{ x: 3 }} transition={{ duration: 0.15 }}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                          <div className="w-9 h-9 rounded-full bg-trust-100 text-trust-700 font-bold text-sm flex items-center justify-center shrink-0">
                            {p.user_name?.[0] || '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{p.user_name}</p>
                            <p className="text-xs text-slate-400">{p.age} yrs · {p.gender} · {p.city}</p>
                          </div>
                          <Badge status="pending" />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </Card>
              </FadeIn>

              <FadeIn delay={0.42}>
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-display text-lg text-trust-900">Recent Applications</h3>
                    <Link to="/admin/jobs" className="text-xs text-trust-600 hover:text-trust-800 font-medium flex items-center gap-1">
                      View all <ArrowUpRight size={12}/>
                    </Link>
                  </div>
                  {recentApps.length === 0 ? (
                    <EmptyState icon={<CheckCircle size={20}/>} title="No applications yet" />
                  ) : (
                    <div className="space-y-2.5">
                      {recentApps.map((a: any) => (
                        <motion.div key={a.id} whileHover={{ x: 3 }} transition={{ duration: 0.15 }}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                          <div className="w-9 h-9 rounded-full bg-sage-100 text-sage-700 font-bold text-sm flex items-center justify-center shrink-0">
                            {a.candidate_name?.[0] || '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{a.candidate_name}</p>
                            <p className="text-xs text-slate-400 truncate">{a.job_title}</p>
                          </div>
                          <Badge status={a.status} />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </Card>
              </FadeIn>
            </div>

            {/* Quick actions */}
            <FadeIn delay={0.5}>
              <div>
                <h3 className="font-display text-lg text-trust-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {QUICK_ACTIONS.map((a, i) => (
                    <motion.div key={a.href} whileHover={{ y: -3, scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.2 }}>
                      <Link to={a.href}
                        className={`flex items-center gap-2.5 p-4 rounded-2xl border text-sm font-semibold transition-all ${a.color}`}>
                        {a.icon} {a.label}
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </>
        )}
      </div>
    </AdminLayout>
  )
}
