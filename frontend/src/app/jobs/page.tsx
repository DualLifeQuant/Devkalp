import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, Briefcase, Clock, ChevronRight, Filter, X, Upload, Check, IndianRupee, Sparkles, TrendingUp, Heart, ShieldCheck, Building, Users, ArrowRight, HeartHandshake, Award, Zap, Bookmark, ExternalLink, FileText, Send, Share2, ChevronDown } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Badge, Spinner, EmptyState } from '@/components/ui'
import { jobsApi } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'
import VariableProximity from '@/components/ui/VariableProximity'
import Seo from '@/components/common/Seo'

const JOB_TYPES = ['All', 'full-time', 'part-time', 'contract', 'internship']
const TYPE_COLORS: Record<string, string> = {
  'full-time': 'bg-trust-100/80 text-trust-800 border border-trust-200/60 font-extrabold',
  'part-time': 'bg-saffron-100/80 text-saffron-800 border border-saffron-200/60 font-extrabold',
  'contract': 'bg-purple-100/80 text-purple-800 border border-purple-200/60 font-extrabold',
  'internship': 'bg-sage-100/80 text-sage-800 border border-sage-200/60 font-extrabold',
}

const MOCK_JOBS = [
  {
    id: 'job-1',
    title: 'Senior Community Outreach Lead',
    department: 'Community Development',
    location: 'Surat HQ, Gujarat (Hybrid)',
    job_type: 'full-time',
    salary_min: 45000,
    salary_max: 65000,
    positions: 2,
    application_deadline: '2026-06-30T00:00:00Z',
    skills_required: ['Community Organizing', 'Team Leadership', 'Gujarati & Hindi', 'Public Speaking', 'Program Management'],
    description: 'We are seeking an experienced Senior Community Outreach Lead to spearhead our grassroots development programs across Surat and rural Gujarat. You will collaborate closely with local municipal bodies, community elders, and volunteer networks to design and execute high-impact social welfare campaigns.',
    responsibilities: [
      'Lead a dedicated team of 15+ regional volunteers and field coordinators.',
      'Establish strategic partnerships with local NGOs, educational institutions, and healthcare providers.',
      'Monitor program metrics, assess community impact, and prepare quarterly executive transparency reports.',
      'Organize large-scale health camps, vocational training drives, and educational empowerment workshops.'
    ],
    benefits: ['100% Family Medical Insurance', 'Flexible Hybrid Working', '₹25,000 Annual Learning Stipend', 'Travel Allowance & Fuel Reimbursement'],
    urgency: 'Urgently hiring',
    matchScore: '98% Match',
    posted: 'Posted 1 day ago',
    isRemote: false,
  },
  {
    id: 'job-2',
    title: 'Healthcare Program Coordinator',
    department: 'Medical Initiatives',
    location: 'Surat HQ, Gujarat',
    job_type: 'full-time',
    salary_min: 38000,
    salary_max: 52000,
    positions: 3,
    application_deadline: '2026-06-25T00:00:00Z',
    skills_required: ['Healthcare Management', 'NGO Operations', 'Medical Camp Coordination', 'Budgeting'],
    description: 'The Healthcare Program Coordinator plays a pivotal role in organizing mobile medical dispensaries, specialized health camps, and preventive healthcare awareness campaigns in underserved neighborhoods of Surat.',
    responsibilities: [
      'Coordinate with volunteer doctors, nursing staff, and medical supply vendors.',
      'Manage end-to-end logistics for weekly mobile health clinics and diagnostic camps.',
      'Maintain rigorous patient care records and follow-up tracking databases.',
      'Conduct community health surveys to identify prevalent medical needs.'
    ],
    benefits: ['100% Family Medical Insurance', 'Accident Coverage', 'Free Annual Health Checkups', 'Mentorship from Senior Medical Professionals'],
    urgency: 'Hiring multiple candidates',
    matchScore: '95% Match',
    posted: 'Posted 3 days ago',
    isRemote: false,
  },
  {
    id: 'job-3',
    title: 'Rural Education Specialist',
    department: 'Education & Literacy',
    location: 'Surat District / Rural Gujarat',
    job_type: 'contract',
    salary_min: 35000,
    salary_max: 48000,
    positions: 4,
    application_deadline: '2026-07-15T00:00:00Z',
    skills_required: ['Curriculum Design', 'Child Psychology', 'Teacher Training', 'Gujarati Fluency'],
    description: 'Join our mission to bridge the educational divide in rural Gujarat. As a Rural Education Specialist, you will develop interactive learning modules, train local village educators, and implement digital literacy programs for primary and secondary school children.',
    responsibilities: [
      'Design culturally relevant, engaging curriculum materials for rural students.',
      'Conduct interactive training workshops for village teachers and Anganwadi workers.',
      'Implement tablet-based learning initiatives in remote community centers.',
      'Assess student learning outcomes and adapt teaching methodologies accordingly.'
    ],
    benefits: ['Accommodation & Boarding Support', 'Travel Stipend', 'Certificate of Commendation', 'Flexible Contract Terms'],
    urgency: 'High demand role',
    matchScore: '92% Match',
    posted: 'Posted 4 days ago',
    isRemote: false,
  },
  {
    id: 'job-4',
    title: 'Digital Marketing & Fundraising Officer',
    department: 'Communications & PR',
    location: 'Surat HQ, Gujarat (Remote Eligible)',
    job_type: 'full-time',
    salary_min: 40000,
    salary_max: 60000,
    positions: 1,
    application_deadline: '2026-06-20T00:00:00Z',
    skills_required: ['Digital Campaign Management', 'Donor Relations', 'Social Media Strategy', 'Content Writing', 'Analytics'],
    description: 'We are looking for a creative, results-driven Digital Marketing & Fundraising Officer to amplify Devkalp Foundation’s digital presence, manage crowdfunding campaigns, and engage our global donor community through compelling storytelling.',
    responsibilities: [
      'Strategize and execute multi-channel fundraising campaigns across social media and email newsletters.',
      'Create high-impact video narratives, infographics, and impact reports highlighting our ongoing projects.',
      'Cultivate relationships with corporate CSR heads, philanthropic foundations, and individual major donors.',
      'Optimize website conversion funnels and track campaign ROI using advanced web analytics.'
    ],
    benefits: ['Remote Work Flexibility', 'Performance-based Performance Bonuses', '₹30,000 Equipment & Learning Allowance', 'Comprehensive Health Insurance'],
    urgency: 'Urgently hiring',
    matchScore: '96% Match',
    posted: 'Posted 5 days ago',
    isRemote: true,
  },
  {
    id: 'job-5',
    title: 'Operations & Logistics Manager',
    department: 'Administration',
    location: 'Surat HQ, Gujarat',
    job_type: 'full-time',
    salary_min: 50000,
    salary_max: 70000,
    positions: 1,
    application_deadline: '2026-07-05T00:00:00Z',
    skills_required: ['Supply Chain Management', 'Vendor Negotiation', 'Facility Administration', 'Inventory Control'],
    description: 'The Operations & Logistics Manager oversees the smooth administrative functioning of our Surat headquarters and regional relief centers. You will manage procurement, inventory of relief materials, vehicle fleet logistics, and facility safety protocols.',
    responsibilities: [
      'Manage end-to-end supply chain for disaster relief materials, medical kits, and educational supplies.',
      'Negotiate favorable contracts with vendors, transport agencies, and maintenance contractors.',
      'Implement robust inventory tracking systems to ensure complete transparency and zero wastage.',
      'Oversee fleet management of mobile medical vans and outreach vehicles.'
    ],
    benefits: ['Executive Health Coverage', 'Company Provided Laptop & Phone', 'Annual Leadership Retreat', 'Fuel Reimbursement'],
    urgency: 'Critical position',
    matchScore: '91% Match',
    posted: 'Posted 1 week ago',
    isRemote: false,
  },
  {
    id: 'job-6',
    title: 'Social Work Research Intern',
    department: 'Research & Policy',
    location: 'Surat HQ, Gujarat',
    job_type: 'internship',
    salary_min: 15000,
    salary_max: 20000,
    positions: 6,
    application_deadline: '2026-07-31T00:00:00Z',
    skills_required: ['Data Collection', 'Qualitative Research', 'Survey Design', 'Report Writing', 'Empathy'],
    description: 'Gain invaluable grassroots experience by joining our Research & Policy division as a Social Work Research Intern. You will conduct field surveys, interview community beneficiaries, and assist senior researchers in publishing text studies on urban poverty and healthcare access.',
    responsibilities: [
      'Conduct structured door-to-door surveys and focus group discussions in target communities.',
      'Clean, tabulate, and analyze qualitative and quantitative field data.',
      'Assist in drafting policy briefs, grant proposals, and academic research papers.',
      'Participate in weekly mentorship seminars led by senior social scientists.'
    ],
    benefits: ['Monthly Stipend', 'Official Letter of Recommendation', 'Academic Internship Credit Support', 'Direct Field Mentorship'],
    urgency: 'Internship opportunity',
    matchScore: '89% Match',
    posted: 'Posted 1 week ago',
    isRemote: false,
  }
]

function SkeletonJob() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 animate-pulse shadow-2xs">
      <div className="flex gap-3">
        <div className="w-10 h-10 bg-slate-100 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2 pt-0.5">
          <div className="h-3.5 bg-slate-100 rounded-full w-40" />
          <div className="h-2.5 bg-slate-100 rounded-full w-28" />
          <div className="flex gap-1.5 pt-1">
            {[50, 70, 60].map(w => <div key={w} className="h-4 bg-slate-100 rounded-md" style={{ width: w }} />)}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Apply Modal (Indeed Quick Apply Style) ─────────────────────────────────────────────── */
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
      className="fixed inset-0 z-50 bg-trust-950/60 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white rounded-3xl shadow-float w-full max-w-lg max-h-[90vh] overflow-y-auto border border-slate-100 flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {submitted ? (
          <div className="p-10 text-center my-auto">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}
              className="w-16 h-16 rounded-full bg-sage-50 border border-sage-200 flex items-center justify-center mx-auto mb-5 shadow-sm">
              <Check size={32} className="text-sage-600 stroke-[3]" />
            </motion.div>
            <h2 className="font-display text-xl font-bold text-trust-900 mb-2">Application Submitted!</h2>
            <p className="text-slate-500 text-xs max-w-xs mx-auto mb-6 leading-relaxed">
              Thank you for applying for <strong className="text-trust-900 font-bold">{job.title}</strong>. Our hiring team will review your credentials and reach out soon.
            </p>
            <button onClick={onClose} className="px-8 py-3 bg-trust-900 text-white rounded-xl text-xs font-bold hover:bg-trust-800 transition-all shadow-md hover:shadow-lg">
              Return to Job Feed
            </button>
          </div>
        ) : (
          <>
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur-sm rounded-t-3xl z-10 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-extrabold text-trust-800 bg-trust-50 border border-trust-200 px-2.5 py-0.5 rounded-full mb-1 inline-block">Indeed Quick Apply</span>
                <h2 className="font-display text-lg font-bold text-trust-900">{job.title}</h2>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5 flex items-center gap-1">
                  <Building size={12} className="shrink-0 text-trust-600" /> Devkalp Foundation · {job.location || 'Surat, Gujarat'}
                </p>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors border border-slate-100 shadow-2xs">
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">Full Name *</label>
                  <input className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:border-trust-400 focus:ring-2 focus:ring-trust-100 transition-all" placeholder="Your full name"
                    value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">Phone *</label>
                  <input type="tel" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:border-trust-400 focus:ring-2 focus:ring-trust-100 transition-all" placeholder="+91 98765 43210"
                    value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">Email *</label>
                <input type="email" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:border-trust-400 focus:ring-2 focus:ring-trust-100 transition-all" placeholder="your@email.com"
                  value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">Years of Experience</label>
                  <input className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:border-trust-400 focus:ring-2 focus:ring-trust-100 transition-all" placeholder="e.g. 3 years"
                    value={form.experience} onChange={e => setForm(f => ({ ...f, experience: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">Expected Salary (₹/mo)</label>
                  <input type="number" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:border-trust-400 focus:ring-2 focus:ring-trust-100 transition-all" placeholder="45000"
                    value={form.expected_salary} onChange={e => setForm(f => ({ ...f, expected_salary: e.target.value }))} />
                </div>
              </div>

              {/* Resume Upload */}
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">Resume / CV *</label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className={clsx(
                    'border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all duration-200 group',
                    file ? 'border-sage-400 bg-sage-50/50 shadow-inner' : 'border-slate-200 hover:border-trust-400 hover:bg-trust-50/30 shadow-2xs'
                  )}
                >
                  <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFile} />
                  {file ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-sage-100 flex items-center justify-center border border-sage-200 shrink-0">
                        <Check size={16} className="text-sage-600 stroke-[3]" />
                      </div>
                      <div className="text-left min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate max-w-[180px]">{file.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{(file.size / 1024).toFixed(0)} KB · Ready to submit</p>
                      </div>
                      <button onClick={e => { e.stopPropagation(); setFile(null) }}
                        className="ml-auto p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors border border-transparent hover:border-red-100">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 group-hover:bg-trust-50 border border-slate-100 group-hover:border-trust-200 flex items-center justify-center mx-auto transition-colors">
                        <Upload size={18} className="text-slate-400 group-hover:text-trust-600 transition-colors" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-700 group-hover:text-trust-900 transition-colors">Click to upload your resume</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">PDF, DOC, DOCX (Max 5MB)</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Cover Letter */}
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">Cover Letter (optional)</label>
                <textarea className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:border-trust-400 focus:ring-2 focus:ring-trust-100 transition-all resize-none" rows={2}
                  placeholder="Tell us why you are passionate about Devkalp's community mission..."
                  value={form.cover_letter} onChange={e => setForm(f => ({ ...f, cover_letter: e.target.value }))} />
              </div>

              {/* Upload Progress */}
              {uploading && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex justify-between text-[11px] text-slate-600 font-bold mb-1.5">
                    <span>Transmitting secure application data…</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <motion.div className="h-full bg-trust-800 rounded-full"
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ duration: 0.3 }} />
                  </div>
                </div>
              )}

              <motion.button
                onClick={handleSubmit}
                disabled={uploading}
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-trust-900 text-white text-xs font-bold rounded-xl hover:bg-trust-800 transition-all shadow-md hover:shadow-lg disabled:opacity-60 flex items-center justify-center gap-2 mt-3"
              >
                {uploading ? <Spinner size="sm" /> : <><Sparkles size={14} className="text-saffron-300" /> Submit Application</>}
              </motion.button>

              {!isLoggedIn && (
                <p className="text-[11px] text-center text-slate-500 font-medium pt-2 border-t border-slate-100">
                  <Link to="/auth/login" className="text-trust-800 font-bold hover:underline">Sign in</Link> or{' '}
                  <Link to="/auth/register" className="text-trust-800 font-bold hover:underline">create an account</Link> to apply instantly
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
  const navigate = useNavigate()
  const containerRef = useRef<HTMLElement>(null)
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchWhat, setSearchWhat] = useState('')
  const [searchWhere, setSearchWhere] = useState('')
  const [jobType, setJobType] = useState('All')
  const [quickFilter, setQuickFilter] = useState('all')
  const [total, setTotal] = useState(0)
  const [applyJob, setApplyJob] = useState<any>(null)
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [savedJobs, setSavedJobs] = useState<string[]>([])
  const [showGeneralApply, setShowGeneralApply] = useState(false)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        const res = await jobsApi.list({ limit: 30, job_type: jobType !== 'All' ? jobType : undefined })
        if (!cancelled) {
          const fetched = res.data.items || []
          setJobs(fetched)
          setTotal(res.data.total || 0)
          if (fetched.length > 0 && !selectedJob) {
            setSelectedJob(fetched[0])
          }
        }
      } catch {
        if (!cancelled) {
          setJobs(MOCK_JOBS)
          setTotal(MOCK_JOBS.length)
          if (!selectedJob) setSelectedJob(MOCK_JOBS[0])
        }
      }
      finally { if (!cancelled) setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [jobType])

  const toggleSaveJob = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSavedJobs(prev => prev.includes(id) ? prev.filter(j => j !== id) : [...prev, id])
    toast.success(savedJobs.includes(id) ? 'Job removed from saved list' : 'Job saved to your profile')
  }

  // Filter logic combining What, Where, Job Type, and Indeed Quick Filters
  const filtered = jobs.filter(j => {
    const matchWhat = !searchWhat || (j.title || '').toLowerCase().includes(searchWhat.toLowerCase()) || (j.department || '').toLowerCase().includes(searchWhat.toLowerCase()) || (j.description || '').toLowerCase().includes(searchWhat.toLowerCase())
    const matchWhere = !searchWhere || (j.location || '').toLowerCase().includes(searchWhere.toLowerCase())

    let matchQuick = true
    if (quickFilter === 'remote') matchQuick = j.isRemote || (j.location || '').toLowerCase().includes('remote') || (j.location || '').toLowerCase().includes('hybrid')
    if (quickFilter === 'high-salary') matchQuick = (j.salary_min || 0) >= 40000 || (j.salary_max || 0) >= 55000
    if (quickFilter === 'urgent') matchQuick = !!j.urgency

    return matchWhat && matchWhere && matchQuick
  })

  // Ensure selectedJob remains valid
  useEffect(() => {
    if (filtered.length > 0) {
      if (!selectedJob || !filtered.find(j => j.id === selectedJob.id)) {
        setSelectedJob(filtered[0])
      }
    } else {
      setSelectedJob(null)
    }
  }, [filtered, selectedJob])

  const scrollToFeed = () => {
    const el = document.getElementById('jobs-feed-section')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <Seo
        title="Jobs &amp; Careers"
        description="Browse open job opportunities and livelihood support programs offered through Devkalp Foundation."
        path="/jobs"
      />
      <Navbar transparent />

      {/* ── BREATHTAKING FULL-SCREEN INDEED-STYLE CINEMATIC HERO ───────────────────────────────────────────── */}
      <section ref={containerRef} className="relative min-h-screen flex items-center justify-center bg-trust-950 overflow-hidden pt-20 pb-12">
        {/* Background Image & Gradient Overlays */}
        <div className="absolute inset-0">
          <img src="jobs.jpg" alt="Devkalp Team Collaboration" className="w-full h-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-b from-trust-950/92 via-trust-950/85 to-trust-950/98" />
        </div>
        {/* Subtle Ambient Glowing Orbs */}
        <motion.div
          animate={{
            x: [0, 15, -10, 0],
            y: [0, -20, 10, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 right-10 w-96 h-96 bg-saffron-500/15 rounded-full blur-3xl pointer-events-none animate-pulse"
        />
        <motion.div
          animate={{
            x: [0, -10, 15, 0],
            y: [0, 20, -10, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-10 left-1/4 w-96 h-96 bg-trust-400/15 rounded-full blur-3xl pointer-events-none"
        />
        <div className="absolute inset-0 bg-hero-pattern opacity-10" />

        <div className="page-container relative z-10 w-full max-w-5xl mx-auto text-center px-4">
          {/* Headline */}
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.12] mb-6 tracking-tight">
            <VariableProximity
              label="Find Your Next Role at"
              containerRef={containerRef}
              fromFontVariationSettings="'wght' 700, 'opsz' 9"
              toFontVariationSettings="'wght' 1000, 'opsz' 40"
              radius={150}
              falloff="linear"
            />{' '}
            <span className="text-saffron-300 italic font-light">
              <VariableProximity
                label="Devkalp Foundation"
                containerRef={containerRef}
                fromFontVariationSettings="'wght' 300, 'opsz' 9"
                toFontVariationSettings="'wght' 800, 'opsz' 40"
                radius={150}
                falloff="linear"
              />
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            className="text-white/80 text-base sm:text-lg leading-relaxed mb-10 max-w-2xl mx-auto font-body">
            Explore verified social welfare, medical, educational, and administrative opportunities in <strong className="text-white font-bold">Surat, Gujarat</strong> and make a tangible grassroots impact.
          </motion.p>

          {/* Premium Indeed-Style Dual Input Search Bar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.45 }}
            className="bg-white/95 backdrop-blur-md rounded-2xl p-2 sm:p-2.5 shadow-2xl border border-white/20 flex flex-col md:flex-row items-center gap-1.5 max-w-4xl mx-auto w-full">

            {/* What Input */}
            <div className="w-full md:flex-1 flex items-center gap-3 px-4 py-2.5 bg-slate-50 md:bg-transparent rounded-xl md:rounded-none border-b md:border-b-0 md:border-r border-slate-200/80">
              <Search size={20} className="text-trust-800 shrink-0" />
              <div className="flex-1 text-left">
                <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-0.5">What</label>
                <input value={searchWhat} onChange={e => setSearchWhat(e.target.value)}
                  placeholder="Job title, keywords, or department..."
                  className="w-full text-sm text-slate-800 placeholder-slate-400 outline-none bg-transparent font-medium" />
              </div>
              {searchWhat && (
                <button onClick={() => setSearchWhat('')} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Where Input */}
            <div className="w-full md:flex-1 flex items-center gap-3 px-4 py-2.5 bg-slate-50 md:bg-transparent rounded-xl md:rounded-none">
              <MapPin size={20} className="text-trust-800 shrink-0" />
              <div className="flex-1 text-left">
                <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-0.5">Where</label>
                <input value={searchWhere} onChange={e => setSearchWhere(e.target.value)}
                  placeholder="Surat, Gujarat, or Remote..."
                  className="w-full text-sm text-slate-800 placeholder-slate-400 outline-none bg-transparent font-medium" />
              </div>
              {searchWhere && (
                <button onClick={() => setSearchWhere('')} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Action Button */}
            <button onClick={scrollToFeed} className="w-full md:w-auto px-9 py-3.5 bg-trust-900 text-white text-sm font-bold rounded-xl hover:bg-trust-800 transition-all shadow-md hover:shadow-lg shrink-0 flex items-center justify-center gap-2 mt-2 md:mt-0">
              <Sparkles size={16} className="text-saffron-300" /> Find Jobs
            </button>
          </motion.div>

          {/* Quick Stats / Trust Signals */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.6 }}
            className="flex items-center justify-center gap-8 mt-6 text-xs text-white/80 flex-wrap font-medium">
            <span className="flex items-center gap-1.5"><Check size={14} className="text-saffron-300 stroke-[3]" /> Verified Direct Employer</span>
            <span className="flex items-center gap-1.5"><Check size={14} className="text-saffron-300 stroke-[3]" /> No External Agency Fees</span>
            <span className="flex items-center gap-1.5"><Check size={14} className="text-saffron-300 stroke-[3]" /> Quick Apply Enabled</span>
          </motion.div>
        </div>

        {/* Bouncing Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          onClick={scrollToFeed}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/60 hover:text-white transition-colors cursor-pointer z-20"
        >
          <span className="text-[11px] font-bold tracking-widest uppercase">Explore Job Feed</span>
          <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-md">
            <ChevronDown size={16} className="text-white" />
          </div>
        </motion.div>
      </section>

      {/* ── ULTRA-COMPACT INDEED-STYLE QUICK FILTER BAR ───────────────────────────────────────────── */}
      <section id="jobs-feed-section" className="bg-white border-b border-slate-200/80 sticky top-16 z-30 shadow-2xs py-2.5 transition-all">
        <div className="page-container flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto py-0.5">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mr-1.5 shrink-0 flex items-center gap-1">
              <Filter size={11} className="text-trust-800" /> Filters:
            </span>
            {[
              { id: 'all', label: 'All Positions', icon: null },
              { id: 'remote', label: 'Remote / Hybrid', icon: <Zap size={10} className="text-amber-500 fill-amber-500" /> },
              { id: 'high-salary', label: '₹40K+ / month', icon: <IndianRupee size={10} className="text-emerald-600" /> },
              { id: 'urgent', label: 'Urgently Hiring', icon: <Clock size={10} className="text-red-500" /> },
            ].map(f => {
              const active = quickFilter === f.id
              return (
                <button key={f.id} onClick={() => setQuickFilter(f.id)}
                  className={clsx(
                    'relative px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors duration-200 flex items-center gap-1 border shrink-0 z-10',
                    active
                      ? 'text-white border-transparent font-extrabold shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-trust-300 hover:text-slate-900 shadow-2xs'
                  )}>
                  {active && (
                    <motion.span
                      layoutId="activeQuickFilterBg"
                      className="absolute inset-0 bg-trust-900 rounded-lg -z-10"
                      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    />
                  )}
                  {f.icon}
                  {f.label}
                </button>
              )
            })}

            {/* Job Type Pills */}
            <div className="h-3 w-[1px] bg-slate-200 mx-1 shrink-0 hidden sm:block" />
            {JOB_TYPES.filter(t => t !== 'All').map(t => (
              <button key={t} onClick={() => setJobType(jobType === t ? 'All' : t)}
                className={clsx(
                  'px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition-all duration-150 border shrink-0',
                  jobType === t
                    ? 'bg-trust-100 text-trust-900 border-trust-300 shadow-2xs font-extrabold scale-105'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 shadow-2xs'
                )}>
                {t}
              </button>
            ))}
          </div>

          {/* Results Count */}
          <div className="text-[11px] text-slate-500 font-medium shrink-0 ml-auto">
            Showing <strong className="text-trust-900 font-bold">{filtered.length}</strong> matching jobs
          </div>
        </div>
      </section>

      {/* ── COMPACT INDEED TWO-COLUMN SPLIT FEED & LIVE PREVIEW (FIXED IN VIEWPORT) ───────────────────────────────────────────── */}
      <section className="py-5 page-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

          {/* ── LEFT COLUMN: COMPACT INDEED JOB FEED CARDS (5 COLUMNS) ── */}
          <div className="lg:col-span-5 space-y-2.5">
            {/* General Resume Drop Box Callout (Pinned at Top of Feed for Maximum Visibility) */}
            <div className="bg-gradient-to-br from-trust-900 via-trust-950 to-trust-900 rounded-2xl p-5 text-white border border-trust-850 shadow-md flex flex-col gap-3 text-left">
              <div>
                <h4 className="font-display text-sm font-bold text-white flex items-center gap-1.5">
                  💼 Can't find your match?
                </h4>
                <p className="text-xs text-trust-200 leading-relaxed font-body mt-1">
                  Submit your resume and specify your desired job criteria. We will contact you as soon as a suitable position opens up.
                </p>
              </div>
              <Link
                to="/contact?type=careers"
                className="px-4 py-2 bg-saffron-400 text-trust-950 text-[11px] font-extrabold rounded-xl hover:bg-saffron-300 transition-all text-center block w-full"
              >
                Drop Your Resume Here
              </Link>
            </div>

            {/* Employer Recruitment Request Callout (Pinned at Top of Feed for Maximum Visibility) */}
            <div className="bg-gradient-to-br from-trust-50 to-saffron-50/30 rounded-2xl p-5 text-slate-700 border border-trust-100 shadow-sm flex flex-col gap-3 text-left">
              <div>
                <h4 className="font-display text-sm font-bold text-trust-900 flex items-center gap-1.5">
                  💼 Hiring? Post Job Availabilities
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed font-body mt-1">
                  Are you an employer looking for candidates? Submit your recruitment needs, and we'll display them to our network.
                </p>
              </div>
              <Link
                to="/contact?type=recruitment"
                className="px-4 py-2.5 bg-trust-900 hover:bg-trust-800 text-white text-[11px] font-extrabold rounded-xl transition-all text-center inline-block shadow-md"
              >
                Post Job Availability
              </Link>
            </div>

            {loading ? (
              <div className="space-y-2.5">{Array.from({ length: 4 }).map((_, i) => <SkeletonJob key={i} />)}</div>
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center shadow-card my-3">
                <Briefcase size={24} className="text-slate-300 mx-auto mb-2" />
                <h3 className="font-display text-base font-bold text-trust-900 mb-1">No matching jobs found</h3>
                <p className="text-slate-500 text-[11px] mb-4 leading-relaxed">Try adjusting your keywords, location, or clearing the quick filters to see more roles.</p>
                <button onClick={() => { setSearchWhat(''); setSearchWhere(''); setQuickFilter('all'); setJobType('All') }} className="px-4 py-2 bg-trust-900 text-white text-xs font-bold rounded-xl hover:bg-trust-800 transition-all shadow-md">
                  Clear All Filters
                </button>
              </div>
            ) : (
              filtered.map((job: any) => {
                const isSelected = selectedJob?.id === job.id
                const isSaved = savedJobs.includes(job.id)

                return (
                  <motion.div key={job.id}
                    onClick={() => setSelectedJob(job)}
                    whileHover={{ scale: 1.01 }}
                    className={clsx(
                      'bg-white rounded-2xl p-4 transition-all duration-200 cursor-pointer border text-left relative overflow-hidden group shadow-card hover:shadow-card-hover flex flex-col justify-between',
                      isSelected ? 'border-trust-900 ring-2 ring-trust-900/10 bg-gradient-to-br from-white via-trust-50/20 to-trust-50/40 shadow-sm' : 'border-slate-200/80 hover:border-trust-300'
                    )}
                  >
                    {/* Top Row: Company & Saved Icon */}
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-lg bg-trust-900 text-white flex items-center justify-center font-display font-bold text-[11px] shadow-2xs">
                          D
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-trust-900 flex items-center gap-1">
                            Devkalp Foundation <ShieldCheck size={11} className="text-trust-600 shrink-0" />
                          </p>
                          <p className="text-[9px] text-slate-500 font-medium">{job.location || 'Surat HQ, Gujarat'}</p>
                        </div>
                      </div>
                      <button onClick={(e) => toggleSaveJob(job.id, e)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-trust-800 transition-colors">
                        <Bookmark size={14} className={clsx(isSaved && 'fill-trust-800 text-trust-800')} />
                      </button>
                    </div>

                    {/* Job Title */}
                    <h3 className="font-display text-sm sm:text-base font-bold text-trust-950 group-hover:text-trust-800 transition-colors leading-snug mb-1.5">
                      {job.title}
                    </h3>

                    {/* Pills Row: Salary, Type, Urgency */}
                    <div className="flex items-center gap-1 flex-wrap mb-2.5">
                      {(job.salary_min || job.salary_max) && (
                        <span className="bg-trust-50 border border-trust-100 text-trust-900 text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-2xs flex items-center gap-0.5">
                          <IndianRupee size={10} className="text-trust-700" />
                          {job.salary_min ? `${(job.salary_min / 1000).toFixed(0)}K` : ''}
                          {job.salary_max ? `–${(job.salary_max / 1000).toFixed(0)}K` : ''} /mo
                        </span>
                      )}
                      <span className={clsx('text-[8px] px-1.5 py-0.5 rounded-md uppercase tracking-wider shadow-2xs font-extrabold', TYPE_COLORS[job.job_type] || 'bg-slate-100 text-slate-600')}>
                        {job.job_type}
                      </span>
                      {job.urgency && (
                        <span className="bg-red-50 border border-red-200 text-red-700 text-[8px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider shadow-2xs flex items-center gap-0.5">
                          <Zap size={8} className="fill-red-700" /> {job.urgency}
                        </span>
                      )}
                      {(job.experience_min !== undefined || job.experience_max) && (
                        <span className="bg-slate-50 border border-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-2xs">
                          💼 {job.experience_min || 0}{job.experience_max ? `–${job.experience_max}` : '+'} yrs exp
                        </span>
                      )}
                    </div>

                    {/* Bullet Highlights */}
                    <div className="space-y-1 mb-3 text-[10px] text-slate-600 font-medium">
                      <p className="line-clamp-2 leading-relaxed">
                        • {job.description}
                      </p>
                      {job.skills_required?.slice(0, 2).map((skill: string) => (
                        <p key={skill} className="truncate text-slate-500">
                          • <strong className="text-slate-700 font-bold">Required skill:</strong> {skill}
                        </p>
                      ))}
                    </div>

                    {/* Bottom Row: Match Score & Posted Date */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[9px] font-medium text-slate-400">
                      <span className="flex items-center gap-1 bg-saffron-50 border border-saffron-200 text-saffron-800 font-extrabold px-1.5 py-0.5 rounded shadow-2xs">
                        ✨ {job.matchScore || '95% Match'}
                      </span>
                      <span>{job.posted || 'Posted recently'}</span>
                    </div>
                  </motion.div>
                )
              })
            )}

            {/* General Resume Drop Box Callout */}
            <div className="bg-gradient-to-br from-trust-900 via-trust-950 to-trust-900 rounded-2xl p-5 text-white border border-trust-800 shadow-md flex flex-col gap-3 mt-4 text-left">
              <div>
                <h4 className="font-display text-sm font-bold text-white flex items-center gap-1.5">
                  💼 Can't find your match?
                </h4>
                <p className="text-xs text-trust-200 leading-relaxed font-body mt-1">
                  Submit your resume and specify your desired job criteria. We will contact you as soon as a suitable position opens up.
                </p>
              </div>
              <button
                onClick={() => setShowGeneralApply(true)}
                className="px-4 py-2 bg-saffron-400 text-trust-950 text-[11px] font-extrabold rounded-xl hover:bg-saffron-300 transition-all text-center"
              >
                Drop Your Resume Here
              </button>
            </div>
          </div>

          {/* ── RIGHT COLUMN: COMPACT INDEED LIVE JOB PREVIEW PANE (FIXED IN VIEWPORT / 7 COLUMNS) ── */}
          <div className="lg:col-span-7 sticky top-24 h-[calc(100vh-110px)] max-h-[880px]">
            {selectedJob ? (
              <motion.div
                key={selectedJob.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xl overflow-hidden flex flex-col h-full"
              >
                {/* Sticky Preview Header (Ultra-Compact) */}
                <div className="p-4 bg-white border-b border-slate-100 shrink-0 z-10 shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="font-display text-lg sm:text-xl font-bold text-trust-950 leading-tight truncate">
                      {selectedJob.title}
                    </h2>
                    {/* Share / Save / Apply Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button onClick={(e) => toggleSaveJob(selectedJob.id, e)} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-trust-800 transition-colors shadow-2xs">
                        <Bookmark size={14} className={clsx(savedJobs.includes(selectedJob.id) && 'fill-trust-800 text-trust-800')} />
                      </button>
                      <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Job link copied to clipboard!') }} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-trust-800 transition-colors shadow-2xs">
                        <Share2 size={14} />
                      </button>
                      <motion.button
                        onClick={() => navigate(`/contact?type=careers&job_title=${encodeURIComponent(selectedJob.title)}&department=${encodeURIComponent(selectedJob.department || '')}`)}
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        className="px-4 py-1.5 bg-trust-900 text-white text-xs font-bold rounded-lg hover:bg-trust-800 transition-all shadow-md flex items-center gap-1.5"
                      >
                        <Sparkles size={12} className="text-saffron-300" /> Quick Apply
                      </motion.button>
                    </div>
                  </div>

                  {/* Compact Metadata Row */}
                  <div className="flex items-center gap-2.5 text-[11px] text-slate-600 font-medium flex-wrap pt-0.5">
                    <span className="text-[9px] font-extrabold text-trust-800 bg-trust-50 border border-trust-200 px-2 py-0.5 rounded uppercase tracking-wider shadow-2xs shrink-0">Devkalp Insights</span>
                    <span className="flex items-center gap-1 font-bold text-trust-900 shrink-0">
                      <Building size={12} className="text-trust-600" /> Devkalp Foundation
                    </span>
                    <span className="text-slate-300 hidden sm:inline">•</span>
                    <span className="flex items-center gap-1 text-slate-500 shrink-0">
                      <MapPin size={12} className="text-slate-400" /> {selectedJob.location || 'Surat HQ, Gujarat'}
                    </span>
                    <span className="text-slate-300 hidden sm:inline">•</span>
                    {(selectedJob.salary_min || selectedJob.salary_max) && (
                      <span className="bg-trust-50 text-trust-900 px-2 py-0.5 rounded font-extrabold flex items-center gap-0.5 border border-trust-100 shadow-2xs shrink-0">
                        <IndianRupee size={10} className="text-trust-700" />
                        {selectedJob.salary_min ? `${(selectedJob.salary_min / 1000).toFixed(0)}K` : ''}
                        {selectedJob.salary_max ? `–${(selectedJob.salary_max / 1000).toFixed(0)}K` : ''} /mo
                      </span>
                    )}
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold capitalize border border-slate-200/80 shadow-2xs shrink-0">
                      {selectedJob.job_type}
                    </span>
                    {(selectedJob.experience_min !== undefined || selectedJob.experience_max) && (
                      <>
                        <span className="text-slate-300 hidden sm:inline">•</span>
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold border border-slate-200/80 shadow-2xs shrink-0 flex items-center gap-1">
                          <Briefcase size={10} />
                          {selectedJob.experience_min || 0}
                          {selectedJob.experience_max ? `–${selectedJob.experience_max}` : '+'} yrs exp
                        </span>
                      </>
                    )}
                    {selectedJob.application_deadline && (
                      <>
                        <span className="text-slate-300 hidden sm:inline">•</span>
                        <span className="text-red-600 font-bold shrink-0 flex items-center gap-1">
                          <Clock size={11} />
                          Deadline: {new Date(selectedJob.application_deadline).toLocaleDateString('en-IN')}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Scrollable Preview Body */}
                <div className="p-5 sm:p-7 overflow-y-auto space-y-7 flex-1">
                  {/* Job Match Callout */}
                  <div className="bg-gradient-to-r from-saffron-50/90 via-saffron-50/50 to-transparent border-l-4 border-saffron-500 p-4 rounded-r-2xl shadow-2xs">
                    <p className="text-xs font-display font-bold text-trust-950 flex items-center gap-1.5 mb-1">
                      <Sparkles size={14} className="text-saffron-600 fill-saffron-600" /> Profile Match: {selectedJob.matchScore || '95% Match'}
                    </p>
                    <p className="text-xs text-slate-700 leading-relaxed font-body">Your skills match the primary requirements for this role at Devkalp Foundation. Applying early increases your chance of selection.</p>
                  </div>

                  {/* Full Job Description */}
                  <div>
                    <h3 className="font-display text-sm font-bold text-trust-950 mb-2.5 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                      <FileText size={16} className="text-trust-800" /> Full Job Description
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-body whitespace-pre-line">
                      {selectedJob.description}
                    </p>
                  </div>

                  {/* Responsibilities */}
                  {selectedJob.responsibilities && (
                    <div>
                      <h3 className="font-display text-sm font-bold text-trust-950 mb-2.5 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                        <Check size={16} className="text-trust-800 stroke-[3]" /> Role Responsibilities
                      </h3>
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 sm:p-5">
                        {Array.isArray(selectedJob.responsibilities) ? (
                          <ul className="space-y-3">
                            {selectedJob.responsibilities.map((r: string, idx: number) => (
                              <li key={idx} className="text-xs sm:text-sm text-slate-700 flex items-start gap-2.5 leading-relaxed font-body">
                                <div className="w-5 h-5 rounded-lg bg-trust-100 text-trust-800 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                                  {idx + 1}
                                </div>
                                <span className="flex-1">{r}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-body whitespace-pre-line">
                            {selectedJob.responsibilities}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Requirements */}
                  {selectedJob.requirements && (
                    <div>
                      <h3 className="font-display text-sm font-bold text-trust-950 mb-2.5 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                        <Award size={16} className="text-trust-800" /> Job Requirements
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-body bg-slate-50 border border-slate-100 rounded-2xl p-4 sm:p-5 whitespace-pre-line">
                        {selectedJob.requirements}
                      </p>
                    </div>
                  )}

                  {/* Qualifications & Skills */}
                  {selectedJob.skills_required && (
                    <div>
                      <h3 className="font-display text-sm font-bold text-trust-950 mb-2.5 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                        <Award size={16} className="text-trust-800" /> Qualifications & Skills Required
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(selectedJob.skills_required) ? (
                          selectedJob.skills_required.map((skill: string) => (
                            <span key={skill} className="text-xs font-bold px-3.5 py-1.5 bg-trust-50 border border-trust-200/60 text-trust-900 rounded-xl shadow-2xs flex items-center gap-1.5">
                              <Check size={12} className="text-trust-700 stroke-[3]" /> {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs font-bold px-3.5 py-1.5 bg-trust-50 border border-trust-200/60 text-trust-900 rounded-xl shadow-2xs flex items-center gap-1.5">
                            <Check size={12} className="text-trust-700 stroke-[3]" /> {selectedJob.skills_required}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Benefits & Perks */}
                  <div>
                    <h3 className="font-display text-sm font-bold text-trust-950 mb-2.5 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                      <HeartHandshake size={16} className="text-trust-800" /> Devkalp Foundation Benefits & Perks
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {selectedJob.benefits?.map((benefit: string, idx: number) => (
                        <div key={idx} className="p-3 bg-gradient-to-br from-white to-trust-50/40 border border-trust-100 rounded-xl flex items-center gap-2.5 shadow-2xs hover:border-trust-200 transition-colors">
                          <div className="w-6 h-6 rounded-lg bg-trust-900 text-white flex items-center justify-center shrink-0 shadow-2xs">
                            <Check size={12} className="stroke-[3]" />
                          </div>
                          <span className="text-xs font-bold text-trust-950">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Company Overview */}
                  <div className="pt-6 border-t border-slate-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-trust-900 text-white flex items-center justify-center font-display font-bold text-base shadow-sm">
                        D
                      </div>
                      <div>
                        <h4 className="font-display text-sm font-bold text-trust-950">Devkalp Foundation</h4>
                        <p className="text-xs text-slate-500 font-medium">Empowering Communities · Surat HQ, Gujarat</p>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4 font-body">
                      Devkalp Foundation is a premier non-profit organization dedicated to healthcare empowerment, educational advancement, and holistic grassroots community development across Gujarat.
                    </p>
                    <div className="flex items-center gap-4 text-xs font-bold text-trust-800">
                      <Link to="/about" className="hover:underline flex items-center gap-1">Learn more <ExternalLink size={12} /></Link>
                      <Link to="/campaigns" className="hover:underline flex items-center gap-1">Active campaigns <ExternalLink size={12} /></Link>
                    </div>
                  </div>

                  {/* Non-Sticky Inline Application Footer (Flows Naturally at Bottom of Content) */}
                  <div className="p-6 bg-gradient-to-br from-trust-900 via-trust-950 to-trust-900 rounded-2xl text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 border border-trust-800">
                    <div className="text-center sm:text-left">
                      <p className="font-display text-base font-bold text-white mb-1">Ready to make an impact?</p>
                      <p className="text-xs text-trust-200 font-medium">Submit your resume in 60 seconds with Indeed Quick Apply.</p>
                    </div>
                    <motion.button
                      onClick={() => navigate(`/contact?type=careers&job_title=${encodeURIComponent(selectedJob.title)}&department=${encodeURIComponent(selectedJob.department || '')}`)}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className="px-6 py-3 bg-saffron-400 text-trust-950 text-xs font-extrabold rounded-xl hover:bg-saffron-300 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 shrink-0 w-full sm:w-auto"
                    >
                      <Sparkles size={14} className="text-trust-950" /> Apply Now
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center shadow-card h-full flex flex-col items-center justify-center">
                <Briefcase size={28} className="text-slate-300 mb-2" />
                <h3 className="font-display text-base font-bold text-trust-900 mb-1">Select a job to view details</h3>
                <p className="text-slate-500 text-[11px] max-w-xs leading-relaxed">Click on any job card from the left feed to see the full role description, responsibilities, and benefits.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Apply Modal */}
      <AnimatePresence>
        {applyJob && <ApplyModal job={applyJob} onClose={() => setApplyJob(null)} />}
      </AnimatePresence>

      {/* General Apply Modal */}
      <AnimatePresence>
        {showGeneralApply && <GeneralApplyModal onClose={() => setShowGeneralApply(false)} />}
      </AnimatePresence>

      <Footer />
    </div>
  )
}


/* ── General Apply Modal Component ───────────────────────────────────────── */
interface GeneralApplyModalProps {
  onClose: () => void;
}

function GeneralApplyModal({ onClose }: GeneralApplyModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    desired_job_title: '',
    department: 'Health Programs',
    experience_years: 0,
    expected_salary: '',
    skills: '',
    notes: '',
  })
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.phone || !formData.desired_job_title || !file) {
      toast.error('Please fill in all required fields and upload your resume')
      return
    }

    setSubmitting(true)
    try {
      // 1. Upload Resume
      setUploading(true)
      const form = new FormData()
      form.append('file', file)
      const uploadRes = await jobsApi.uploadGeneralResume(form)
      const resumeUrl = uploadRes.data.resume_url
      setUploading(false)

      // 2. Submit Application
      await jobsApi.submitGeneral({
        ...formData,
        experience_years: Number(formData.experience_years),
        expected_salary: formData.expected_salary ? parseInt(formData.expected_salary) : undefined,
        resume_url: resumeUrl,
      })

      toast.success('Your application has been submitted successfully!')
      onClose()
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to submit application')
    } finally {
      setUploading(false)
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white rounded-t-3xl z-10">
          <div className="text-left">
            <h2 className="font-display text-xl font-bold text-trust-900 flex items-center gap-2">
              <Briefcase size={20} className="text-trust-800" /> General Application
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">Tell us what you're looking for and upload your resume.</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={16} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label text-slate-700 font-semibold text-xs mb-1 block">Full Name *</label>
              <input
                required
                className="input text-sm w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-trust-500"
                placeholder="John Doe"
                value={formData.name}
                onChange={e => setFormData(d => ({ ...d, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="label text-slate-700 font-semibold text-xs mb-1 block">Email *</label>
              <input
                required
                type="email"
                className="input text-sm w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-trust-500"
                placeholder="john@example.com"
                value={formData.email}
                onChange={e => setFormData(d => ({ ...d, email: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label text-slate-700 font-semibold text-xs mb-1 block">Phone Number *</label>
              <input
                required
                type="tel"
                className="input text-sm w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-trust-500"
                placeholder="e.g. +91 9876543210"
                value={formData.phone}
                onChange={e => setFormData(d => ({ ...d, phone: e.target.value }))}
              />
            </div>
            <div>
              <label className="label text-slate-700 font-semibold text-xs mb-1 block">Desired Job Title *</label>
              <input
                required
                className="input text-sm w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-trust-500"
                placeholder="e.g. Full Stack Developer"
                value={formData.desired_job_title}
                onChange={e => setFormData(d => ({ ...d, desired_job_title: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label text-slate-700 font-semibold text-xs mb-1 block">Department</label>
              <select
                className="input text-sm w-full border border-slate-200 bg-white rounded-xl p-2.5 outline-none focus:border-trust-500"
                value={formData.department}
                onChange={e => setFormData(d => ({ ...d, department: e.target.value }))}
              >
                {['Health Programs', 'Education Programs', 'Grassroots Dev', 'Administration', 'IT Support', 'Social Work', 'Other'].map(dep => (
                  <option key={dep} value={dep}>{dep}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label text-slate-700 font-semibold text-xs mb-1 block">Experience (Years)</label>
              <input
                type="number"
                min="0"
                className="input text-sm w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-trust-500"
                value={formData.experience_years}
                onChange={e => setFormData(d => ({ ...d, experience_years: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <label className="label text-slate-700 font-semibold text-xs mb-1 block">Expected Salary (₹/mo)</label>
              <input
                type="number"
                min="0"
                className="input text-sm w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-trust-500"
                placeholder="Optional"
                value={formData.expected_salary}
                onChange={e => setFormData(d => ({ ...d, expected_salary: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="label text-slate-700 font-semibold text-xs mb-1 block">Key Skills / Area of Expertise</label>
            <input
              className="input text-sm w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-trust-500"
              placeholder="e.g. React, public health outreach, team coordination"
              value={formData.skills}
              onChange={e => setFormData(d => ({ ...d, skills: e.target.value }))}
            />
          </div>

          <div>
            <label className="label text-slate-700 font-semibold text-xs mb-1 block">Resume / CV (PDF, DOC, JPEG, PNG) *</label>
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:border-trust-500 transition-colors relative cursor-pointer bg-slate-50/50">
              <input
                type="file"
                required
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={e => setFile(e.target.files?.[0] || null)}
              />
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 rounded-full bg-trust-50 text-trust-800 flex items-center justify-center mx-auto">
                  <Upload size={18} className="text-trust-600" />
                </div>
                {file ? (
                  <p className="text-xs font-bold text-trust-900">{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</p>
                ) : (
                  <>
                    <p className="text-xs font-bold text-slate-700">Click to upload or drag & drop</p>
                    <p className="text-[10px] text-slate-400">PDF, DOC, DOCX, JPEG, PNG up to 10MB</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="label text-slate-700 font-semibold text-xs mb-1 block">Brief Statement / Job Criteria Notes</label>
            <textarea
              rows={3}
              className="input text-sm w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-trust-500 resize-none"
              placeholder="Describe your ideal role, availability, and how you wish to contribute..."
              value={formData.notes}
              onChange={e => setFormData(d => ({ ...d, notes: e.target.value }))}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 font-extrabold text-sm rounded-2xl shadow-md bg-trust-900 text-white hover:bg-trust-800 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
