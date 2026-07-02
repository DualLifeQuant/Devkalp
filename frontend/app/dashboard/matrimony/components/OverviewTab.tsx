'use client'
import { useState, useMemo, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HeartHandshake, Heart, Star, Search, Check, ChevronDown, 
  X, Filter, ArrowUpDown, MapPin, ShieldCheck, AlertCircle, Camera
} from 'lucide-react'
import { Button, Card, EmptyState, Spinner } from '@/components/ui'
import { matrimonyApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

interface OverviewTabProps {
  profile: any
  profileNotFound: boolean
  matches: any[]
  activeMatchesCount: number
  onSwitchTab: (tab: string) => void
}

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
  Religion:  ['Hindu', 'Jain', 'Muslim', 'Christian', 'Sikh'],
  Language:  ['Gujarati', 'Hindi', 'English', 'Marathi', 'Punjabi'],
  City:      ['Surat', 'Ahmedabad', 'Vadodara', 'Rajkot'],
}

type SortKey = 'latest' | 'age_asc' | 'age_desc' | 'relevance'

interface Filters {
  lookingFor:   string
  ageMin:       string
  ageMax:       string
  religion:     string
  community:    string
  language:     string
  education:    string
  city:         string
  searchQuery:  string
}

const EMPTY_FILTERS: Filters = {
  lookingFor: 'Bride', ageMin: '', ageMax: '',
  religion: '', community: '', language: '', education: '', city: '', searchQuery: ''
}

const PAGE_SIZE = 8

export default function OverviewTab({
  profile,
  profileNotFound,
  matches,
  activeMatchesCount,
  onSwitchTab
}: OverviewTabProps) {
  const [apiProfiles, setApiProfiles] = useState<ApiProfile[]>([])
  const [profilesLoading, setProfilesLoading] = useState(true)
  const [profilesError, setProfilesError] = useState<string | null>(null)
  
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [sort, setSort] = useState<SortKey>('relevance')
  const [activeTab, setActiveTab] = useState<string>('Community')
  const [page, setPage] = useState(1)
  
  const [showSidebar, setShowSidebar] = useState(false)
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [interests, setInterests] = useState<Set<string>>(new Set())
  const [actionLoading, setActionLoading] = useState<Set<string>>(new Set())

  // Fetch live candidate profiles on mount
  useEffect(() => {
    setProfilesLoading(true)
    matrimonyApi.getProfiles()
      .then(res => {
        setApiProfiles(res.data || [])
      })
      .catch(err => {
        console.error('Error fetching approved profiles:', err)
        setProfilesError('Unable to load approved candidate profiles. Please check your network and try again.')
      })
      .finally(() => {
        setProfilesLoading(false)
      })
  }, [])

  // Sync initial interests from matches prop
  useEffect(() => {
    if (matches && matches.length > 0) {
      const activeInterests = new Set<string>()
      matches.forEach((m: any) => {
        const myResponse = profile && m.profile1_id === profile.id ? m.profile1_response : m.profile2_response
        if (m.status === 'interested' || myResponse === 'interested' || !['declined', 'closed'].includes(m.status)) {
          if (m.other_profile && m.other_profile.id) {
            activeInterests.add(m.other_profile.id)
          }
        }
      })
      setInterests(activeInterests)
    }
  }, [matches, profile])

  const setFilter = useCallback(<K extends keyof Filters>(key: K, val: Filters[K]) => {
    setFilters(f => ({ ...f, [key]: val }))
    setPage(1)
  }, [])

  const toggleChip = useCallback((cat: string, chip: string) => {
    setFilters(f => {
      const next = { ...f }
      if (cat === 'Community') next.community = f.community === chip ? '' : chip
      if (cat === 'Religion')  next.religion  = f.religion === chip ? '' : chip
      if (cat === 'Language')  next.language  = f.language === chip ? '' : chip
      if (cat === 'City')      next.city      = f.city === chip ? '' : chip
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

  // Express interest logic
  const expressInterest = async (id: string) => {
    if (profileNotFound || !profile) {
      toast.error('Please build your matrimony profile first using the Profile Builder tab to express interest!')
      onSwitchTab('profile')
      return
    }

    setActionLoading(prev => {
      const next = new Set(prev)
      next.add(id)
      return next
    })

    try {
      await matrimonyApi.expressInterest(id)
      setInterests(prev => {
        const next = new Set(prev)
        next.add(id)
        return next
      })
      toast.success('❤️ Interest expressed! Our counselors will coordinate introduction steps.')
    } catch (err: any) {
      const errMsg = err?.response?.data?.detail || 'Failed to record interest. Please build your profile first.'
      toast.error(errMsg)
    } finally {
      setActionLoading(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  // Filter and sort computation
  const processed = useMemo(() => {
    let result = apiProfiles.filter(p => {
      // Don't show the user's own profile in search results
      if (profile && p.id === profile.id) return false

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

    // Sort options
    if (sort === 'age_asc')  result = [...result].sort((a, b) => a.age - b.age)
    if (sort === 'age_desc') result = [...result].sort((a, b) => b.age - a.age)
    if (sort === 'latest')   result = [...result].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    return result
  }, [apiProfiles, filters, sort, profile])

  const visible = processed.slice(0, page * PAGE_SIZE)
  const hasMore = visible.length < processed.length

  const SORT_OPTIONS: { key: SortKey; label: string }[] = [
    { key: 'relevance', label: 'Relevance' },
    { key: 'latest',    label: 'Recently Joined' },
    { key: 'age_asc',   label: 'Age: Youngest First' },
    { key: 'age_desc',  label: 'Age: Oldest First' },
  ]

  const isTabActive = (tab: string) => {
    if (tab === 'Community') return !!filters.community
    if (tab === 'Religion')  return !!filters.religion
    if (tab === 'Language')  return !!filters.language
    if (tab === 'City')      return !!filters.city
    return false
  }

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* ── SEARCH & FILTER CONTROLS ── */}
      <section className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs w-full transition-all">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Left: Looking for toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner shrink-0 items-center">
            {(['Bride', 'Groom'] as const).map(v => (
              <button
                key={v}
                onClick={() => setFilter('lookingFor', v)}
                className={clsx(
                  'px-5 py-2 text-xs font-bold rounded-lg transition-all duration-200 flex items-center gap-1.5 focus:outline-none',
                  filters.lookingFor === v 
                    ? 'bg-trust-800 text-white shadow-sm' 
                    : 'text-slate-600 hover:text-trust-900'
                )}
              >
                {v === 'Bride' ? (
                  <Heart size={13} className={filters.lookingFor === v ? 'fill-saffron-300 text-saffron-300' : ''} />
                ) : (
                  <HeartHandshake size={13} />
                )}
                {v}
              </button>
            ))}
          </div>

          {/* Center: Global Search Input */}
          <div className="flex-1 min-w-[240px] max-w-2xl flex items-center gap-2.5 bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2 focus-within:border-trust-400 focus-within:ring-2 focus-within:ring-trust-100 transition-all shadow-inner">
            <Search size={14} className="text-slate-400 shrink-0" />
            <input
              placeholder="Search city, profession, education, name..."
              value={filters.searchQuery}
              onChange={e => setFilter('searchQuery', e.target.value)}
              className="flex-1 text-xs bg-transparent outline-none text-slate-800 placeholder-slate-400 min-w-0 font-medium" 
            />
            {filters.searchQuery && (
              <button onClick={() => setFilter('searchQuery', '')} className="text-slate-400 hover:text-slate-600 focus:outline-none">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Right: Quick Age & Advanced Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-1.5 shadow-inner">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mr-1 select-none">Age</span>
              <input 
                type="number" 
                min="18" 
                max="60" 
                placeholder="Min" 
                value={filters.ageMin} 
                onChange={e => setFilter('ageMin', e.target.value)}
                className="w-11 bg-transparent text-center text-xs font-bold text-slate-800 outline-none" 
              />
              <span className="text-slate-300 text-xs font-bold select-none">–</span>
              <input 
                type="number" 
                min="18" 
                max="70" 
                placeholder="Max" 
                value={filters.ageMax} 
                onChange={e => setFilter('ageMax', e.target.value)}
                className="w-11 bg-transparent text-center text-xs font-bold text-slate-800 outline-none" 
              />
            </div>

            <button 
              onClick={() => setShowSidebar(v => !v)}
              className={clsx(
                'flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all border shadow-xs focus:outline-none',
                showSidebar 
                  ? 'bg-trust-900 text-white border-trust-900 shadow-sm' 
                  : 'bg-trust-50 text-trust-800 border-trust-200 hover:bg-trust-100'
              )}
            >
              <Filter size={13} /> Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </button>
            {activeFiltersCount > 0 && (
              <button 
                onClick={clearAllFilters} 
                className="flex items-center gap-1 px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-100 text-red-600 hover:bg-red-100/80 transition-colors text-xs font-bold focus:outline-none"
              >
                <X size={13} /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Expandable Advanced Filters Drawer */}
        <AnimatePresence>
          {showSidebar && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: 'auto', opacity: 1 }} 
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }} 
              className="overflow-hidden border-t border-slate-100 mt-4 pt-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="lg:hidden">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 select-none">Age Range</p>
                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                    <input 
                      type="number" 
                      min="18" 
                      max="60" 
                      placeholder="Min" 
                      value={filters.ageMin} 
                      onChange={e => setFilter('ageMin', e.target.value)}
                      className="w-full bg-transparent text-center text-xs font-bold text-slate-800 outline-none" 
                    />
                    <span className="text-slate-300 text-xs font-bold select-none">–</span>
                    <input 
                      type="number" 
                      min="18" 
                      max="70" 
                      placeholder="Max" 
                      value={filters.ageMax} 
                      onChange={e => setFilter('ageMax', e.target.value)}
                      className="w-full bg-transparent text-center text-xs font-bold text-slate-800 outline-none" 
                    />
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1.5">Religion</p>
                  <select 
                    value={filters.religion} 
                    onChange={e => setFilter('religion', e.target.value)}
                    className="w-full py-2 px-3 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none focus:border-trust-400 cursor-pointer font-bold"
                  >
                    <option value="">Any Religion</option>
                    {['Hindu','Jain','Muslim','Christian','Sikh'].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1.5">Community</p>
                  <select 
                    value={filters.community} 
                    onChange={e => setFilter('community', e.target.value)}
                    className="w-full py-2 px-3 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none focus:border-trust-400 cursor-pointer font-bold"
                  >
                    <option value="">Any Community</option>
                    {['Patel','Brahmin','Jain','Kshatriya','Muslim','Christian'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1.5">Language</p>
                  <select 
                    value={filters.language} 
                    onChange={e => setFilter('language', e.target.value)}
                    className="w-full py-2 px-3 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none focus:border-trust-400 cursor-pointer font-bold"
                  >
                    <option value="">Any Language</option>
                    {['Gujarati','Hindi','English','Marathi','Punjabi'].map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1.5">City</p>
                  <select 
                    value={filters.city} 
                    onChange={e => setFilter('city', e.target.value)}
                    className="w-full py-2 px-3 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none focus:border-trust-400 cursor-pointer font-bold"
                  >
                    <option value="">Any City</option>
                    {['Surat','Ahmedabad','Vadodara','Rajkot'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1.5">Education</p>
                  <select 
                    value={filters.education} 
                    onChange={e => setFilter('education', e.target.value)}
                    className="w-full py-2 px-3 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none focus:border-trust-400 cursor-pointer font-bold"
                  >
                    <option value="">Any Education</option>
                    {['Graduate','Post-Graduate','PhD','Diploma','10th/12th'].map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category Filter Toolbar */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-3 overflow-x-auto flex-nowrap w-full pb-1 scrollbar-none">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1 select-none">
              <Filter size={12} /> Filter By:
            </span>

            <div className="flex bg-slate-100/80 p-1 rounded-xl shadow-inner shrink-0 items-center">
              {FILTER_TABS.map(tab => {
                const active = activeTab === tab
                const hasActiveFilter = isTabActive(tab)
                return (
                  <button 
                    key={tab} 
                    onClick={() => setActiveTab(tab)}
                    className={clsx(
                      'px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shrink-0 focus:outline-none',
                      active 
                        ? 'bg-white text-trust-950 shadow-xs font-extrabold' 
                        : 'text-slate-600 hover:text-slate-900'
                    )}
                  >
                    {tab}
                    {hasActiveFilter && <span className="w-1.5 h-1.5 rounded-full bg-saffron-500 shadow-xs shrink-0" />}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="w-[1px] h-5 bg-slate-200 shrink-0 mx-1 select-none" />

          {/* Active Chips scroll-track */}
          <div className="flex items-center gap-1.5 shrink-0 flex-nowrap">
            {FILTER_CHIPS[activeTab]?.map(chip => {
              const active =
                (activeTab === 'Community' && filters.community === chip) ||
                (activeTab === 'Religion'  && filters.religion  === chip) ||
                (activeTab === 'Language'  && filters.language  === chip) ||
                (activeTab === 'City'      && filters.city      === chip)

              return (
                <button 
                  key={chip} 
                  onClick={() => toggleChip(activeTab, chip)}
                  className={clsx(
                    'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-1.5 border shrink-0 focus:outline-none',
                    active
                      ? 'bg-gradient-to-r from-saffron-400 to-saffron-500 text-trust-950 border-none shadow-xs scale-105 font-extrabold'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-trust-300 hover:text-slate-900 shadow-2xs'
                  )}
                >
                  {active && <Check size={12} className="text-trust-950 stroke-[3]" />}
                  {chip}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── PROFILE GRID SECTION ── */}
      <section className="space-y-6">
        
        {/* Statistics and Sorting Header */}
        <div className="flex items-center justify-between bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex-wrap gap-4">
          <div>
            <h3 className="font-display text-xl font-bold text-trust-900 mb-0.5">Explore Approved Candidates</h3>
            <p className="text-xs text-slate-500 font-medium">
              Displaying <strong className="text-trust-900 font-bold">{processed.length}</strong> active profiles matched to your search scope
            </p>
          </div>

          <div className="relative">
            <button 
              onClick={() => setShowSortMenu(v => !v)}
              className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-2xl hover:border-slate-300 transition-colors shadow-inner focus:outline-none"
            >
              <ArrowUpDown size={14} className="text-trust-800" />
              {SORT_OPTIONS.find(o => o.key === sort)?.label}
              <ChevronDown size={14} className={clsx('transition-transform', showSortMenu && 'rotate-180')} />
            </button>
            <AnimatePresence>
              {showSortMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 6 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-56 bg-white rounded-3xl shadow-float border border-slate-100 overflow-hidden z-20"
                >
                  {SORT_OPTIONS.map(o => (
                    <button 
                      key={o.key} 
                      onClick={() => { setSort(o.key); setShowSortMenu(false) }}
                      className={clsx(
                        'w-full text-left px-5 py-3.5 text-xs transition-colors flex items-center justify-between font-semibold focus:outline-none',
                        sort === o.key ? 'bg-trust-50 text-trust-800 font-bold' : 'text-slate-600 hover:bg-slate-50'
                      )}
                    >
                      {o.label}
                      {sort === o.key && <Check size={14} className="text-trust-800 stroke-[3]" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Content States */}
        {profilesLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-card animate-pulse">
                <div className="h-60 bg-slate-100" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-slate-100 rounded-full w-3/4 animate-pulse" />
                  <div className="h-3 bg-slate-100 rounded-full w-1/2 animate-pulse" />
                  <div className="h-10 bg-slate-100 rounded-2xl mt-4 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : profilesError ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-card max-w-xl mx-auto p-8 flex flex-col items-center">
            <AlertCircle size={40} className="text-red-500 mb-4" />
            <p className="font-display text-lg text-slate-800 font-bold mb-2">Failed to load profiles</p>
            <p className="text-slate-400 text-sm mb-6 max-w-md">{profilesError}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-2.5 bg-trust-800 text-white rounded-xl text-xs font-bold hover:bg-trust-700 transition-colors focus:outline-none"
            >
              Retry Connection
            </button>
          </div>
        ) : processed.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-card max-w-2xl mx-auto p-8 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
              <Heart size={28} className="text-slate-350" />
            </div>
            <p className="font-display text-xl text-slate-800 font-bold mb-2">
              {apiProfiles.length === 0 ? 'No approved profiles yet' : 'No profiles match your search criteria'}
            </p>
            <p className="text-slate-400 text-sm mb-6 max-w-md leading-relaxed">
              {apiProfiles.length === 0
                ? 'Check back soon! Our counseling specialists approve new registration details daily.'
                : 'Try adjusting your filter categories, increasing the age range, or clearing active chips.'}
            </p>
            {apiProfiles.length > 0 && (
              <button 
                onClick={clearAllFilters} 
                className="px-6 py-2.5 bg-trust-800 text-white rounded-xl text-xs font-bold hover:bg-trust-700 transition-colors focus:outline-none"
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {visible.map((p) => {
                const photo = p.photos?.[0] || null
                const hasExpressedInterest = interests.has(p.id)
                const isSubmitting = actionLoading.has(p.id)

                return (
                  <div 
                    key={p.id}
                    className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 group flex flex-col"
                  >
                    {/* Photo & Basic Indicators */}
                    <div className="relative h-60 overflow-hidden bg-slate-100 shrink-0">
                      {photo ? (
                        <img 
                          src={photo} 
                          alt={p.name} 
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                          <div className="w-20 h-20 rounded-full bg-white/60 flex items-center justify-center">
                            <span className="text-3xl font-bold text-slate-450 uppercase">{p.name[0]}</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Premium verified badge overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                      <div className="absolute top-3.5 right-3.5 bg-white/95 backdrop-blur-sm text-trust-800 text-[10px] font-bold px-3 py-1 rounded-full shadow-xs flex items-center gap-1 uppercase tracking-wider select-none">
                        <Check size={11} className="text-trust-700 stroke-[3]" /> Verified
                      </div>

                      {/* Display name, age, city overlay */}
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <p className="font-display text-lg font-bold leading-tight drop-shadow-xs">{p.name}, {p.age}</p>
                        <p className="text-saffron-300 text-xs font-semibold mt-0.5 flex items-center gap-1 truncate select-none">
                          <MapPin size={12} className="shrink-0" /> {p.city}{p.state ? `, ${p.state}` : ''}
                        </p>
                      </div>
                    </div>

                    {/* Metadata & Career Grid */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs mb-3.5 p-3 bg-slate-50 rounded-2xl border border-slate-100/80 select-none">
                          <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Education</p>
                            <p className="font-bold text-slate-700 truncate" title={p.education}>{p.education}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Profession</p>
                            <p className="font-bold text-slate-700 truncate" title={p.occupation}>{p.occupation}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Religion</p>
                            <p className="font-bold text-slate-700 truncate">{p.religion}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Community</p>
                            <p className="font-bold text-slate-700 truncate">{p.caste || '—'}</p>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 italic font-accent">
                          "{p.bio || 'Looking for a compatible life partner.'}"
                        </p>
                      </div>

                      {/* Premium Dual CTA Actions */}
                      <div className="flex gap-2 pt-3 border-t border-slate-100 shrink-0">
                        <button 
                          onClick={() => expressInterest(p.id)} 
                          disabled={hasExpressedInterest || isSubmitting}
                          className={clsx(
                            'flex-1 py-2.5 text-xs font-bold rounded-2xl transition-all duration-150 flex items-center justify-center gap-1.5 shadow-xs focus:outline-none',
                            hasExpressedInterest
                              ? 'bg-sage-50 text-sage-600 cursor-default shadow-none border border-sage-100'
                              : isSubmitting
                                ? 'bg-trust-100 text-trust-500 cursor-wait'
                                : 'bg-trust-800 text-white hover:bg-trust-750 hover:shadow-sm'
                          )}
                        >
                          {isSubmitting ? (
                            <Spinner size="sm" className="text-trust-600" />
                          ) : hasExpressedInterest ? (
                            <><Check size={13} className="stroke-[3]" /> Interested</>
                          ) : (
                            <><Heart size={13} className="fill-white/30" /> Interested</>
                          )}
                        </button>
                        
                        <button 
                          onClick={() => {
                            if (profileNotFound || !profile) {
                              toast.error('Complete your matrimony profile to connect with candidates.')
                              onSwitchTab('profile')
                            } else {
                              toast('Details verified by Senior counselors. Connect by expressing interest!', {
                                icon: '🤝',
                              })
                            }
                          }}
                          className="flex-1 py-2.5 text-xs font-bold rounded-2xl border border-slate-200 text-slate-750 hover:border-trust-450 hover:bg-slate-50 transition-all duration-150 flex items-center justify-center focus:outline-none"
                        >
                          Vetted Details
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pagination Load More */}
            {hasMore && (
              <div className="mt-10 text-center">
                <button 
                  onClick={() => setPage(p => p + 1)}
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-2xl hover:border-trust-400 hover:text-trust-900 transition-all duration-150 shadow-xs hover:shadow-sm focus:outline-none"
                >
                  Load More Candidate Profiles
                  <span className="text-xs text-slate-400 font-normal">({processed.length - visible.length} remaining)</span>
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* ── 👑 VIP COUNSELOR'S CHOICE SHOWCASE CAROUSEL ── */}
      <section className="pt-8 pb-4 border-t border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="font-accent italic text-saffron-600 text-xs mb-0.5">Elite Matchmaking</p>
            <h2 className="font-display text-xl font-bold text-trust-900 flex items-center gap-1.5">
              <Star size={18} className="text-saffron-555 fill-saffron-500" /> VIP Counselor's Choice
            </h2>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block font-semibold select-none">
            Handpicked & Personally Screened by Senior Counselors
          </p>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-none flex-nowrap w-full" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {processed.slice(0, 8).map((p, idx) => {
            const photo = p.photos?.[0] || null
            const hasExpressedInterest = interests.has(p.id)
            const tagLabels = ['Highly Compatible', 'Recently Joined', 'Top Rated', 'Nearby', 'Verified Early']
            const tagColors = [
              'bg-trust-50 text-trust-750 border border-trust-100',
              'bg-sage-50 text-sage-750 border border-sage-100',
              'bg-saffron-50 text-saffron-800 border border-saffron-100',
              'bg-trust-50 text-trust-750 border border-trust-100',
              'bg-sage-50 text-sage-750 border border-sage-100',
            ]
            return (
              <div 
                key={`vip-${p.id}`} 
                className="flex-none w-64 bg-white rounded-2xl overflow-hidden shadow-card border border-slate-100 flex flex-col group transition-all duration-300 hover:shadow-card-hover"
              >
                <div className="h-36 relative overflow-hidden bg-slate-50 shrink-0">
                  {photo ? (
                    <img 
                      src={photo} 
                      alt={p.name} 
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-555" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                      <span className="text-3xl font-bold text-slate-350 uppercase">{p.name[0]}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-trust-950/80 via-trust-950/15 to-transparent" />
                  <span className={clsx('absolute top-2.5 left-2.5 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider', tagColors[idx % tagColors.length])}>
                    {tagLabels[idx % tagLabels.length]}
                  </span>
                  
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between text-white">
                    <div className="min-w-0 pr-2">
                      <p className="font-display text-sm font-bold leading-tight truncate">{p.name}, {p.age}</p>
                      <p className="text-saffron-300 text-[10px] font-semibold mt-0.5 truncate">{p.occupation}</p>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20 shrink-0 select-none">
                      <ShieldCheck size={12} className="text-white" />
                    </div>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-white">
                  <p className="text-[11px] text-slate-500 line-clamp-2 italic font-accent leading-relaxed">
                    "{p.bio || 'Looking for a family-oriented partner with traditional values and modern outlook.'}"
                  </p>
                  
                  <button 
                    onClick={() => expressInterest(p.id)} 
                    disabled={hasExpressedInterest || actionLoading.has(p.id)}
                    className={clsx(
                      'w-full py-2 text-xs font-bold rounded-xl transition-all duration-150 flex items-center justify-center gap-1.5 shadow-2xs focus:outline-none',
                      hasExpressedInterest 
                        ? 'bg-sage-50 text-sage-700 cursor-default shadow-none border border-sage-200' 
                        : 'bg-trust-50 text-trust-800 hover:bg-trust-100 hover:border-trust-300 border border-trust-200'
                    )}
                  >
                    {hasExpressedInterest ? (
                      <><Check size={12} className="stroke-[3]" /> Interest Recorded</>
                    ) : (
                      <><Heart size={12} className="fill-trust-800/10" /> Express VIP Interest</>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>

    </div>
  )
}
