import { useEffect, useState } from 'react'
import { Briefcase, Plus, Check, X, Calendar, ChevronDown, ChevronUp } from 'lucide-react'
import AdminLayout from '@/components/layout/AdminLayout'
import { Badge, Button, Card, Spinner, EmptyState, StatsCard } from '@/components/ui'
import { jobsApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [apps, setApps] = useState<any[]>([])
  const [generalApps, setGeneralApps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'jobs'|'applications'|'general'>('applications')
  const [showNewJob, setShowNewJob] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')
  const [selectedApp, setSelectedApp] = useState<any>(null)
  const [interviewData, setInterviewData] = useState({ interview_date: '', interview_mode: 'online', interview_link: '', interviewer_name: '' })
  const [newJob, setNewJob] = useState({
    title: '',
    department: '',
    location: '',
    job_type: 'full-time',
    experience_min: 0,
    experience_max: '',
    salary_min: '',
    salary_max: '',
    description: '',
    requirements: '',
    responsibilities: '',
    skills_required: '',
    positions: 1,
    application_deadline: ''
  })
  const [saving, setSaving] = useState(false)
  const [editingJobId, setEditingJobId] = useState<string | null>(null)
  const [viewJob, setViewJob] = useState<any | null>(null)
  const [deletingJob, setDeletingJob] = useState<any | null>(null)
  const [designations, setDesignations] = useState<string[]>([])
  const [locations, setLocations] = useState<string[]>([])

  // const load = async () => {
  //   setLoading(true)
  //   try {
  //     const [jRes, aRes, gRes] = await Promise.allSettled([
  //       jobsApi.adminList(),
  //       jobsApi.adminApps({ limit: 100 }),
  //       jobsApi.adminGeneralList()
  //     ])
  //     if (jRes.status === 'fulfilled') setJobs(jRes.value.data.items || [])
  //     if (aRes.status === 'fulfilled') setApps(aRes.value.data.items || [])
  //     if (gRes.status === 'fulfilled') setGeneralApps(gRes.value.data.items || [])
  //   } catch { toast.error('Failed to load') }
  //   finally { setLoading(false) }
  // }
  // useEffect(() => { load() }, [])
  const load = async () => {
    setLoading(true)
    try {
      const [jRes, aRes, gRes] = await Promise.allSettled([
        jobsApi.adminList(),
        jobsApi.adminApps({ limit: 100 }),
        jobsApi.adminGeneralList()
      ])
      if (jRes.status === 'fulfilled') setJobs(jRes.value.data.items || [])
      if (aRes.status === 'fulfilled') setApps(aRes.value.data.items || [])
      if (gRes.status === 'fulfilled') setGeneralApps(gRes.value.data.items || [])
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  const fetchDesignations = async () => {
    try {
      const erpnextUrl = 'http://192.168.1.25:5100'
      const apiKey = '9ff88d537c92809'
      const apiSecret = '31a275388bce201'

      const res = await fetch(
        `${erpnextUrl}/api/resource/Designation?fields=["designation_name"]&limit_page_length=0`,
        { headers: { 'Authorization': `token ${apiKey}:${apiSecret}` } }
      )
      const data = await res.json()
      const names = (data.data || []).map((d: any) => d.designation_name).sort()
      setDesignations(names)
    } catch (err) {
      console.error('Failed to fetch designations:', err)
    }
  }

   const fetchLocations = async () => {
    try {
      const erpnextUrl = 'http://192.168.1.25:5100'
      const apiKey = '9ff88d537c92809'
      const apiSecret = '31a275388bce201'

      const res = await fetch(
        `${erpnextUrl}/api/resource/Branch?fields=["branch"]&limit_page_length=0`,
        { headers: { 'Authorization': `token ${apiKey}:${apiSecret}` } }
      )
      const data = await res.json()
      const names = (data.data || []).map((l: any) => l.branch).sort()
      setLocations(names)
    } catch (err) {
      console.error('Failed to fetch locations:', err)
    }
  }

  useEffect(() => { load(); fetchDesignations(); fetchLocations() }, [])

  const handleCloseModal = () => {
    setShowNewJob(false)
    setEditingJobId(null)
    setNewJob({
      title: '', department: '', location: '', job_type: 'full-time', experience_min: 0,
      experience_max: '', salary_min: '', salary_max: '', description: '', requirements: '',
      responsibilities: '', skills_required: '', positions: 1, application_deadline: ''
    })
  }

  const handleEditClick = (j: any) => {
    setEditingJobId(j.id)
    setNewJob({
      title: j.title || '',
      department: j.department || '',
      location: j.location || '',
      job_type: j.job_type || 'full-time',
      experience_min: j.experience_min || 0,
      experience_max: j.experience_max !== null && j.experience_max !== undefined ? String(j.experience_max) : '',
      salary_min: j.salary_min !== null && j.salary_min !== undefined ? String(j.salary_min) : '',
      salary_max: j.salary_max !== null && j.salary_max !== undefined ? String(j.salary_max) : '',
      description: j.description || '',
      requirements: j.requirements || '',
      responsibilities: j.responsibilities || '',
      skills_required: Array.isArray(j.skills_required) ? j.skills_required.join(', ') : (j.skills_required || ''),
      positions: j.positions || 1,
      application_deadline: j.application_deadline ? j.application_deadline.split('T')[0] : ''
    })
    setShowNewJob(true)
  }

  const handleDeleteJob = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete the job "${title}"? This will also delete all candidate applications associated with it.`)) {
      try {
        await jobsApi.delete(id)
        toast.success('Job deleted successfully')
        load()
      } catch (err: any) {
        toast.error(err?.response?.data?.detail || 'Failed to delete job')
      }
    }
  }

  const saveJob = async () => {
    if (!newJob.title || !newJob.location || !newJob.description || !newJob.requirements || !newJob.responsibilities) {
      toast.error('Fill all required fields'); return
    }
    setSaving(true)
    try {
      const skillsArray = newJob.skills_required
        ? newJob.skills_required.split(',').map(s => s.trim()).filter(Boolean)
        : []
      
      const payload = {
        ...newJob,
        experience_max: newJob.experience_max ? parseInt(newJob.experience_max) : null,
        salary_min: newJob.salary_min ? parseInt(newJob.salary_min) : null,
        salary_max: newJob.salary_max ? parseInt(newJob.salary_max) : null,
        skills_required: skillsArray.length > 0 ? skillsArray : null,
        application_deadline: newJob.application_deadline || null,
      }

      if (editingJobId) {
        await jobsApi.update(editingJobId, payload)
        toast.success('Job updated successfully!')
      } else {
        const createRes = await jobsApi.create(payload)
        const localJobId = createRes?.data?.job_id
        toast.success('Job posted!')
        // Post a Job entry in ERPNext
        try {
          const erpnextUrl = 'http://192.168.1.25:5100'
          const apiKey = '9ff88d537c92809'
          const apiSecret = '31a275388bce201'

          try {
            await fetch(`${erpnextUrl}/api/resource/Location`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `token ${apiKey}:${apiSecret}`,
              },
              body: JSON.stringify({ location_name: newJob.location }),
            })
          } catch (locErr) {}

          const erpPayload = {
            doctype: 'Job Opening',
            job_title: newJob.title,
            status: 'Open',
            company: 'Devkalp',
            designation: newJob.department, 
            employment_type: newJob.job_type,
            custom_positions: newJob.positions,
            location: newJob.location,
            description: newJob.description,
            custom_requirements: newJob.requirements,
            custom_responsibilities_: newJob.responsibilities,
            custom_required_skills: skillsArray.join(', '),
            custom_min_experience_year: newJob.experience_min || 0,
            custom_max_experience_year: newJob.experience_max ? parseInt(newJob.experience_max) : undefined,
            custom_min_salary: newJob.salary_min ? parseInt(newJob.salary_min) : undefined,
            custom_max_salary: newJob.salary_max ? parseInt(newJob.salary_max) : undefined,
            custom_application_deadline: newJob.application_deadline || undefined,
          }

          const erpRes = await fetch(`${erpnextUrl}/api/resource/Job Opening`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `token ${apiKey}:${apiSecret}`,
              'X-Frappe-CSRF-Token': 'fetch',
            },
            body: JSON.stringify(erpPayload),
          })
          const erpData = await erpRes.json()
          const erpnextJobId = erpData?.data?.name

          if (localJobId && erpnextJobId) {
            await jobsApi.update(localJobId, { erpnext_job_id: erpnextJobId })
          }
        } catch (erpErr) {
          console.error('ERPNext job entry failed:', erpErr)
        }
      }
      handleCloseModal()
      load()
    } catch (e:any) { toast.error(e?.response?.data?.detail || 'Failed') }
    finally { setSaving(false) }
  }

  const handleShortlist = async (appId: string, action: string, reason = '') => {
    try {
      await jobsApi.shortlist(appId, { action, reason })
      toast.success(`Candidate ${action}ed`)
      load()
    } catch { toast.error('Failed') }
  }

  const scheduleInterview = async () => {
    if (!selectedApp || !interviewData.interview_date) { toast.error('Set date and time'); return }
    setSaving(true)
    try {
      await jobsApi.scheduleInterview({ application_id: selectedApp.id, ...interviewData })
      toast.success('Interview scheduled! Candidate notified via email.')
      setSelectedApp(null)
      load()
    } catch { toast.error('Failed') }
    finally { setSaving(false) }
  }

  const filteredApps = filterStatus ? apps.filter(a => a.status === filterStatus) : apps
  const pendingCount = apps.filter(a => a.status === 'applied').length
  const interviewCount = apps.filter(a => a.status === 'interview_scheduled').length

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl text-trust-900">Jobs & Hiring</h1>
            <p className="text-slate-500 text-sm mt-0.5">Manage open positions and candidate pipeline.</p>
          </div>
          <Button size="sm" variant="secondary" onClick={() => { setEditingJobId(null); setShowNewJob(true); }}>
            <Plus size={15}/> Post Job
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard label="Open Jobs" value={jobs.filter(j=>j.status==='open').length} icon={<Briefcase size={17}/>} color="trust"/>
          <StatsCard label="Total Applications" value={apps.length} icon={<Briefcase size={17}/>} color="saffron"/>
          <StatsCard label="Pending Review" value={pendingCount} icon={<ChevronDown size={17}/>} color="saffron"/>
          <StatsCard label="Interviews Set" value={interviewCount} icon={<Calendar size={17}/>} color="sage"/>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {[
            { id: 'applications', label: 'applications', count: pendingCount },
            { id: 'jobs', label: 'jobs', count: 0 },
            { id: 'general', label: 'general resumes', count: generalApps.length }
          ].map(t => (
            <button key={t.id} onClick={()=>setTab(t.id as any)}
              className={clsx('px-5 py-2.5 rounded-xl text-sm font-medium capitalize transition-colors',
                tab===t.id ? 'bg-trust-800 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-trust-300')}>
              {t.label} {t.count > 0 && <span className="ml-1 bg-saffron-400 text-trust-900 text-xs font-bold px-1.5 py-0.5 rounded-full">{t.count}</span>}
            </button>
          ))}
        </div>

        {loading ? <div className="flex justify-center py-12"><Spinner size="lg"/></div> : (
          <>
            {tab === 'jobs' && (
              <div className="space-y-3">
                {jobs.length === 0 ? <EmptyState icon={<Briefcase size={22}/>} title="No jobs posted yet" action={<Button size="sm" onClick={() => { setEditingJobId(null); setShowNewJob(true); }}>Post First Job</Button>}/> :
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
                        <div className="flex gap-2 items-center flex-wrap">
                          <button onClick={() => setViewJob(j)}
                            className="text-xs px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg font-medium transition-colors">
                            View
                          </button>
                          <button onClick={() => handleEditClick(j)}
                            className="text-xs px-3 py-1.5 bg-trust-50 text-trust-700 hover:bg-trust-100 rounded-lg font-medium transition-colors">
                            Edit
                          </button>
                          <button onClick={()=>jobsApi.update(j.id,{status: j.status==='open'?'closed':'open'}).then(load)}
                            className={clsx('text-xs px-3 py-1.5 rounded-lg font-medium transition-colors',
                              j.status==='open' ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-sage-50 text-sage-700 hover:bg-sage-100')}>
                            {j.status==='open' ? 'Close' : 'Reopen'}
                          </button>
                          <button onClick={() => setDeletingJob(j)}
                            className="text-xs px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium transition-colors">
                            Delete
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

            {tab === 'general' && (
              <div className="space-y-3">
                {generalApps.length === 0 ? <EmptyState icon={<Briefcase size={22}/>} title="No general applications found"/> :
                  generalApps.map((a: any) => (
                    <Card key={a.id} className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-trust-100 text-trust-700 font-semibold flex items-center justify-center text-sm shrink-0">
                          {a.name?.[0]||'?'}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex items-center justify-between mb-0.5">
                            <p className="font-semibold text-slate-800 text-sm">{a.name}</p>
                            <span className="text-[10px] text-slate-400 font-medium">
                              Submitted {a.applied_at ? new Date(a.applied_at).toLocaleDateString('en-IN') : 'recently'}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-2 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                            <div>
                              <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Desired Title</p>
                              <p className="text-xs font-semibold text-slate-700">{a.desired_job_title}</p>
                            </div>
                            <div>
                              <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Preferred Department</p>
                              <p className="text-xs font-semibold text-slate-700">{a.department || 'Not Specified'}</p>
                            </div>
                            <div>
                              <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Experience & Salary</p>
                              <p className="text-xs font-semibold text-slate-700">
                                {a.experience_years} Yr{a.experience_years !== 1 ? 's' : ''} 
                                {a.expected_salary ? ` · ₹${a.expected_salary.toLocaleString('en-IN')}/mo` : ''}
                              </p>
                            </div>
                          </div>

                          <p className="text-xs text-slate-600 mt-1">
                            <strong className="text-slate-800 font-bold">Contact:</strong> {a.email} · {a.phone}
                          </p>

                          {a.skills && (
                            <p className="text-xs text-slate-500 mt-1.5">
                              <strong className="text-slate-800 font-bold">Skills:</strong> {a.skills}
                            </p>
                          )}

                          {a.notes && (
                            <p className="text-xs text-slate-500 mt-1.5 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                              "{a.notes}"
                            </p>
                          )}
                        </div>
                        
                        <div className="shrink-0">
                          {a.resume_url ? (
                            <a 
                              href={a.resume_url} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="text-xs px-3 py-1.5 bg-trust-800 text-white rounded-lg hover:bg-trust-700 transition-colors font-bold shadow-sm inline-block"
                            >
                              Download Resume
                            </a>
                          ) : (
                            <span className="text-xs text-slate-400 italic">No Resume</span>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                }
              </div>
            )}
          </>
        )}
      </div>

      {/* New Job Modal */}
      {showNewJob && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={handleCloseModal}>
          <div className="bg-white rounded-3xl shadow-float w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white rounded-t-3xl">
              <h2 className="font-display text-xl text-trust-900">{editingJobId ? 'Edit Job' : 'Post a Job'}</h2>
              <button onClick={handleCloseModal} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={16}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="label">Job Title *</label>
                <input className="input text-sm" placeholder="e.g. Community Health Worker" value={newJob.title} onChange={e=>setNewJob(d=>({...d,title:e.target.value}))}/>
              </div>
              <div>
                <label className="label">Department</label>
                <select className="input bg-white text-sm" value={newJob.department} onChange={e=>setNewJob(d=>({...d,department:e.target.value}))}>
                  <option value="">Select Department</option>
                  {designations.map(name => <option key={name} value={name}>{name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Location *</label>
                <select className="input bg-white text-sm" value={newJob.location} onChange={e=>setNewJob(d=>({...d,location:e.target.value}))}>
                  <option value="">Select Location</option>
                  {locations.map(name => <option key={name} value={name}>{name}</option>)}
                </select>
              </div>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label">Min Experience (Years)</label>
                  <input type="number" min="0" className="input text-sm" placeholder="0" value={newJob.experience_min} onChange={e=>setNewJob(d=>({...d,experience_min:+e.target.value}))}/>
                </div>
                <div>
                  <label className="label">Max Experience (Years)</label>
                  <input type="number" min="0" className="input text-sm" placeholder="Optional" value={newJob.experience_max} onChange={e=>setNewJob(d=>({...d,experience_max:e.target.value}))}/>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label">Min Salary (₹/month)</label>
                  <input type="number" min="0" className="input text-sm" placeholder="e.g. 20000" value={newJob.salary_min} onChange={e=>setNewJob(d=>({...d,salary_min:e.target.value}))}/>
                </div>
                <div>
                  <label className="label">Max Salary (₹/month)</label>
                  <input type="number" min="0" className="input text-sm" placeholder="e.g. 35000" value={newJob.salary_max} onChange={e=>setNewJob(d=>({...d,salary_max:e.target.value}))}/>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label">Application Deadline</label>
                  <input type="date" className="input text-sm" value={newJob.application_deadline} onChange={e=>setNewJob(d=>({...d,application_deadline:e.target.value}))}/>
                </div>
                <div>
                  <label className="label">Required Skills (Comma-separated)</label>
                  <input className="input text-sm" placeholder="e.g. React, Node.js, Git" value={newJob.skills_required} onChange={e=>setNewJob(d=>({...d,skills_required:e.target.value}))}/>
                </div>
              </div>
              {[{l:'Description *',k:'description',p:'Describe the role and impact...'},{l:'Requirements *',k:'requirements',p:'Education, experience, skills...'},{l:'Responsibilities *',k:'responsibilities',p:'Day-to-day duties...'}].map(f=>(
                <div key={f.k}>
                  <label className="label">{f.l}</label>
                  <textarea className="input resize-none text-sm" rows={3} placeholder={f.p} value={(newJob as any)[f.k]} onChange={e=>setNewJob(d=>({...d,[f.k]:e.target.value}))}/>
                </div>
              ))}
              <Button onClick={saveJob} loading={saving} className="w-full justify-center">
                {editingJobId ? 'Save Changes' : 'Post Job'}
              </Button>
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
              <Button onClick={scheduleInterview} loading={saving} className="w-full justify-center">
                <Calendar size={15}/> Schedule & Notify Candidate
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* View Job Modal */}
      {viewJob && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setViewJob(null)}>
          <div className="bg-white rounded-3xl shadow-float w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white rounded-t-3xl z-10">
              <h2 className="font-display text-xl text-trust-900">Job Details</h2>
              <button onClick={() => setViewJob(null)} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={16}/></button>
            </div>
            <div className="p-6 space-y-5 text-left">
              <div>
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Job Title</h3>
                <p className="text-base font-bold text-slate-800">{viewJob.title}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Department</h3>
                  <p className="text-sm font-semibold text-slate-700">{viewJob.department || 'Not Specified'}</p>
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Location</h3>
                  <p className="text-sm font-semibold text-slate-700">{viewJob.location}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Job Type</h3>
                  <p className="text-sm font-semibold text-slate-700 capitalize">{viewJob.job_type}</p>
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Positions</h3>
                  <p className="text-sm font-semibold text-slate-700">{viewJob.positions}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Experience Required</h3>
                  <p className="text-sm font-semibold text-slate-700">
                    {viewJob.experience_min}–{viewJob.experience_max || '5'}+ years
                  </p>
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Salary Range</h3>
                  <p className="text-sm font-semibold text-slate-700">
                    {viewJob.salary_min || viewJob.salary_max
                      ? `₹${viewJob.salary_min ? (viewJob.salary_min).toLocaleString('en-IN') : '0'} – ₹${viewJob.salary_max ? (viewJob.salary_max).toLocaleString('en-IN') : 'negotiable'}/mo`
                      : 'Not Specified'}
                  </p>
                </div>
              </div>
              {viewJob.application_deadline && (
                <div>
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Application Deadline</h3>
                  <p className="text-sm font-semibold text-red-600">
                    {new Date(viewJob.application_deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              )}
              {viewJob.skills_required && (
                <div>
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Required Skills</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {(Array.isArray(viewJob.skills_required) ? viewJob.skills_required : String(viewJob.skills_required).split(',')).map((s: string) => (
                      <span key={s} className="px-2.5 py-1 bg-trust-50 text-trust-800 text-xs font-bold rounded-lg border border-trust-100">{s.trim()}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="border-t border-slate-100 pt-4 space-y-4">
                <div>
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Description</h3>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line mt-1">{viewJob.description}</p>
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Requirements</h3>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line mt-1">{viewJob.requirements}</p>
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Responsibilities</h3>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line mt-1">{viewJob.responsibilities}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingJob && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setDeletingJob(null)}>
          <div className="bg-white rounded-3xl shadow-float w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600">
                <X size={24} />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-slate-800">Delete Position?</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Are you sure you want to delete <strong className="text-slate-800 font-bold">"{deletingJob.title}"</strong>?
                  This action is permanent and will delete all candidate applications for this role.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setDeletingJob(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all">
                  Cancel
                </button>
                <button onClick={async () => {
                  try {
                    await jobsApi.delete(deletingJob.id)
                    toast.success('Job deleted successfully')
                    setDeletingJob(null)
                    load()
                  } catch (err: any) {
                    toast.error(err?.response?.data?.detail || 'Failed to delete job')
                  }
                }}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all shadow-md">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
