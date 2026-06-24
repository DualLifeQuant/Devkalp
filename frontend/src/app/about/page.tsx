'use client'
import { useRef, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, Target, Eye, Users, Award, ArrowRight, HeartHandshake, HandHeart, Briefcase, Leaf, Check } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { clsx } from 'clsx'
import VariableProximity from '@/components/ui/VariableProximity'
import CountUp from '@/components/ui/CountUp'

const VALUES = [
  { icon: '🤝', title: 'Trust Above All', desc: 'Every interaction — a profile review, a counselor session, a donation — is handled with the same standard of care and honesty.' },
  { icon: '❤️', title: 'Human-Centered', desc: 'We don\'t manage cases. We walk with people. Our processes are designed around human dignity, not efficiency metrics.' },
  { icon: '🌱', title: 'Long-Term Impact', desc: 'We measure success not in numbers alone, but in the stories of families strengthened, lives changed, and communities uplifted.' },
  { icon: '🔍', title: 'Transparency', desc: 'Every rupee donated is accounted for. Every campaign outcome is reported. We hold ourselves to the same standard we ask of others.' },
]

const PROGRAMS = [
  { icon: <HeartHandshake size={24} className="text-trust-700" />, bg: 'bg-trust-50', title: 'Matrimony Services', desc: 'A private, counselor-led matchmaking program that honours family values and personal readiness. Not an app — a relationship.' },
  { icon: <Leaf size={24} className="text-sage-600" />, bg: 'bg-sage-50', title: 'Health Campaigns', desc: '40–45 minute awareness sessions in schools covering menstrual hygiene, nutrition, and adolescent health — tracked session by session.' },
  { icon: <HandHeart size={24} className="text-saffron-600" />, bg: 'bg-saffron-50', title: 'Transparent Giving', desc: 'Campaign-based donations with full reporting. You see exactly where your contribution went and what it achieved.' },
  { icon: <Briefcase size={24} className="text-trust-700" />, bg: 'bg-trust-50', title: 'Livelihood Support', desc: 'We connect candidates with meaningful opportunities, prepare them for interviews, and stand with them through the process.' },
  { icon: <Users size={24} className="text-sage-600" />, bg: 'bg-sage-50', title: 'Volunteer Ecosystem', desc: 'A structured, respected volunteer program where contributions are tracked, acknowledged, and directly tied to community outcomes.' },
]

const TEAM = [
  { name: 'Founding Team', role: 'Devkalp Foundation', desc: 'Founded with the belief that every family deserves guidance, every child deserves health knowledge, and every person deserves dignity in their journey.' },
]

export default function AboutPage() {
  const containerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const initGsap = async () => {
      const { gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)

      gsap.fromTo('.gsap-about-card',
        { opacity: 0, y: 40, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.gsap-about-grid',
            start: 'top 85%',
          }
        }
      )
    }
    initGsap()
  }, [])

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <Navbar transparent />

      {/* ── BREATHTAKING CINEMATIC HERO (MATCHING JOBS, MATRIMONY & CAMPAIGNS PAGES) ── */}
      <section ref={containerRef} className="relative min-h-screen flex items-center justify-center bg-trust-950 overflow-hidden pt-28 pb-16">
        {/* Background Image & Gradient Overlays */}
        <div className="absolute inset-0">
          <img src="about_hero.jpg" alt="Devkalp Foundation Team" className="w-full h-full object-cover opacity-25" />
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
            <Heart size={14} className="text-saffron-300 shrink-0" />
            <span className="text-saffron-200 text-xs font-bold tracking-wider uppercase">Our Founding Philosophy · Devkalp Foundation</span>
          </motion.div>

          {/* Headline */}
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.12] mb-6 tracking-tight">
            <VariableProximity
              label="Built on Trust."
              containerRef={containerRef}
              fromFontVariationSettings="'wght' 700, 'opsz' 9"
              toFontVariationSettings="'wght' 1000, 'opsz' 40"
              radius={150}
              falloff="linear"
            />{' '}
            <span className="text-saffron-300 italic font-light">
              <VariableProximity
                label="Rooted in Care."
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
            Devkalp Foundation was born from a simple conviction — that the most important moments in a person's life deserve more than a transaction. They deserve presence, guidance, and genuine human connection.
          </motion.p>

          {/* Premium Stats Box */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.45 }}
            className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto w-full">
            {[
              { v: 2025, f: 1990, s: '', l: 'Year Founded' },
              { v: 80, f: 0, s: '+', l: 'Marriages Facilitated' },
              { v: 48, f: 0, s: '', l: 'Schools Reached' },
            ].map((s, idx) => (
              <div key={s.l} className={clsx("text-center border-slate-200/60", idx < 2 && "md:border-r")}>
                <p className="font-display text-2xl sm:text-3xl font-bold text-trust-900 mb-1">
                  <CountUp to={s.v} from={s.f} separator={s.sep} />{s.s}
                </p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{s.l}</p>
              </div>
            ))}
          </motion.div>

          {/* Quick Stats / Trust Signals */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.6 }}
            className="flex items-center justify-center gap-8 mt-6 text-xs text-white/80 flex-wrap font-medium">
            <span className="flex items-center gap-1.5"><Check size={14} className="text-saffron-300 stroke-[3]" /> Registered Non-Profit</span>
            <span className="flex items-center gap-1.5"><Check size={14} className="text-saffron-300 stroke-[3]" /> 100% Accountable</span>
            <span className="flex items-center gap-1.5"><Check size={14} className="text-saffron-300 stroke-[3]" /> Headquartered in Surat, Gujarat</span>
          </motion.div>
        </div>
      </section>

      {/* Vision, Mission, Purpose */}
      <section className="py-20 bg-white">
        <div className="page-container">
          <div className="gsap-about-grid grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Eye size={24} className="text-trust-700" />,
                label: 'Our Vision',
                heading: 'A society where every family thrives with dignity and support.',
                body: 'We envision communities where health knowledge reaches every child, where meaningful partnerships are formed with care, where generosity is met with accountability, and where every individual has access to livelihood opportunities.',
              },
              {
                icon: <Target size={24} className="text-saffron-600" />,
                label: 'Our Mission',
                heading: 'To build trust-based programs that create lasting change.',
                body: 'Through counselor-guided matrimony services, school health campaigns, transparent donations, employment support, and community volunteering — we work at the intersection of human need and social good.',
              },
              {
                icon: <Heart size={24} className="text-sage-600" />,
                label: 'Our Purpose',
                heading: 'To be the organisation that shows up — again and again.',
                body: 'We don\'t do one-off events. We build relationships. With families seeking life partners. With donors who want their money to matter. With volunteers who want to give meaningfully. With candidates who need more than a job listing.',
              },
            ].map(item => (
              <div key={item.label} className="gsap-about-card opacity-0 border border-slate-100 rounded-3xl p-8 hover:shadow-card transition-all duration-300">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-5">
                  {item.icon}
                </div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">{item.label}</p>
                <h3 className="font-display text-xl text-trust-900 mb-3 leading-snug">{item.heading}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who we are */}
      <section className="py-20 bg-slate-50">
        <div className="page-container">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="font-accent italic text-saffron-600 text-lg mb-3">Who We Are</p>
              <h2 className="section-title mb-5">A Foundation Built on Relationships</h2>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p>
                  Devkalp Foundation is a registered non-profit organisation working across five interconnected domains: matrimony services, health awareness, charitable giving, livelihood support, and community volunteering.
                </p>
                <p>
                  What makes us different isn't our programs — it's how we run them. Our matrimony service is not an algorithm; it's a counselor who listens. Our donation platform doesn't just collect money; it reports every rupee. Our campaigns don't just happen; they're tracked, session by session, school by school.
                </p>
                <p>
                  We are headquartered in Surat, Gujarat, and our programs reach communities across Pune, Ahmedabad, Mumbai, and surrounding rural areas.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: 2025, from: 1990, suffix: '', label: 'Year Founded', sub: 'A decade of service', fullWidth: true },
                { value: 80, from: 0, suffix: '+', label: 'Marriages Facilitated', sub: 'With care and counseling' },
                { value: 48, from: 0, suffix: '', label: 'Schools Reached', sub: 'Across Maharashtra' },
              ].map(stat => (
                <div key={stat.label} className={clsx("bg-white rounded-2xl p-5 shadow-card text-center", stat.fullWidth && "col-span-2")}>
                  <p className="font-display text-2xl font-semibold text-trust-800 mb-0.5">
                    <CountUp to={stat.value} from={stat.from} separator={stat.separator} />{stat.suffix}
                  </p>
                  <p className="text-xs font-semibold text-slate-700">{stat.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{stat.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-white">
        <div className="page-container">
          <div className="text-center mb-12">
            <p className="font-accent italic text-saffron-600 text-lg mb-2">What Guides Us</p>
            <h2 className="section-title">Our Values</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map(v => (
              <div key={v.title} className="bg-slate-50 rounded-2xl p-6">
                <div className="text-3xl mb-4">{v.icon}</div>
                <h3 className="font-display text-lg text-trust-900 mb-2">{v.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs */}
      <section className="py-20 bg-trust-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-pattern opacity-20" />
        <div className="page-container relative z-10">
          <div className="text-center mb-12">
            <p className="font-accent italic text-saffron-300 text-lg mb-2">Our Programs</p>
            <h2 className="font-display text-4xl font-semibold text-white">Five Ways We Serve</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {PROGRAMS.map(p => (
              <div key={p.title} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
                <div className={`w-12 h-12 ${p.bg} rounded-2xl flex items-center justify-center mb-4`}>
                  {p.icon}
                </div>
                <h3 className="font-display text-lg text-white mb-2">{p.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-saffron-400 to-warm-400">
        <div className="page-container text-center">
          <h2 className="font-display text-4xl font-semibold text-trust-900 mb-3">Walk With Us</h2>
          <p className="text-trust-800/70 max-w-xl mx-auto mb-8 leading-relaxed text-lg">
            Whether you want to donate, volunteer, find a life partner, or simply learn more — there's a place for you here.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/donate" className="inline-flex items-center gap-2 px-8 py-4 bg-trust-900 text-white font-semibold rounded-2xl hover:bg-trust-800 transition-all">
              <HandHeart size={18} /> Make a Donation
            </Link>
            <Link href="/volunteer" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-trust-800 font-semibold rounded-2xl hover:bg-trust-50 transition-all">
              <Users size={18} /> Volunteer With Us
            </Link>
            <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-white/60 text-trust-800 font-medium rounded-2xl hover:bg-white transition-all border border-trust-200">
              Get in Touch <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
