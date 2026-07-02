'use client'
import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HeartHandshake, ShieldCheck, Heart, Users, Star, Search,
  ArrowRight, Check, ChevronDown, ChevronRight, UserCheck, X,
  Filter, ArrowUpDown, MapPin, GraduationCap, Briefcase
} from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { matrimonyApi } from '@/lib/api'
import VariableProximity from '@/components/ui/VariableProximity'
import CountUp from '@/components/ui/CountUp'
import { useAuthStore } from '@/lib/store'
import { clsx } from 'clsx'

/* ── API profile shape ──────────────────────────────────────── */
interface ApiProfile {
  id: string
  name: string
  age: number
  gender: string
  city: string
  state: string
  education: string
  occupation: string
  religion: string
  caste?: string
  bio?: string
  photos: string[]
  created_at: string
}

const FILTER_TABS = ['Community', 'Religion', 'Language', 'City'] as const
const FILTER_CHIPS: Record<string, string[]> = {
  Community: ['Patel', 'Jain', 'Brahmin', 'Muslim', 'Christian', 'Kshatriya'],
  Religion: ['Hindu', 'Jain', 'Muslim', 'Christian', 'Sikh'],
  Language: ['Gujarati', 'Hindi', 'English', 'Marathi', 'Punjabi'],
  City: ['Surat', 'Ahmedabad', 'Vadodara', 'Rajkot'],
}

const FAQ_ITEMS = [
  { q: 'Is my profile and information safe?', a: 'Completely. Your profile is never publicly searchable or visible to other users. Only the admin team and your assigned counselor can access your details.' },
  { q: 'Is the matrimony service free to use?', a: 'Registration and profile creation are free. The full counselor-guided service involves a nominal fee discussed during your initial consultation.' },
  { q: 'How does the matching process actually work?', a: 'Our counselors review your profile, compatibility expectations, and family background to manually identify compatible matches. No algorithm — every suggestion is made by a human.' },
  { q: 'How long does the process take?', a: 'Most members receive their first match suggestion within 2–4 weeks of profile approval. The counselor moves at a pace you\'re comfortable with.' },
  { q: 'Can I involve my family in the process?', a: 'Yes, and we encourage it. You can add family members to your profile and our counselor will facilitate family meetings when both parties are ready.' },
]

const WHY = [
  { icon: '🔒', t: 'Completely Private', d: 'Profiles never publicly searchable. Only admin and your counselor can see your details.' },
  { icon: '👨‍👩‍👧', t: 'Family-Centered', d: 'We honour the Indian tradition of family involvement at every stage, on your terms.' },
  { icon: '🤝', t: 'Personal Compatibility', d: 'Our deep-dive profiling ensures candidates share highly aligned life and family expectations.' },
  { icon: '💬', t: 'Counselor Guidance', d: 'Dedicated counselors provide sessions, notes, and ongoing support through the journey.' },
  { icon: '✅', t: 'Verified Profiles', d: 'Every profile is reviewed with ID verification. No misrepresentation tolerated.' },
  { icon: '❤️', t: 'No Algorithms', d: 'Matches are suggested by humans who understand your complete story.' },
]

type SortKey = 'latest' | 'age_asc' | 'age_desc' | 'relevance'

/* ── Centralised filter state ──────────────────────────────── */
interface Filters {
  lookingFor: string
  ageMin: string
  ageMax: string
  religion: string
  community: string
  language: string
  education: string
  city: string
  searchQuery: string
}
const EMPTY_FILTERS: Filters = {
  lookingFor: 'Bride', ageMin: '', ageMax: '',
  religion: '', community: '', language: '', education: '', city: '', searchQuery: ''
}

/* ── Fade helper ───────────────────────────────────────────── */
function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div className={className}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}>
      {children}
    </motion.div>
  )
}



function LockedMatrimonySection() {
  return (
    <section className="relative py-20 bg-gradient-to-b from-white via-slate-50 to-[#fafaf8] overflow-hidden border-t border-b border-slate-100">
      {/* Background patterns */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #1e293b 1px, transparent 0)', backgroundSize: '24px 24px' }} />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-saffron-300/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-trust-300/10 rounded-full blur-3xl pointer-events-none" />

      <div className="page-container relative z-10 max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="bg-white/70 backdrop-blur-md rounded-3xl md:rounded-[2.5rem] border border-slate-200/80 p-6 md:p-14 text-center shadow-card"
        >
          {/* Animated Lock Icon */}
          <div className="relative w-20 h-20 mx-auto mb-8 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="absolute inset-0 bg-saffron-100 rounded-3xl"
            />
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 0.5 }}
              className="absolute inset-0 bg-saffron-50 rounded-3xl -z-10 opacity-60"
            />
            <ShieldCheck size={40} className="text-saffron-600 relative z-10" />
          </div>

          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-trust-950 mb-4 tracking-tight">
            Verified Profiles are <span className="text-saffron-500 font-accent italic">Protected</span>
          </h2>

          <p className="text-slate-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            To safeguard the privacy of our candidates and uphold family security, exploring profile lists, utilizing filters, and browsing counselor selections require a verified account.
          </p>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-xl mx-auto mb-10 p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
            <div className="text-center">
              <p className="font-display text-2xl md:text-3xl font-bold text-trust-900 mb-1">
                <CountUp to={80} />+
              </p>
              <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-wider">Matches Made</p>
            </div>
            <div className="text-center py-4 sm:py-0 border-y sm:border-y-0 sm:border-x border-slate-200">
              <p className="font-display text-2xl md:text-3xl font-bold text-trust-900 mb-1">
                <CountUp to={100} />%
              </p>
              <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-wider">Verified Profiles</p>
            </div>
            <div className="text-center">
              <p className="font-display text-2xl md:text-3xl font-bold text-trust-900 mb-1">
                <CountUp to={1} /> year
              </p>
              <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-wider">Dedicated Service</p>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full">
            <Link
              href="/auth/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-trust-900 text-white font-bold rounded-2xl hover:bg-trust-800 transition-all hover:shadow-lg text-sm"
            >
              Sign In to View Profiles <ArrowRight size={15} />
            </Link>
            <Link
              href="/matrimony/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl hover:border-trust-400 hover:text-trust-900 hover:bg-slate-50/50 transition-all text-sm"
            >
              Create Free Account
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ── Main page ─────────────────────────────────────────────── */
const PAGE_SIZE = 6

export default function MatrimonyPage() {
  const containerRef = useRef<HTMLElement>(null)
  const { isLoggedIn } = useAuthStore()
  const [isMounted, setIsMounted] = useState(false)
  const [apiProfiles, setApiProfiles] = useState<ApiProfile[]>([])
  const [profilesLoading, setProfilesLoading] = useState(true)
  const [profilesError, setProfilesError] = useState<string | null>(null)

  useEffect(() => {
    setIsMounted(true)
    if (isLoggedIn) {
      setProfilesLoading(true)
      matrimonyApi.getPublicProfiles()
        .then(r => setApiProfiles(r.data || []))
        .catch(() => setProfilesError('Unable to load profiles. Please try again.'))
        .finally(() => setProfilesLoading(false))
    } else {
      setApiProfiles([])
      setProfilesLoading(false)
    }
  }, [isLoggedIn])

  const showProfiles = isMounted && isLoggedIn

  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [sort, setSort] = useState<SortKey>('relevance')
  const [activeTab, setActiveTab] = useState<string>('Community')
  const [page, setPage] = useState(1)

  // UI state
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [showSidebar, setShowSidebar] = useState(false)
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [interests, setInterests] = useState<Set<string>>(new Set())
  const [interestToast, setInterestToast] = useState<string | null>(null)

  const setFilter = useCallback(<K extends keyof Filters>(key: K, val: Filters[K]) => {
    setFilters(f => ({ ...f, [key]: val }))
    setPage(1)
  }, [])

  const toggleChip = useCallback((cat: string, chip: string) => {
    setFilters(f => {
      const next = { ...f }
      if (cat === 'Community') next.community = f.community === chip ? '' : chip
      if (cat === 'Religion') next.religion = f.religion === chip ? '' : chip
      if (cat === 'Language') next.language = f.language === chip ? '' : chip
      if (cat === 'City') next.city = f.city === chip ? '' : chip
      return next
    })
    setPage(1)
  }, [])

  const clearAllFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS)
    setPage(1)
  }, [])

  const activeFiltersCount = (filters.religion ? 1 : 0) + (filters.community ? 1 : 0) +
    (filters.language ? 1 : 0) + (filters.education ? 1 : 0) + (filters.city ? 1 : 0) +
    (filters.ageMin ? 1 : 0) + (filters.ageMax ? 1 : 0) + (filters.searchQuery ? 1 : 0)

  // ── Compute filtered + sorted profiles ──
  const processed = useMemo(() => {
    let result = apiProfiles.filter(p => {
      if (filters.lookingFor === 'Bride' && p.gender !== 'female') return false
      if (filters.lookingFor === 'Groom' && p.gender !== 'male') return false
      if (filters.religion && p.religion !== filters.religion) return false
      if (filters.community && p.caste !== filters.community) return false
      if (filters.city && !p.city.toLowerCase().includes(filters.city.toLowerCase())) return false
      if (filters.education && !p.education.toLowerCase().includes(filters.education.toLowerCase())) return false
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase()
        if (!p.city.toLowerCase().includes(q) &&
          !p.occupation.toLowerCase().includes(q) &&
          !p.education.toLowerCase().includes(q) &&
          !p.name.toLowerCase().includes(q)) return false
      }
      if (filters.ageMin && p.age < parseInt(filters.ageMin)) return false
      if (filters.ageMax && p.age > parseInt(filters.ageMax)) return false
      return true
    })

    // Sort
    if (sort === 'age_asc') result = [...result].sort((a, b) => a.age - b.age)
    if (sort === 'age_desc') result = [...result].sort((a, b) => b.age - a.age)
    if (sort === 'latest') result = [...result].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    return result
  }, [apiProfiles, filters, sort])

  const visible = processed.slice(0, page * PAGE_SIZE)
  const hasMore = visible.length < processed.length

  const expressInterest = useCallback((id: string) => {
    if (!isLoggedIn) {
      setInterestToast('Please sign in to express interest in a profile.')
      setTimeout(() => setInterestToast(null), 3500)
      return
    }
    setInterests(prev => new Set(prev).add(id))
    const profile = apiProfiles.find(p => p.id === id)
    setInterestToast(`Interest expressed for ${profile?.name || ''}! Our counselor will follow up.`)
    setTimeout(() => setInterestToast(null), 3500)
  }, [isLoggedIn, apiProfiles])

  const SORT_OPTIONS: { key: SortKey; label: string }[] = [
    { key: 'relevance', label: 'Relevance' },
    { key: 'latest', label: 'Recently Joined' },
    { key: 'age_asc', label: 'Age: Youngest First' },
    { key: 'age_desc', label: 'Age: Oldest First' },
  ]

  // Check if active tab has an active filter
  const isTabActive = (tab: string) => {
    if (tab === 'Community') return !!filters.community
    if (tab === 'Religion') return !!filters.religion
    if (tab === 'Language') return !!filters.language
    if (tab === 'City') return !!filters.city
    return false
  }

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <Navbar transparent />

      {/* ── Toast ───────────────────────────────────────────── */}
      <AnimatePresence>
        {interestToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-trust-800 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-float flex items-center gap-2">
            <Heart size={14} className="fill-saffron-300 text-saffron-300 shrink-0" />
            {interestToast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HERO ───────────────────────────────────────────── */}
      <section ref={containerRef} className="relative min-h-[76vh] flex items-center bg-trust-950 overflow-hidden">
        <div className="absolute inset-0">
          <img src="matrimony_hero.jpg" alt="" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-r from-trust-950/98 via-trust-950/88 to-trust-900/70" />
        </div>
        <div className="absolute inset-0 bg-hero-pattern opacity-15" />

        <div className="page-container relative z-10 py-20 pt-32 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.55 }}
              className="inline-flex items-center gap-2 bg-saffron-400/20 border border-saffron-400/25 rounded-full px-4 py-1.5 mb-5">
              <Heart size={11} className="text-saffron-300 fill-saffron-300" />
              <span className="text-saffron-200 text-sm">Private · Counselor-Led · Family-Centered</span>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.12 }}
              className="font-display text-5xl md:text-6xl font-semibold text-white leading-[1.1] mb-4">
              <VariableProximity
                label="Find Your"
                containerRef={containerRef}
                fromFontVariationSettings="'wght' 600, 'opsz' 9"
                toFontVariationSettings="'wght' 1000, 'opsz' 40"
                radius={150}
                falloff="linear"
              />{' '}
              <span className="text-saffron-300 italic font-light">
                <VariableProximity
                  label="Life Partner"
                  containerRef={containerRef}
                  fromFontVariationSettings="'wght' 300, 'opsz' 9"
                  toFontVariationSettings="'wght' 800, 'opsz' 40"
                  radius={150}
                  falloff="linear"
                />
              </span>
              <br />
              <VariableProximity
                label="with Dignity"
                containerRef={containerRef}
                fromFontVariationSettings="'wght' 600, 'opsz' 9"
                toFontVariationSettings="'wght' 1000, 'opsz' 40"
                radius={150}
                falloff="linear"
              />
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}
              className="text-white/60 text-base leading-relaxed mb-7 max-w-md">
              Guided by counselors, rooted in family values. Not an app — a real relationship with real people in Surat, Gujarat.
            </motion.p>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45, delay: 0.35 }}
              className="flex flex-wrap gap-3">
              <Link href="/matrimony/register" className="inline-flex items-center gap-2 px-7 py-3.5 bg-saffron-400 text-trust-900 font-bold rounded-xl hover:bg-saffron-300 transition-colors shadow-warm text-sm">
                <HeartHandshake size={16} /> Create My Profile
              </Link>
              <Link href="/auth/login" className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/10 text-white font-medium rounded-xl hover:bg-white/15 border border-white/10 transition-colors text-sm">
                Sign In <ChevronRight size={14} />
              </Link>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.55, delay: 0.35 }}
            className="hidden md:grid grid-cols-2 gap-4">
            {[
              { v: 80, s: '+', l: 'Successful Matches' },
              { v: 98, s: '%', l: 'Family Satisfaction' },
              { v: 100, s: '%', l: 'Verified Profiles' },
              { v: 1, s: ' year', l: 'Serving Families' },
            ].map(s => (
              <div key={s.l} className="bg-white/8 border border-white/10 rounded-2xl p-5 text-center">
                <p className="font-display text-3xl font-semibold text-saffron-300 mb-1">
                  <CountUp to={s.v} />{s.s}
                </p>
                <p className="text-white/50 text-xs">{s.l}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {showProfiles ? (
        <>
          {/* ── EXECUTIVE SEARCH BAR (FULL-WIDTH STRIP MATCHING HERO SHAPE & SIZE) ── */}
          <section className="relative z-30 bg-white border-b border-slate-200/80 shadow-sm w-full transition-all">
            <div className="page-container py-4">
              {/* Main Controls Row */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                {/* Left: Gender Toggle Pill */}
                <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner shrink-0 items-center">
                  {(['Bride', 'Groom'] as const).map(v => (
                    <button key={v} onClick={() => setFilter('lookingFor', v)}
                      className={clsx('px-5 py-2 text-xs font-bold rounded-lg transition-all duration-200 flex items-center gap-1.5',
                        filters.lookingFor === v ? 'bg-trust-900 text-white shadow-sm' : 'text-slate-600 hover:text-trust-900')}>
                      {v === 'Bride' ? <Heart size={13} className={filters.lookingFor === v ? 'fill-saffron-300 text-saffron-300' : ''} /> : <UserCheck size={13} />}
                      {v}
                    </button>
                  ))}
                </div>

                {/* Center: Global Search Bar */}
                <div className="flex-1 min-w-[240px] max-w-2xl flex items-center gap-2.5 bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2 focus-within:border-trust-400 focus-within:ring-2 focus-within:ring-trust-100 transition-all shadow-2xs">
                  <Search size={14} className="text-slate-400 shrink-0" />
                  <input
                    placeholder="Search city, profession, education, name..."
                    value={filters.searchQuery}
                    onChange={e => setFilter('searchQuery', e.target.value)}
                    className="flex-1 text-xs bg-transparent outline-none text-slate-800 placeholder-slate-400 min-w-0 font-medium" />
                  {filters.searchQuery && (
                    <button onClick={() => setFilter('searchQuery', '')} className="text-slate-400 hover:text-slate-600">
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Right: Quick Age & Advanced Toggle */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="hidden lg:flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-1.5 shadow-2xs">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mr-1">Age</span>
                    <input type="number" min="18" max="60" placeholder="Min" value={filters.ageMin} onChange={e => setFilter('ageMin', e.target.value)}
                      className="w-11 bg-transparent text-center text-xs font-bold text-slate-800 outline-none" />
                    <span className="text-slate-300 text-xs font-bold">–</span>
                    <input type="number" min="18" max="70" placeholder="Max" value={filters.ageMax} onChange={e => setFilter('ageMax', e.target.value)}
                      className="w-11 bg-transparent text-center text-xs font-bold text-slate-800 outline-none" />
                  </div>

                  <button onClick={() => setShowSidebar(v => !v)}
                    className={clsx('flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-xs transition-all border shadow-2xs',
                      showSidebar ? 'bg-trust-900 text-white border-trust-900 shadow-sm' : 'bg-trust-50 text-trust-800 border-trust-200 hover:bg-trust-100')}>
                    <Filter size={13} /> Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                  </button>
                  {activeFiltersCount > 0 && (
                    <button onClick={clearAllFilters} className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-xs font-bold shadow-2xs">
                      <X size={13} /> Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Expandable Advanced Filters Drawer */}
              <AnimatePresence>
                {showSidebar && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }} className="overflow-hidden border-t border-slate-100 mt-4 pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      <div className="lg:hidden">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1.5">Age Range</p>
                        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                          <input type="number" min="18" max="60" placeholder="Min" value={filters.ageMin} onChange={e => setFilter('ageMin', e.target.value)}
                            className="w-full bg-transparent text-center text-xs font-bold text-slate-800 outline-none" />
                          <span className="text-slate-300 text-xs font-bold">–</span>
                          <input type="number" min="18" max="70" placeholder="Max" value={filters.ageMax} onChange={e => setFilter('ageMax', e.target.value)}
                            className="w-full bg-transparent text-center text-xs font-bold text-slate-800 outline-none" />
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1.5">Religion</p>
                        <select value={filters.religion} onChange={e => setFilter('religion', e.target.value)}
                          className="w-full py-2 px-3 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none focus:border-trust-400 cursor-pointer font-bold">
                          <option value="">Any Religion</option>
                          {['Hindu', 'Jain', 'Muslim', 'Christian', 'Sikh'].map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1.5">Community</p>
                        <select value={filters.community} onChange={e => setFilter('community', e.target.value)}
                          className="w-full py-2 px-3 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none focus:border-trust-400 cursor-pointer font-bold">
                          <option value="">Any Community</option>
                          {['Patel', 'Brahmin', 'Jain', 'Kshatriya', 'Muslim', 'Christian'].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1.5">Language</p>
                        <select value={filters.language} onChange={e => setFilter('language', e.target.value)}
                          className="w-full py-2 px-3 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none focus:border-trust-400 cursor-pointer font-bold">
                          <option value="">Any Language</option>
                          {['Gujarati', 'Hindi', 'English', 'Marathi', 'Punjabi'].map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1.5">City</p>
                        <select value={filters.city} onChange={e => setFilter('city', e.target.value)}
                          className="w-full py-2 px-3 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none focus:border-trust-400 cursor-pointer font-bold">
                          <option value="">Any City</option>
                          {['Surat', 'Ahmedabad', 'Vadodara', 'Rajkot'].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1.5">Education</p>
                        <select value={filters.education} onChange={e => setFilter('education', e.target.value)}
                          className="w-full py-2 px-3 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none focus:border-trust-400 cursor-pointer font-bold">
                          <option value="">Any Education</option>
                          {['Graduate', 'Post-Graduate', 'PhD', 'Diploma', '10th/12th'].map(e => <option key={e} value={e}>{e}</option>)}
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Integrated Category Toolbar (Single-line Horizontal Scrollable Track) */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-3 overflow-x-auto flex-nowrap w-full pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
                    <Filter size={12} /> Filter By:
                  </span>

                  {/* Category Tabs */}
                  <div className="flex bg-slate-100/80 p-1 rounded-xl shadow-inner shrink-0 items-center">
                    {FILTER_TABS.map(tab => {
                      const active = activeTab === tab
                      const hasActiveFilter = isTabActive(tab)
                      return (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                          className={clsx('px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shrink-0',
                            active ? 'bg-white text-trust-950 shadow-xs font-extrabold' : 'text-slate-600 hover:text-slate-900')}>
                          {tab}
                          {hasActiveFilter && <span className="w-1.5 h-1.5 rounded-full bg-saffron-500 shadow-xs shrink-0" />}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="w-[1px] h-5 bg-slate-200 shrink-0 mx-1" />

                {/* Active Category Chips */}
                <div className="flex items-center gap-1.5 shrink-0 flex-nowrap">
                  {FILTER_CHIPS[activeTab]?.map(chip => {
                    const active =
                      (activeTab === 'Community' && filters.community === chip) ||
                      (activeTab === 'Religion' && filters.religion === chip) ||
                      (activeTab === 'Language' && filters.language === chip) ||
                      (activeTab === 'City' && filters.city === chip)

                    return (
                      <button key={chip} onClick={() => toggleChip(activeTab, chip)}
                        className={clsx('px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-1.5 border shrink-0',
                          active
                            ? 'bg-gradient-to-r from-saffron-400 to-saffron-500 text-trust-950 border-none shadow-xs scale-105 font-extrabold'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-trust-300 hover:text-slate-900 shadow-2xs')}>
                        {active && <Check size={12} className="text-trust-950 stroke-[3]" />}
                        {chip}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* ── IMMERSIVE FULL-WIDTH 4-COLUMN PROFILE GRID ── */}
          <section className="py-10 bg-gradient-to-b from-white via-slate-50/50 to-[#fafaf8]">
            <div className="page-container">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-8 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex-wrap gap-4">
                <div>
                  <h3 className="font-display text-xl font-bold text-trust-900 mb-0.5">Explore Profiles</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Showing <strong className="text-trust-900 font-bold">{processed.length}</strong> matching candidate profiles
                  </p>
                </div>

                {/* Sort menu */}
                <div className="relative">
                  <button onClick={() => setShowSortMenu(v => !v)}
                    className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-2xl hover:border-slate-300 transition-colors shadow-inner">
                    <ArrowUpDown size={14} className="text-trust-800" />
                    {SORT_OPTIONS.find(o => o.key === sort)?.label}
                    <ChevronDown size={14} className={clsx('transition-transform', showSortMenu && 'rotate-180')} />
                  </button>
                  <AnimatePresence>
                    {showSortMenu && (
                      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-56 bg-white rounded-3xl shadow-float border border-slate-100 overflow-hidden z-20">
                        {SORT_OPTIONS.map(o => (
                          <button key={o.key} onClick={() => { setSort(o.key); setShowSortMenu(false) }}
                            className={clsx('w-full text-left px-5 py-3.5 text-xs transition-colors flex items-center justify-between font-semibold',
                              sort === o.key ? 'bg-trust-50 text-trust-800 font-bold' : 'text-slate-600 hover:bg-slate-50')}>
                            {o.label}
                            {sort === o.key && <Check size={14} className="text-trust-800 stroke-[3]" />}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Grid */}
              {profilesLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-card animate-pulse">
                      <div className="h-60 bg-slate-100" />
                      <div className="p-5 space-y-3">
                        <div className="h-3 bg-slate-100 rounded-full w-3/4" />
                        <div className="h-3 bg-slate-100 rounded-full w-1/2" />
                        <div className="h-10 bg-slate-100 rounded-2xl mt-4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : profilesError ? (
                <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 shadow-card max-w-xl mx-auto p-8">
                  <p className="font-display text-xl text-slate-800 font-bold mb-2">Couldn't load profiles</p>
                  <p className="text-slate-400 text-sm mb-6">{profilesError}</p>
                  <button onClick={() => window.location.reload()} className="px-8 py-3.5 bg-trust-800 text-white rounded-2xl text-xs font-bold hover:bg-trust-700 transition-colors">Retry</button>
                </div>
              ) : processed.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 shadow-card max-w-2xl mx-auto p-8">
                  <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
                    <Heart size={28} className="text-slate-300 mx-auto" />
                  </div>
                  <p className="font-display text-2xl text-slate-800 font-bold mb-2">
                    {apiProfiles.length === 0 ? 'No approved profiles yet' : 'No profiles match your criteria'}
                  </p>
                  <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                    {apiProfiles.length === 0
                      ? 'Be the first to register and get matched by our counselors!'
                      : 'Try broadening your search or clearing active category filters.'}
                  </p>
                  {apiProfiles.length > 0 && (
                    <button onClick={clearAllFilters} className="px-8 py-3.5 bg-trust-800 text-white rounded-2xl text-xs font-bold hover:bg-trust-700 transition-colors shadow-md">
                      Reset All Filters
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {visible.map((p) => {
                      const photo = p.photos?.[0] || null
                      return (
                        <div key={p.id}
                          className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 group flex flex-col">
                          {/* Photo */}
                          <div className="relative h-60 overflow-hidden bg-slate-100 shrink-0">
                            {photo ? (
                              <img src={photo} alt={p.name} className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                                <div className="w-20 h-20 rounded-full bg-white/60 flex items-center justify-center">
                                  <span className="text-3xl font-bold text-slate-400">{p.name[0]}</span>
                                </div>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                            <div className="absolute top-3.5 right-3.5 bg-white/95 backdrop-blur-sm text-trust-800 text-[10px] font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1 uppercase tracking-wider">
                              <Check size={11} className="text-trust-700 stroke-[3]" /> Verified
                            </div>
                            <div className="absolute bottom-4 left-4 right-4 text-white">
                              <p className="font-display text-xl font-bold leading-tight drop-shadow-sm">{p.name}, {p.age}</p>
                              <p className="text-saffron-300 text-xs font-semibold mt-0.5 flex items-center gap-1 truncate">
                                <MapPin size={12} className="shrink-0" /> {p.city}{p.state ? `, ${p.state}` : ''}
                              </p>
                            </div>
                          </div>

                          <div className="p-5 flex-1 flex flex-col justify-between">
                            <div>
                              <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs mb-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-100/80">
                                <div>
                                  <p className="text-[10px] uppercase font-bold text-slate-400">Education</p>
                                  <p className="font-bold text-slate-700 truncate">{p.education}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] uppercase font-bold text-slate-400">Profession</p>
                                  <p className="font-bold text-slate-700 truncate">{p.occupation}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] uppercase font-bold text-slate-400">Religion</p>
                                  <p className="font-bold text-slate-700 truncate">{p.religion}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] uppercase font-bold text-slate-400">Community</p>
                                  <p className="font-bold text-slate-700 truncate">{p.caste || '—'}</p>
                                </div>
                              </div>
                              <p className="text-xs text-slate-600 leading-relaxed mb-6 line-clamp-2 italic font-accent">"{p.bio || 'Looking for a compatible life partner.'}"
                              </p>
                            </div>
                            <div className="flex flex-col gap-2 pt-3 border-t border-slate-100 w-full">
                              <button onClick={() => expressInterest(p.id)} disabled={interests.has(p.id)}
                                className={clsx(
                                  'w-full py-3 text-xs font-bold rounded-2xl transition-all duration-150 flex items-center justify-center gap-1.5 shadow-sm',
                                  interests.has(p.id)
                                    ? 'bg-sage-100 text-sage-700 cursor-default shadow-none'
                                    : 'bg-trust-800 text-white hover:bg-trust-700 hover:shadow-md'
                                )}>
                                {interests.has(p.id)
                                  ? <><Check size={13} className="stroke-[3]" /> Interested</>
                                  : <><Heart size={13} className="fill-white/30" /> Interested</>
                                }
                              </button>
                              <Link href="/auth/login"
                                className="w-full py-3 text-xs font-bold rounded-2xl border border-slate-200 text-slate-700 hover:border-trust-400 hover:bg-slate-50 transition-all duration-150 flex items-center justify-center text-center">
                                Sign in to Connect
                              </Link>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Load more */}
                  {hasMore && (
                    <div className="mt-12 text-center">
                      <button onClick={() => setPage(p => p + 1)}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-2xl hover:border-trust-400 hover:text-trust-900 transition-all duration-150 shadow-md hover:shadow-lg">
                        Load More Candidate Profiles
                        <span className="text-xs text-slate-400 font-normal">({processed.length - visible.length} remaining)</span>
                      </button>
                    </div>
                  )}

                </>
              )}

            </div>
          </section>

          {/* ── 👑 VIP COUNSELOR'S CHOICE SHOWCASE (COMPACT LIGHT HORIZONTAL CAROUSEL) ── */}
          <section className="pt-10 pb-8 bg-[#fafaf8] border-t border-b border-slate-100 overflow-hidden">
            <div className="page-container">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="font-accent italic text-saffron-600 text-xs mb-0.5">Elite Matchmaking</p>
                  <h2 className="font-display text-xl font-bold text-trust-900 flex items-center gap-1.5">
                    <Star size={18} className="text-saffron-500 fill-saffron-500" /> VIP Counselor's Choice
                  </h2>
                </div>
                <p className="text-xs text-slate-500 hidden sm:block font-medium">Handpicked & Verified by Senior Counselors · Surat, Gujarat</p>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {apiProfiles.slice(0, 8).map((p, idx) => {
                  const photo = p.photos?.[0] || null
                  const tagLabels = ['Highly Compatible', 'Recently Joined', 'Top Rated', 'Nearby', 'Verified Early']
                  const tagColors = [
                    'bg-trust-100 text-trust-700',
                    'bg-sage-100 text-sage-700',
                    'bg-saffron-100 text-saffron-700',
                    'bg-trust-100 text-trust-700',
                    'bg-sage-100 text-sage-700',
                  ]
                  return (
                    <div key={p.id} className="flex-none w-64 bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 border border-slate-100 flex flex-col group">
                      <div className="h-36 relative overflow-hidden bg-slate-100 shrink-0">
                        {photo ? (
                          <img src={photo} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                            <span className="text-4xl font-bold text-slate-400">{p.name[0]}</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-trust-950/80 via-trust-950/20 to-transparent" />
                        <span className={clsx('absolute top-2.5 left-2.5 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full shadow-sm uppercase tracking-wider', tagColors[idx % tagColors.length])}>
                          {tagLabels[idx % tagLabels.length]}
                        </span>
                        <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between">
                          <div className="min-w-0 pr-2">
                            <p className="font-display text-base font-bold text-white leading-tight truncate">{p.name}, {p.age}</p>
                            <p className="text-saffron-300 text-[11px] font-semibold mt-0.5 truncate">{p.occupation}</p>
                          </div>
                          <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20 shrink-0">
                            <ShieldCheck size={13} className="text-white" />
                          </div>
                        </div>
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between bg-white">
                        <p className="text-[11px] text-slate-500 line-clamp-2 italic mb-3 font-accent leading-relaxed">"{p.bio || 'Looking for a family-oriented partner with traditional values and modern outlook.'}"
                        </p>
                        <button onClick={() => expressInterest(p.id)} disabled={interests.has(p.id)}
                          className={clsx('w-full py-2 text-xs font-bold rounded-xl transition-all duration-150 flex items-center justify-center gap-1.5 shadow-2xs',
                            interests.has(p.id) ? 'bg-sage-50 text-sage-700 cursor-default shadow-none border border-sage-200' : 'bg-trust-50 text-trust-800 hover:bg-trust-100 hover:border-trust-300 border border-trust-200')}>
                          {interests.has(p.id) ? <><Check size={13} className="stroke-[3]" /> Interest Recorded</> : <><Heart size={13} className="fill-trust-800/10" /> Express VIP Interest</>}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        </>
      ) : (
        <LockedMatrimonySection />
      )}
      {/* ── HOW IT WORKS ───────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="page-container">
          <FadeIn className="text-center mb-10">
            <p className="font-accent italic text-saffron-600 text-lg mb-1">The Process</p>
            <h2 className="section-title">How Our Matchmaking Works</h2>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { n: '01', icon: <UserCheck size={17} className="text-trust-600" />, t: 'Register & Share', d: 'Create a detailed, private profile.' },
              { n: '02', icon: <ShieldCheck size={17} className="text-saffron-600" />, t: 'Admin Reviews', d: 'Our team verifies every profile personally.' },
              { n: '03', icon: <HeartHandshake size={17} className="text-trust-600" />, t: 'Counselor Matches', d: 'A human suggests compatible profiles.' },
              { n: '04', icon: <Heart size={17} className="text-red-500" />, t: 'Express Interest', d: 'Both parties respond with interest.' },
              { n: '05', icon: <Users size={17} className="text-sage-600" />, t: 'Family Meeting', d: 'Families meet with full counselor support.' },
            ].map((s, i) => (
              <FadeIn key={s.n} delay={i * 0.06} className="h-full">
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-card text-center h-full flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mx-auto mb-3">{s.icon}</div>
                    <p className="text-[10px] text-slate-400 font-bold mb-1 tracking-wide">{s.n}</p>
                    <p className="font-display text-base text-trust-900 mb-1">{s.t}</p>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed mt-2">{s.d}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY DEVKALP ────────────────────────────────────── */}
      <section className="py-16 bg-[#f8f9fc]">
        <div className="page-container">
          <FadeIn className="text-center mb-10">
            <p className="font-accent italic text-saffron-600 text-lg mb-1">What Makes Us Different</p>
            <h2 className="section-title">Built on Trust, Not Clicks</h2>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {WHY.map((w, i) => (
              <FadeIn key={w.t} delay={i * 0.06}>
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200">
                  <div className="text-2xl mb-3">{w.icon}</div>
                  <h3 className="font-display text-lg text-trust-900 mb-1.5">{w.t}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{w.d}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── SUCCESS STORIES ────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="page-container">
          <FadeIn className="text-center mb-10">
            <p className="font-accent italic text-saffron-600 text-lg mb-1">Success Stories</p>
            <h2 className="section-title">500+ Families Connected</h2>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[
              { couple: 'Priya & Rohan', year: '2023', city: 'Surat', story: 'The counselor took time to understand both families. Within three months we knew this was right.', img: 'success_1.jpg' },
              { couple: 'Kavya & Ankit', year: '2023', city: 'Surat', story: 'The counselor\'s detailed compatibility matching helped us align on all major life expectations early.', img: 'success_2.jpg' },
              { couple: 'Nisha & Dev', year: '2024', city: 'Ahmedabad', story: 'Our families were involved from the beginning, which made the entire process feel natural and dignified.', img: 'success_3.jpg' },
            ].map((s, i) => (
              <FadeIn key={s.couple} delay={i * 0.07}>
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-card">
                  <div className="h-40 overflow-hidden">
                    <img src={s.img} alt={s.couple} className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-500" />
                  </div>
                  <div className="p-5">
                    <p className="font-display text-lg text-trust-900 mb-0.5">{s.couple}</p>
                    <p className="text-xs text-slate-400 mb-3">{s.city} · {s.year}</p>
                    <p className="text-sm text-slate-600 leading-relaxed italic font-accent">"{s.story}"</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn>
            <div className="bg-gradient-to-br from-trust-50 to-saffron-50 rounded-2xl p-7 flex flex-col md:flex-row items-center gap-6 border border-slate-100">
              <div className="flex-1">
                <p className="font-display text-2xl text-trust-900 mb-1.5">1,000+ Profiles Created</p>
                <p className="text-slate-500 text-sm leading-relaxed">Every profile personally reviewed. Every match made with care and counselor guidance.</p>
              </div>
              <Link href="/matrimony/register"
                className="shrink-0 inline-flex items-center gap-2 px-7 py-3.5 bg-trust-800 text-white font-bold rounded-xl hover:bg-trust-700 transition-colors text-sm">
                <Heart size={15} /> Start My Journey
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────── */}
      <section className="py-16 bg-[#f8f9fc]">
        <div className="page-container max-w-2xl">
          <FadeIn className="text-center mb-10">
            <p className="font-accent italic text-saffron-600 text-lg mb-1">Common Questions</p>
            <h2 className="section-title">Frequently Asked</h2>
          </FadeIn>
          <div className="space-y-2.5">
            {FAQ_ITEMS.map((item, i) => (
              <FadeIn key={i} delay={i * 0.05}>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left gap-4 hover:bg-slate-50/70 transition-colors">
                    <p className="font-semibold text-slate-800 text-sm leading-snug">{item.q}</p>
                    <motion.span animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0">
                      <ChevronDown size={17} className="text-slate-400" />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {openFaq === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }} className="overflow-hidden">
                        <div className="px-6 pb-5 border-t border-slate-100 pt-4">
                          <p className="text-sm text-slate-600 leading-relaxed">{item.a}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────── */}
      <section className="py-16 bg-trust-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-pattern opacity-15" />
        <div className="page-container text-center relative z-10">
          <FadeIn>
            <Heart size={30} className="text-saffron-400 fill-saffron-400/25 mx-auto mb-4" />
            <h2 className="font-display text-4xl font-semibold text-white mb-3">Your Story Begins Here</h2>
            <p className="text-white/55 max-w-md mx-auto mb-7 leading-relaxed text-base">
              Join hundreds of families who trusted Devkalp Foundation to guide their most important journey.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/matrimony/register"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-saffron-400 text-trust-900 font-bold rounded-xl hover:bg-saffron-300 transition-colors shadow-warm text-sm">
                <HeartHandshake size={16} /> Create My Profile
              </Link>
              <Link href="/contact"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white/10 text-white font-medium rounded-xl hover:bg-white/15 border border-white/10 transition-colors text-sm">
                Talk to a Counselor <ArrowRight size={14} />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer />

    </div>
  )
}

/* ── Sidebar filters — reads/writes the central `filters` state ─ */
function SidebarFilters({ filters, setFilter }: { filters: Filters; setFilter: <K extends keyof Filters>(k: K, v: Filters[K]) => void }) {
  const grp = (label: string, children: React.ReactNode) => (
    <div className="mb-5">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{label}</p>
      {children}
    </div>
  )
  const sel = (key: keyof Filters, opts: string[]) => (
    <select value={filters[key] as string} onChange={e => setFilter(key, e.target.value)}
      className="w-full py-2 px-3 text-sm border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:border-trust-400 cursor-pointer">
      <option value="">Any</option>
      {opts.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )
  return (
    <>
      {grp('Age Range',
        <div className="flex items-center gap-2">
          <input type="number" placeholder="Min" value={filters.ageMin} onChange={e => setFilter('ageMin', e.target.value)}
            className="w-full py-2 px-3 text-sm text-center border border-slate-200 rounded-xl focus:outline-none focus:border-trust-400" />
          <span className="text-slate-300 text-sm shrink-0">–</span>
          <input type="number" placeholder="Max" value={filters.ageMax} onChange={e => setFilter('ageMax', e.target.value)}
            className="w-full py-2 px-3 text-sm text-center border border-slate-200 rounded-xl focus:outline-none focus:border-trust-400" />
        </div>
      )}
      {grp('Religion', sel('religion', ['Hindu', 'Jain', 'Muslim', 'Christian', 'Sikh']))}
      {grp('Community', sel('community', ['Patel', 'Brahmin', 'Jain', 'Kshatriya', 'Muslim', 'Christian']))}
      {grp('Language', sel('language', ['Gujarati', 'Hindi', 'English', 'Marathi', 'Punjabi']))}
      {grp('City', sel('city', ['Surat', 'Ahmedabad', 'Vadodara', 'Rajkot']))}
      {grp('Education', sel('education', ['Graduate', 'Post-Graduate', 'PhD', 'Diploma', '10th/12th']))}
    </>
  )
}
