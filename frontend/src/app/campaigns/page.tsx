import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Leaf, Calendar, MapPin, Search, X, Check, Play, Video } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Button, EmptyState } from '@/components/ui'
import { campaignsApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'
import VariableProximity from '@/components/ui/VariableProximity'
import Seo from '@/components/common/Seo'

const isVideoUrl = (url: string): boolean => {
  if (!url) return false
  const videoExtensions = ['.mp4', '.webm', '.mov', '.ogg', '.mkv', '.avi']
  const lowerUrl = url.toLowerCase()
  return (
    videoExtensions.some(ext => lowerUrl.endsWith(ext) || lowerUrl.includes(ext + '?')) ||
    lowerUrl.includes('/video/upload/')
  )
}


const CAT_META: Record<string,{label:string;color:string;bg:string}> = {
  health:      { label:'Health',      color:'text-red-700',    bg:'bg-red-100'   },
  education:   { label:'Education',   color:'text-trust-700',  bg:'bg-trust-100' },
  environment: { label:'Environment', color:'text-sage-700',   bg:'bg-sage-100'  },
  community:   { label:'Community',   color:'text-warm-700',   bg:'bg-warm-100'  },
}
const getCategoryLabel = (c: string) => {
  if (CAT_META[c]) return CAT_META[c].label
  return c.charAt(0).toUpperCase() + c.slice(1)
}

const HERO_IMGS = [
  'volunteer.jpg',
]

/* ── Skeleton card ─────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden animate-pulse">
      <div className="h-48 bg-slate-200" />
      <div className="p-5 space-y-3">
        <div className="h-3 bg-slate-200 rounded-full w-20" />
        <div className="h-4 bg-slate-200 rounded-full w-3/4" />
        <div className="h-3 bg-slate-200 rounded-full w-full" />
        <div className="h-3 bg-slate-200 rounded-full w-4/5" />
        <div className="h-10 bg-slate-200 rounded-xl mt-4" />
      </div>
    </div>
  )
}

export default function CampaignsPage() {
  const containerRef = useRef<HTMLElement>(null)
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [categories, setCategories] = useState<string[]>(['All'])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [selectedCamp, setSelectedCamp] = useState<any>(null)
  const [activeMedia, setActiveMedia] = useState<string | null>(null)

  useEffect(() => {
    if (selectedCamp) {
      setActiveMedia(selectedCamp.cover_image || (selectedCamp.media_gallery && selectedCamp.media_gallery[0]) || null)
    } else {
      setActiveMedia(null)
    }
  }, [selectedCamp])


  useEffect(() => {
    campaignsApi.categories()
      .then(res => {
        if (Array.isArray(res.data)) {
          setCategories(['All', ...res.data])
        }
      })
      .catch(err => {
        console.error("Failed to fetch campaign categories:", err)
      })
  }, [])

  useEffect(() => {
    const params: any = { limit: 30 }
    if (category !== 'All') params.category = category
    setLoading(true)
    campaignsApi.list(params)
      .then(r => setCampaigns(r.data.items || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [category])

  const filtered = campaigns.filter(c =>
    !search || (c.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.short_description || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <Seo
        title="Campaigns"
        description="Explore Devkalp Foundation's active health, education, and community campaigns and see the impact of transparent, accountable giving."
        path="/campaigns"
      />
      <Navbar transparent />

      {/* ── BREATHTAKING CINEMATIC HERO (MATCHING JOBS & MATRIMONY PAGES) ── */}
      <section ref={containerRef} className="relative min-h-screen flex items-center justify-center bg-trust-950 overflow-hidden pt-28 pb-16">
        {/* Background Image & Gradient Overlays */}
        <div className="absolute inset-0">
          <img src={HERO_IMGS[0]} alt="Devkalp Campaigns" className="w-full h-full object-cover opacity-25" />
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

        <div className="page-container relative z-10 w-full max-w-5xl mx-auto text-center px-4 pt-8">
          {/* Mission Badge */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-saffron-400/20 border border-saffron-400/30 rounded-full px-4 py-1.5 mb-6 shadow-inner">
            <Leaf size={14} className="text-saffron-300 shrink-0" />
            <span className="text-saffron-200 text-xs font-bold tracking-wider uppercase">Where Grassroots Change Happens · Devkalp Foundation</span>
          </motion.div>

          {/* Headline */}
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.12] mb-6 tracking-tight">
            <VariableProximity
              label="Our Conducted"
              containerRef={containerRef}
              fromFontVariationSettings="'wght' 700, 'opsz' 9"
              toFontVariationSettings="'wght' 1000, 'opsz' 40"
              radius={150}
              falloff="linear"
            />{' '}
            <span className="text-saffron-300 italic font-light">
              <VariableProximity
                label="Social Campaigns"
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
            From school health sessions to nutrition drives — explore the grassroots impact we've created in <strong className="text-white font-bold">Surat, Gujarat</strong> and beyond.
          </motion.p>

          {/* Premium Search Bar Box */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.45 }}
            className="bg-white/95 backdrop-blur-md rounded-2xl p-2 sm:p-2.5 shadow-2xl border border-white/20 flex items-center gap-2 max-w-2xl mx-auto w-full">
            <div className="flex-1 flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200/80 focus-within:border-trust-400 focus-within:ring-2 focus-within:ring-trust-100 transition-all shadow-2xs">
              <Search size={20} className="text-trust-800 shrink-0" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search past campaigns by title, keywords, or description..."
                className="w-full text-sm text-slate-800 placeholder-slate-400 outline-none bg-transparent font-medium py-1" />
              {search && (
                <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
                  <X size={16} />
                </button>
              )}
            </div>
          </motion.div>

          {/* Quick Stats / Trust Signals */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.6 }}
            className="flex items-center justify-center gap-8 mt-6 text-xs text-white/80 flex-wrap font-medium">
            <span className="flex items-center gap-1.5"><Check size={14} className="text-saffron-300 stroke-[3]" /> 100% Grassroots Impact</span>
            <span className="flex items-center gap-1.5"><Check size={14} className="text-saffron-300 stroke-[3]" /> Real Community Stories</span>
            <span className="flex items-center gap-1.5"><Check size={14} className="text-saffron-300 stroke-[3]" /> Transparent Records</span>
          </motion.div>
        </div>
      </section>

      <div className="page-container py-12">
        {/* Category filter */}
        <div className="flex gap-2 mb-8 flex-wrap relative z-0">
          {categories.map((c, i) => {
            const isActive = category === c
            return (
              <button key={c} onClick={() => setCategory(c)}
                className={clsx('relative px-5 py-2 rounded-xl text-sm font-medium capitalize transition-colors duration-200 z-10',
                  isActive ? 'text-white border border-transparent' : 'bg-white border border-slate-200 text-slate-600 hover:border-sage-300 hover:text-sage-700')}
              >
                {isActive && (
                  <motion.span
                    layoutId="activeCampaignBg"
                    className="absolute inset-0 bg-sage-700 rounded-xl -z-10 shadow-sm"
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  />
                )}
                {c === 'All' ? 'All Campaigns' : getCategoryLabel(c)}
              </button>
            )
          })}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({length:6}).map((_,i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={<Leaf size={24}/>} title="No campaigns found" description="Try a different category or search term." />
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {filtered.map((c: any, i: number) => {
                const cat = CAT_META[c.category]
                const rotationAngles = [-2, 1, 3, -1, 2, -3]
                const rot = rotationAngles[i % rotationAngles.length]
                const year = c.event_date ? new Date(c.event_date).getFullYear() : '2024'

                return (
                  <motion.div key={c.id}
                    layout
                    onClick={async () => {
                      const loadId = toast.loading('Loading campaign details...')
                      try {
                        const res = await campaignsApi.get(c.slug)
                        setSelectedCamp(res.data)
                        toast.dismiss(loadId)
                      } catch {
                        toast.dismiss(loadId)
                        toast.error('Failed to load campaign details')
                      }
                    }}
                    initial={{ opacity:0, y:30, rotate: 0 }} 
                    animate={{ opacity:1, y:0, rotate: rot }} 
                    exit={{ opacity:0, scale:0.96 }}
                    transition={{ duration:0.5, delay: i * 0.08, ease:[0.22,1,0.36,1] }}
                    whileHover={{ scale: 1.05, rotate: 0, zIndex: 10, transition: { duration: 0.3 } }}
                    className="bg-white p-3 pb-12 md:p-4 md:pb-16 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 group cursor-pointer relative hover:shadow-[0_20px_50px_rgb(0,0,0,0.2)] transition-shadow"
                  >
                    <div className="relative w-full aspect-square overflow-hidden bg-slate-100 shadow-inner">
                      {/* Image */}
                      {c.cover_image ? (
                        <img src={c.cover_image} alt={c.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      ) : (
                        <img
                          src={`https://images.unsplash.com/photo-${['1529156069898-49953e39b3ac','1469571486292-0ba58a3f068b','1488521787991-ed7bbaae773c'][i % 3]}?w=600&q=80`}
                          alt={c.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      )}
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Content Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 flex items-end justify-between">
                        <div className="flex-1 pr-4">
                          <p className="text-white/80 text-xs font-semibold tracking-widest mb-1.5">{year}</p>
                          <h3 className="text-white font-display text-xl md:text-2xl font-bold uppercase leading-tight drop-shadow-md">
                            {c.title}
                          </h3>
                        </div>
                        <div className="shrink-0 pb-1">
                          <span className="text-white/70 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase">
                            {getCategoryLabel(c.category)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Campaign Details & Gallery Modal */}
      <AnimatePresence>
        {selectedCamp && (
          <motion.div
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-50 bg-trust-950/60 backdrop-blur-md flex items-center justify-center p-4 md:p-8 overflow-y-auto"
            onClick={() => setSelectedCamp(null)}
          >
            <motion.div
              initial={{ opacity:0, scale:0.95, y:20 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.95, y:20 }}
              transition={{ duration:0.3, ease:[0.22,1,0.36,1] }}
              className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative flex flex-col md:flex-row"
              onClick={e => e.stopPropagation()}
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedCamp(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/50 hover:bg-white backdrop-blur-md rounded-full flex items-center justify-center text-slate-800 transition-colors shadow-sm"
              >
                <X size={20} />
              </button>

              {/* Photo Gallery Column */}
              <div className="w-full md:w-1/2 p-4 md:p-6 space-y-4">
                <div className="h-64 sm:h-80 w-full rounded-2xl overflow-hidden shadow-sm relative group bg-slate-900 flex items-center justify-center">
                  {activeMedia && isVideoUrl(activeMedia) ? (
                    <video src={activeMedia} controls className="w-full h-full object-contain" />
                  ) : (
                    <img src={activeMedia || 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&q=80'} alt="Main" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  )}
                </div>
                {selectedCamp.media_gallery && selectedCamp.media_gallery.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {selectedCamp.media_gallery.map((url: string, idx: number) => {
                      const isSelected = activeMedia === url
                      const isVideo = isVideoUrl(url)
                      return (
                        <div key={idx} onClick={() => setActiveMedia(url)}
                          className={clsx(
                            "h-32 rounded-xl overflow-hidden shadow-sm relative group bg-slate-100 cursor-pointer transition-all duration-300",
                            isSelected ? "ring-4 ring-trust-600 ring-offset-2 scale-[1.02]" : "hover:scale-[1.01]"
                          )}
                        >
                          {isVideo ? (
                            <>
                              <video src={url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" muted />
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center transition-colors group-hover:bg-black/45">
                                <div className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-xs flex items-center justify-center text-trust-950 shadow-md">
                                  <Play size={14} className="fill-trust-950 translate-x-0.5" />
                                </div>
                              </div>
                            </>
                          ) : (
                            <img src={url} alt={`Gallery ${idx+1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 border border-dashed border-slate-200 rounded-2xl text-xs text-slate-400">
                    No gallery photos or videos available
                  </div>
                )}

              </div>

              {/* Campaign Notes & Details Column */}
              <div className="w-full md:w-1/2 p-6 md:py-8 md:pr-10 border-t md:border-t-0 md:border-l border-slate-100 flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <span className={`text-xs font-bold px-3 py-1 rounded-lg ${CAT_META[selectedCamp.category]?.bg || 'bg-slate-100'} ${CAT_META[selectedCamp.category]?.color || 'text-slate-700'}`}>
                    {getCategoryLabel(selectedCamp.category)}
                  </span>
                </div>
                
                <h2 className="font-display text-3xl font-bold text-trust-900 mb-4 leading-tight">
                  {selectedCamp.title}
                </h2>
                
                <div className="flex items-center gap-4 text-sm text-slate-500 mb-6 font-medium">
                  {selectedCamp.city && <span className="flex items-center gap-1.5"><MapPin size={16} className="text-saffron-500"/>{selectedCamp.city}, Gujarat</span>}
                  {selectedCamp.event_date && <span className="flex items-center gap-1.5"><Calendar size={16} className="text-saffron-500"/>{new Date(selectedCamp.event_date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</span>}
                </div>

                <div className="space-y-6 flex-1">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Campaign Overview</h4>
                    <p className="text-slate-600 leading-relaxed text-sm">
                      {selectedCamp.description || selectedCamp.short_description || "A wonderful grassroots initiative executed by our dedicated team to drive meaningful impact in the local community."}
                    </p>
                  </div>

                  {selectedCamp.notes ? (
                    <div className="bg-trust-50 border border-trust-100 rounded-2xl p-5">
                      <h4 className="text-sm font-bold text-trust-900 mb-2 flex items-center gap-2">
                        <Check size={16} className="text-trust-600" /> Key Impact Notes
                      </h4>
                      <ul className="text-sm text-trust-800 space-y-2 list-inside list-disc">
                        {selectedCamp.notes.split('\n').filter((line: string) => line.trim().length > 0).map((line: string, idx: number) => (
                          <li key={idx}>{line.trim().replace(/^[•\-\*\s]+/, '')}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="bg-trust-50 border border-trust-100 rounded-2xl p-5">
                      <h4 className="text-sm font-bold text-trust-900 mb-2 flex items-center gap-2">
                        <Check size={16} className="text-trust-600" /> Key Impact Notes
                      </h4>
                      <ul className="text-sm text-trust-800 space-y-2 list-inside list-disc">
                        <li>Over 100+ community members directly benefited.</li>
                        <li>Initiative aligned with our core sustainability goals.</li>
                        <li>Successfully partnered with local civic authorities.</li>
                      </ul>
                    </div>
                  )}
                </div>
                
                <div className="pt-8 mt-auto">
                  <button 
                    onClick={() => setSelectedCamp(null)}
                    className="w-full py-3.5 bg-trust-900 text-white rounded-xl font-semibold shadow-md hover:bg-trust-800 transition-colors"
                  >
                    Close Gallery
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
