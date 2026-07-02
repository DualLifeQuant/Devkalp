'use client'
import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HeartHandshake, ShieldCheck, Heart, Users, Star, Search,
  ArrowRight, Check, ChevronDown, ChevronRight, UserCheck, X,
  Filter, ArrowUpDown, MapPin, GraduationCap, Briefcase
} from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuthStore } from '@/lib/store'
import { auditMatrimony } from '@/lib/audit/auditLog'
import { journey } from '@/lib/analytics'
import { clsx } from 'clsx'

/* ── Static data ───────────────────────────────────────────── */
const ALL_PROFILES = [
  { id: '1', name: 'Priya S.',   age: 27, location: 'Surat, Gujarat',     edu: 'MBA',    occ: 'Marketing Manager',    religion: 'Hindu', community: 'Patel',   lang: 'Gujarati', bio: 'Family-oriented, loves reading. Looking for a grounded, respectful partner.', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80', joined: 3 },
  { id: '2', name: 'Rahul M.',   age: 29, location: 'Surat, Gujarat',     edu: 'B.Tech', occ: 'Software Engineer',    religion: 'Hindu', community: 'Brahmin', lang: 'Gujarati', bio: 'Calm and thoughtful. Values honesty, family harmony and shared goals.',        img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', joined: 7 },
  { id: '3', name: 'Kavita D.',  age: 25, location: 'Ahmedabad, Gujarat', edu: 'MBBS',   occ: 'Doctor',               religion: 'Jain',  community: 'Jain',    lang: 'Gujarati', bio: 'Passionate about healthcare and social service. Seeking a like-minded partner.', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80', joined: 1 },
  { id: '4', name: 'Arjun P.',   age: 31, location: 'Surat, Gujarat',     edu: 'CA',     occ: 'Chartered Accountant', religion: 'Hindu', community: 'Patel',   lang: 'Hindi',    bio: 'Responsible and family-first. Enjoys travel and spending time with loved ones.', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80', joined: 14 },
  { id: '5', name: 'Neha R.',    age: 26, location: 'Surat, Gujarat',     edu: 'B.Com',  occ: 'Bank Officer',         religion: 'Hindu', community: 'Brahmin', lang: 'Gujarati', bio: 'Warm and caring person. Values tradition and modern thinking equally.',         img: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&q=80', joined: 5 },
  { id: '6', name: 'Vivek S.',   age: 30, location: 'Vadodara, Gujarat',  edu: 'M.Tech', occ: 'Civil Engineer',       religion: 'Hindu', community: 'Patel',   lang: 'Gujarati', bio: 'Simple and sincere. Looking for a partner who shares family values.',          img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80', joined: 9 },
  { id: '7', name: 'Shruti K.',  age: 24, location: 'Surat, Gujarat',     edu: 'BCA',    occ: 'UI Designer',          religion: 'Hindu', community: 'Brahmin', lang: 'Hindi',    bio: 'Creative and independent. Loves design, music, and meaningful conversations.',  img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80', joined: 2 },
  { id: '8', name: 'Rohan J.',   age: 33, location: 'Surat, Gujarat',     edu: 'MBA',    occ: 'Business Owner',       religion: 'Jain',  community: 'Jain',    lang: 'Gujarati', bio: 'Entrepreneurial spirit. Family is everything — looking for a grounded partner.', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80', joined: 20 },
]

const SUGGESTED = [
  { id: 's1', name: 'Disha M.',  age: 26, occ: 'Teacher',   tag: 'Highly Compatible', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80', tagColor: 'bg-trust-100 text-trust-700' },
  { id: 's2', name: 'Kiran P.',  age: 28, occ: 'Pharmacist',tag: 'Same Community',    img: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80', tagColor: 'bg-sage-100 text-sage-700' },
  { id: 's3', name: 'Ravi T.',   age: 32, occ: 'Architect', tag: 'Nearby',            img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80', tagColor: 'bg-saffron-100 text-saffron-700' },
  { id: 's4', name: 'Anjali K.', age: 25, occ: 'Designer',  tag: 'Highly Compatible', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80', tagColor: 'bg-trust-100 text-trust-700' },
]

const FILTER_TABS = ['Community', 'Religion', 'Language', 'City'] as const
const FILTER_CHIPS: Record<string, string[]> = {
  Community: ['Patel', 'Jain', 'Brahmin', 'Muslim', 'Christian', 'Kshatriya'],
  Religion:  ['Hindu', 'Jain', 'Muslim', 'Christian', 'Sikh'],
  Language:  ['Gujarati', 'Hindi', 'English', 'Marathi', 'Punjabi'],
  City:      ['Surat', 'Ahmedabad', 'Vadodara', 'Rajkot'],
}

const FAQ_ITEMS = [
  { q: 'Is my profile and information safe?',           a: 'Completely. Your profile is never publicly searchable or visible to other users. Only the admin team and your assigned counselor can access your details.' },
  { q: 'Is the matrimony service free to use?',         a: 'Registration and profile creation are free. The full counselor-guided service involves a nominal fee discussed during your initial consultation.' },
  { q: 'How does the matching process actually work?',  a: 'Our counselors review your profile, emotional readiness evaluation, and family background to manually identify compatible matches. No algorithm — every suggestion is made by a human.' },
  { q: 'How long does the process take?',               a: 'Most members receive their first match suggestion within 2–4 weeks of profile approval. The counselor moves at a pace you\'re comfortable with.' },
  { q: 'Can I involve my family in the process?',       a: 'Yes, and we encourage it. You can add family members to your profile and our counselor will facilitate family meetings when both parties are ready.' },
]

const WHY = [
  { icon: '🔒', t: 'Completely Private',   d: 'Profiles never publicly searchable. Only admin and your counselor can see your details.' },
  { icon: '👨‍👩‍👧', t: 'Family-Centered',     d: 'We honour the Indian tradition of family involvement at every stage, on your terms.' },
  { icon: '🧠', t: 'Emotional Readiness',  d: 'A 15-question evaluation ensures you\'re genuinely ready — not just socially pressured.' },
  { icon: '💬', t: 'Counselor Guidance',   d: 'Dedicated counselors provide sessions, notes, and ongoing support through the journey.' },
  { icon: '✅', t: 'Verified Profiles',    d: 'Every profile is reviewed with ID verification. No misrepresentation tolerated.' },
  { icon: '❤️', t: 'No Algorithms',        d: 'Matches are suggested by humans who understand your complete story.' },
]

type SortKey = 'latest' | 'age_asc' | 'age_desc' | 'relevance'

/* ── Centralised filter state ──────────────────────────────── */
interface Filters {
  lookingFor:   string
  ageMin:       string
  ageMax:       string
  religion:     string
  community:    string
  language:     string
  education:    string
  chips:        Record<string, string[]>
}
const EMPTY_FILTERS: Filters = {
  lookingFor: 'Bride', ageMin: '', ageMax: '',
  religion: '', community: '', language: '', education: '',
  chips: {},
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

/* ── Profile modal ─────────────────────────────────────────── */
function ProfileModal({ profile, onClose, onInterest }: { profile: typeof ALL_PROFILES[0]; onClose: () => void; onInterest: (id: string) => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="bg-white rounded-2xl shadow-float w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Photo */}
        <div className="relative h-64 bg-slate-200">
          <img src={profile.img} alt={profile.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 bg-black/40 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-black/60 transition-colors">
            <X size={15} />
          </button>
          <div className="absolute bottom-4 left-5 text-white">
            <p className="font-display text-2xl font-semibold">{profile.name}, {profile.age}</p>
            <p className="text-white/70 text-sm flex items-center gap-1.5 mt-0.5">
              <MapPin size={12} />{profile.location}
            </p>
          </div>
          <div className="absolute top-3 left-3 bg-white/90 text-trust-700 text-xs font-bold px-2.5 py-1 rounded-full">✓ Verified</div>
        </div>

        <div className="p-6">
          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { icon: <GraduationCap size={13} />, label: 'Education', value: profile.edu },
              { icon: <Briefcase size={13} />, label: 'Profession', value: profile.occ },
              { icon: <Heart size={13} />, label: 'Religion', value: profile.religion },
              { icon: <Users size={13} />, label: 'Community', value: profile.community },
            ].map(d => (
              <div key={d.label} className="bg-slate-50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">{d.icon}{d.label}</div>
                <p className="text-sm font-semibold text-slate-800">{d.value}</p>
              </div>
            ))}
          </div>

          {/* Bio */}
          <div className="mb-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">About</p>
            <p className="text-sm text-slate-600 leading-relaxed">{profile.bio}</p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5">
            <p className="text-xs text-amber-700 font-medium">
              🔒 Full contact details are shared only after mutual interest and counselor review.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => { onInterest(profile.id); onClose() }}
              className="flex-1 py-3 bg-trust-800 text-white text-sm font-bold rounded-xl hover:bg-trust-700 transition-colors flex items-center justify-center gap-2">
              <Heart size={15} className="fill-white/30" /> Express Interest
            </button>
            <Link href="/matrimony/register"
              className="flex-1 py-3 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:border-trust-300 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5">
              Register to Connect <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

/* ── Main page ─────────────────────────────────────────────── */
const PAGE_SIZE = 6

export default function MatrimonyPage() {
  // ── ONE centralised filter state ──
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [sort, setSort] = useState<SortKey>('relevance')
  const [activeTab, setActiveTab] = useState<string>('Community')
  const [page, setPage] = useState(1)
  const { user } = useAuthStore()

  // UI state
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [showSidebar, setShowSidebar] = useState(false)
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<typeof ALL_PROFILES[0] | null>(null)
  const [interests, setInterests] = useState<Set<string>>(new Set())
  const [interestToast, setInterestToast] = useState<string | null>(null)

  const setFilter = useCallback(<K extends keyof Filters>(key: K, val: Filters[K]) => {
    setFilters(f => ({ ...f, [key]: val }))
    setPage(1)
  }, [])

  const toggleChip = useCallback((cat: string, chip: string) => {
    setFilters(f => {
      const cur = f.chips[cat] || []
      return {
        ...f,
        chips: { ...f.chips, [cat]: cur.includes(chip) ? cur.filter(c => c !== chip) : [...cur, chip] },
      }
    })
    setPage(1)
  }, [])

  const clearAllFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS)
    setPage(1)
  }, [])

  const totalChips = useMemo(() => Object.values(filters.chips).flat().length, [filters.chips])
  const activeFiltersCount = totalChips +
    (filters.religion ? 1 : 0) + (filters.community ? 1 : 0) +
    (filters.language ? 1 : 0) + (filters.education ? 1 : 0) +
    (filters.ageMin ? 1 : 0) + (filters.ageMax ? 1 : 0)

  // ── Compute filtered + sorted profiles ──
  const processed = useMemo(() => {
    let result = ALL_PROFILES.filter(p => {
      // Chip filters
      const chipEntries = Object.entries(filters.chips).flatMap(([cat, vals]) => vals.map(v => ({ cat, v })))
      if (chipEntries.length) {
        const match = chipEntries.some(({ cat, v }) => {
          if (cat === 'Community') return p.community === v
          if (cat === 'Religion')  return p.religion === v
          if (cat === 'Language')  return p.lang === v
          if (cat === 'City')      return p.location.includes(v)
          return false
        })
        if (!match) return false
      }
      // Sidebar + search bar filters
      if (filters.religion  && p.religion   !== filters.religion)   return false
      if (filters.community && p.community  !== filters.community)  return false
      if (filters.language  && p.lang       !== filters.language)   return false
      if (filters.ageMin    && p.age < parseInt(filters.ageMin))     return false
      if (filters.ageMax    && p.age > parseInt(filters.ageMax))     return false
      return true
    })

    // Sort
    if (sort === 'age_asc')  result = [...result].sort((a, b) => a.age - b.age)
    if (sort === 'age_desc') result = [...result].sort((a, b) => b.age - a.age)
    if (sort === 'latest')   result = [...result].sort((a, b) => a.joined - b.joined)

    return result
  }, [filters, sort])

  const visible = processed.slice(0, page * PAGE_SIZE)
  const hasMore = visible.length < processed.length

  const expressInterest = useCallback((id: string) => {
    setInterests(prev => new Set(prev).add(id))
    const name = ALL_PROFILES.find(p => p.id === id)?.name || ''
    setInterestToast(`Interest expressed for ${name}! Our counselor will follow up.`)
    setTimeout(() => setInterestToast(null), 3500)
    auditMatrimony('interest_expressed', id, user?.id, { profileName: name })
    journey.interestExpressed(id)
  }, [user?.id])

  const SORT_OPTIONS: { key: SortKey; label: string }[] = [
    { key: 'relevance', label: 'Relevance' },
    { key: 'latest',    label: 'Recently Joined' },
    { key: 'age_asc',   label: 'Age: Youngest First' },
    { key: 'age_desc',  label: 'Age: Oldest First' },
  ]

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
      <section className="relative min-h-[76vh] flex items-center bg-trust-950 overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1600&q=80" alt="" className="w-full h-full object-cover opacity-20" />
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
              Find Your <span className="text-saffron-300 italic">Life Partner</span><br />with Dignity
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
              { v: '850+', l: 'Successful Matches' },
              { v: '98%',  l: 'Family Satisfaction' },
              { v: '100%', l: 'Verified Profiles' },
              { v: '6 yrs',l: 'Serving Families' },
            ].map(s => (
              <div key={s.l} className="bg-white/8 border border-white/10 rounded-2xl p-5 text-center">
                <p className="font-display text-3xl font-semibold text-saffron-300 mb-1">{s.v}</p>
                <p className="text-white/50 text-xs">{s.l}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── STICKY SEARCH BAR ──────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="page-container py-2.5">
          {/* Row 1: Looking for + Age + Clear */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Looking for */}
            <div className="flex rounded-xl border border-slate-200 overflow-hidden text-sm shrink-0">
              {(['Bride', 'Groom'] as const).map(v => (
                <button key={v} onClick={() => setFilter('lookingFor', v)}
                  className={clsx('px-4 py-2 font-medium transition-colors', filters.lookingFor === v ? 'bg-trust-800 text-white' : 'text-slate-600 hover:bg-slate-50')}>
                  {v}
                </button>
              ))}
            </div>

            {/* Age range */}
            <div className="flex items-center gap-1 shrink-0">
              <input type="number" min="18" max="60" placeholder="Min age" value={filters.ageMin}
                onChange={e => setFilter('ageMin', e.target.value)}
                className="w-[68px] px-2 py-2 text-sm text-center border border-slate-200 rounded-xl focus:outline-none focus:border-trust-400 focus:ring-1 focus:ring-trust-100 transition-all" />
              <span className="text-slate-300 text-sm">–</span>
              <input type="number" min="18" max="70" placeholder="Max age" value={filters.ageMax}
                onChange={e => setFilter('ageMax', e.target.value)}
                className="w-[68px] px-2 py-2 text-sm text-center border border-slate-200 rounded-xl focus:outline-none focus:border-trust-400 focus:ring-1 focus:ring-trust-100 transition-all" />
            </div>

            {/* Religion */}
            <select value={filters.religion} onChange={e => setFilter('religion', e.target.value)}
              className="py-2 px-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-trust-400 bg-white text-slate-700 shrink-0 cursor-pointer">
              <option value="">Religion</option>
              {['Hindu','Jain','Muslim','Christian','Sikh'].map(r => <option key={r} value={r}>{r}</option>)}
            </select>

            {/* Community — hidden on very small screens, shown md+ */}
            <select value={filters.community} onChange={e => setFilter('community', e.target.value)}
              className="hidden sm:block py-2 px-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-trust-400 bg-white text-slate-700 shrink-0 cursor-pointer">
              <option value="">Community</option>
              {['Patel','Brahmin','Jain','Kshatriya','Muslim','Christian'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* Location — flex-1 to fill remaining space */}
            <div className="hidden md:flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 flex-1 min-w-[120px] focus-within:border-trust-400 focus-within:ring-1 focus-within:ring-trust-100 transition-all">
              <Search size={13} className="text-slate-400 shrink-0" />
              <input
                placeholder="Surat, Gujarat"
                defaultValue="Surat, Gujarat"
                className="flex-1 text-sm outline-none text-slate-700 placeholder-slate-400 bg-transparent min-w-0" />
            </div>

            {/* Clear filters button */}
            {activeFiltersCount > 0 && (
              <button onClick={clearAllFilters} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium shrink-0 transition-colors ml-auto">
                <X size={12} /> Clear ({activeFiltersCount})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── CATEGORY CHIPS ─────────────────────────────────── */}
      <div className="bg-white border-b border-slate-100">
        <div className="page-container">
          <div className="flex gap-0">
            {FILTER_TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={clsx('px-5 py-3 text-sm font-medium border-b-2 transition-colors',
                  activeTab === tab ? 'border-trust-700 text-trust-700' : 'border-transparent text-slate-500 hover:text-slate-700')}>
                {tab}
                {(filters.chips[tab]?.length ?? 0) > 0 && (
                  <span className="ml-1.5 bg-trust-700 text-white text-xs px-1.5 py-0.5 rounded-full">{filters.chips[tab].length}</span>
                )}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 py-3">
            {FILTER_CHIPS[activeTab]?.map(chip => {
              const active = (filters.chips[activeTab] || []).includes(chip)
              return (
                <button key={chip} onClick={() => toggleChip(activeTab, chip)}
                  className={clsx('px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-150',
                    active ? 'bg-trust-800 text-white border-trust-800' : 'bg-white text-slate-600 border-slate-200 hover:border-trust-400 hover:text-trust-700')}>
                  {active && <Check size={11} className="inline mr-1.5" />}{chip}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── SUGGESTED MATCHES ──────────────────────────────── */}
      <section className="py-8 bg-white border-b border-slate-100">
        <div className="page-container">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl text-trust-900">Suggested for You</h2>
            <p className="text-xs text-slate-400 hidden sm:block">Reviewed by our counselors · Surat, Gujarat</p>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {SUGGESTED.map((p, i) => (
              <div key={p.id} className="flex-none w-48 bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200">
                <div className="h-36 relative overflow-hidden">
                  <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
                  <span className={clsx('absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full', p.tagColor)}>{p.tag}</span>
                </div>
                <div className="p-3.5">
                  <p className="font-semibold text-slate-800 text-sm">{p.name}, {p.age}</p>
                  <p className="text-xs text-slate-400 mt-0.5 mb-2.5">{p.occ}</p>
                  <button onClick={() => expressInterest(p.id)} disabled={interests.has(p.id)}
                    className={clsx('w-full py-1.5 text-xs font-semibold rounded-lg transition-colors', interests.has(p.id) ? 'bg-sage-100 text-sage-700' : 'bg-trust-50 text-trust-700 hover:bg-trust-100')}>
                    {interests.has(p.id) ? '✓ Interested' : '♥ Express Interest'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MAIN: SIDEBAR + GRID ───────────────────────────── */}
      <section className="py-8 bg-[#f8f9fc]">
        <div className="page-container">
          {/* Mobile filter toggle */}
          <button onClick={() => setShowSidebar(true)}
            className="md:hidden mb-4 flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:border-trust-300 transition-colors">
            <Filter size={14} /> Filters{activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ''}
          </button>

          <div className="flex gap-7">
            {/* Mobile sidebar */}
            <AnimatePresence>
              {showSidebar && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex md:hidden" onClick={() => setShowSidebar(false)}>
                  <div className="flex-1 bg-black/40 backdrop-blur-sm" />
                  <motion.aside initial={{ x: 300 }} animate={{ x: 0 }} exit={{ x: 300 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className="w-72 bg-white h-full overflow-y-auto shadow-float p-5"
                    onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between mb-5">
                      <p className="font-semibold text-slate-800">Refine Results</p>
                      <button onClick={() => setShowSidebar(false)} className="p-1 rounded-lg hover:bg-slate-100"><X size={16} className="text-slate-500" /></button>
                    </div>
                    <SidebarFilters filters={filters} setFilter={setFilter} />
                    {activeFiltersCount > 0 && (
                      <button onClick={clearAllFilters} className="mt-4 w-full py-2 text-xs text-red-500 hover:bg-red-50 rounded-xl transition-colors font-semibold">
                        Clear All Filters
                      </button>
                    )}
                  </motion.aside>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Desktop sidebar */}
            <aside className="hidden md:block w-56 shrink-0">
              <div className="bg-white rounded-2xl border border-slate-100 p-5 sticky top-[104px] shadow-card">
                <p className="font-semibold text-slate-800 text-sm mb-4">Refine Results</p>
                <SidebarFilters filters={filters} setFilter={setFilter} />
                {activeFiltersCount > 0 && (
                  <button onClick={clearAllFilters} className="mt-4 w-full py-2 text-xs text-red-500 hover:bg-red-50 rounded-xl transition-colors font-semibold">
                    Clear All Filters
                  </button>
                )}
              </div>
            </aside>

            {/* Profile grid */}
            <div className="flex-1 min-w-0">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-5">
                <p className="text-sm text-slate-500">
                  <strong className="text-slate-800">{processed.length}</strong>
                  {processed.length !== ALL_PROFILES.length && ` of ${ALL_PROFILES.length}`} profiles
                </p>

                {/* Sort menu */}
                <div className="relative">
                  <button onClick={() => setShowSortMenu(v => !v)}
                    className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-200 px-3 py-2 rounded-xl hover:border-slate-300 transition-colors">
                    <ArrowUpDown size={13} />
                    {SORT_OPTIONS.find(o => o.key === sort)?.label}
                    <ChevronDown size={13} className={clsx('transition-transform', showSortMenu && 'rotate-180')} />
                  </button>
                  <AnimatePresence>
                    {showSortMenu && (
                      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl shadow-float border border-slate-100 overflow-hidden z-20">
                        {SORT_OPTIONS.map(o => (
                          <button key={o.key} onClick={() => { setSort(o.key); setShowSortMenu(false) }}
                            className={clsx('w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between',
                              sort === o.key ? 'bg-trust-50 text-trust-700 font-medium' : 'text-slate-600 hover:bg-slate-50')}>
                            {o.label}
                            {sort === o.key && <Check size={13} />}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Grid */}
              {processed.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-card">
                  <Heart size={28} className="text-slate-300 mx-auto mb-3" />
                  <p className="font-display text-lg text-slate-600 mb-1">No profiles match</p>
                  <p className="text-slate-400 text-sm mb-4">Try adjusting your filters.</p>
                  <button onClick={clearAllFilters} className="text-sm text-trust-600 hover:underline font-semibold">Clear all filters</button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {visible.map((p) => (
                      <div key={p.id}
                        className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 group">
                        {/* Photo */}
                        <div className="relative h-52 overflow-hidden bg-slate-100 cursor-pointer" onClick={() => setSelectedProfile(p)}>
                          <img src={p.img} alt={p.name} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
                          <div className="absolute top-3 right-3 bg-white/90 text-trust-700 text-xs font-bold px-2.5 py-0.5 rounded-full">✓ Verified</div>
                          <div className="absolute bottom-3 left-3 text-white">
                            <p className="font-display text-lg font-semibold leading-tight">{p.name}, {p.age}</p>
                            <p className="text-white/70 text-xs">{p.location}</p>
                          </div>
                        </div>

                        <div className="p-5">
                          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-slate-500 mb-3">
                            <p><span className="font-semibold text-slate-700">Education</span>: {p.edu}</p>
                            <p><span className="font-semibold text-slate-700">Religion</span>: {p.religion}</p>
                            <p><span className="font-semibold text-slate-700">Profession</span>: {p.occ}</p>
                            <p><span className="font-semibold text-slate-700">Community</span>: {p.community}</p>
                          </div>

                          <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-2 italic">"{p.bio}"</p>

                          <div className="flex gap-2">
                            <button onClick={() => expressInterest(p.id)} disabled={interests.has(p.id)}
                              className={clsx(
                                'flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-150 flex items-center justify-center gap-1.5',
                                interests.has(p.id)
                                  ? 'bg-sage-100 text-sage-700 cursor-default'
                                  : 'bg-trust-800 text-white hover:bg-trust-700'
                              )}>
                              {interests.has(p.id)
                                ? <><Check size={13} /> Interested</>
                                : <><Heart size={13} className="fill-white/30" /> Interested</>
                              }
                            </button>
                            <button onClick={() => setSelectedProfile(p)}
                              className="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 text-slate-700 hover:border-trust-300 hover:bg-slate-50 transition-all duration-150">
                              View Profile
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Load more */}
                  {hasMore && (
                    <div className="mt-8 text-center">
                      <button onClick={() => setPage(p => p + 1)}
                        className="inline-flex items-center gap-2 px-8 py-3 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:border-trust-300 hover:text-trust-700 transition-all duration-150 shadow-card">
                        Load More Profiles
                        <span className="text-xs text-slate-400">({processed.length - visible.length} remaining)</span>
                      </button>
                    </div>
                  )}

                  <div className="mt-6 text-center">
                    <p className="text-xs text-slate-400 mb-3">Showing sample profiles only. Full details visible after registration.</p>
                    <Link href="/matrimony/register"
                      className="inline-flex items-center gap-2 px-7 py-3 bg-trust-800 text-white font-semibold rounded-xl hover:bg-trust-700 transition-colors text-sm">
                      Register to See All Profiles <ArrowRight size={14} />
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="page-container">
          <FadeIn className="text-center mb-10">
            <p className="font-accent italic text-saffron-600 text-lg mb-1">The Process</p>
            <h2 className="section-title">How Our Matchmaking Works</h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { n: '01', icon: <UserCheck size={17} className="text-trust-600" />,     t: 'Register & Share', d: 'Create a detailed, private profile.' },
              { n: '02', icon: <ShieldCheck size={17} className="text-saffron-600" />, t: 'Admin Reviews',    d: 'Our team verifies every profile personally.' },
              { n: '03', icon: <HeartHandshake size={17} className="text-trust-600" />,t: 'Counselor Matches',d: 'A human suggests compatible profiles.' },
              { n: '04', icon: <Heart size={17} className="text-red-500" />,           t: 'Express Interest', d: 'Both parties respond with interest.' },
              { n: '05', icon: <Users size={17} className="text-sage-600" />,          t: 'Family Meeting',   d: 'Families meet with full counselor support.' },
            ].map((s, i) => (
              <FadeIn key={s.n} delay={i * 0.06}>
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-card text-center">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mx-auto mb-3">{s.icon}</div>
                  <p className="text-[10px] text-slate-400 font-bold mb-1 tracking-wide">{s.n}</p>
                  <p className="font-display text-base text-trust-900 mb-1">{s.t}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{s.d}</p>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {[
              { couple: 'Priya & Rohan', year: '2023', city: 'Surat',     story: 'The counselor took time to understand both families. Within three months we knew this was right.',      img: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=400&q=80' },
              { couple: 'Kavya & Ankit', year: '2023', city: 'Surat',     story: 'The emotional readiness evaluation helped us understand ourselves before understanding each other.',   img: 'https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?w=400&q=80' },
              { couple: 'Nisha & Dev',   year: '2024', city: 'Ahmedabad', story: 'Our families were involved from the beginning, which made the entire process feel natural and dignified.', img: 'https://images.unsplash.com/photo-1515772526800-4e4bc08c40ac?w=400&q=80' },
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

      {/* ── Profile modal ─────────────────────────────────── */}
      <AnimatePresence>
        {selectedProfile && (
          <ProfileModal
            profile={selectedProfile}
            onClose={() => setSelectedProfile(null)}
            onInterest={expressInterest}
          />
        )}
      </AnimatePresence>
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
      {grp('Religion',  sel('religion',  ['Hindu','Jain','Muslim','Christian','Sikh']))}
      {grp('Community', sel('community', ['Patel','Brahmin','Jain','Kshatriya']))}
      {grp('Language',  sel('language',  ['Gujarati','Hindi','English','Marathi']))}
      {grp('Education', sel('education', ['Graduate','Post-Graduate','PhD','Diploma','10th/12th']))}
    </>
  )
}
