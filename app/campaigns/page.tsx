'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Leaf, Calendar, MapPin, Users, ArrowRight, Search } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Button, EmptyState } from '@/components/ui'
import { SkeletonGrid, InlineError } from '@/components/common/LoadingStates'
import { useCampaigns, useRegisterForCampaign } from '@/hooks/useApiQueries'
import { journey } from '@/lib/analytics'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

const CATEGORIES = ['All','health','education','environment','community']
const CAT_META: Record<string,{label:string;color:string;bg:string}> = {
  health:      { label:'Health',      color:'text-red-700',    bg:'bg-red-100'   },
  education:   { label:'Education',   color:'text-trust-700',  bg:'bg-trust-100' },
  environment: { label:'Environment', color:'text-sage-700',   bg:'bg-sage-100'  },
  community:   { label:'Community',   color:'text-warm-700',   bg:'bg-warm-100'  },
}

const HERO_IMGS = [
  'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1200&q=80',
]

export default function CampaignsPage() {
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [regModal, setRegModal] = useState<any>(null)
  const [regForm, setRegForm] = useState({ name:'', email:'', phone:'', organization:'' })

  const params = category !== 'All' ? { limit: 30, category } : { limit: 30 }
  const { data, isLoading: loading, isError, refetch } = useCampaigns(params)
  const campaigns: any[] = (data as any)?.items || []
  const registerMutation = useRegisterForCampaign()

  const filtered = campaigns.filter(c =>
    !search || (c.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.short_description || '').toLowerCase().includes(search.toLowerCase())
  )

  const register = async () => {
    if (!regForm.name || !regForm.email || !regForm.phone) { toast.error('Name, email and phone required'); return }
    try {
      await registerMutation.mutateAsync({ id: regModal.id, data: regForm })
      toast.success('Registered! We\'ll see you there. 🎉')
      journey.campaignRegistered(regModal.id)
      setRegModal(null)
      setRegForm({ name:'', email:'', phone:'', organization:'' })
    } catch (e:any) { toast.error(e?.response?.data?.detail || 'Registration failed') }
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <Navbar />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-sage-900 to-sage-700 pt-28 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_IMGS[0]} alt="" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-r from-sage-900/95 to-sage-700/80" />
        </div>
        <div className="absolute inset-0 opacity-10" style={{backgroundImage:'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',backgroundSize:'32px 32px'}} />

        <div className="page-container relative z-10">
          <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, ease:[0.22,1,0.36,1] }}>
            <p className="font-accent italic text-sage-200 text-lg mb-2">Where Change Happens</p>
            <h1 className="font-display text-5xl font-semibold text-white mb-4">Our Campaigns</h1>
            <p className="text-white/60 max-w-xl text-base leading-relaxed mb-8 font-body">
              From school health sessions to nutrition drives — each campaign is tracked, reported, and impactful. All based in <strong className="text-white/80">Surat, Gujarat</strong>.
            </p>
            {/* Search */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-2 flex gap-2 max-w-lg">
              <div className="flex-1 flex items-center gap-3 px-3">
                <Search size={16} className="text-white/50" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search campaigns…"
                  className="flex-1 py-2.5 text-sm text-white placeholder-white/40 outline-none bg-transparent" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="page-container py-12">
        {/* Category filter */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {CATEGORIES.map((c, i) => (
            <motion.button key={c} onClick={() => setCategory(c)}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className={clsx('px-5 py-2 rounded-xl text-sm font-medium capitalize transition-all duration-200',
                category === c ? 'bg-sage-700 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:border-sage-300 hover:text-sage-700')}>
              {c === 'All' ? 'All Campaigns' : CAT_META[c]?.label || c}
            </motion.button>
          ))}
        </div>

        {/* Grid */}
        {isError && (
          <InlineError message="Failed to load campaigns." onRetry={() => refetch()} className="mb-4" />
        )}
        {loading ? (
          <SkeletonGrid count={6} cols={3} />
        ) : filtered.length === 0 ? (
          <EmptyState icon={<Leaf size={24}/>} title="No campaigns found" description="Try a different category or search term." />
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filtered.map((c: any, i: number) => {
                const cat = CAT_META[c.category]
                return (
                  <motion.div key={c.id}
                    layout
                    initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, scale:0.96 }}
                    transition={{ duration:0.45, delay: i * 0.06, ease:[0.22,1,0.36,1] }}
                    whileHover={{ y:-6, boxShadow:'0 24px 50px rgba(0,0,0,0.10)' }}
                    className="bg-white rounded-3xl border border-slate-100 overflow-hidden group cursor-pointer"
                  >
                    {/* Image */}
                    <div className="h-48 bg-gradient-to-br from-sage-100 to-trust-50 relative overflow-hidden">
                      {c.cover_image ? (
                        <img src={c.cover_image} alt={c.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <img
                          src={`https://images.unsplash.com/photo-${['1529156069898-49953e39b3ac','1469571486292-0ba58a3f068b','1488521787991-ed7bbaae773c'][i % 3]}?w=600&q=80`}
                          alt={c.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      {cat && (
                        <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-lg ${cat.bg} ${cat.color}`}>
                          {cat.label}
                        </span>
                      )}
                    </div>

                    <div className="p-5">
                      <h3 className="font-display text-lg text-trust-900 mb-1.5 leading-snug">{c.title}</h3>
                      <p className="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-2 font-body">{c.short_description}</p>

                      {/* Meta */}
                      <div className="flex items-center gap-4 text-xs text-slate-400 mb-4 font-body flex-wrap">
                        {c.city && <span className="flex items-center gap-1"><MapPin size={11}/>{c.city}, Gujarat</span>}
                        {c.event_date && <span className="flex items-center gap-1"><Calendar size={11}/>{new Date(c.event_date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>}
                        {(c.registration_count ?? 0) > 0 && <span className="flex items-center gap-1"><Users size={11}/>{c.registration_count} joined</span>}
                      </div>

                      {/* Progress bar (UI) */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>Session progress</span>
                          <span>{Math.min(((c.registration_count || 0) / (c.max_registrations || 100)) * 100, 100).toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                          <motion.div
                            className="h-1.5 rounded-full bg-gradient-to-r from-sage-500 to-sage-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(((c.registration_count || 0) / (c.max_registrations || 100)) * 100, 100)}%` }}
                            transition={{ duration: 0.8, delay: i * 0.06 + 0.3 }}
                          />
                        </div>
                      </div>

                      {c.is_registration_open ? (
                        <motion.button onClick={() => setRegModal(c)} whileTap={{ scale: 0.97 }}
                          className="w-full py-3 bg-sage-600 text-white text-sm font-semibold rounded-xl hover:bg-sage-700 transition-colors flex items-center justify-center gap-2">
                          Register Now <ArrowRight size={14}/>
                        </motion.button>
                      ) : (
                        <div className="w-full py-3 text-center text-xs text-slate-400 border border-slate-100 rounded-xl">
                          Registration closed
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Registration Modal */}
      <AnimatePresence>
        {regModal && (
          <motion.div
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setRegModal(null)}
          >
            <motion.div
              initial={{ opacity:0, scale:0.92, y:24 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.94 }}
              transition={{ duration:0.25, ease:[0.22,1,0.36,1] }}
              className="bg-white rounded-3xl shadow-float w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-100">
                <h2 className="font-display text-xl text-trust-900">Register for Campaign</h2>
                <p className="text-xs text-slate-400 mt-0.5">{regModal.title}</p>
              </div>
              <div className="p-6 space-y-4">
                {[
                  {label:'Full Name *',key:'name',placeholder:'Your name',type:'text'},
                  {label:'Email *',key:'email',placeholder:'your@email.com',type:'email'},
                  {label:'Phone *',key:'phone',placeholder:'+91 98765 43210',type:'tel'},
                  {label:'Organization (optional)',key:'organization',placeholder:'School / Company',type:'text'},
                ].map(f => (
                  <div key={f.key}>
                    <label className="label">{f.label}</label>
                    <input type={f.type} className="input text-sm" placeholder={f.placeholder}
                      value={(regForm as any)[f.key]} onChange={e => setRegForm(d => ({...d,[f.key]:e.target.value}))} />
                  </div>
                ))}
                <div className="flex gap-3 pt-1">
                  <motion.button onClick={register} disabled={registerMutation.isPending} whileTap={{ scale:0.97 }}
                    className="flex-1 py-3 bg-sage-600 text-white text-sm font-semibold rounded-xl hover:bg-sage-700 transition-colors disabled:opacity-60">
                    {registerMutation.isPending ? 'Registering…' : 'Confirm Registration'}
                  </motion.button>
                  <button onClick={() => setRegModal(null)} className="flex-1 py-3 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  )
}
