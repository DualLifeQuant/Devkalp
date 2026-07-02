import { useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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
  const [activeTab, setActiveTab] = useState(0)

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
                  Devkalp Foundation is a registered non-profit organisation working across six interconnected domains: aducation, matrimony services, health awareness, charitable giving, livelihood support, and community volunteering.
                </p>
                <p>
                  What makes us different isn't our programs — it's how we run them. Our matrimony service is not an algorithm; it's a counselor who listens. Our donation platform doesn't just collect money; it reports every rupee. Our campaigns don't just happen; they're tracked, session by session, school by school.
                </p>
                <p>
                  We are headquartered in Surat, Gujarat.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: 2025, from: 1990, suffix: '', label: 'Year Founded', sub: 'A decade of service', fullWidth: true },
                { value: 80, from: 0, suffix: '+', label: 'Marriages Facilitated', sub: 'With care and counseling' },
                { value: 48, from: 0, suffix: '', label: 'Schools Reached', sub: 'Across Gujarat' },
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

      {/* ── EMPOWER VISUAL CONCEPT SECTION ── */}
      <section className="py-8 bg-[#fafaf8] overflow-hidden border-t border-b border-slate-100/50">
        <div className="page-container relative max-w-7xl mx-auto px-4">
          <div className="relative flex flex-col items-center justify-center min-h-[220px] sm:min-h-[300px]">
            {/* Desktop View: Floating Tags and Giant Masked Text */}
            <div className="hidden md:block w-full relative h-[300px]">
              <h2 
                className="absolute inset-0 flex items-center justify-center font-display font-black text-[10rem] lg:text-[13rem] xl:text-[16rem] tracking-tighter leading-none select-none uppercase text-center bg-clip-text text-transparent bg-cover bg-center bg-no-repeat transition-all duration-500 hover:scale-[1.01]"
                style={{ 
                  backgroundImage: "url('/about_hero.jpg')",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}
              >
                EMPOWER
              </h2>

              {/* Floating Tags */}
              {[
                { text: 'Empathy', top: '78%', left: '2%', delay: 0.2 },
                { text: 'Mentorship', top: '2%', left: '16%', delay: 0.5 },
                { text: 'Purpose', top: '80%', left: '24%', delay: 0.8 },
                { text: 'Opportunity', top: '2%', left: '38%', delay: 1.1 },
                { text: 'Welfare', top: '82%', left: '50%', delay: 0.4 },
                { text: 'Equality', top: '50%', left: '60%', delay: 0.7 },
                { text: 'Resilience', top: '12%', left: '72%', delay: 1.3 },
                { text: 'Transparency', top: '80%', left: '78%', delay: 0.9 },
                { text: 'Accountability', top: '20%', left: '90%', delay: 1.5 },
              ].map((tag) => (
                <motion.div
                  key={tag.text}
                  style={{ top: tag.top, left: tag.left }}
                  animate={{
                    y: [0, -8, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: tag.delay,
                  }}
                  className="absolute z-20 bg-white/95 backdrop-blur-sm border border-slate-200/60 shadow-md shadow-slate-100/50 px-4 py-1.5 rounded-full text-xs font-semibold text-trust-700 tracking-wide select-none transition-transform hover:scale-105 cursor-default hover:bg-white"
                >
                  {tag.text}
                </motion.div>
              ))}
            </div>

            {/* Mobile View: Wrapped Flex Tags and Smaller Masked Text */}
            <div className="md:hidden w-full flex flex-col items-center gap-8">
              <h2 
                className="font-display font-black text-7xl sm:text-[6rem] tracking-tighter leading-none select-none uppercase text-center bg-clip-text text-transparent bg-cover bg-center bg-no-repeat"
                style={{ 
                  backgroundImage: "url('/about_hero.jpg')",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}
              >
                EMPOWER
              </h2>
              <div className="flex flex-wrap justify-center gap-2.5 px-2">
                {[
                  'Empathy',
                  'Mentorship',
                  'Purpose',
                  'Opportunity',
                  'Welfare',
                  'Equality',
                  'Resilience',
                  'Transparency',
                  'Accountability'
                ].map((tag) => (
                  <span 
                    key={tag}
                    className="bg-white border border-slate-200/60 shadow-sm px-3.5 py-1.5 rounded-full text-[11px] font-semibold text-trust-700 tracking-wide"
                  >
                    {tag}
                  </span>
                ))}
              </div>
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
      <section className="py-24 bg-trust-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-pattern opacity-10" />
        <div className="page-container relative z-10 max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Left Side: Circular Wheel (Desktop) & Fallback grid (Mobile) */}
            <div className="col-span-12 lg:col-span-6 flex flex-col items-center justify-center">
              {/* Desktop View: Interactive Wheel */}
              <div className="hidden md:block relative w-[420px] h-[420px] rounded-full p-2 border border-white/10 shadow-2xl bg-white/5 backdrop-blur-sm">
                
                {/* SVG for 5 sectors */}
                <svg viewBox="0 0 400 400" className="w-full h-full">
                  <defs>
                    <pattern id="pic-1" patternUnits="userSpaceOnUse" width="400" height="400">
                      <image href="matrimony_hero.jpg" x="0" y="0" width="400" height="400" preserveAspectRatio="xMidYMid slice" />
                    </pattern>
                    <pattern id="pic-2" patternUnits="userSpaceOnUse" width="400" height="400">
                      <image href="camp.jpg" x="0" y="0" width="400" height="400" preserveAspectRatio="xMidYMid slice" />
                    </pattern>
                    <pattern id="pic-3" patternUnits="userSpaceOnUse" width="400" height="400">
                      <image href="1.jpeg" x="0" y="0" width="400" height="400" preserveAspectRatio="xMidYMid slice" />
                    </pattern>
                    <pattern id="pic-4" patternUnits="userSpaceOnUse" width="400" height="400">
                      <image href="jobs.jpg" x="0" y="0" width="400" height="400" preserveAspectRatio="xMidYMid slice" />
                    </pattern>
                    <pattern id="pic-5" patternUnits="userSpaceOnUse" width="400" height="400">
                      <image href="volunteer.jpg" x="0" y="0" width="400" height="400" preserveAspectRatio="xMidYMid slice" />
                    </pattern>
                  </defs>

                  {/* Sectors */}
                  {[
                    { id: 'pic-1', d: 'M 200 200 L 200 10 A 190 190 0 0 1 380.7 141.3 Z' },
                    { id: 'pic-2', d: 'M 200 200 L 380.7 141.3 A 190 190 0 0 1 311.7 353.7 Z' },
                    { id: 'pic-3', d: 'M 200 200 L 311.7 353.7 A 190 190 0 0 1 88.3 353.7 Z' },
                    { id: 'pic-4', d: 'M 200 200 L 88.3 353.7 A 190 190 0 0 1 19.3 141.3 Z' },
                    { id: 'pic-5', d: 'M 200 200 L 19.3 141.3 A 190 190 0 0 1 200 10 Z' },
                  ].map((sec, index) => (
                    <path
                      key={index}
                      d={sec.d}
                      fill={`url(#${sec.id})`}
                      onMouseEnter={() => setActiveTab(index)}
                      className={clsx(
                        "transition-all duration-500 cursor-pointer origin-center hover:scale-[1.02] stroke-[3]",
                        activeTab === index 
                          ? "grayscale-0 stroke-saffron-500 opacity-100" 
                          : "grayscale opacity-40 hover:opacity-75 stroke-transparent"
                      )}
                    />
                  ))}
                  
                  {/* Inner logo/circle for design polish */}
                  <circle cx="200" cy="200" r="35" className="fill-trust-950 stroke-white/20 stroke-2" />
                  <circle cx="200" cy="200" r="28" className="fill-saffron-500/10 stroke-saffron-500/30 stroke" />
                </svg>

                {/* Quadrant Labels (Absolute Position Overlays) */}
                {[
                  { label: 'MATRIMONY', top: '24%', left: '72%', align: 'start', id: 0, hl: 'M' },
                  { label: 'HEALTH', top: '60%', left: '76%', align: 'start', id: 1, hl: 'H' },
                  { label: 'GIVING', top: '78%', left: '50%', align: 'center', id: 2, hl: 'G' },
                  { label: 'LIVELIHOOD', top: '60%', left: '24%', align: 'end', id: 3, hl: 'L' },
                  { label: 'VOLUNTEER', top: '24%', left: '28%', align: 'end', id: 4, hl: 'V' },
                ].map((pos) => (
                  <button
                    key={pos.id}
                    onMouseEnter={() => setActiveTab(pos.id)}
                    onClick={() => setActiveTab(pos.id)}
                    style={{
                      top: pos.top,
                      left: pos.left,
                      transform: pos.align === 'center' ? 'translateX(-50%)' : pos.align === 'end' ? 'translateX(-100%)' : 'none'
                    }}
                    className={clsx(
                      "absolute z-20 font-display font-black text-sm tracking-widest px-3 py-1.5 rounded-lg select-none transition-all duration-300",
                      activeTab === pos.id
                        ? "text-white bg-trust-950/80 backdrop-blur-md border border-saffron-500/50 shadow-lg scale-105"
                        : "text-white/60 bg-transparent hover:text-white hover:bg-white/5 border border-transparent"
                    )}
                  >
                    {pos.label.split('').map((char, charIdx) => 
                      char === pos.hl ? <span key={charIdx} className="text-saffron-400 font-extrabold">{char}</span> : char
                    )}
                  </button>
                ))}
              </div>

              {/* Mobile View: Small Interactive Segmented Bar */}
              <div className="md:hidden w-full flex flex-col gap-4">
                <div className="relative w-72 h-72 rounded-full overflow-hidden border border-white/10 mx-auto bg-white/5">
                  <svg viewBox="0 0 400 400" className="w-full h-full">
                    <defs>
                      <pattern id="m-pic-1" patternUnits="userSpaceOnUse" width="400" height="400">
                        <image href="matrimony_hero.jpg" x="0" y="0" width="400" height="400" preserveAspectRatio="xMidYMid slice" />
                      </pattern>
                      <pattern id="m-pic-2" patternUnits="userSpaceOnUse" width="400" height="400">
                        <image href="camp.jpg" x="0" y="0" width="400" height="400" preserveAspectRatio="xMidYMid slice" />
                      </pattern>
                      <pattern id="m-pic-3" patternUnits="userSpaceOnUse" width="400" height="400">
                        <image href="1.jpeg" x="0" y="0" width="400" height="400" preserveAspectRatio="xMidYMid slice" />
                      </pattern>
                      <pattern id="m-pic-4" patternUnits="userSpaceOnUse" width="400" height="400">
                        <image href="jobs.jpg" x="0" y="0" width="400" height="400" preserveAspectRatio="xMidYMid slice" />
                      </pattern>
                      <pattern id="m-pic-5" patternUnits="userSpaceOnUse" width="400" height="400">
                        <image href="volunteer.jpg" x="0" y="0" width="400" height="400" preserveAspectRatio="xMidYMid slice" />
                      </pattern>
                    </defs>
                    {[
                      { id: 'm-pic-1', d: 'M 200 200 L 200 10 A 190 190 0 0 1 380.7 141.3 Z' },
                      { id: 'm-pic-2', d: 'M 200 200 L 380.7 141.3 A 190 190 0 0 1 311.7 353.7 Z' },
                      { id: 'm-pic-3', d: 'M 200 200 L 311.7 353.7 A 190 190 0 0 1 88.3 353.7 Z' },
                      { id: 'm-pic-4', d: 'M 200 200 L 88.3 353.7 A 190 190 0 0 1 19.3 141.3 Z' },
                      { id: 'm-pic-5', d: 'M 200 200 L 19.3 141.3 A 190 190 0 0 1 200 10 Z' },
                    ].map((sec, index) => (
                      <path
                        key={index}
                        d={sec.d}
                        fill={`url(#${sec.id})`}
                        onClick={() => setActiveTab(index)}
                        className={clsx(
                          "transition-all duration-300 origin-center",
                          activeTab === index 
                            ? "grayscale-0 stroke-saffron-500 stroke-[4] opacity-100" 
                            : "grayscale opacity-50 stroke-transparent"
                        )}
                      />
                    ))}
                  </svg>
                </div>
                
                {/* Horizontal Navigation Dots / Buttons for Mobile */}
                <div className="flex justify-center gap-2 mt-2">
                  {['M', 'H', 'T', 'L', 'V'].map((letter, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveTab(idx)}
                      className={clsx(
                        "w-10 h-10 rounded-full font-bold text-sm transition-all duration-300 border flex items-center justify-center",
                        activeTab === idx
                          ? "bg-saffron-500 border-saffron-500 text-trust-950 font-black shadow-lg"
                          : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                      )}
                    >
                      {letter}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side: Description and Details */}
            <div className="col-span-12 lg:col-span-6 flex flex-col justify-center">
              <span className="font-accent italic text-saffron-400 text-lg mb-2">Our Programs</span>
              <h2 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-wider text-white mb-6 leading-none">
                <span 
                  style={{ WebkitTextStroke: "1px rgba(255,255,255,0.75)", color: "transparent" }}
                  className="mr-3"
                >
                  FIVE WAYS
                </span>
                WE SERVE
              </h2>

              <p className="text-white/70 text-sm sm:text-base leading-relaxed mb-8">
                Our core initiatives centre around five closely interlinked service domains, nurturing and uplifting diverse communities across Surat, Gujarat.
              </p>

              {/* Bulleted Detailed List */}
              <div className="space-y-4">
                {[
                  {
                    hl: 'M',
                    title: 'atrimony Services',
                    desc: 'A private, counselor-led matchmaking program that honours family values and personal readiness. Not an app — a relationship.'
                  },
                  {
                    hl: 'H',
                    title: 'ealth Campaigns',
                    desc: '40–45 minute awareness sessions in schools covering menstrual hygiene, nutrition, and adolescent health — tracked session by session.'
                  },
                  {
                    hl: 'T',
                    title: 'ransparent Giving',
                    desc: 'Campaign-based donations with full reporting. You see exactly where your contribution went and what it achieved.'
                  },
                  {
                    hl: 'L',
                    title: 'ivelihood Support',
                    desc: 'We connect candidates with meaningful opportunities, prepare them for interviews, and stand with them through the process.'
                  },
                  {
                    hl: 'V',
                    title: 'olunteer Ecosystem',
                    desc: 'A structured, respected volunteer program where contributions are tracked, acknowledged, and directly tied to community outcomes.'
                  }
                ].map((item, index) => (
                  <div
                    key={index}
                    onMouseEnter={() => setActiveTab(index)}
                    onClick={() => setActiveTab(index)}
                    className={clsx(
                      "cursor-pointer group flex gap-4 p-4 rounded-2xl transition-all duration-300 border",
                      activeTab === index
                        ? "bg-white/10 border-white/10 shadow-lg"
                        : "bg-transparent border-transparent hover:bg-white/5"
                    )}
                  >
                    <div className="flex flex-col items-center">
                      <span className={clsx(
                        "w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 border",
                        activeTab === index
                          ? "bg-saffron-500 border-saffron-500 text-trust-950 font-black"
                          : "bg-white/5 border-white/15 text-white/50 group-hover:text-white"
                      )}>
                        {item.hl}
                      </span>
                      {index < 4 && (
                        <div className={clsx(
                          "w-[2px] grow min-h-[30px] my-2 transition-colors duration-300",
                          activeTab === index ? "bg-saffron-500/50" : "bg-white/10"
                        )} />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className={clsx(
                        "font-display text-lg transition-colors duration-300",
                        activeTab === index ? "text-saffron-300 font-bold" : "text-white/80 group-hover:text-white"
                      )}>
                        <span className="text-saffron-400 font-black">{item.hl}</span>
                        {item.title}
                      </h3>
                      <p className={clsx(
                        "text-xs sm:text-sm mt-1 leading-relaxed transition-colors duration-300",
                        activeTab === index ? "text-white/90" : "text-white/50 group-hover:text-white/70"
                      )}>
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

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
            <Link to="/donate" className="inline-flex items-center gap-2 px-8 py-4 bg-trust-900 text-white font-semibold rounded-2xl hover:bg-trust-800 transition-all">
              <HandHeart size={18} /> Make a Donation
            </Link>
            <Link to="/volunteer" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-trust-800 font-semibold rounded-2xl hover:bg-trust-50 transition-all">
              <Users size={18} /> Volunteer With Us
            </Link>
            <Link to="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-white/60 text-trust-800 font-medium rounded-2xl hover:bg-white transition-all border border-trust-200">
              Get in Touch <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
