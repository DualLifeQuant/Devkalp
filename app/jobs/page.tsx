'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, Briefcase, Clock, ChevronRight, Filter, X, Upload, Check, IndianRupee } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Badge, EmptyState } from '@/components/ui'
import { SkeletonList, InlineError } from '@/components/common/LoadingStates'
import { useAuthStore } from '@/lib/store'
import { useJobs } from '@/hooks/useApiQueries'
import { jobsApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

const JOB_TYPES = ['All', 'full-time', 'part-time', 'contract', 'internship']
const TYPE_COLORS: Record<string,string> = {
  'full-time':  'bg-trust-100 text-trust-700',
  'part-time':  'bg-saffron-100 text-saffron-700',
  'contract':   'bg-purple-100 text-purple-700',
  'internship': 'bg-sage-100 text-sage-700',
}

function SkeletonJob() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse">
      <div className="flex gap-4">
        <div className="w-12 h-12 bg-slate-200 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 rounded-full w-48" />
          <div className="h-3 bg-slate-200 rounded-full w-32" />
          <div className="flex gap-2 mt-2">
            {[60,80,70].map(w => <div key={w} className="h-5 bg-slate-200 rounded-lg" style={{width:w}} />)}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Apply Modal ─────────────────────────────────────────────── */
function ApplyModal({ job, onClose }: { job: any; onClose: () => void }) {
  const { user, isLoggedIn } = useAuthStore()
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    cover_letter: '',
    experience: '',
    expected_salary: '',
  })
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [submitted, setSubmitted] = useState(false)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 5 * 1024 * 1024) { toast.error('File must be under 5MB'); return }
    setFile(f)
  }

  const handleSubmit = async () => {
    if (!form.full_name || !form.email || !form.phone) { toast.error('Please fill name, email, and phone'); return }
    if (!isLoggedIn) { toast.error('Please sign in to apply'); return }
    setUploading(true)

    // Simulate progress
    const interval = setInterval(() => setUploadProgress(p => Math.min(p + 15, 85)), 200)

    try {
      await jobsApi.apply(job.id, {
        cover_letter: form.cover_letter || undefined,
        expected_salary: form.expected_salary ? parseInt(form.expected_salary) : undefined,
      })
      clearInterval(interval)
      setUploadProgress(100)
      setTimeout(() => setSubmitted(true), 400)
    } catch (e: any) {
      clearInterval(interval)
      setUploadProgress(0)
      const msg = e?.response?.data?.detail
      if (msg?.includes('Already applied')) { toast.error('Already applied for this position.') }
      else toast.error(msg || 'Failed to submit application')
    } finally {
      setUploading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white rounded-3xl shadow-float w-full max-w-lg max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {submitted ? (
          <div className="p-12 text-center">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}
              className="w-16 h-16 rounded-full bg-sage-100 flex items-center justify-center mx-auto mb-4">
              <Check size={28} className="text-sage-600" />
            </motion.div>
            <h2 className="font-display text-2xl text-trust-900 mb-2">Application Submitted!</h2>
            <p className="text-slate-500 text-sm max-w-xs mx-auto mb-6">
              Thank you for applying for <strong>{job.title}</strong>. We'll review your application and get in touch soon.
            </p>
            <button onClick={onClose} className="px-8 py-3 bg-trust-800 text-white rounded-xl text-sm font-semibold hover:bg-trust-700 transition-colors">
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="p-6 border-b border-slate-100 sticky top-0 bg-white rounded-t-3xl z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-xl text-trust-900">Apply for Position</h2>
                  <p className="text-xs text-slate-400 mt-0.5">{job.title} · {job.location}</p>
                </div>
                <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label">Full Name *</label>
                  <input className="input text-sm" placeholder="Your full name"
                    value={form.full_name} onChange={e => setForm(f => ({...f, full_name: e.target.value}))} />
                </div>
                <div>
                  <label className="label">Phone *</label>
                  <input type="tel" className="input text-sm" placeholder="+91 98765 43210"
                    value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} />
                </div>
              </div>
              <div>
                <label className="label">Email *</label>
                <input type="email" className="input text-sm" placeholder="your@email.com"
                  value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} />
              </div>
              <div>
                <label className="label">Years of Experience</label>
                <input className="input text-sm" placeholder="e.g. 2 years"
                  value={form.experience} onChange={e => setForm(f => ({...f, experience: e.target.value}))} />
              </div>
              <div>
                <label className="label">Expected Salary (₹/month)</label>
                <input type="number" className="input text-sm" placeholder="35000"
                  value={form.expected_salary} onChange={e => setForm(f => ({...f, expected_salary: e.target.value}))} />
              </div>

              {/* Resume Upload */}
              <div>
                <label className="label">Resume / CV</label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className={clsx(
                    'border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all duration-200',
                    file ? 'border-sage-400 bg-sage-50' : 'border-slate-200 hover:border-trust-400 hover:bg-trust-50/50'
                  )}
                >
                  <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFile} />
                  {file ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-sage-100 flex items-center justify-center">
                        <Check size={16} className="text-sage-600" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-slate-800 truncate max-w-48">{file.name}</p>
                        <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(0)} KB</p>
                      </div>
                      <button onClick={e => { e.stopPropagation(); setFile(null) }}
                        className="ml-auto p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <Upload size={24} className="text-slate-300 mx-auto" />
                      <p className="text-sm font-medium text-slate-600">Click to upload resume</p>
                      <p className="text-xs text-slate-400">PDF, DOC, DOCX · Max 5MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Cover Letter */}
              <div>
                <label className="label">Cover Letter (optional)</label>
                <textarea className="input resize-none text-sm" rows={3}
                  placeholder="Tell us why you're a great fit for this role..."
                  value={form.cover_letter} onChange={e => setForm(f => ({...f, cover_letter: e.target.value}))} />
              </div>

              {/* Upload Progress */}
              {uploading && (
                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                    <span>Submitting application…</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <motion.div className="h-2 rounded-full bg-trust-600"
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ duration: 0.3 }} />
                  </div>
                </div>
              )}

              <motion.button
                onClick={handleSubmit}
                disabled={uploading}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                className="w-full py-3.5 bg-trust-800 text-white text-sm font-bold rounded-xl hover:bg-trust-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {uploading ? 'Submitting…' : 'Submit Application →'}
              </motion.button>

              {!isLoggedIn && (
                <p className="text-xs text-center text-slate-400">
                  <Link href="/auth/login" className="text-trust-600 hover:underline font-medium">Sign in</Link> or{' '}
                  <Link href="/auth/register" className="text-trust-600 hover:underline font-medium">create account</Link> to apply
                </p>
              )}
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}

/* ── Main Page ─────────────────────────────────────────────── */
export default function JobsPage() {
  const [search, setSearch] = useState('')
  const [jobType, setJobType] = useState('All')
  const [applyJob, setApplyJob] = useState<any>(null)

  const { data, isLoading: loading, isError, refetch } = useJobs(
    jobType !== 'All' ? { limit: 30, job_type: jobType } : { limit: 30 }
  )
  const jobs: any[] = (data as any)?.items || []
  const total: number = (data as any)?.total || 0

  const filtered = jobs.filter(j =>
    !search ||
    (j.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (j.location || '').toLowerCase().includes(search.toLowerCase()) ||
    (j.department || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero */}
      <section className="bg-trust-900 pt-28 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage:'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',backgroundSize:'32px 32px'}} />
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-saffron-500/10 to-transparent" />
        <div className="page-container relative z-10">
          <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, ease:[0.22,1,0.36,1] }}>
            <p className="font-accent italic text-saffron-300 text-lg mb-2">Build a Career With Purpose</p>
            <h1 className="font-display text-4xl md:text-5xl font-semibold text-white mb-3">Careers at Devkalp</h1>
            <p className="text-white/60 max-w-xl text-base leading-relaxed mb-8 font-body">
              We don't just hire employees — we welcome mission-driven people from <strong className="text-white/80">Surat, Gujarat</strong> and beyond.
            </p>
            <div className="bg-white rounded-2xl p-2 flex gap-2 max-w-2xl shadow-float">
              <div className="flex-1 flex items-center gap-3 px-3">
                <Search size={18} className="text-slate-400" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search by role, location, or department…"
                  className="flex-1 py-2.5 text-sm text-slate-700 placeholder-slate-400 outline-none bg-transparent" />
                {search && (
                  <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600">
                    <X size={15} />
                  </button>
                )}
              </div>
              <button className="px-6 py-3 bg-trust-800 text-white text-sm font-semibold rounded-xl hover:bg-trust-700 transition-colors">
                Search
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="page-container py-12">
        <div className="flex flex-col md:flex-row gap-8">

          {/* Sidebar */}
          <aside className="md:w-60 shrink-0">
            <div className="bg-white rounded-2xl border border-slate-100 p-5 sticky top-24">
              <div className="flex items-center gap-2 mb-5">
                <Filter size={15} className="text-slate-500" />
                <p className="font-semibold text-slate-700 text-sm">Filter by Type</p>
              </div>
              <div className="space-y-1">
                {JOB_TYPES.map(t => (
                  <motion.button key={t} onClick={() => setJobType(t)}
                    whileTap={{ scale: 0.97 }}
                    className={clsx(
                      'w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium capitalize transition-all duration-150 flex items-center justify-between',
                      jobType === t ? 'bg-trust-800 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-trust-700'
                    )}>
                    <span>{t}</span>
                    {t !== 'All' && jobs.filter(j => j.job_type === t).length > 0 && (
                      <span className={clsx('text-xs px-1.5 py-0.5 rounded-md font-bold', jobType === t ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500')}>
                        {jobs.filter(j => j.job_type === t).length}
                      </span>
                    )}
                  </motion.button>
                ))}
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100">
                <p className="text-xs text-slate-400 mb-3 font-medium uppercase tracking-wide">Location</p>
                <div className="flex items-center gap-2 px-4 py-2.5 bg-trust-50 rounded-xl">
                  <MapPin size={13} className="text-trust-600 shrink-0" />
                  <span className="text-sm text-trust-700 font-medium">Surat, Gujarat</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Jobs list */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-slate-500 font-body">
                {loading ? 'Loading…' : <><strong className="text-slate-700">{filtered.length}</strong> of <strong className="text-slate-700">{total}</strong> positions</>}
              </p>
            </div>

            {isError && (
              <InlineError message="Failed to load jobs. Please try again." onRetry={() => refetch()} className="mb-4" />
            )}

            {loading ? (
              <div className="space-y-4"><SkeletonList count={5} /></div>
            ) : filtered.length === 0 ? (
              <EmptyState icon={<Briefcase size={24}/>} title="No positions found" description="Try adjusting your search or check back — new roles are posted regularly." />
            ) : (
              <div className="space-y-3">
                {filtered.map((job: any, i: number) => (
                  <motion.div key={job.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
                    className="bg-white rounded-2xl border border-slate-100 p-6 transition-all duration-200 group"
                  >
                    <div className="flex items-start gap-4">
                      {/* Job icon */}
                      <div className="w-12 h-12 rounded-xl bg-trust-50 flex items-center justify-center shrink-0 border border-trust-100">
                        <Briefcase size={20} className="text-trust-600" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-display text-lg text-trust-900 group-hover:text-trust-700 transition-colors leading-snug">
                              {job.title}
                            </h3>
                            <div className="flex items-center gap-3 text-sm text-slate-500 mt-1 flex-wrap font-body">
                              {job.department && <span className="flex items-center gap-1"><Briefcase size={12}/>{job.department}</span>}
                              <span className="flex items-center gap-1"><MapPin size={12}/>{job.location || 'Surat, Gujarat'}</span>
                              {job.application_deadline && (
                                <span className="flex items-center gap-1 text-amber-600"><Clock size={12}/>Due {new Date(job.application_deadline).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>
                              )}
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            {(job.salary_min || job.salary_max) && (
                              <p className="text-sm font-bold text-trust-800 flex items-center gap-0.5">
                                <IndianRupee size={12}/>
                                {job.salary_min ? `${(job.salary_min/1000).toFixed(0)}K` : ''}
                                {job.salary_max ? `–${(job.salary_max/1000).toFixed(0)}K` : ''}
                                <span className="font-normal text-slate-400 text-xs">/mo</span>
                              </p>
                            )}
                            <p className="text-xs text-slate-400 mt-0.5">{job.positions} open</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                          <span className={clsx('text-xs font-semibold px-2.5 py-1 rounded-lg capitalize', TYPE_COLORS[job.job_type] || 'bg-slate-100 text-slate-600')}>
                            {job.job_type}
                          </span>
                          {job.skills_required?.slice(0,3).map((s: string) => (
                            <span key={s} className="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg">{s}</span>
                          ))}
                          {(job.skills_required?.length || 0) > 3 && (
                            <span className="text-xs text-slate-400">+{job.skills_required.length - 3}</span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 mt-4">
                          <motion.button
                            onClick={() => setApplyJob(job)}
                            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                            className="px-5 py-2 bg-trust-800 text-white text-sm font-semibold rounded-xl hover:bg-trust-700 transition-colors"
                          >
                            Apply Now
                          </motion.button>
                          <Link href={`/jobs/${job.id}`}
                            className="px-5 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:border-trust-300 hover:text-trust-700 transition-colors flex items-center gap-1">
                            View Details <ChevronRight size={13}/>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      <AnimatePresence>
        {applyJob && <ApplyModal job={applyJob} onClose={() => setApplyJob(null)} />}
      </AnimatePresence>

      <Footer />
    </div>
  )
}
