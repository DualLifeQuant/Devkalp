'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Briefcase, Clock, MapPin, ChevronRight, CheckCircle, AlertCircle, Calendar } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { StatsCard, Badge, Card, Button, EmptyState, Spinner } from '@/components/ui'
import { jobsApi } from '@/lib/api'

const STATUS_STEPS = ['applied','shortlisted','interview_scheduled','interviewed','selected']
const STATUS_LABELS: Record<string,string> = {
  applied:'Applied', shortlisted:'Shortlisted',
  interview_scheduled:'Interview Set', interviewed:'Interviewed',
  selected:'Selected ✓', rejected:'Rejected',
}

export default function CandidateDashboard() {
  const [apps, setApps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    jobsApi.myApplications().then(r => setApps(r.data || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const active = apps.filter(a => !['rejected','withdrawn'].includes(a.status))
  const interviews = apps.filter(a => a.status === 'interview_scheduled')

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 mt-16 md:mt-20 space-y-8">
        <div>
          <h1 className="font-display text-2xl text-trust-900">My Applications</h1>
          <p className="text-slate-500 text-sm mt-1">Track every step of your journey.</p>
        </div>

        {loading ? <div className="flex justify-center py-16"><Spinner size="lg"/></div> : <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard label="Total Applied" value={apps.length} icon={<Briefcase size={18}/>} color="trust"/>
            <StatsCard label="In Progress" value={active.length} icon={<Clock size={18}/>} color="saffron"/>
            <StatsCard label="Interviews" value={interviews.length} icon={<Calendar size={18}/>} color="sage"/>
            <StatsCard label="Selected" value={apps.filter(a=>a.status==='selected').length} icon={<CheckCircle size={18}/>} color="sage"/>
          </div>

          {interviews.length > 0 && (
            <div className="bg-trust-50 border border-trust-200 rounded-2xl p-5">
              <p className="font-semibold text-trust-800 text-sm mb-3 flex items-center gap-2">
                <Calendar size={16}/> Upcoming Interviews
              </p>
              {interviews.map((a:any) => (
                <div key={a.id} className="bg-white rounded-xl p-4 border border-trust-100">
                  <p className="font-semibold text-slate-800 text-sm">{a.job?.title}</p>
                  <div className="flex gap-4 text-xs text-slate-500 mt-1">
                    <span>📅 {new Date(a.interview_date).toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'})}</span>
                    <span>🕐 {new Date(a.interview_date).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</span>
                    <span>📱 {a.interview_mode}</span>
                  </div>
                  {a.interview_link && (
                    <a href={a.interview_link} target="_blank" rel="noopener noreferrer"
                       className="inline-block mt-2 text-xs text-trust-600 hover:underline">
                      Join Interview →
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          <div>
            <h2 className="font-display text-xl text-trust-900 mb-4">All Applications</h2>
            {apps.length === 0 ? (
              <EmptyState icon={<Briefcase size={24}/>} title="No applications yet"
                description="Browse our open positions and apply."
                action={<Link href="/jobs"><Button size="sm">Browse Jobs →</Button></Link>}/>
            ) : (
              <div className="space-y-3">
                {apps.map((a:any) => {
                  const stepIdx = STATUS_STEPS.indexOf(a.status)
                  return (
                  <Card key={a.id} className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        a.status==='selected' ? 'bg-sage-100 text-sage-600' :
                        a.status==='rejected' ? 'bg-red-50 text-red-500' : 'bg-trust-50 text-trust-600'}`}>
                        {a.status==='rejected' ? <AlertCircle size={18}/> :
                         a.status==='selected' ? <CheckCircle size={18}/> : <Briefcase size={18}/>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-slate-800 text-sm">{a.job?.title || 'Job'}</p>
                          <Badge status={a.status} label={STATUS_LABELS[a.status] || a.status}/>
                        </div>
                        <div className="flex gap-3 text-xs text-slate-400 mb-3">
                          {a.job?.location && <span className="flex items-center gap-1"><MapPin size={10}/>{a.job.location}</span>}
                          <span>Applied {new Date(a.applied_at).toLocaleDateString('en-IN')}</span>
                        </div>
                        {stepIdx >= 0 && a.status !== 'rejected' && (
                          <div className="flex gap-1">
                            {STATUS_STEPS.map((step,i) => (
                              <div key={step} className={`h-1.5 flex-1 rounded-full transition-colors ${
                                i <= stepIdx ? 'bg-trust-600' : 'bg-slate-200'}`}/>
                            ))}
                          </div>
                        )}
                        {a.interview_date && a.status==='interview_scheduled' && (
                          <p className="text-xs text-saffron-700 font-medium mt-2">
                            🗓 Interview: {new Date(a.interview_date).toLocaleString('en-IN')}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                )})}
              </div>
            )}
          </div>
        </>}
      </div>
      <Footer />
    </div>
  )
}
