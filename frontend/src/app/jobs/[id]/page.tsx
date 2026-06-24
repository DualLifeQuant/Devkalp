import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  MapPin, Briefcase, Clock, Users, ArrowLeft,
  CheckCircle, ChevronRight, Calendar, IndianRupee
} from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Button, Badge, Spinner } from '@/components/ui'
import { jobsApi } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, isLoggedIn } = useAuthStore()

  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ cover_letter: '', expected_salary: '', notice_period_days: '' })

  useEffect(() => {
    if (!id) return
    jobsApi.get(id)
      .then(r => setJob(r.data))
      .catch(() => navigate('/jobs'))
      .finally(() => setLoading(false))
  }, [id])

  const handleApply = async () => {
    if (!isLoggedIn) {
      toast.error('Please sign in to apply')
      navigate('/auth/login')
      return
    }
    if (user?.role !== 'candidate' && user?.role !== 'admin') {
      toast.error('Create a candidate account to apply for jobs')
      return
    }
    setApplying(true)
    try {
      await jobsApi.apply(id, {
        cover_letter: form.cover_letter || undefined,
        expected_salary: form.expected_salary ? parseInt(form.expected_salary) : undefined,
        notice_period_days: form.notice_period_days ? parseInt(form.notice_period_days) : undefined,
      })
      setApplied(true)
      setShowForm(false)
      toast.success('Application submitted! We\'ll be in touch.')
    } catch (e: any) {
      const msg = e?.response?.data?.detail
      if (msg?.includes('Already applied')) {
        toast.error('You have already applied for this position.')
        setApplied(true)
      } else {
        toast.error(msg || 'Failed to submit application')
      }
    } finally {
      setApplying(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center pt-16">
      <Spinner size="lg" />
    </div>
  )

  if (!job) return null

  const salaryRange = job.salary_min || job.salary_max
    ? `₹${job.salary_min ? (job.salary_min / 1000).toFixed(0) + 'K' : ''}${job.salary_max ? '–' + (job.salary_max / 1000).toFixed(0) + 'K' : ''}/mo`
    : null

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <Navbar />

      <div className="pt-24 pb-16">
        <div className="page-container max-w-5xl">

          {/* Back */}
          <Link to="/jobs" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-trust-700 transition-colors mb-6 mt-4">
            <ArrowLeft size={15} /> All Positions
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">

              {/* Header card */}
              <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-card">
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div>
                    <Badge status={job.status} className="mb-3" />
                    <h1 className="font-display text-3xl text-trust-900 leading-tight">{job.title}</h1>
                    {job.department && (
                      <p className="text-slate-500 mt-1 font-medium">{job.department}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-trust-500" /> {job.location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Briefcase size={14} className="text-trust-500" /> {job.job_type}
                  </span>
                  {salaryRange && (
                    <span className="flex items-center gap-1.5">
                      <IndianRupee size={14} className="text-trust-500" /> {salaryRange}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} className="text-trust-500" />
                    {job.experience_min}–{job.experience_max || '5'}+ yrs exp.
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users size={14} className="text-trust-500" />
                    {job.positions} position{job.positions > 1 ? 's' : ''}
                  </span>
                  {job.application_deadline && (
                    <span className="flex items-center gap-1.5 text-amber-600 font-medium">
                      <Calendar size={14} />
                      Deadline: {new Date(job.application_deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  )}
                </div>

                {job.skills_required?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-slate-100">
                    {job.skills_required.map((s: string) => (
                      <span key={s} className="px-3 py-1 bg-trust-50 text-trust-700 text-xs font-medium rounded-xl">{s}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-card">
                <h2 className="font-display text-xl text-trust-900 mb-4">About this Role</h2>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line text-sm">{job.description}</p>
              </div>

              {/* Responsibilities */}
              <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-card">
                <h2 className="font-display text-xl text-trust-900 mb-4">What You'll Do</h2>
                <div className="space-y-2.5">
                  {(job.responsibilities || '').split('\n').filter((l: string) => l.trim()).map((line: string, i: number) => (
                    <div key={i} className="flex items-start gap-3">
                      <ChevronRight size={14} className="text-saffron-500 mt-0.5 shrink-0" />
                      <p className="text-slate-600 text-sm leading-relaxed">{line.replace(/^[-•*]\s*/, '')}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Requirements */}
              <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-card">
                <h2 className="font-display text-xl text-trust-900 mb-4">What We're Looking For</h2>
                <div className="space-y-2.5">
                  {(job.requirements || '').split('\n').filter((l: string) => l.trim()).map((line: string, i: number) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle size={14} className="text-sage-500 mt-0.5 shrink-0" />
                      <p className="text-slate-600 text-sm leading-relaxed">{line.replace(/^[-•*]\s*/, '')}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">

              {/* Apply Card */}
              <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-card sticky top-24">
                <h3 className="font-display text-lg text-trust-900 mb-4">Apply for this Position</h3>

                {applied ? (
                  <div className="text-center py-4">
                    <CheckCircle size={32} className="text-sage-500 mx-auto mb-3" />
                    <p className="font-semibold text-slate-800 text-sm">Application Submitted!</p>
                    <p className="text-xs text-slate-500 mt-1 mb-4">We'll review your application and reach out soon.</p>
                    <Link to="/dashboard/jobs">
                      <Button size="sm" variant="ghost" className="w-full justify-center">View My Applications →</Button>
                    </Link>
                  </div>
                ) : job.status !== 'open' ? (
                  <div className="text-center py-4 text-slate-500 text-sm">
                    <p>This position is currently closed.</p>
                    <Link to="/jobs" className="text-trust-600 hover:underline text-sm mt-2 block">Browse open positions →</Link>
                  </div>
                ) : (
                  <>
                    {!showForm ? (
                      <Button onClick={() => setShowForm(true)} className="w-full justify-center" size="lg">
                        Apply Now →
                      </Button>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="label">Cover Letter</label>
                          <textarea
                            className="input resize-none text-sm"
                            rows={4}
                            placeholder="Tell us why you're a great fit for this role..."
                            value={form.cover_letter}
                            onChange={e => setForm(f => ({ ...f, cover_letter: e.target.value }))}
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="label">Expected Salary (₹/mo)</label>
                            <input
                              type="number"
                              className="input text-sm"
                              placeholder="35000"
                              value={form.expected_salary}
                              onChange={e => setForm(f => ({ ...f, expected_salary: e.target.value }))}
                            />
                          </div>
                          <div>
                            <label className="label">Notice Period (days)</label>
                            <input
                              type="number"
                              className="input text-sm"
                              placeholder="30"
                              value={form.notice_period_days}
                              onChange={e => setForm(f => ({ ...f, notice_period_days: e.target.value }))}
                            />
                          </div>
                        </div>
                        <Button
                          onClick={handleApply}
                          loading={applying}
                          className="w-full justify-center"
                          variant="secondary"
                        >
                          Submit Application
                        </Button>
                        <button
                          onClick={() => setShowForm(false)}
                          className="w-full text-xs text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                    {!isLoggedIn && (
                      <p className="text-xs text-center text-slate-400 mt-3">
                        <Link to="/auth/login" className="text-trust-600 hover:underline">Sign in</Link> or{' '}
                        <Link to="/auth/register" className="text-trust-600 hover:underline">create account</Link> to apply
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* About Devkalp Jobs */}
              <div className="bg-gradient-to-br from-trust-50 to-saffron-50 border border-trust-100 rounded-2xl p-5">
                <p className="font-semibold text-trust-800 text-sm mb-2">Why Work With Us</p>
                <div className="space-y-2">
                  {[
                    'Mission-driven, purpose-led work',
                    'Supportive, close-knit team culture',
                    'Direct community impact every day',
                    'Transparent hiring process',
                  ].map(p => (
                    <div key={p} className="flex items-start gap-2 text-xs text-slate-600">
                      <span className="text-saffron-500 mt-0.5">✦</span> {p}
                    </div>
                  ))}
                </div>
              </div>

              {/* Posted info */}
              <div className="text-xs text-slate-400 text-center">
                Posted {new Date(job.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
