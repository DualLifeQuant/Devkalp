import { useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, ArrowRight, Star, Users, HandHeart, Briefcase, Leaf, HeartHandshake, Quote, Trophy, Award as AwardIcon, Newspaper, ChevronLeft, ChevronRight, Ambulance, Sparkles, TreeDeciduous, Activity, Coins } from 'lucide-react'
import { awardsApi, pressApi, partnersApi } from '@/lib/api'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import VariableProximity from '@/components/ui/VariableProximity'
import CountUp from '@/components/ui/CountUp'
import ConstellationBackground from '@/components/ui/ConstellationBackground'
import IndiaMap from '@/components/ui/IndiaMap'
import { useAuthStore } from '@/lib/store'
import VirtualPhone from '@/components/ui/VirtualPhone'

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div className={className}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}>
      {children}
    </motion.div>
  )
}

const STATS = [
  { value: 80, suffix: '+', label: 'Marriages Facilitated' },
  { value: 5400, suffix: '+', separator: ',', label: 'School\'s Student Sessions Held' },
  { value: 100, suffix: '+', label: 'Lives Placed in Jobs' },
]
const GALLERY = [
  '2.jpeg',
  '13.jpeg',
  '12.jpeg',
  '3.jpeg',
  '8.jpeg',
  '11.jpeg',
]
const MODULES = [
  { href: '/matrimony', img: 'matrimony.jpg', icon: <HeartHandshake size={22} />, bg: 'bg-trust-50', text: 'text-trust-700', title: 'Matrimony', desc: 'Counselor-guided matchmaking rooted in family values and personalized compatibility.', cta: 'Create Profile' },
  { href: '/donate', img: '1.jpeg', icon: <HandHeart size={22} />, bg: 'bg-saffron-50', text: 'text-saffron-700', title: 'Donate', desc: '100% transparent giving. Donations are eligible for tax deduction under Section 80G.', cta: 'Support a Cause' },
  { href: '/campaigns', img: 'camp.jpg', icon: <Leaf size={22} />, bg: 'bg-sage-50', text: 'text-sage-700', title: 'Campaigns', desc: 'School health drives tracked session by session across Surat, Gujarat.', cta: 'See Our Work' },
  { href: '/jobs', img: 'jobs.jpg', icon: <Briefcase size={22} />, bg: 'bg-trust-50', text: 'text-trust-700', title: 'Careers', desc: 'Mission-driven hiring. We prepare candidates and stand by them throughout.', cta: 'Browse Jobs' },
  { href: '/volunteer', img: 'volunteer.jpg', icon: <Users size={22} />, bg: 'bg-sage-50', text: 'text-sage-700', title: 'Volunteer', desc: 'Contribute your time to communities across Surat, Gujarat and beyond.', cta: 'Join the Team' },
]
const TESTIMONIALS = [
  { name: 'Priya Shah', city: 'Surat', text: 'The counselors truly understood our family. They found a match that felt right from the very first meeting.', role: 'Matrimony Member', stars: 5 },
  { name: 'Rajiv Patel', city: 'Surat', text: 'I donated and could see exactly where every rupee went. That transparency made all the difference.', role: 'Regular Donor', stars: 5 },
  { name: 'Meena Desai', city: 'Surat', text: 'Volunteering for the awareness sessions was life-changing. The team is dedicated and every session counts.', role: 'Volunteer', stars: 5 },
  { name: 'Arjun Mehta', city: 'Surat', text: "Got placed through Devkalp. They didn't just send my resume — they prepared me throughout.", role: 'Candidate', stars: 5 },
]

const IMPACT_TABS = [
  {
    id: 0,
    label: 'Education',
    title: 'Nurturing Minds, Building Futures',
    desc1: 'At Devkalp Foundation, we believe education is the key to breaking the cycle of poverty. We support rural schools by providing quality learning materials, library setup, and volunteer-led tutoring programs.',
    desc2: 'Our mentorship programs and scholarships guide students through their educational journeys, equipping them with the knowledge and confidence to build self-reliant futures.',
    badgeText: '5,400+ Students Mentored',
    badgeIcon: <Sparkles className="text-rose-400 shrink-0" size={20} />,
    colorClass: 'bg-rose-500',
    textClass: 'text-rose-400',
    borderClass: 'border-rose-500/20',
    bgClass: 'from-rose-500/10 to-transparent',
  },
  {
    id: 1,
    label: 'Healthcare',
    title: 'Healing Hands, Happy Communities',
    desc1: 'Healthcare is a fundamental pillar of human dignity. Devkalp organizes health camps, raises medical awareness, and brings essential diagnostic facilities directly to families in remote and underserved villages.',
    desc2: 'Through active collaborations and mobile support clinics, we provide primary health screenings, nutritional guidance, and healthcare resources to ensure no one is left behind.',
    badgeText: '58+ Health Camps Conducted',
    badgeIcon: <Ambulance className="text-sky-400 shrink-0" size={20} />,
    colorClass: 'bg-sky-500',
    textClass: 'text-sky-400',
    borderClass: 'border-sky-500/20',
    bgClass: 'from-sky-500/10 to-transparent',
  },
  {
    id: 2,
    label: 'Empowerment',
    title: 'Empowering Lives, Enabling Dreams',
    desc1: 'We foster holistic empowerment to help individuals lead fulfilling lives. Our counselor-guided matrimony program connects families, helping individuals find compatible partners based on values and mutual trust.',
    desc2: 'Additionally, we prepare candidates for careers through local placement, interview mentorship, and job matching, alongside providing active volunteering roles to empower citizens to give back to their communities.',
    badgeText: '80+ Matrimony Matches & Job Placements',
    badgeIcon: <HeartHandshake className="text-emerald-400 shrink-0" size={20} />,
    colorClass: 'bg-emerald-500',
    textClass: 'text-emerald-400',
    borderClass: 'border-emerald-500/20',
    bgClass: 'from-emerald-500/10 to-transparent',
  }
]

export default function HomePage() {
  const { isLoggedIn } = useAuthStore()
  const containerRef = useRef<HTMLElement>(null)
  const awardsSliderRef = useRef<HTMLDivElement>(null)
  const [awards, setAwards] = useState<any[]>([])
  const [pressMentions, setPressMentions] = useState<any[]>([])
  const [partners, setPartners] = useState<any[]>([])
  const [activeImpactTab, setActiveImpactTab] = useState(0)
  const [isImpactHovered, setIsImpactHovered] = useState(false)

  useEffect(() => {
    if (isImpactHovered) return
    const interval = setInterval(() => {
      setActiveImpactTab((prev) => (prev + 1) % 3)
    }, 5000)
    return () => clearInterval(interval)
  }, [isImpactHovered])

  const scrollLeft = () => {
    if (awardsSliderRef.current) {
      awardsSliderRef.current.scrollBy({ left: -380, behavior: 'smooth' })
    }
  }
  const scrollRight = () => {
    if (awardsSliderRef.current) {
      awardsSliderRef.current.scrollBy({ left: 380, behavior: 'smooth' })
    }
  }

  useEffect(() => {
    const fetchAwards = async () => {
      try {
        const res = await awardsApi.list()
        if (Array.isArray(res.data)) {
          setAwards(res.data)
        }
      } catch (err) {
        console.error("Failed to fetch awards:", err)
      }
    }
    const fetchPress = async () => {
      try {
        const res = await pressApi.list()
        if (Array.isArray(res.data)) {
          setPressMentions(res.data)
        }
      } catch (err) {
        console.error("Failed to fetch press mentions:", err)
      }
    }
    const fetchPartners = async () => {
      try {
        const res = await partnersApi.list({ active_only: true })
        if (Array.isArray(res.data)) {
          setPartners(res.data)
        }
      } catch (err) {
        console.error("Failed to fetch partners:", err)
      }
    }
    fetchAwards()
    fetchPress()
    fetchPartners()
  }, [])

  useEffect(() => {
    const initGsap = async () => {
      const { gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)

      gsap.fromTo('.gsap-module-card',
        { opacity: 0, y: 40, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          stagger: 0.12,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.gsap-modules-grid',
            start: 'top 80%',
          }
        }
      )
    }
    initGsap()
  }, [])
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navbar transparent />

      {/* HERO */}
      <section ref={containerRef} className="relative min-h-screen flex items-center bg-trust-950 overflow-hidden">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-70"
        >
          <source src="/1.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-gradient-to-br from-trust-950/85 via-trust-900/80 to-[#0c1e4a]/75 z-10" />
        <div className="absolute inset-0 bg-hero-pattern opacity-15 z-10" />
        <motion.div
          animate={{
            x: [0, 15, -10, 0],
            y: [0, -25, 15, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 right-1/3 w-96 h-96 bg-saffron-500/5 rounded-full blur-3xl pointer-events-none z-10"
        />
        <ConstellationBackground />
        <div className="page-container relative z-20 py-24 pt-36">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}
              className="inline-flex flex-wrap items-center gap-3 mb-7">
              <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 border border-white/10">
                <span className="w-2 h-2 rounded-full bg-saffron-400 animate-pulse" />
                <span className="text-white/70 text-sm">NGO · Surat, Gujarat · Empowering Since 2025</span>
              </div>
              <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 border border-white/10">
                <span className="w-2 h-2 rounded-full bg-saffron-400 animate-pulse" />
                <span className="text-white/70 text-xs font-bold uppercase tracking-wider">Section 8 Company</span>
              </div>
              <Link to="/80g" className="inline-flex items-center gap-2 bg-saffron-500/20 hover:bg-saffron-500/30 border border-saffron-400/40 hover:border-saffron-400/70 rounded-full px-4 py-1.5 transition-all duration-300 shadow-sm hover:scale-[1.02] group">
                <span className="w-2 h-2 rounded-full bg-saffron-400 animate-pulse group-hover:scale-110 transition-transform" />
                <span className="text-saffron-300 text-xs font-semibold uppercase tracking-wider">12A & 80G Tax Benefits</span>
              </Link>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}
              className="font-display text-5xl md:text-6xl font-semibold text-white leading-[1.1] mb-5">
              <VariableProximity
                label="Where Every Family"
                containerRef={containerRef}
                fromFontVariationSettings="'wght' 600, 'opsz' 9"
                toFontVariationSettings="'wght' 1000, 'opsz' 40"
                radius={150}
                falloff="linear"
              />
              <br />
              <span className="text-saffron-300 italic font-light">
                <VariableProximity
                  label="Finds Its Story"
                  containerRef={containerRef}
                  fromFontVariationSettings="'wght' 300, 'opsz' 9"
                  toFontVariationSettings="'wght' 800, 'opsz' 40"
                  radius={150}
                  falloff="linear"
                />
              </span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.28 }}
              className="text-white/60 text-lg leading-relaxed max-w-xl mb-9">
              Devkalp Foundation walks alongside families through marriage, health, livelihood, and community —
              with <em className="not-italic font-accent text-xl text-saffron-200">trust, care, and human connection.</em>
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap gap-4">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link to="/matrimony" className="inline-flex items-center gap-2 px-8 py-3.5 bg-saffron-400 text-trust-900 font-bold rounded-xl hover:bg-saffron-300 transition-colors shadow-warm text-sm">
                  <HeartHandshake size={18} /> Begin Your Journey
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link to="/donate" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white/10 text-white font-medium rounded-xl hover:bg-white/15 border border-white/10 transition-colors text-sm">
                  <Heart size={15} /> Donate Us
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-12 bg-white border-y border-slate-100">
        <div className="page-container">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
            {STATS.map((s, i) => (
              <FadeIn key={s.label} delay={i * 0.07} className="text-center">
                <p className="font-display text-3xl md:text-4xl font-semibold text-trust-700 mb-1">
                  <CountUp to={s.value} separator={s.separator} />{s.suffix}
                </p>
                <p className="text-slate-500 text-sm">{s.label}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 80G TAX BENEFITS BANNER */}
      <section className="py-8 bg-gradient-to-r from-saffron-500/10 via-saffron-500/5 to-transparent border-b border-slate-100">
        <div className="page-container">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-saffron-100 flex items-center justify-center shrink-0">
                <Star className="text-saffron-600 fill-saffron-300" size={24} />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-trust-900 flex items-center flex-wrap gap-2">
                  80G Tax Exemption Certificate
                  <span className="bg-saffron-100 text-saffron-800 text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full tracking-wider">Save Tax</span>
                </h3>
                <p className="text-slate-600 text-sm mt-0.5">All donations to Devkalp Foundation qualify for a tax deduction under Section 80G of the Income Tax Act.</p>
              </div>
            </div>
            <Link to="/80g" className="inline-flex items-center gap-2 px-6 py-3 bg-trust-900 hover:bg-trust-800 text-white text-sm font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-sm shrink-0">
              Claim 80G Benefits <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* MODULES (BENTO SHOWCASE) */}
      <section className="py-16 bg-[#0a1128] text-white relative overflow-hidden">
        {/* Ambient Glowing Orbs */}
        <div className="absolute top-1/4 left-1/4 -translate-y-1/2 w-96 h-96 bg-saffron-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 translate-y-1/2 w-96 h-96 bg-trust-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-hero-pattern opacity-5 pointer-events-none" />

        <div className="page-container relative z-10">
          <FadeIn className="text-center mb-10">
            <p className="font-accent italic text-saffron-400 text-lg mb-2">How We Can Help</p>
            <h2 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-wider text-white">
              Every Need, <span className="text-saffron-400">One Home</span>
            </h2>
          </FadeIn>

          <div className="gsap-modules-grid grid grid-cols-1 md:grid-cols-6 gap-6">
            {/* Card 1: Matrimony (Featured) */}
            <div className="gsap-module-card opacity-0 md:col-span-4 h-full">
              <Link to="/matrimony" className="group block relative overflow-hidden bg-white/[0.02] backdrop-blur-md border border-white/10 hover:border-saffron-500/50 hover:shadow-[0_0_40px_rgba(245,158,11,0.12)] rounded-3xl transition-all duration-500 h-full">
                <div className="flex flex-col sm:flex-row h-full">
                  <div className="p-6 sm:w-3/5 flex flex-col justify-between h-full min-h-[220px]">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-saffron-500/10 text-saffron-400 flex items-center justify-center border border-saffron-500/20 mb-4 group-hover:bg-saffron-500 group-hover:text-trust-950 transition-all duration-300">
                        <HeartHandshake size={20} />
                      </div>
                      <span className="bg-saffron-500/10 border border-saffron-500/20 text-saffron-300 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full mb-3 inline-block">
                        Featured Service
                      </span>
                      <h3 className="font-display text-2xl font-bold text-white mb-3">Matrimony</h3>
                      <p className="text-slate-400 text-sm leading-relaxed mb-4">
                        Counselor-guided matchmaking rooted in family values and personalized compatibility. Not an algorithm — a real relationship.
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-saffron-400 group-hover:text-saffron-300 group-hover:gap-2.5 transition-all duration-300">
                      Create Profile <ArrowRight size={14} />
                    </span>
                  </div>
                  <div className="sm:w-2/5 relative overflow-hidden min-h-[160px] sm:min-h-0 border-t sm:border-t-0 sm:border-l border-white/10">
                    <img
                      src="matrimony.jpg"
                      alt="Matrimony"
                      className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-85 group-hover:scale-105 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-trust-950/90 via-transparent to-transparent" />
                  </div>
                </div>
              </Link>
            </div>

            {/* Card 2: Donate */}
            <div className="gsap-module-card opacity-0 md:col-span-2 h-full">
              <Link to="/donate" className="group block relative overflow-hidden bg-white/[0.02] backdrop-blur-md border border-white/10 hover:border-saffron-500/50 hover:shadow-[0_0_40px_rgba(245,158,11,0.12)] rounded-3xl transition-all duration-500 h-full p-5 flex flex-col justify-between">
                <div>
                  <div className="relative w-full h-28 overflow-hidden rounded-2xl mb-4 border border-white/5">
                    <img
                      src="1.jpeg"
                      alt="Donate"
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-85 group-hover:scale-105 transition-all duration-700"
                    />
                    <div className="absolute top-3 right-3 bg-saffron-500 text-trust-950 text-[9px] uppercase font-extrabold px-2.5 py-1 rounded-full tracking-wider shadow-md">
                      Tax Exempt (80G)
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-saffron-500/10 text-saffron-400 flex items-center justify-center border border-saffron-500/20 group-hover:bg-saffron-500 group-hover:text-trust-950 transition-all duration-300">
                      <HandHeart size={20} />
                    </div>
                    <h3 className="font-display text-xl font-bold text-white">Donate</h3>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed mt-4">
                    100% transparent giving. Support critical healthcare campaigns, matrimony sponsorships, or education funds.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-saffron-400 group-hover:text-saffron-300 group-hover:gap-2.5 transition-all duration-300 mt-4">
                  Support a Cause <ArrowRight size={14} />
                </span>
              </Link>
            </div>

            {/* Card 3: Campaigns */}
            <div className="gsap-module-card opacity-0 md:col-span-2 h-full">
              <Link to="/campaigns" className="group block relative overflow-hidden bg-white/[0.02] backdrop-blur-md border border-white/10 hover:border-saffron-500/50 hover:shadow-[0_0_40px_rgba(245,158,11,0.12)] rounded-3xl transition-all duration-500 h-full p-5 flex flex-col justify-between">
                <div>
                  <div className="relative w-full h-28 overflow-hidden rounded-2xl mb-4 border border-white/5">
                    <img
                      src="camp.jpg"
                      alt="Campaigns"
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-85 group-hover:scale-105 transition-all duration-700"
                    />
                    <div className="absolute top-3 right-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[9px] uppercase font-bold px-2.5 py-1 rounded-full tracking-wider">
                      Active Drives
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-trust-950 transition-all duration-300">
                      <Leaf size={20} />
                    </div>
                    <h3 className="font-display text-xl font-bold text-white">Campaigns</h3>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed mt-4">
                    School health awareness drives covering menstrual hygiene, nutrition, and adolescent wellness across Surat, Gujarat.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-saffron-400 group-hover:text-saffron-300 group-hover:gap-2.5 transition-all duration-300 mt-4">
                  See Our Work <ArrowRight size={14} />
                </span>
              </Link>
            </div>

            {/* Card 4: Careers */}
            <div className="gsap-module-card opacity-0 md:col-span-2 h-full">
              <Link to="/jobs" className="group block relative overflow-hidden bg-white/[0.02] backdrop-blur-md border border-white/10 hover:border-saffron-500/50 hover:shadow-[0_0_40px_rgba(245,158,11,0.12)] rounded-3xl transition-all duration-500 h-full p-5 flex flex-col justify-between">
                <div>
                  <div className="relative w-full h-28 overflow-hidden rounded-2xl mb-4 border border-white/5">
                    <img
                      src="jobs.jpg"
                      alt="Careers"
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-85 group-hover:scale-105 transition-all duration-700"
                    />
                    <div className="absolute top-3 right-3 bg-blue-500/20 border border-blue-500/30 text-blue-300 text-[9px] uppercase font-bold px-2.5 py-1 rounded-full tracking-wider">
                      Local Placement
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-trust-950 transition-all duration-300">
                      <Briefcase size={20} />
                    </div>
                    <h3 className="font-display text-xl font-bold text-white">Careers</h3>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed mt-4">
                    Mission-driven placement. We prepare local candidates for interviews and walk with them throughout the hiring process.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-saffron-400 group-hover:text-saffron-300 group-hover:gap-2.5 transition-all duration-300 mt-4">
                  Browse Jobs <ArrowRight size={14} />
                </span>
              </Link>
            </div>

            {/* Card 5: Volunteer */}
            <div className="gsap-module-card opacity-0 md:col-span-2 h-full">
              <Link to="/volunteer" className="group block relative overflow-hidden bg-white/[0.02] backdrop-blur-md border border-white/10 hover:border-saffron-500/50 hover:shadow-[0_0_40px_rgba(245,158,11,0.12)] rounded-3xl transition-all duration-500 h-full p-5 flex flex-col justify-between">
                <div>
                  <div className="relative w-full h-28 overflow-hidden rounded-2xl mb-4 border border-white/5">
                    <img
                      src="volunteer.jpg"
                      alt="Volunteer"
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-85 group-hover:scale-105 transition-all duration-700"
                    />
                    <div className="absolute top-3 right-3 bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[9px] uppercase font-bold px-2.5 py-1 rounded-full tracking-wider">
                      180+ Active
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20 group-hover:bg-purple-500 group-hover:text-trust-950 transition-all duration-300">
                      <Users size={20} />
                    </div>
                    <h3 className="font-display text-xl font-bold text-white">Volunteer</h3>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed mt-4">
                    Join our structured, respected volunteer network to run health camps, mentor students, or distribute food.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-saffron-400 group-hover:text-saffron-300 group-hover:gap-2.5 transition-all duration-300 mt-4">
                  Join the Team <ArrowRight size={14} />
                </span>
              </Link>
            </div>

            {/* Card 6: Need Guidance (Full Width Banner) */}
            <div className="gsap-module-card opacity-0 md:col-span-6 w-full">
              <div className="relative overflow-hidden bg-gradient-to-r from-trust-900 to-[#0e2763] border border-white/10 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 hover:shadow-[0_0_35px_rgba(30,58,138,0.25)] hover:border-trust-500/50 transition-all duration-500">
                <div className="absolute right-0 top-0 bottom-0 w-96 bg-saffron-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                  <div className="w-14 h-14 rounded-2xl bg-saffron-400 text-trust-950 flex items-center justify-center shrink-0 shadow-lg shadow-saffron-500/20">
                    <Heart size={26} className="fill-trust-950" />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-bold text-white mb-1">Need Guidance?</h3>
                    <p className="text-white/70 text-sm max-w-xl">
                      Our experienced counselors are available for a free, completely confidential first conversation to help guide your journey.
                    </p>
                  </div>
                </div>
                <Link
                  to="/contact"
                  className="px-8 py-4 bg-white hover:bg-saffron-400 text-trust-950 font-bold rounded-2xl shadow-lg hover:shadow-saffron-400/20 transition-all duration-300 hover:scale-[1.02] shrink-0 inline-flex items-center gap-2 text-sm md:text-base border border-transparent"
                >
                  Talk to a counselor <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW WE WORK */}
      <section className="py-20 bg-white">
        <div className="page-container">
          <div className="grid md:grid-cols-2 gap-14 items-center">
            <FadeIn>
              <p className="font-accent italic text-saffron-600 text-lg mb-1.5">Our Approach</p>
              <h2 className="section-title mb-5">We Walk With You, Not Just For You</h2>
              <p className="text-slate-500 leading-relaxed mb-7">Every matrimony profile is reviewed by a human. Every match is suggested with care. Every donation is reported transparently.</p>
              <div className="space-y-4">
                {[
                  { n: '01', t: 'Personal Intake', d: 'A counselor meets you first — to listen, not just collect forms.' },
                  { n: '02', t: 'Family Involved', d: 'We honour the role of family and invite their participation.' },
                  { n: '03', t: 'Ongoing Support', d: "We stay available through the journey, not just at sign-up." },
                ].map(s => (
                  <div key={s.n} className="flex gap-4 items-start">
                    <span className="w-9 h-9 rounded-xl bg-saffron-100 text-saffron-700 font-display font-bold text-sm flex items-center justify-center shrink-0">{s.n}</span>
                    <div><p className="font-semibold text-slate-800 text-sm mb-0.5">{s.t}</p><p className="text-slate-500 text-sm">{s.d}</p></div>
                  </div>
                ))}
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="bg-gradient-to-br from-trust-50 to-saffron-50 rounded-2xl p-8 border border-slate-100">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-full bg-trust-100 flex items-center justify-center"><Heart size={16} className="text-trust-700 fill-trust-200" /></div>
                  <div><p className="font-semibold text-slate-800 text-sm">Counselor's Note</p><p className="text-xs text-slate-400">After first session</p></div>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed italic font-accent text-base">"The family came in nervous. After two hours of genuine conversation, the nervousness transformed into clarity. That shift — that's what we work towards every day."</p>
                <div className="mt-4 pt-4 border-t border-slate-200 flex items-center gap-2">
                  <div className="flex text-saffron-400 gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={10} fill="currentColor" />)}</div>
                  <span className="text-xs text-slate-500">Session completed · Surat, Gujarat</span>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* CEO MESSAGE */}
      <section className="py-20 bg-slate-50/40 border-t border-slate-100 relative overflow-hidden">
        {/* Subtle background background effects */}
        <div className="absolute top-1/2 left-10 w-72 h-72 bg-saffron-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/2 right-10 w-72 h-72 bg-trust-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="page-container relative z-10">
          <FadeIn className="text-center mb-14">
            <p className="font-accent italic text-saffron-600 text-lg mb-1">Well Wisher's Message</p>
            <h2 className="section-title mb-2">Message of Support</h2>
            <p className="text-slate-500 text-sm md:text-base max-w-md mx-auto">A message of encouragement from Nevil Mansara, CEO of Dual Life Quant (DLQ).</p>
          </FadeIn>

          <div className="flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-14 max-w-5xl mx-auto">
            {/* CEO Image Card */}
            <FadeIn className="shrink-0">
              <div className="relative group">
                <div className="absolute -inset-1.5 bg-gradient-to-tr from-saffron-400 to-trust-600 rounded-3xl blur-md opacity-25 group-hover:opacity-40 transition duration-500" />
                <div className="relative w-64 aspect-[3/4] sm:w-72 lg:w-80 bg-white border border-slate-100 rounded-3xl p-3 shadow-card overflow-hidden">
                  <img
                    src="/ceo_portrait.jpeg"
                    alt="Nevil Mansara - CEO, Dual Life Quant (DLQ)"
                    className="w-full h-full object-cover rounded-2xl group-hover:scale-[1.02] transition-transform duration-500"
                  />
                </div>
              </div>
            </FadeIn>

            {/* CEO Message Bubble */}
            <FadeIn delay={0.1} className="flex-1">
              <div className="relative bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 md:p-10 shadow-card lg:after:content-[''] lg:after:absolute lg:after:top-1/2 lg:after:-translate-y-1/2 lg:after:-left-5 lg:after:border-[10px] lg:after:border-transparent lg:after:border-r-white">
                <div className="space-y-4 text-slate-600 text-sm sm:text-base leading-relaxed">
                  <p>
                    "I am deeply inspired by the outstanding work being done by the <strong className="text-trust-800">Devkalp Foundation</strong> team. Their comprehensive approach to uplifting communities—spanning counselor-guided matchmaking, transparent donation drives, school healthcare campaigns, and livelihood training—is creating real, measurable social impact on the ground."
                  </p>
                  <p>
                    "It is vital to support organizations that walk alongside families with deep trust, genuine care, and human connection. Devkalp's dedication to integrity, structural transparency, and active social change is exemplary. They are doing outstanding work on the ground, and I am proud to support their efforts to build a sustainable, inclusive future."
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-end">
                  <p className="font-display font-bold text-trust-800 text-base sm:text-lg">Nevil Mansara</p>
                  <p className="text-xs sm:text-sm font-semibold text-saffron-500 mt-0.5">CEO, Dual Life Quant (DLQ)</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Supporter & Well Wisher</p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* DEVHALP'S IMPACT SHOWCASE */}
      <section
        className="py-14 bg-[#0a1128] text-white relative overflow-hidden border-t border-white/5"
        onMouseEnter={() => setIsImpactHovered(true)}
        onMouseLeave={() => setIsImpactHovered(false)}
      >
        {/* Glowing visual effect in background */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-trust-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-y-1/2 w-[500px] h-[500px] bg-saffron-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-hero-pattern opacity-5 pointer-events-none" />

        <div className="page-container relative z-10">
          <FadeIn className="text-center mb-8">
            <p className="font-accent italic text-saffron-400 text-lg mb-2">Our Footprint</p>
            <h2 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-wider text-white">
              Devkalp's <span className="text-saffron-400">Impact</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto mt-4 leading-relaxed">
              The far-reaching impact of Devkalp's work is reflected in these powerful statistics, evidenced by a high Social Return on Investment (SROI).
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Interactive Map */}
            <FadeIn className="lg:col-span-5 flex flex-col justify-center relative">
              <div className="relative w-full max-w-[420px] mx-auto rounded-3xl bg-white/[0.01] border border-white/5 p-3 backdrop-blur-sm overflow-hidden shadow-2xl">
                {/* Background grid representation */}
                <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
                <IndiaMap activeTab={activeImpactTab} className="w-full" />

                {/* Floating Map Badge */}
                <motion.div
                  key={activeImpactTab}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="absolute bottom-4 left-4 right-4 sm:right-auto bg-trust-950/80 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 flex items-center gap-3 shadow-xl z-20"
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/5 border border-white/10">
                    {IMPACT_TABS[activeImpactTab].badgeIcon}
                  </div>
                  <div>
                    <h4 className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Active Metric</h4>
                    <p className="text-xs font-bold text-white mt-0.5">{IMPACT_TABS[activeImpactTab].badgeText}</p>
                  </div>
                </motion.div>
              </div>
            </FadeIn>

            {/* Right Column: Dynamic Info Card */}
            <FadeIn className="lg:col-span-7" delay={0.1}>
              <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-5 sm:p-6 md:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">

                {/* Tabs Selector */}
                <div className="flex border-b border-white/10 pb-4 mb-6 gap-2 sm:gap-4 overflow-x-auto scrollbar-none">
                  {IMPACT_TABS.map((tab) => {
                    const isActive = activeImpactTab === tab.id
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveImpactTab(tab.id)
                          setIsImpactHovered(true) // Pause autoplay after user clicks
                        }}
                        className={`relative px-4 py-2 rounded-xl text-xs sm:text-sm font-bold tracking-wider uppercase transition-colors duration-300 ${isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                          }`}
                      >
                        {isActive && (
                          <motion.span
                            layoutId="activeImpactIndicator"
                            className="absolute inset-0 bg-white/10 border border-white/10 rounded-xl -z-10"
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          />
                        )}
                        {tab.label}
                      </button>
                    )
                  })}
                </div>

                {/* Animated Text Content */}
                <div className="min-h-[170px] flex flex-col justify-between">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeImpactTab}
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -15 }}
                      transition={{ duration: 0.4 }}
                      className="space-y-3"
                    >
                      <h3 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
                        <span className={`w-2 h-2 rounded-full ${IMPACT_TABS[activeImpactTab].colorClass} animate-pulse`} />
                        {IMPACT_TABS[activeImpactTab].title}
                      </h3>
                      <div className="space-y-3 text-slate-400 text-xs sm:text-sm leading-relaxed">
                        <p>{IMPACT_TABS[activeImpactTab].desc1}</p>
                        <p>{IMPACT_TABS[activeImpactTab].desc2}</p>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Static Statistics list */}
                  <div className="flex justify-start mt-6 pt-6 border-t border-white/5">
                    {/* Stat Box 1: Lives Impacted */}
                    <div className="group relative bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 rounded-xl p-3 px-5 flex items-center gap-4 transition-all duration-300 hover:border-saffron-500/20 shadow-md w-full sm:w-auto">
                      <div className="w-10 h-10 rounded-lg bg-saffron-500/10 text-saffron-400 flex items-center justify-center border border-saffron-500/20 shrink-0">
                        <Heart className="fill-saffron-500/20" size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Lives Impacted</p>
                        <p className="text-base font-black text-white mt-0.5">3500+</p>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section className="py-16 bg-[#f8f9fc]">
        <div className="page-container">
          <FadeIn className="text-center mb-9">
            <p className="font-accent italic text-saffron-600 text-lg mb-1.5">On the Ground</p>
            <h2 className="section-title">Real People, Real Impact</h2>
          </FadeIn>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {GALLERY.map((src, i) => (
              <FadeIn key={src} delay={i * 0.05}>
                <div className="overflow-hidden rounded-2xl aspect-[4/3] bg-slate-200">
                  <img src={src} alt="Impact" className="w-full h-full object-cover hover:scale-[1.04] transition-transform duration-500" loading="lazy" />
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* AWARDS & ACHIEVEMENTS */}
      {awards.length > 0 && (
        <section className="py-12 bg-[#0a1128] text-white relative overflow-hidden border-y border-white/5">
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-saffron-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-trust-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="page-container relative z-10">

            {/* Header with Slider Navigation */}
            <FadeIn>
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-saffron-400/10 border border-saffron-400/20 rounded-full mb-3">
                    <Trophy size={14} className="text-saffron-400" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-saffron-300">Recognition & Honor</span>
                  </div>
                  <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-white via-white to-saffron-200 bg-clip-text text-transparent">
                    Awards & Achievements
                  </h2>
                  <p className="text-slate-400 max-w-xl text-sm">
                    Recognizing our commitment, transparency, and milestones in building stronger, healthier communities.
                  </p>
                </div>
                <div className="flex gap-3 mt-4 md:mt-0 shrink-0">
                  <button onClick={scrollLeft} className="w-10 h-10 rounded-full border border-white/10 hover:border-saffron-400/50 hover:bg-saffron-500/10 flex items-center justify-center text-slate-300 hover:text-saffron-300 transition-colors shadow-sm" title="Previous">
                    <ChevronLeft size={20} />
                  </button>
                  <button onClick={scrollRight} className="w-10 h-10 rounded-full border border-white/10 hover:border-saffron-400/50 hover:bg-saffron-500/10 flex items-center justify-center text-slate-300 hover:text-saffron-300 transition-colors shadow-sm" title="Next">
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </FadeIn>

            {/* Horizontal Scroll Container */}
            <FadeIn>
              <div
                ref={awardsSliderRef}
                className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-none pb-4"
              >
                {awards.map((award) => (
                  <div
                    key={award.id}
                    className="w-[280px] sm:w-[500px] shrink-0 snap-start h-auto"
                  >
                    <div className="group relative bg-white/[0.03] backdrop-blur-md border border-white/10 hover:border-saffron-400/50 rounded-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col sm:flex-row h-[360px] sm:h-[230px] overflow-hidden hover:shadow-[0_12px_30px_rgba(245,158,11,0.08)]">

                      {/* Glowing highlight border on hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-saffron-500/0 via-saffron-500/10 to-saffron-500/0 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-500 -z-10" />

                      {/* Left side: Content */}
                      <div className="flex-1 p-5 flex flex-col justify-between min-w-0 h-full">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="w-8 h-8 rounded-lg bg-saffron-500/10 text-saffron-400 flex items-center justify-center border border-saffron-500/20 shrink-0">
                              <AwardIcon size={16} />
                            </div>
                            {award.date_given && (
                              <span className="text-[10px] font-semibold text-slate-400 bg-white/5 border border-white/10 rounded-full px-2.5 py-0.5">
                                {award.date_given}
                              </span>
                            )}
                          </div>

                          <h3 className="font-display text-base font-bold text-white group-hover:text-saffron-300 transition-colors mb-0.5 line-clamp-1">
                            {award.title}
                          </h3>

                          {award.issuer && (
                            <p className="text-[10px] font-semibold text-saffron-400/90 mb-2 tracking-wide uppercase truncate">
                              Issued by: {award.issuer}
                            </p>
                          )}

                          <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 sm:line-clamp-4">
                            {award.description}
                          </p>
                        </div>

                        {award.link && (
                          <a
                            href={award.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-saffron-300 hover:text-saffron-400 hover:gap-2 transition-all mt-2"
                          >
                            View Verification Certificate <ArrowRight size={12} />
                          </a>
                        )}
                      </div>

                      {/* Right side: Image (if exists) */}
                      {award.image_url && (
                        <div className="w-full sm:w-2/5 h-32 sm:h-full relative overflow-hidden bg-white/5 border-t sm:border-t-0 sm:border-l border-white/10 shrink-0 animate-fade-in">
                          <img
                            src={award.image_url}
                            alt={award.title}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </section>
      )}

      {/* TESTIMONIALS */}
      <section className="py-20 bg-trust-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-pattern opacity-15" />
        <div className="page-container relative z-10">
          <FadeIn className="text-center mb-10">
            <p className="font-accent italic text-saffron-300 text-lg mb-1.5">Stories of Change</p>
            <h2 className="font-display text-3xl font-semibold text-white">Families We've Walked With</h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <FadeIn key={t.name} delay={i * 0.07}>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-7">
                  <p className="text-white/70 leading-relaxed font-accent italic text-base mb-5">"{t.text}"</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-trust-700 text-white text-xs font-bold flex items-center justify-center">{t.name.split(' ').map(w => w[0]).join('')}</div>
                      <div><p className="text-white font-semibold text-sm">{t.name}</p><p className="text-white/40 text-xs">{t.role} · {t.city}</p></div>
                    </div>
                    <div className="flex text-saffron-400 gap-0.5">{Array.from({ length: t.stars }).map((_, j) => <Star key={j} size={11} fill="currentColor" />)}</div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* PRESS & MEDIA COVERAGE */}
      {pressMentions.length > 0 && (
        <section className="py-20 bg-[#f8f9fc] border-t border-slate-100">
          <div className="page-container">
            <FadeIn className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-trust-50 border border-trust-100 rounded-full mb-4">
                <Newspaper size={14} className="text-trust-700" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-trust-700">Media & Press</span>
              </div>
              <h2 className="section-title">Devkalp in the News</h2>
              <p className="text-slate-500 max-w-xl mx-auto text-sm leading-relaxed mt-2">
                Explore stories and features covering our social campaigns, matrimonial counselor success, and community building.
              </p>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pressMentions.map((mention, index) => (
                <FadeIn key={mention.id} delay={index * 0.08}>
                  <div className="bg-white rounded-2xl border border-slate-100 hover:border-trust-200 p-6 flex flex-col justify-between h-full transition-all duration-300 hover:shadow-card-hover group">
                    <div>
                      <div className="flex items-center justify-between gap-4 mb-4">
                        {mention.logo_url ? (
                          <img src={mention.logo_url} alt={mention.publisher_name} className="h-8 object-contain opacity-80 group-hover:opacity-100 transition-opacity" />
                        ) : (
                          <span className="text-xs font-bold text-trust-700 bg-trust-50 px-2.5 py-1 rounded-md border border-trust-100 uppercase tracking-wider">
                            {mention.publisher_name}
                          </span>
                        )}
                        {mention.publish_date && (
                          <span className="text-xs text-slate-400 font-medium">
                            {mention.publish_date}
                          </span>
                        )}
                      </div>
                      <h3 className="font-display text-lg font-bold text-trust-900 group-hover:text-trust-700 transition-colors mb-2 leading-snug">
                        {mention.title}
                      </h3>
                      {mention.summary && (
                        <p className="text-slate-500 text-sm leading-relaxed">
                          {mention.summary}
                        </p>
                      )}
                    </div>
                    {mention.article_url && (
                      <a
                        href={mention.article_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 mt-5 text-sm font-semibold text-trust-700 group-hover:text-saffron-600 transition-colors hover:gap-2.5 transition-all"
                      >
                        Read Full Story <ArrowRight size={13} />
                      </a>
                    )}
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PARTNERS LOGO MARQUEE */}
      {partners.length > 0 && (
        <section className="py-16 bg-white border-t border-slate-100 relative overflow-hidden select-none">
          <div className="page-container mb-10 text-center">
            <FadeIn>
              <h2 className="section-title">Devkalp's Partners in Change</h2>
              <p className="text-slate-500 max-w-xl mx-auto text-sm leading-relaxed mt-2">
                We are proud to work with dedicated changemakers who believe in our mission.
              </p>
            </FadeIn>
          </div>

          <FadeIn>
            <div className="relative w-full overflow-hidden py-4 bg-slate-50/30">
              {/* Left and Right shading fades */}
              <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent pointer-events-none z-10" />
              <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent pointer-events-none z-10" />

              {/* Infinite scrolling wrapper */}
              <div className="flex gap-12 items-center w-max animate-marquee hover:[animation-play-state:paused] py-2">
                {[...partners, ...partners].map((partner, index) => (
                  <div
                    key={`${partner.id}-${index}`}
                    className="flex items-center justify-center shrink-0 w-44 h-24 px-6 py-4 bg-white border border-slate-100 hover:border-trust-200 rounded-2xl shadow-2xs hover:shadow-sm transition-all duration-300 group"
                  >
                    {partner.website_url ? (
                      <a
                        href={partner.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full h-full flex items-center justify-center"
                      >
                        <img
                          src={partner.logo_url}
                          alt={partner.name}
                          className="max-h-14 max-w-full object-contain transition-all duration-300 group-hover:scale-105"
                        />
                      </a>
                    ) : (
                      <img
                        src={partner.logo_url}
                        alt={partner.name}
                        className="max-h-14 max-w-full object-contain transition-all duration-300 group-hover:scale-105"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-saffron-400 via-saffron-400 to-amber-500 overflow-hidden relative">
        {/* Pulsing light rings for premium detailing */}
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Info Text & CTAs */}
            <div className="lg:col-span-7 text-center lg:text-left">
              <FadeIn>
                <h2 className="font-display text-4xl sm:text-5xl font-black text-trust-950 leading-tight mb-4">
                  Ready to Take <br className="hidden sm:inline" /> the <span className="underline decoration-trust-950/20 underline-offset-8">First Step</span>?
                </h2>
                <p className="text-trust-900/80 text-base sm:text-lg mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  Whether you're looking for a life partner, wanting to give back to the community, or seeking meaningful career coaching — Devkalp Foundation walks with you.
                </p>
                <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                  {!isLoggedIn && (
                    <Link to="/auth/register" className="inline-flex items-center gap-2 px-8 py-4 bg-trust-950 hover:bg-trust-900 text-white font-bold rounded-2xl transition-all duration-300 hover:scale-[1.02] shadow-lg text-sm">
                      Create an Account <ArrowRight size={16} />
                    </Link>
                  )}
                  <Link to="/donate" className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-slate-50 text-trust-950 font-bold rounded-2xl transition-all duration-300 hover:scale-[1.02] shadow-lg text-sm">
                    <Heart size={16} className="text-red-500 fill-red-500/25 animate-pulse" /> Donate Today
                  </Link>
                </div>
                <p className="text-xs text-trust-900/60 mt-6">
                  * All donations qualify for tax exemption under Section 12A & 80G.{' '}
                  <Link to="/80g" className="underline hover:text-trust-950 font-bold transition-colors">
                    View 12A & 80G Certificate Details
                  </Link>
                </p>
              </FadeIn>
            </div>

            {/* Right Column: 3D Interactive Virtual Phone */}
            <div className="lg:col-span-5 flex justify-center items-center relative">
              <FadeIn className="relative">
                <VirtualPhone />
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
