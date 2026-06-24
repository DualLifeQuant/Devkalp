'use client'
import { useState } from 'react'
import { Briefcase, Plus, Check, X, Calendar, ChevronDown, ChevronUp } from 'lucide-react'
import AdminLayout from '@/components/layout/AdminLayout'
import { Badge, Button, Card, EmptyState, StatsCard } from '@/components/ui'
import { SkeletonList, SkeletonStats, InlineError } from '@/components/common/LoadingStates'
import { useAuthGuard } from '@/hooks/useAuthGuard'
import {
  useAdminJobs, useAdminApplications,
  useCreateJob, useShortlistApplication, useScheduleInterview,
} from '@/hooks/useApiQueries'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

export default function AdminJobsPage() {
  useAuthGuard({ allowedRoles: ['admin'] })

  const [tab, setTab] = useState<'jobs'|'applications'>('applications')
  const [showNewJob, setShowNewJob] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')
  const [selectedApp, setSelectedApp] = useState<any>(null)
  const [interviewData, setInterviewData] = useState({ interview_date: '', interview_mode: 'online', interview_link: '', interviewer_name: '' })
  const [newJob, setNewJob] = useState({ title: '', department: '', location: '', job_type: 'full-time', experience_min: 0, description: '', requirements: '', responsibilities: '', positions: 1 })

  const { data: jobs = [], isLoading: jobsLoading, isError: jobsError, refetch: refetchJobs } = useAdminJobs()
  const { data: apps = [], isLoading: appsLoading, isError: appsError, refetch: refetchApps } = useAdminApplications({ limit: 100 })
  const loading = jobsLoading || appsLoading

  const createJobMutation = useCreateJob()
  const shortlistMutation = useShortlistApplication()
  const scheduleInterviewMutation = useScheduleInterview()

  const createJob = async () => {
    if (!newJob.title || !newJob.location || !newJob.description || !newJob.requirements || !newJob.responsibilities) {
      toast.error('Fill all required fields'); return
    }
    try {
      await createJobMutation.mutateAsync(newJob)
      toast.success('Job posted!')
      setShowNewJob(false)
      setNewJob({ title:'', department:'', location:'', job_type:'full-time', experience_min:0, description:'', requirements:'', responsibilities:'', positions:1 })
    } catch (e:any) { toast.error(e?.response?.data?.detail || 'Failed') }
  }

  const handleShortlist = async (appId: string, action: string, reason = '') => {
    try {
      await shortlistMutation.mutateAsync({ id: appId, data: { action, reason } })
      toast.success(`Candidate ${action}ed`)
    } catch { toast.error('Failed') }
  }

  const scheduleInterview = async () => {
    if (!selectedApp || !interviewData.interview_date) { toast.error('Set date and time'); return }
    try {
      await scheduleInterviewMutation.mutateAsync({ application_id: selectedApp.id, ...interviewData })
      toast.success('Interview scheduled! Candidate notified via email.')
      setSelectedApp(null)
    } catch { toast.error('Failed') }
  }

  const filteredApps = filterStatus ? (apps as any[]).filter(a => a.status === filterStatus) : (apps as any[])
  const pendingCount = (apps as any[]).filter(a => a.status === 'applied').length
  const interviewCount = (apps as any[]).filter(a => a.status === 'interview_scheduled').length

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl text-trust-900">Jobs & Hiring</h1>
            <p className="text-slate-500 text-sm mt-0.5">Manage open positions and candidate pipeline.</p>
          </div>
          <Button size="sm" variant="secondary" onClick={() => setShowNewJob(true)}>
            <Plus size={15}/> Post Job
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard label="Open Jobs" value={(jobs as any[]).filter((j:any)=>j.status==='open').length} icon={<Briefcase size={17}/>} color="trust"/>
          <StatsCard label="Total Applications" value={(apps as any[]).length} icon={<Briefcase size={17}/>} color="saffron"/>
          <StatsCard label="Pending Review" value={pendingCount} icon={<ChevronDown size={17}/>} color="saffron"/>
          <StatsCard label="Interviews Set" value={interviewCount} icon={<Calendar size={17}/>} color="sage"/>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {(['applications','jobs'] as const).map(t => (
            <button key={t} onClick={()=>setTab(t)}
              className={clsx('px-5 py-2.5 rounded-xl text-sm font-medium capitalize transition-colors',
                tab===t ? 'bg-trust-800 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-trust-300')}>
              {t} {t==='applications' && pendingCount > 0 && <span className="ml-1 bg-saffron-400 text-trust-900 text-xs font-bold px-1.5 py-0.5 rounded-full">{pendingCount}</span>}
            </button>
          ))}
        </div>

        {loading ? <div className="space-y-4"><SkeletonStats count={4}/><SkeletonList count={4}/></div> : (
          <>
            {tab === 'jobs' && (
              <div className="space-y-3">
                {jobs.length === 0 ? <EmptyState icon={<Briefcase size={22}/>} title="No jobs posted yet" action={<Button size="sm" onClick={()=>setShowNewJob(true)}>Post First Job</Button>}/> :
                  jobs.map((j:any) => (
                    <Card key={j.id} className="p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-slate-800">{j.title}</p>
                            <Badge status={j.status}/>
                          </div>
                          <p className="text-xs text-slate-400">{j.location} · {j.job_type} · {j.positions} position{j.positions>1?'s':''}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{apps.filter(a=>a.job_title===j.title).length} applications received</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => jobsApi.update(j.id, {status: j.status==='open'?'closed':'open'}).then(() => refetchJobs()).catch(() => toast.error('Failed'))}
                            className={clsx('text-xs px-3 py-1.5 rounded-lg font-medium transition-colors',
                              j.status==='open' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-sage-50 text-sage-700 hover:bg-sage-100')}>
                            {j.status==='open' ? 'Close' : 'Reopen'}
                          </button>
                        </div>
                      </div>
                    </Card>
                  ))
                }
              </div>
            )}

            {tab === 'applications' && (
              <div>
                {/* Status filter */}
                <div className="flex gap-2 mb-4 flex-wrap">
                  {['','applied','shortlisted','interview_scheduled','selected','rejected'].map(s => (
                    <button key={s} onClick={()=>setFilterStatus(s)}
                      className={clsx('px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors',
                        filterStatus===s ? 'bg-trust-800 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-trust-300')}>
                      {s || 'All'} {!s && `(${apps.length})`}
                    </button>
                  ))}
                </div>
                {filteredApps.length === 0 ? <EmptyState icon={<Briefcase size={22}/>} title="No applications found"/> :
                  <div className="space-y-3">
                    {filteredApps.map((a:any) => (
                      <Card key={a.id} className="p-5">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-trust-100 text-trust-700 font-semibold flex items-center justify-center text-sm shrink-0">
                            {a.candidate_name?.[0]||'?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <p className="font-semibold text-slate-800 text-sm">{a.candidate_name}</p>
                              <Badge status={a.status}/>
                            </div>
                            <p className="text-xs text-slate-500">For: <span className="font-medium">{a.job_title}</span></p>
                            <p className="text-xs text-slate-400 mt-0.5">{a.candidate_email} · Applied {new Date(a.applied_at).toLocaleDateString('en-IN')}</p>
                            {a.cover_letter && <p className="text-xs text-slate-500 mt-1 line-clamp-1 italic">"{a.cover_letter}"</p>}
                          </div>
                          <div className="flex flex-col gap-1.5 shrink-0">
                            {a.status === 'applied' && (
                              <button onClick={()=>handleShortlist(a.id,'shortlist')}
                                className="text-xs px-3 py-1.5 bg-trust-800 text-white rounded-lg hover:bg-trust-700 transition-colors">
                                Shortlist
                              </button>
                            )}
                            {a.status === 'shortlisted' && (
                              <button onClick={()=>setSelectedApp(a)}
                                className="text-xs px-3 py-1.5 bg-sage-500 text-white rounded-lg hover:bg-sage-600 transition-colors flex items-center gap-1">
                                <Calendar size={12}/> Schedule
                              </button>
                            )}
                            {a.status === 'interview_scheduled' && (
                              <>
                                <button onClick={()=>handleShortlist(a.id,'select')}
                                  className="text-xs px-3 py-1.5 bg-sage-500 text-white rounded-lg hover:bg-sage-600 flex items-center gap-1">
                                  <Check size={12}/> Select
                                </button>
                                <button onClick={()=>handleShortlist(a.id,'reject')}
                                  className="text-xs px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                                  Reject
                                </button>
                              </>
                            )}
                            {a.resume_url && (
                              <a href={a.resume_url} target="_blank" rel="noopener noreferrer"
                                className="text-xs px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg hover:border-trust-300 text-center">
                                Resume
                              </a>
                            )}
                          </div>
                        </div>
                        {a.interview_date && (
                          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 flex gap-4">
                            <span>📅 {new Date(a.interview_date).toLocaleString('en-IN')}</span>
                            <span>📱 {a.interview_mode}</span>
                            {a.interview_link && <a href={a.interview_link} target="_blank" className="text-trust-600 hover:underline">Join Link →</a>}
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                }
              </div>
            )}
          </>
        )}
      </div>

      {/* New Job Modal */}
      {showNewJob && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={()=>setShowNewJob(false)}>
          <div className="bg-white rounded-3xl shadow-float w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white rounded-t-3xl">
              <h2 className="font-display text-xl text-trust-900">Post a Job</h2>
              <button onClick={()=>setShowNewJob(false)} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={16}/></button>
            </div>
            <div className="p-6 space-y-4">
              {[{l:'Job Title *',k:'title',p:'e.g. Community Health Worker'},{l:'Department',k:'department',p:'e.g. Health Programs'},{l:'Location *',k:'location',p:'Surat, Gujarat'}].map(f=>(
                <div key={f.k}>
                  <label className="label">{f.l}</label>
                  <input className="input text-sm" placeholder={f.p} value={(newJob as any)[f.k]} onChange={e=>setNewJob(d=>({...d,[f.k]:e.target.value}))}/>
                </div>
              ))}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label">Job Type</label>
                  <select className="input bg-white text-sm" value={newJob.job_type} onChange={e=>setNewJob(d=>({...d,job_type:e.target.value}))}>
                    {['full-time','part-time','contract','internship'].map(t=><option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Positions</label>
                  <input type="number" min="1" className="input text-sm" value={newJob.positions} onChange={e=>setNewJob(d=>({...d,positions:+e.target.value}))}/>
                </div>
              </div>
              {[{l:'Description *',k:'description',p:'Describe the role and impact...'},{l:'Requirements *',k:'requirements',p:'Education, experience, skills...'},{l:'Responsibilities *',k:'responsibilities',p:'Day-to-day duties...'}].map(f=>(
                <div key={f.k}>
                  <label className="label">{f.l}</label>
                  <textarea className="input resize-none text-sm" rows={3} placeholder={f.p} value={(newJob as any)[f.k]} onChange={e=>setNewJob(d=>({...d,[f.k]:e.target.value}))}/>
                </div>
              ))}
              <Button onClick={createJob} loading={createJobMutation.isPending} className="w-full justify-center">Post Job</Button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Interview Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={()=>setSelectedApp(null)}>
          <div className="bg-white rounded-3xl shadow-float w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 sticky top-0 bg-white rounded-t-3xl">
              <h2 className="font-display text-xl text-trust-900">Schedule Interview</h2>
              <p className="text-xs text-slate-400 mt-0.5">{selectedApp.candidate_name} · {selectedApp.job_title}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="label">Date & Time *</label>
                <input type="datetime-local" className="input text-sm" value={interviewData.interview_date}
                  onChange={e=>setInterviewData(d=>({...d,interview_date:e.target.value}))}/>
              </div>
              <div>
                <label className="label">Mode</label>
                <select className="input bg-white text-sm" value={interviewData.interview_mode}
                  onChange={e=>setInterviewData(d=>({...d,interview_mode:e.target.value}))}>
                  <option value="online">Online (Video Call)</option>
                  <option value="in-person">In-Person</option>
                  <option value="phone">Phone Call</option>
                </select>
              </div>
              <div>
                <label className="label">Link / Venue</label>
                <input className="input text-sm" placeholder="Google Meet link or venue address"
                  value={interviewData.interview_link} onChange={e=>setInterviewData(d=>({...d,interview_link:e.target.value}))}/>
              </div>
              <div>
                <label className="label">Interviewer Name</label>
                <input className="input text-sm" placeholder="Name of the interviewer"
                  value={interviewData.interviewer_name} onChange={e=>setInterviewData(d=>({...d,interviewer_name:e.target.value}))}/>
              </div>
              <Button onClick={scheduleInterview} loading={createJobMutation.isPending} className="w-full justify-center">
                <Calendar size={15}/> Schedule & Notify Candidate
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
