import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Instagram, Heart, MessageCircle, Bookmark, Compass, Send, 
  Grid, Tv, UserSquare2, ChevronLeft, MoreHorizontal, Bell,
  Battery, Wifi, Signal
} from 'lucide-react'
import { instagramApi } from '@/lib/api'

// Verified Badge SVG helper
const VerifiedBadge = () => (
  <span className="w-3.5 h-3.5 rounded-full bg-[#0095f6] flex items-center justify-center inline-block shrink-0 ml-1">
    <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 text-white fill-white" strokeWidth={3} stroke="currentColor">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
    </svg>
  </span>
)

export default function VirtualPhone() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPost, setSelectedPost] = useState<any>(null)
  const [view, setView] = useState<'profile' | 'detail'>('profile')
  const [activeTab, setActiveTab] = useState<'grid' | 'reels' | 'tagged'>('grid')
  
  // Custom states for interactive features
  const [timeStr, setTimeStr] = useState('18:18')
  const [isFollowing, setIsFollowing] = useState(false)
  const [likesState, setLikesState] = useState<{ [postId: string]: { count: number; liked: boolean } }>({})
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([])
  
  // Hover state to pop the phone out without tilting it
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    // Local clock update
    const updateTime = () => {
      const now = new Date()
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }))
    }
    updateTime()
    const timer = setInterval(updateTime, 30000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const loadFeed = async () => {
      try {
        const res = await instagramApi.list({ active_only: true })
        if (Array.isArray(res.data)) {
          setPosts(res.data)
          // Initialize likes/comments state from DB values
          const initialLikes: typeof likesState = {}
          res.data.forEach((p: any) => {
            initialLikes[p.id] = {
              count: p.likes_count || 100,
              liked: false
            }
          })
          setLikesState(initialLikes)
        }
      } catch (err) {
        console.error('Failed to load Instagram posts for virtual phone', err)
      } finally {
        setLoading(false)
      }
    }
    loadFeed()
  }, [])

  // Mouse handlers removed to prevent rotation during click navigation

  const handlePostClick = (post: any) => {
    setSelectedPost(post)
    setView('detail')
  }

  const handleBackToProfile = () => {
    setView('profile')
    setSelectedPost(null)
  }

  const handleLikeToggle = (postId: string) => {
    setLikesState(prev => {
      const state = prev[postId] || { count: 120, liked: false }
      const newLiked = !state.liked
      return {
        ...prev,
        [postId]: {
          count: newLiked ? state.count + 1 : state.count - 1,
          liked: newLiked
        }
      }
    })
  }

  const triggerHeartAnimation = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // Add flying heart instance
    const id = Date.now()
    setHearts(prev => [...prev, { id, x, y }])
    
    // Auto remove heart instance
    setTimeout(() => {
      setHearts(prev => prev.filter(h => h.id !== id))
    }, 1000)
  }

  const handleDoubleTap = (e: React.MouseEvent, postId: string) => {
    // Trigger double tap like
    const state = likesState[postId]
    if (state && !state.liked) {
      handleLikeToggle(postId)
    }
    triggerHeartAnimation(e)
  }

  return (
    <div 
      className="relative select-none cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Phone Body Frame */}
      <motion.div
        className="w-[280px] h-[570px] bg-[#1e293b] rounded-[44px] p-[10px] border-4 border-slate-700/50 flex flex-col relative overflow-hidden"
        animate={{
          y: isHovered ? -12 : 0,
          scale: isHovered ? 1.05 : 1,
          boxShadow: isHovered 
            ? '0 35px 60px -15px rgba(0,0,0,0.75)' 
            : '0 20px 40px -10px rgba(0,0,0,0.5)'
        }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      >
        {/* Dynamic screen reflection shimmer */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 pointer-events-none z-20 rounded-[34px]" />

        {/* Dynamic Island / Notch */}
        <div className="absolute top-[14px] left-1/2 -translate-x-1/2 w-[85px] h-[18px] bg-black rounded-full z-30 flex items-center justify-between px-3">
          {/* Mock Camera lens & sensor */}
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#0d0d1e] blur-[0.5px]" />
        </div>

        {/* Home Indicator Bar */}
        <div className="absolute bottom-[8px] left-1/2 -translate-x-1/2 w-[90px] h-[4px] bg-slate-400/80 rounded-full z-30 pointer-events-none" />

        {/* Phone screen content */}
        <div className="w-full h-full bg-white text-black rounded-[34px] flex flex-col relative overflow-hidden text-xs">
          
          {/* 1. Phone Status Bar */}
          <div className="h-[36px] bg-white flex justify-between items-center px-6 pt-2 select-none shrink-0 z-20">
            <span className="font-semibold tracking-tight text-[11px]">{timeStr}</span>
            <div className="flex items-center gap-1.5 text-slate-800">
              <Signal size={10} strokeWidth={2.5} />
              <Wifi size={10} strokeWidth={2.5} />
              <Battery size={11} strokeWidth={2.5} className="rotate-90 origin-center text-slate-800 -mr-0.5" />
            </div>
          </div>

          {/* 2. Instagram Views Area */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
            
            {/* View A: Profile grid */}
            {view === 'profile' && (
              <div className="flex-1 flex flex-col overflow-y-auto scrollbar-none">
                
                {/* Profile Header */}
                <div className="h-10 border-b border-slate-100 flex items-center justify-between px-3.5 sticky top-0 bg-white z-10">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-sm tracking-tight">devkalp_foundation</span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-800">
                    <Bell size={16} />
                    <MoreHorizontal size={16} />
                  </div>
                </div>

                {/* Profile Info Details */}
                <div className="p-3.5 space-y-2.5">
                  {/* Avatar ring + Stats */}
                  <div className="flex items-center justify-between gap-2.5">
                    {/* Story Gradient Ring */}
                    <div className="w-[66px] h-[66px] rounded-full p-[2.5px] bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 flex items-center justify-center shrink-0">
                      <div className="w-full h-full rounded-full bg-white p-[2px] flex items-center justify-center">
                        <img 
                          src="/devkalp-logo.jpeg" 
                          alt="Devkalp Avatar" 
                          className="w-full h-full rounded-full object-cover" 
                        />
                      </div>
                    </div>

                    {/* Stats columns */}
                    <div className="flex-1 flex justify-around text-center select-none text-[11px] font-semibold text-slate-700">
                      <div>
                        <p className="font-bold text-black text-xs">{posts.length || 21}</p>
                        <p className="text-[10px] text-slate-400 font-normal">posts</p>
                      </div>
                      <div>
                        <p className="font-bold text-black text-xs">94</p>
                        <p className="text-[10px] text-slate-400 font-normal">followers</p>
                      </div>
                      <div>
                        <p className="font-bold text-black text-xs">5</p>
                        <p className="text-[10px] text-slate-400 font-normal">following</p>
                      </div>
                    </div>
                  </div>

                  {/* Bio descriptions matching screenshot */}
                  <div className="space-y-0.5">
                    <h3 className="font-bold text-black text-[11.5px] leading-tight">
                      Devkalp_foundation
                    </h3>
                    <div className="text-slate-900 leading-[1.35] text-[10px] font-medium space-y-0.5">
                      <p>🌿 Devkalp Foundation</p>
                      <p>Hope. Humanity. Impact</p>
                      <p>Education • Health • Environment</p>
                      <p>📍 Gujarat, Surat</p>
                      <p>🤝 Join us for volunteer</p>
                      <p>✉️ DM to volunteer or support</p>
                    </div>
                  </div>

                  {/* Profile action CTA buttons matching screenshot */}
                  <div className="flex gap-1.5 text-center text-[11px] font-bold">
                    <a 
                      href="https://www.instagram.com/devkalp_foundation?igsh=bjEyaDBzOTFhbDB0"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 py-1.5 rounded-lg bg-[#0095f6] hover:bg-[#1877f2] text-white text-[10.5px] flex items-center justify-center"
                    >
                      Follow
                    </a>
                    <a 
                      href="https://www.instagram.com/devkalp_foundation?igsh=bjEyaDBzOTFhbDB0"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-black text-[10.5px] flex items-center justify-center"
                    >
                      Message
                    </a>
                    <a 
                      href="https://www.instagram.com/devkalp_foundation?igsh=bjEyaDBzOTFhbDB0"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 shrink-0"
                    >
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2}>
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <line x1="19" y1="8" x2="19" y2="14" />
                        <line x1="22" y1="11" x2="16" y2="11" />
                      </svg>
                    </a>
                  </div>
                </div>

                {/* Tabs selection bar matching screenshot (Grid, Video, Repost/Arrows, Tagged) */}
                <div className="flex border-t border-slate-100 text-slate-400 h-9 shrink-0">
                  <button 
                    onClick={() => setActiveTab('grid')}
                    className={`flex-1 flex items-center justify-center border-b ${
                      activeTab === 'grid' ? 'text-black border-black' : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <Grid size={15} />
                  </button>
                  <button 
                    onClick={() => setActiveTab('reels')}
                    className={`flex-1 flex items-center justify-center border-b ${
                      activeTab === 'reels' ? 'text-black border-black' : 'border-transparent'
                    }`}
                  >
                    <svg viewBox="0 0 24 24" className="w-[15px] h-[15px]" fill="none" stroke="currentColor" strokeWidth={2.2}>
                      <rect x="2" y="2" width="20" height="20" rx="4" />
                      <polygon points="10,8 16,12 10,16" fill="currentColor" className="text-slate-400" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => setActiveTab('tagged')}
                    className="flex-1 flex items-center justify-center border-b border-transparent"
                  >
                    <svg viewBox="0 0 24 24" className="w-[15px] h-[15px]" fill="none" stroke="currentColor" strokeWidth={2.2}>
                      <path d="M17 2l4 4-4 4" />
                      <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
                      <path d="M7 22l-4-4 4-4" />
                      <path d="M21 13v1a4 4 0 0 1-4 4H3" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => setActiveTab('tagged')}
                    className="flex-1 flex items-center justify-center border-b border-transparent"
                  >
                    <UserSquare2 size={15} />
                  </button>
                </div>

                {/* Grid contents loading */}
                {loading ? (
                  <div className="flex justify-center items-center py-10 flex-1">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-900" />
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 font-medium">No posts found</div>
                ) : activeTab === 'grid' ? (
                  <div className="grid grid-cols-3 gap-[1px] bg-slate-100 flex-1">
                    {posts.map((post) => (
                      <div 
                        key={post.id}
                        onClick={() => handlePostClick(post)}
                        className="aspect-square bg-slate-200 relative group overflow-hidden cursor-pointer"
                      >
                        <img src={post.image_url} alt="" className="w-full h-full object-cover" />
                        
                        {/* Hover Overlay count */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 text-white text-[10px] font-bold">
                          <span className="flex items-center gap-0.5">
                            <Heart size={9} className="fill-white" />
                            {likesState[post.id]?.count || post.likes_count}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <MessageCircle size={9} className="fill-white" />
                            {post.comments_count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center py-16 text-slate-400 font-medium">
                    <Instagram size={24} className="mb-2 text-slate-300" />
                    <span>No {activeTab} uploads yet</span>
                  </div>
                )}
              </div>
            )}

            {/* View B: Post Detail View */}
            {view === 'detail' && selectedPost && (
              <div className="flex-1 flex flex-col overflow-y-auto bg-white scrollbar-none relative">
                {/* Detail View Header */}
                <div className="h-10 border-b border-slate-100 flex items-center px-2 sticky top-0 bg-white z-10 select-none">
                  <button onClick={handleBackToProfile} className="p-1 text-slate-800 hover:bg-slate-50 rounded-full">
                    <ChevronLeft size={20} />
                  </button>
                  <span className="font-bold text-[13px] ml-1">Posts</span>
                </div>

                {/* Profile Post Author */}
                <div className="flex items-center justify-between px-3 py-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-[30px] h-[30px] rounded-full p-[1px] bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 flex items-center justify-center">
                      <div className="w-full h-full rounded-full bg-white p-[1px] flex items-center justify-center">
                        <img src="/devkalp-logo.jpeg" alt="" className="w-full h-full rounded-full object-cover bg-white" />
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-[10.5px] flex items-center">
                        devkalp_foundation
                      </div>
                      <p className="text-[9px] text-slate-500 -mt-0.5">Surat, Gujarat, India</p>
                    </div>
                  </div>
                  <MoreHorizontal size={14} className="text-slate-600" />
                </div>

                {/* Image display container */}
                <div 
                  className="aspect-square bg-slate-100 w-full relative overflow-hidden cursor-pointer shrink-0"
                  onDoubleClick={(e) => handleDoubleTap(e, selectedPost.id)}
                >
                  <img src={selectedPost.image_url} alt="" className="w-full h-full object-cover" />

                  {/* Floating heart burst animation */}
                  <AnimatePresence>
                    {hearts.map((h) => (
                      <motion.div
                        key={h.id}
                        className="absolute text-red-500 pointer-events-none"
                        initial={{ opacity: 0, scale: 0.3, x: h.x - 24, y: h.y - 24 }}
                        animate={{ 
                          opacity: [0, 1, 1, 0], 
                          scale: [0.3, 1.4, 1.4, 0.8], 
                          y: h.y - 80 
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      >
                        <Heart size={44} className="fill-red-500 stroke-red-600" />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Actions footer bar */}
                <div className="p-3 py-2 space-y-2 select-none">
                  {/* Action icons */}
                  <div className="flex items-center justify-between text-slate-800">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => handleLikeToggle(selectedPost.id)}
                        className="hover:scale-105 transition-transform"
                      >
                        <Heart 
                          size={18} 
                          className={likesState[selectedPost.id]?.liked 
                            ? 'text-red-500 fill-red-500' 
                            : 'text-slate-800 hover:text-red-500'
                          } 
                        />
                      </button>
                      <MessageCircle size={18} className="hover:scale-105 transition-transform" />
                      <Send size={18} className="hover:scale-105 transition-transform" />
                    </div>
                    <Bookmark size={18} className="hover:scale-105 transition-transform" />
                  </div>

                  {/* Likes count info */}
                  <p className="font-bold text-[10.5px] text-slate-800">
                    Liked by <span className="hover:underline cursor-pointer">nevil_mansara</span> and{' '}
                    <span>{likesState[selectedPost.id]?.count || selectedPost.likes_count} others</span>
                  </p>

                  {/* Post Caption description */}
                  <div className="text-[10px] leading-[1.3] text-slate-700 whitespace-pre-wrap">
                    <span className="font-bold text-black text-[10.5px] mr-1">devkalp_foundation</span>
                    {selectedPost.caption}
                  </div>

                  {/* Age of post */}
                  <p className="text-[8.5px] uppercase font-semibold text-slate-400 tracking-wider pt-0.5">
                    1 day ago
                  </p>
                </div>
              </div>
            )}

          </div>

          {/* 3. Instagram bottom Nav Bar */}
          <div className="h-[44px] border-t border-slate-100 flex justify-around items-center px-4 shrink-0 bg-white select-none z-20">
            <button onClick={handleBackToProfile} className={`p-1.5 ${view === 'profile' ? 'text-black' : 'text-slate-500 hover:text-black'}`}>
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M3 9.5L12 3l9 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-4a1.5 1.5 0 0 1-1.5-1.5v-5a1.5 1.5 0 0 0-1.5-1.5h-1A1.5 1.5 0 0 0 9 14v5A1.5 1.5 0 0 1 7.5 21h-4A1.5 1.5 0 0 1 3 19.5z" />
              </svg>
            </button>
            <button className="p-1.5 text-slate-500 hover:text-black">
              <Compass size={20} strokeWidth={2.2} />
            </button>
            <button className="p-1.5 text-slate-500 hover:text-black">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.2}>
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <path d="M12 8v8M8 12h8" />
              </svg>
            </button>
            <a 
              href="https://www.instagram.com/devkalp_foundation?igsh=bjEyaDBzOTFhbDB0" 
              target="_blank" 
              rel="noreferrer" 
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 text-slate-500 hover:text-black"
            >
              <Send size={18} strokeWidth={2.2} />
            </a>
            <button 
              onClick={handleBackToProfile}
              className="w-5 h-5 rounded-full border border-slate-200 p-[0.5px] overflow-hidden hover:scale-105 transition-transform bg-white"
            >
              <img src="/devkalp-logo.jpeg" alt="" className="w-full h-full rounded-full object-cover bg-white" />
            </button>
          </div>

        </div>
      </motion.div>
    </div>
  )
}
