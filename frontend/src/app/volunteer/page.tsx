'use client'
import { useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Users, Heart, Clock, MapPin, ArrowRight, CheckCircle, Leaf, BookOpen, Activity, Check } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Button } from '@/components/ui'
import { useAuthStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { clsx } from 'clsx'
import VariableProximity from '@/components/ui/VariableProximity'
import CountUp from '@/components/ui/CountUp'

const IMPACT_AREAS = [
  {
    icon: <Activity size={22} className="text-red-500" />,
    title: 'Health Campaigns',
    desc: 'Facilitate menstrual hygiene, nutrition, and wellness sessions in schools and communities.',
    bg: 'bg-red-50',
  },
  {
    icon: <BookOpen size={22} className="text-trust-600" />,
    title: 'Education Support',
    desc: 'Mentor students, assist with career guidance, and support after-school learning programs.',
    bg: 'bg-trust-50',
  },
  {
    icon: <Heart size={22} className="text-pink-500" />,
    title: 'Community Welfare',
    desc: 'Help with food distribution, elder care support, and community outreach events.',
    bg: 'bg-pink-50',
  },
  {
    icon: <Leaf size={22} className="text-sage-600" />,
    title: 'Environment',
    desc: 'Tree plantation drives, cleanliness campaigns, and environmental awareness programs.',
    bg: 'bg-sage-50',
  },
]

const STEPS = [
  { n: '01', title: 'Register Online', desc: 'Fill a short form telling us about your skills, availability, and what area you want to contribute to.' },
  { n: '02', title: 'We Review & Match', desc: 'Our team reviews your profile and matches you with upcoming campaigns and events near you.' },
  { n: '03', title: 'Get Assigned', desc: 'You\'ll receive task assignments with full details — what to do, when, and where.' },
  { n: '04', title: 'Make an Impact', desc: 'Show up, contribute, and track your hours and the difference you\'ve made.' },
]

const TESTIMONIALS = [
  { name: 'Sunita Devi', role: 'Health Educator', city: 'Surat', quote: 'I\'ve facilitated 12 sessions in local schools. Seeing the girls gain confidence and knowledge — that\'s why I volunteer.' },
  { name: 'Kiran Mhatre', role: 'Community Volunteer', city: 'Surat', quote: 'Devkalp treats every volunteer with respect. We are given real responsibility, not just tasks.' },
]

export default function VolunteerPage() {
  const containerRef = useRef<HTMLElement>(null)
  const { isLoggedIn, user } = useAuthStore()
  const router = useRouter()

  const handleCTA = () => {
    if (!isLoggedIn) {
      router.push('/auth/register')
    } else {
      router.push('/dashboard/volunteer')
    }
  }

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <Navbar transparent />

      {/* ── BREATHTAKING CINEMATIC HERO (MATCHING JOBS, MATRIMONY, CAMPAIGNS & ABOUT PAGES) ── */}
      <section ref={containerRef} className="relative min-h-screen flex items-center justify-center bg-trust-950 overflow-hidden pt-28 pb-16">
        {/* Background Image & Gradient Overlays */}
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1600&q=80" alt="Devkalp Volunteers" className="w-full h-full object-cover opacity-25" />
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
            <Users size={14} className="text-saffron-300 shrink-0" />
            <span className="text-saffron-200 text-xs font-bold tracking-wider uppercase">Community Action Network · Devkalp Foundation</span>
          </motion.div>

          {/* Headline */}
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.12] mb-6 tracking-tight">
            <VariableProximity
              label="Volunteer"
              containerRef={containerRef}
              fromFontVariationSettings="'wght' 700, 'opsz' 9"
              toFontVariationSettings="'wght' 1000, 'opsz' 40"
              radius={150}
              falloff="linear"
            />{' '}
            <span className="text-saffron-300 italic font-light">
              <VariableProximity
                label="With Purpose"
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
            At Devkalp Foundation, volunteers aren't just helpers — they're the heartbeat of every campaign. Your skills, your time, your presence matters more than you know.
          </motion.p>

          {/* Premium Stats Box / Action Bar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.45 }}
            className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20 flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl mx-auto w-full">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 flex-1 w-full">
              {[
                { l: 'Active Volunteers', v: 150, s: '+' },
                { l: 'Food & Clothing Distribution Daive', v: 1950, s: '+', sep: ',' },
                { l: 'Schools Reached', v: 30, s: '+' },
                { l: 'Campaigns Run', v: 48, s: '+' },
              ].map((stat, idx) => (
                <div key={stat.l} className={clsx("text-center border-slate-200/60", idx < 3 && "sm:border-r")}>
                  <p className="font-display text-2xl sm:text-3xl font-bold text-trust-900 mb-1">
                    <CountUp to={stat.v} separator={stat.sep} />{stat.s}
                  </p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{stat.l}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0 border-t md:border-t-0 md:border-l border-slate-200/60 pt-4 md:pt-0 md:pl-6">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full">
                <button onClick={handleCTA} className="w-full px-8 py-3.5 bg-trust-900 text-white text-sm font-bold rounded-xl hover:bg-trust-800 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                  <Heart size={16} className="text-saffron-300 fill-saffron-300 shrink-0" /> Join Network
                </button>
              </motion.div>
            </div>
          </motion.div>

          {/* Quick Stats / Trust Signals */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.6 }}
            className="flex items-center justify-center gap-8 mt-6 text-xs text-white/80 flex-wrap font-medium">
            <span className="flex items-center gap-1.5"><Check size={14} className="text-saffron-300 stroke-[3]" /> Certificate of Contribution</span>
            <span className="flex items-center gap-1.5"><Check size={14} className="text-saffron-300 stroke-[3]" /> Flexible Hours</span>
            <span className="flex items-center gap-1.5"><Check size={14} className="text-saffron-300 stroke-[3]" /> Direct Community Engagement</span>
          </motion.div>
        </div>
      </section>

      {/* Impact Areas */}
      <section className="py-20 bg-white">
        <div className="page-container">
          <div className="text-center mb-12">
            <p className="font-accent italic text-saffron-600 text-lg mb-2">Where You Can Contribute</p>
            <h2 className="section-title">Areas of Impact</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {IMPACT_AREAS.map(area => (
              <div key={area.title} className={`${area.bg} rounded-2xl p-6 hover:shadow-card transition-all duration-300`}>
                <div className="mb-4">{area.icon}</div>
                <h3 className="font-display text-lg text-trust-900 mb-2">{area.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{area.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 bg-slate-50">
        <div className="page-container">
          <div className="text-center mb-12">
            <p className="font-accent italic text-saffron-600 text-lg mb-2">Simple & Clear</p>
            <h2 className="section-title">How Volunteering Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <div key={step.n} className="relative">
                <div className="bg-white rounded-2xl p-6 shadow-card h-full">
                  <div className="w-10 h-10 rounded-xl bg-saffron-100 text-saffron-700 font-display font-bold flex items-center justify-center mb-4">
                    {step.n}
                  </div>
                  <h3 className="font-display text-lg text-trust-900 mb-2">{step.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-10 -right-3 z-10 text-slate-300">
                    <ArrowRight size={20} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What we ask */}
      <section className="py-20 bg-white">
        <div className="page-container">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="font-accent italic text-saffron-600 text-lg mb-2">Our Promise to You</p>
              <h2 className="section-title mb-5">We Respect Your Time</h2>
              <p className="text-slate-500 leading-relaxed mb-6">
                We know volunteering is a commitment. We match tasks to your availability — whether you have
                2 hours on weekends or a few days a month. No pressure, no guilt.
              </p>
              <div className="space-y-3">
                {[
                  'Tasks are clearly described before assignment',
                  'You choose your availability — weekdays, weekends, or both',
                  'Your contributions are tracked and acknowledged',
                  'You get to see the direct impact of your work',
                  'Full support from our coordination team',
                ].map(point => (
                  <div key={point} className="flex items-start gap-3">
                    <CheckCircle size={16} className="text-trust-500 mt-0.5 shrink-0" />
                    <span className="text-slate-600 text-sm">{point}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {TESTIMONIALS.map(t => (
                <div key={t.name} className="bg-trust-50 border border-trust-100 rounded-2xl p-6">
                  <p className="text-slate-700 text-sm leading-relaxed italic mb-4 font-accent text-base">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-trust-200 text-trust-700 font-semibold text-sm flex items-center justify-center">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{t.name}</p>
                      <p className="text-xs text-slate-400">{t.role} · {t.city}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-trust-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="page-container text-center relative z-10">
          <h2 className="font-display text-4xl font-semibold text-white mb-3">Ready to Make a Difference?</h2>
          <p className="text-white/60 max-w-xl mx-auto mb-8 leading-relaxed">
            Join 180+ volunteers who are already contributing their time and skills to build stronger, healthier communities.
          </p>
          <motion.button onClick={handleCTA}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 px-10 py-4 bg-saffron-400 text-trust-900 font-semibold rounded-2xl hover:bg-saffron-300 transition-all text-base shadow-warm">
            <Users size={18} /> Register as Volunteer
          </motion.button>
        </div>
      </section>

      <Footer />
    </div>
  )
}
