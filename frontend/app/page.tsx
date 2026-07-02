'use client'
import { useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, ArrowRight, Star, Users, HandHeart, Briefcase, Leaf, HeartHandshake, Quote } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import VariableProximity from '@/components/ui/VariableProximity'
import CountUp from '@/components/ui/CountUp'

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
  { value: 3500, suffix: '+', separator: ',', label: 'School\'s Student Sessions Held' },
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
  { href: '/donate', img: '1.jpeg', icon: <HandHeart size={22} />, bg: 'bg-saffron-50', text: 'text-saffron-700', title: 'Donate', desc: '100% transparent giving. See exactly where every rupee goes.', cta: 'Support a Cause' },
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

export default function HomePage() {
  const containerRef = useRef<HTMLElement>(null)
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navbar transparent />

      {/* HERO */}
      <section ref={containerRef} className="relative min-h-[90vh] flex items-center bg-trust-950 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-trust-950 via-trust-900 to-[#0c1e4a]" />
        <div className="absolute inset-0 bg-hero-pattern opacity-20" />
        <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-saffron-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="page-container relative z-10 py-24 pt-36">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-7 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-saffron-400 animate-pulse" />
              <span className="text-white/70 text-sm">NGO · Surat, Gujarat · Empowering Since 2025</span>
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
              <Link href="/matrimony" className="inline-flex items-center gap-2 px-8 py-3.5 bg-saffron-400 text-trust-900 font-bold rounded-xl hover:bg-saffron-300 transition-colors shadow-warm text-sm">
                <HeartHandshake size={18} /> Begin Your Journey
              </Link>
              <Link href="/donate" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white/10 text-white font-medium rounded-xl hover:bg-white/15 border border-white/10 transition-colors text-sm">
                <Heart size={15} /> Make a Difference
              </Link>
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

      {/* MODULES */}
      <section className="py-20 bg-[#f8f9fc]">
        <div className="page-container">
          <FadeIn className="text-center mb-12">
            <p className="font-accent italic text-saffron-600 text-lg mb-1.5">How We Can Help</p>
            <h2 className="section-title">Every Need, One Home</h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {MODULES.map((m, i) => (
              <FadeIn key={m.href} delay={i * 0.06}>
                <Link href={m.href} className="group block relative overflow-hidden bg-white rounded-2xl border border-slate-100 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 h-full z-0">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10">
                    <img src={m.img} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-trust-950/80 backdrop-blur-[0px]" />
                  </div>
                  <div className="relative z-10 p-7 h-full flex flex-col">
                    <div className={`w-11 h-11 rounded-xl ${m.bg} ${m.text} group-hover:bg-white/10 group-hover:text-white flex items-center justify-center mb-4 transition-colors duration-300`}>{m.icon}</div>
                    <h3 className="font-display text-xl font-semibold text-trust-900 group-hover:text-white mb-2 transition-colors duration-300">{m.title}</h3>
                    <p className="text-slate-500 group-hover:text-white/80 text-sm leading-relaxed mb-4 transition-colors duration-300">{m.desc}</p>
                    <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-trust-700 group-hover:text-saffron-300 group-hover:gap-2.5 transition-all duration-300">{m.cta} <ArrowRight size={13} /></span>
                  </div>
                </Link>
              </FadeIn>
            ))}
            <FadeIn delay={MODULES.length * 0.06}>
              <div className="bg-trust-800 rounded-2xl p-7 flex flex-col justify-between h-full">
                <div>
                  <Heart size={22} className="text-saffron-300 fill-saffron-300/20 mb-4" />
                  <h3 className="font-display text-xl font-semibold text-white mb-2">Need guidance?</h3>
                  <p className="text-white/60 text-sm leading-relaxed">Our counselors are available for a free first conversation.</p>
                </div>
                <Link href="/contact" className="inline-flex items-center gap-1.5 mt-5 text-saffron-300 text-sm font-semibold hover:gap-2.5 transition-all">Talk to a counselor <ArrowRight size={13} /></Link>
              </div>
            </FadeIn>
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

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-saffron-400 to-warm-400">
        <div className="page-container text-center">
          <FadeIn>
            <h2 className="font-display text-4xl font-semibold text-trust-900 mb-3">Ready to Take the First Step?</h2>
            <p className="text-trust-800/70 text-base mb-8 max-w-lg mx-auto">Whether you're looking for a life partner, wanting to give back, or seeking meaningful work — we're here.</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/auth/register" className="inline-flex items-center gap-2 px-8 py-3.5 bg-trust-900 text-white font-bold rounded-xl hover:bg-trust-800 transition-colors text-sm">Create an Account <ArrowRight size={16} /></Link>
              <Link href="/donate" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-trust-800 font-bold rounded-xl hover:bg-trust-50 transition-colors text-sm"><Heart size={15} className="text-red-500" /> Donate Today</Link>
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </div>
  )
}
