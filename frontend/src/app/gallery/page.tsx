import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Image as ImageIcon, X, ChevronLeft, ChevronRight } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { EmptyState, Spinner } from '@/components/ui'
import { galleryApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

const CATEGORIES = [
  { value: 'All', label: 'All Media' },
  { value: 'matrimony', label: 'Matrimony Services' },
  { value: 'health', label: 'Health Campaigns' },
  { value: 'giving', label: 'Transparent Giving' },
  { value: 'livelihood', label: 'Livelihood Support' },
  { value: 'volunteer', label: 'Volunteer Ecosystem' },
  { value: 'general', label: 'General NGO Events' },
]

export default function GalleryPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('All')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const loadGallery = async () => {
    setLoading(true)
    try {
      const res = await galleryApi.list({ active_only: true })
      if (Array.isArray(res.data)) {
        setItems(res.data)
      } else {
        setItems([])
      }
    } catch {
      toast.error('Failed to load media gallery')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGallery()
  }, [])

  const filtered = items.filter(item => {
    return category === 'All' || item.category === category
  })

  const getCategoryLabel = (val: string) => {
    const cat = CATEGORIES.find(c => c.value === val)
    return cat ? cat.label : val ? val.charAt(0).toUpperCase() + val.slice(1) : 'General'
  }

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (lightboxIndex === null) return
    setLightboxIndex(lightboxIndex === 0 ? filtered.length - 1 : lightboxIndex - 1)
  }

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (lightboxIndex === null) return
    setLightboxIndex(lightboxIndex === filtered.length - 1 ? 0 : lightboxIndex + 1)
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <Navbar />

      {/* ── PHOTO CONTENT AREA ── */}
      <div className="page-container pt-32 pb-16">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-trust-900 mb-4">
            Media & Photo Gallery
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Explore snapshots of our school health campaigns, counseling services, local employment drives, and active volunteering fields.
          </p>

        </div>
        
        {/* Category Filters */}
        <div className="flex gap-2.5 mb-10 flex-wrap justify-center relative z-0">
          {CATEGORIES.map((catItem) => {
            const isActive = category === catItem.value
            return (
              <button key={catItem.value} onClick={() => setCategory(catItem.value)}
                className={clsx('relative px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors duration-200 z-10',
                  isActive ? 'text-white border border-transparent' : 'bg-white border border-slate-200 text-slate-600 hover:border-saffron-300 hover:text-trust-900')}
              >
                {isActive && (
                  <motion.span
                    layoutId="activeGalleryCategoryBg"
                    className="absolute inset-0 bg-trust-800 rounded-xl -z-10 shadow-sm"
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  />
                )}
                {catItem.label}
              </button>
            )
          })}
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Spinner size="lg" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={<ImageIcon size={32} className="text-slate-300" />} title="No photos found" description="No gallery postings match your selected filters." />
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <AnimatePresence>
              {filtered.map((item, idx) => (
                <motion.div
                  key={item.id}
                  layout
                  onClick={() => setLightboxIndex(idx)}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="group relative bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden bg-slate-50 relative">
                    <img 
                      src={item.image_url} 
                      alt="Gallery Item" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      loading="lazy" 
                    />
                    
                    {/* Category overlay label */}
                    <div className="absolute top-3 left-3 bg-trust-950/80 backdrop-blur-xs border border-white/10 text-white text-[9px] uppercase font-bold px-2 py-0.5 rounded-md tracking-wider">
                      {getCategoryLabel(item.category)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* ── LIGHTBOX VIEWER MODAL ── */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={() => setLightboxIndex(null)}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 md:p-10 select-none"
          >
            {/* Close Button */}
            <button 
              onClick={() => setLightboxIndex(null)} 
              className="absolute top-6 right-6 w-11 h-11 bg-white/5 border border-white/10 hover:bg-white/10 rounded-full flex items-center justify-center text-white transition-colors"
              title="Close"
            >
              <X size={20} />
            </button>

            {/* Left navigation arrow */}
            <button 
              onClick={handlePrev} 
              className="absolute left-6 w-12 h-12 bg-white/5 border border-white/10 hover:bg-white/10 rounded-full flex items-center justify-center text-white transition-colors"
              title="Previous"
            >
              <ChevronLeft size={24} />
            </button>

            {/* Content box */}
            <motion.div 
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-4xl flex flex-col items-center gap-6"
            >
              <div className="relative max-h-[60vh] md:max-h-[70vh] rounded-2xl overflow-hidden border border-white/10 bg-slate-900 shadow-2xl flex items-center justify-center">
                <img 
                  src={filtered[lightboxIndex].image_url} 
                  alt={filtered[lightboxIndex].title} 
                  className="max-h-[60vh] md:max-h-[70vh] w-auto max-w-full object-contain"
                />
              </div>
              
              <div className="text-center max-w-2xl text-white space-y-2">
                <span className="text-[10px] font-bold text-saffron-400 bg-saffron-500/10 border border-saffron-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider inline-block">
                  {getCategoryLabel(filtered[lightboxIndex].category)}
                </span>
              </div>
            </motion.div>

            {/* Right navigation arrow */}
            <button 
              onClick={handleNext} 
              className="absolute right-6 w-12 h-12 bg-white/5 border border-white/10 hover:bg-white/10 rounded-full flex items-center justify-center text-white transition-colors"
              title="Next"
            >
              <ChevronRight size={24} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  )
}
