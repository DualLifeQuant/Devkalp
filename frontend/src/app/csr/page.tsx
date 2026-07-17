import { useState, useRef, useEffect } from 'react'
import { Mail, Phone, MapPin, Send, Check, Shield, Award, Landmark, Building2, HelpCircle, BookOpen, Heart } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Button } from '@/components/ui'
import toast from 'react-hot-toast'
import { csrApi } from '@/lib/api'
import Seo from '@/components/common/Seo'

const BUDGETS = [
  'Under ₹5 Lakhs',
  '₹5 - ₹10 Lakhs',
  '₹10 - ₹25 Lakhs',
  'Over ₹25 Lakhs',
]

const CSR_PILLARS = [
  { value: 'education', label: 'Education & Digital Literacy' },
  { value: 'health', label: 'Rural Healthcare & Mobile Clinics' },
  { value: 'environment', label: 'Environmental Sustainability & Plantation' },
  { value: 'careers', label: 'Livelihood Skilling & Career Matchmaking' },
  { value: 'community', label: 'Matrimony & Community Welfare Support' },
]

const CSR_SERVICES = [
  {
    id: 'healthcare',
    icon: 'Heart',
    iconColor: 'text-red-600',
    iconBg: 'bg-red-50',
    iconBorder: 'border-red-100',
    title: 'Healthcare',
    desc: "At Devkalp, we believe quality healthcare should be accessible to all. Through Care-on-Wheels (C.O.W.) mobile medical vans, diagnostic camps, and health checkups, we bring free medical services, diagnostic services, medicines, and counseling directly to underserved communities. Our innovative model ensures healthcare is affordable and impactful."
  },
  {
    id: 'livelihood',
    icon: 'Building2',
    iconColor: 'text-saffron-600',
    iconBg: 'bg-saffron-50',
    iconBorder: 'border-saffron-100',
    title: 'Livelihood',
    desc: "Livelihood is the key to empowerment. We equip youth, women, farmers, and differently-abled individuals with vocational training, digital/financial literacy, and job-linked career opportunities. Focused skill placement campaigns have helped thousands gain employment, financial independence, and dignity."
  },
  {
    id: 'esg',
    icon: 'Shield',
    iconColor: 'text-sage-600',
    iconBg: 'bg-sage-50',
    iconBorder: 'border-sage-100',
    title: 'ESG',
    desc: "Sustainability is at the heart of our operations. Devkalp has planted trees to combat pollution, while also providing clean energy solutions to vulnerable families. We also support girls' menstrual health by installing sanitary napkin vending machines and hygiene kits, directly empowering female students and community members."
  },
  {
    id: 'education',
    icon: 'BookOpen',
    iconColor: 'text-trust-600',
    iconBg: 'bg-trust-50',
    iconBorder: 'border-trust-100',
    title: 'Education Support',
    desc: "Education is the foundation of opportunity. We establish digital learning hubs, provide tutoring support, and distribute learning kits to rural students, empowering the next generation with modern skills and guidance."
  }
]

const CSR_TESTIMONIALS = [
  {
    id: 'nevil',
    initial: 'N',
    avatarBg: 'bg-trust-100',
    avatarText: 'text-trust-800',
    name: 'Nevil Mansara',
    title: 'CEO',
    company: 'Dual Life Quant',
    message: '"Dual Life Quant is proud to partner with the Devkalp Foundation to support impactful digital literacy and technology initiatives. We believe in their grassroots approach and transparency, which enables companies like ours to achieve direct, measurable social impact where it is needed most."',
    logo: 'dlq'
  },
  {
    id: 'tirth',
    initial: 'T',
    avatarBg: 'bg-saffron-100',
    avatarText: 'text-saffron-855',
    name: 'Tirth Goyani',
    title: 'Co-Founder',
    company: 'Korneza Solutions',
    message: '"Our collaboration with Devkalp Foundation has been instrumental in driving meaningful change through grassroots digital education and healthcare camps. This partnership reflects our shared commitment to creating sustainable, technology-driven solutions that empower vulnerable communities across Gujarat."',
    logo: 'korneza'
  },
  {
    id: 'harsh',
    initial: 'H',
    avatarBg: 'bg-trust-100',
    avatarText: 'text-trust-855',
    name: 'Harsh Savaliya',
    title: 'Co-Founder',
    company: 'Korneza Solutions',
    message: '"Collaborating with the Devkalp Foundation on community healthcare initiatives has been extremely rewarding. Their organization shows an exceptional level of professionalism and operational care in coordinating local health camps, bringing critical care directly to families in need."',
    logo: 'korneza'
  },
  {
    id: 'sujal',
    initial: 'S',
    avatarBg: 'bg-trust-100',
    avatarText: 'text-trust-855',
    name: 'Sujal Jethava',
    title: 'COO',
    company: 'Dual Life Quant',
    message: '"At Dual Life Quant, we value operational excellence and transparency. Devkalp Foundation has consistently exceeded our expectations in executing and auditing CSR projects across Gujarat, making them an ideal partner for corporate philanthropy."',
    logo: 'dlq'
  }
]

const ServiceIcon = ({ name, size = 20 }: { name: string; size?: number }) => {
  switch (name) {
    case 'Heart':
      return <Heart size={size} className="fill-red-50" />
    case 'Building2':
      return <Building2 size={size} />
    case 'Shield':
      return <Shield size={size} />
    case 'BookOpen':
      return <BookOpen size={size} />
    default:
      return null
  }
}

const TestimonialLogo = ({ type }: { type: string }) => {
  if (type === 'dlq') {
    return (
      <svg className="h-6 w-auto" viewBox="0 0 140 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="12" r="3" fill="#1E3A8A" />
        <circle cx="18" cy="8" r="2" fill="#3B82F6" />
        <circle cx="18" cy="16" r="2" fill="#3B82F6" />
        <line x1="10" y1="12" x2="18" y2="8" stroke="#3B82F6" strokeWidth="1" />
        <line x1="10" y1="12" x2="18" y2="16" stroke="#3B82F6" strokeWidth="1" />
        <text x="26" y="15" fill="#1E3A8A" fontSize="8" fontWeight="800" fontFamily="sans-serif" letterSpacing="0.5">DUAL LIFE QUANT</text>
      </svg>
    )
  }
  if (type === 'korneza') {
    return (
      <svg className="h-6 w-auto" viewBox="0 0 140 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="4" width="16" height="16" rx="4" fill="#0EA5E9" />
        <path d="M7 8h1.5v3.5l2.5-3.5h2l-3 4 3.2 4h-2l-2.7-3.5L8.5 13.5V16H7V8z" fill="white" />
        <text x="24" y="15" fill="#0F172A" fontSize="8" fontWeight="800" fontFamily="sans-serif" letterSpacing="0.5">KORNEZA SOLUTIONS</text>
      </svg>
    )
  }
  return null
}

export default function CSRPage() {
  const [form, setForm] = useState({
    company_name: '',
    contact_person: '',
    email: '',
    phone: '',
    proposed_budget: '',
    interest_areas: [] as string[],
    message: '',
  })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const scrollRefTestimonials = useRef<HTMLDivElement>(null)
  const isDownT = useRef(false)
  const startXT = useRef(0)
  const scrollLeftT = useRef(0)
  const velocityT = useRef(0)
  const lastXT = useRef(0)
  const lastTimeT = useRef(0)
  const animationFrameIdT = useRef<number | null>(null)

  const handleMouseDownT = (e: React.MouseEvent) => {
    if (!scrollRefTestimonials.current) return
    isDownT.current = true
    startXT.current = e.pageX - scrollRefTestimonials.current.offsetLeft
    scrollLeftT.current = scrollRefTestimonials.current.scrollLeft
    lastXT.current = e.pageX
    lastTimeT.current = Date.now()
    velocityT.current = 0
    if (animationFrameIdT.current) {
      cancelAnimationFrame(animationFrameIdT.current)
    }
  }

  const handleMouseLeaveT = () => {
    if (isDownT.current) {
      isDownT.current = false
      startMomentumT()
    }
  }

  const handleMouseUpT = () => {
    if (isDownT.current) {
      isDownT.current = false
      startMomentumT()
    }
  }

  const handleMouseMoveT = (e: React.MouseEvent) => {
    if (!isDownT.current || !scrollRefTestimonials.current) return
    e.preventDefault()
    const x = e.pageX - scrollRefTestimonials.current.offsetLeft
    const walk = (x - startXT.current) * 1.5
    scrollRefTestimonials.current.scrollLeft = scrollLeftT.current - walk

    const now = Date.now()
    const dt = now - lastTimeT.current
    const dx = e.pageX - lastXT.current
    if (dt > 0) {
      velocityT.current = dx / dt
    }
    lastXT.current = e.pageX
    lastTimeT.current = now
  }

  const startMomentumT = () => {
    if (!scrollRefTestimonials.current || Math.abs(velocityT.current) < 0.1) return
    const decay = 0.95
    const step = () => {
      if (!scrollRefTestimonials.current) return
      scrollRefTestimonials.current.scrollLeft -= velocityT.current * 15
      velocityT.current *= decay
      if (Math.abs(velocityT.current) > 0.1 && !isDownT.current) {
        animationFrameIdT.current = requestAnimationFrame(step)
      }
    }
    animationFrameIdT.current = requestAnimationFrame(step)
  }

  // Slider 2: Services / Pillars
  const scrollRefServices = useRef<HTMLDivElement>(null)
  const isDownS = useRef(false)
  const startXS = useRef(0)
  const scrollLeftS = useRef(0)
  const velocityS = useRef(0)
  const lastXS = useRef(0)
  const lastTimeS = useRef(0)
  const animationFrameIdS = useRef<number | null>(null)

  const handleMouseDownS = (e: React.MouseEvent) => {
    if (!scrollRefServices.current) return
    isDownS.current = true
    startXS.current = e.pageX - scrollRefServices.current.offsetLeft
    scrollLeftS.current = scrollRefServices.current.scrollLeft
    lastXS.current = e.pageX
    lastTimeS.current = Date.now()
    velocityS.current = 0
    if (animationFrameIdS.current) {
      cancelAnimationFrame(animationFrameIdS.current)
    }
  }

  const handleMouseLeaveS = () => {
    if (isDownS.current) {
      isDownS.current = false
      startMomentumS()
    }
  }

  const handleMouseUpS = () => {
    if (isDownS.current) {
      isDownS.current = false
      startMomentumS()
    }
  }

  const handleMouseMoveS = (e: React.MouseEvent) => {
    if (!isDownS.current || !scrollRefServices.current) return
    e.preventDefault()
    const x = e.pageX - scrollRefServices.current.offsetLeft
    const walk = (x - startXS.current) * 1.5
    scrollRefServices.current.scrollLeft = scrollLeftS.current - walk

    const now = Date.now()
    const dt = now - lastTimeS.current
    const dx = e.pageX - lastXS.current
    if (dt > 0) {
      velocityS.current = dx / dt
    }
    lastXS.current = e.pageX
    lastTimeS.current = now
  }

  const startMomentumS = () => {
    if (!scrollRefServices.current || Math.abs(velocityS.current) < 0.1) return
    const decay = 0.95
    const step = () => {
      if (!scrollRefServices.current) return
      scrollRefServices.current.scrollLeft -= velocityS.current * 15
      velocityS.current *= decay
      if (Math.abs(velocityS.current) > 0.1 && !isDownS.current) {
        animationFrameIdS.current = requestAnimationFrame(step)
      }
    }
    animationFrameIdS.current = requestAnimationFrame(step)
  }

  const handleScrollServices = () => {
    const container = scrollRefServices.current
    if (!container) return
    const groupWidth = container.scrollWidth / 3
    
    if (container.scrollLeft >= groupWidth * 2) {
      container.scrollLeft -= groupWidth
      if (isDownS.current) {
        scrollLeftS.current -= groupWidth
      }
    } else if (container.scrollLeft <= 0) {
      container.scrollLeft += groupWidth
      if (isDownS.current) {
        scrollLeftS.current += groupWidth
      }
    }
  }

  const handleScrollTestimonials = () => {
    const container = scrollRefTestimonials.current
    if (!container) return
    const groupWidth = container.scrollWidth / 3

    if (container.scrollLeft >= groupWidth * 2) {
      container.scrollLeft -= groupWidth
      if (isDownT.current) {
        scrollLeftT.current -= groupWidth
      }
    } else if (container.scrollLeft <= 0) {
      container.scrollLeft += groupWidth
      if (isDownT.current) {
        scrollLeftT.current += groupWidth
      }
    }
  }

  useEffect(() => {
    const centerSliders = () => {
      if (scrollRefServices.current) {
        const servicesWidth = scrollRefServices.current.scrollWidth / 3
        scrollRefServices.current.scrollLeft = servicesWidth
      }
      if (scrollRefTestimonials.current) {
        const testimonialsWidth = scrollRefTestimonials.current.scrollWidth / 3
        scrollRefTestimonials.current.scrollLeft = testimonialsWidth
      }
    }
    const handle = setTimeout(centerSliders, 100)
    return () => {
      clearTimeout(handle)
      if (animationFrameIdT.current) cancelAnimationFrame(animationFrameIdT.current)
      if (animationFrameIdS.current) cancelAnimationFrame(animationFrameIdS.current)
    }
  }, [])

  const handleAreaToggle = (val: string) => {
    setForm(f => {
      const exist = f.interest_areas.includes(val)
      const next = exist
        ? f.interest_areas.filter(a => a !== val)
        : [...f.interest_areas, val]
      return { ...f, interest_areas: next }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.company_name || !form.contact_person || !form.email || !form.message) {
      toast.error('Please fill all required fields')
      return
    }
    setSending(true)
    try {
      await csrApi.submit(form)
      setSent(true)
      toast.success("Proposal submitted! Our CSR advisory board will reach out shortly. 🙏")
    } catch {
      toast.error('Failed to submit proposal. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <Seo
        title="CSR Partnerships"
        description="Partner with Devkalp Foundation for your CSR initiatives across health, education, matrimony, and livelihood programs."
        path="/csr"
      />
      <Navbar />

      {/* Hero */}
      <section className="bg-trust-950 pt-28 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-pattern opacity-20" />
        <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-saffron-500/10 rounded-full blur-3xl" />
        <div className="page-container relative z-10 max-w-3xl">
          <p className="font-accent italic text-saffron-300 text-lg mb-2">Progress with Purpose</p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-white mb-4">CSR</h1>
          <p className="text-white/60 text-base sm:text-lg leading-relaxed">
            Transform your CSR vision into measurable impact. Devkalp Foundation helps organizations execute transparent, compliant CSR projects across Gujarat while enabling 80G and 12A tax benefits.

          </p>
        </div>
      </section>

      <div className="page-container py-16">
        <div className="grid md:grid-cols-5 gap-12">

          {/* CSR Program details */}
          <div className="md:col-span-2 space-y-8">
            <div>
              <p className="font-accent italic text-saffron-600 text-lg mb-4">Why Collaborate with Devkalp?</p>

              <div className="space-y-6">
                {[
                  {
                    icon: <Award size={20} className="text-saffron-600" />,
                    title: '12A & 80G Tax Exemptions',
                    desc: 'All eligible corporate contributions to our organization qualify for tax deductions under Section 80G of the Income Tax Act, 1961. Our organization is also registered under Section 12AB of the Income Tax Act. 12A & 80G Tax Exemptions',
                  },
                  {
                    icon: <Shield size={20} className="text-trust-600" />,
                    title: 'Transparent Reporting',
                    desc: 'Real-time campaign status, session-by-session tracking, and detailed project audits sent directly to your CSR committee.',
                  },
                  {
                    icon: <Landmark size={20} className="text-sage-600" />,
                    title: 'Local Grassroots Impact',
                    desc: 'Deep outreach across Surat district and surrounding areas in Gujarat, ensuring your CSR funds directly benefit those in need.',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-start bg-white p-5 border border-slate-100 rounded-2xl shadow-2xs">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100/50">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 text-sm mb-1">{item.title}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-trust-50 to-saffron-50 border border-trust-100 rounded-2xl p-6">
              <h3 className="font-semibold text-trust-800 text-sm mb-2 flex items-center gap-1.5">
                <Building2 size={16} /> Corporate Livelihood Projects
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                Sponsor vocational training classes, local jobs matching drives, or community health sessions. We handle execution, logistics, and data collection.
              </p>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-trust-700">
                <Check size={12} className="stroke-[3]" /> Tailored impact reports provided.
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">General Enquiries</p>
              <div className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center gap-3">
                <Mail size={16} className="text-slate-400" />
                <div>
                  <p className="text-[10px] text-slate-400 font-medium">CSR Helpdesk</p>
                  <a href="mailto:devkalp986@gmail.com" className="text-xs font-semibold text-trust-700 hover:underline">devkalp986@gmail.com</a>
                </div>
              </div>
            </div>
          </div>

          {/* Inquiry Form */}
          <div className="md:col-span-3">
            {sent ? (
              <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-card">
                <div className="w-16 h-16 rounded-2xl bg-sage-100 flex items-center justify-center mx-auto mb-4">
                  <Send size={28} className="text-sage-600" />
                </div>
                <h2 className="font-display text-2xl text-trust-900 mb-2">Proposal Received!</h2>
                <p className="text-slate-500 max-w-xs mx-auto">
                  Thank you for submitting your proposal. Our CSR coordinators will evaluate it and contact you within 2 business days.
                </p>
                <button
                  onClick={() => {
                    setSent(false)
                    setForm({
                      company_name: '',
                      contact_person: '',
                      email: '',
                      phone: '',
                      proposed_budget: '',
                      interest_areas: [],
                      message: '',
                    })
                  }}
                  className="mt-6 text-sm text-trust-600 hover:underline"
                >
                  Submit another proposal
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-card">
                <h2 className="font-display text-2xl text-trust-900 mb-6">Corporate CSR Inquiry</h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Company Name *</label>
                      <input className="input text-sm" placeholder="e.g. Acme Corp" value={form.company_name} onChange={set('company_name')} />
                    </div>
                    <div>
                      <label className="label">Contact Person Name *</label>
                      <input className="input text-sm" placeholder="Your Full Name" value={form.contact_person} onChange={set('contact_person')} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Corporate Email Address *</label>
                      <input type="email" className="input text-sm" placeholder="you@acme.com" value={form.email} onChange={set('email')} />
                    </div>
                    <div>
                      <label className="label">Phone Number</label>
                      <input className="input text-sm" placeholder="e.g. +91 99999 99999" value={form.phone} onChange={set('phone')} />
                    </div>
                  </div>

                  {/* Budget */}
                  <div>
                    <label className="label">Estimated Annual Budget</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {BUDGETS.map(b => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, proposed_budget: b }))}
                          className={`px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all ${form.proposed_budget === b
                            ? 'border-trust-400 bg-trust-50 text-trust-800'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Focus Areas */}
                  <div>
                    <label className="label">Pillars of Interest (Select All that Apply)</label>
                    <div className="space-y-2">
                      {CSR_PILLARS.map(p => {
                        const active = form.interest_areas.includes(p.value)
                        return (
                          <button
                            key={p.value}
                            type="button"
                            onClick={() => handleAreaToggle(p.value)}
                            className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left text-sm transition-all ${active
                              ? 'border-sage-400 bg-sage-50 text-sage-800 font-semibold'
                              : 'border-slate-100 hover:border-slate-200 text-slate-600'
                              }`}
                          >
                            <span>{p.label}</span>
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center border text-[10px] ${active ? 'bg-sage-600 text-white border-transparent' : 'border-slate-300 bg-white'
                              }`}>
                              {active && <Check size={11} className="stroke-[3.5]" />}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="label">CSR Proposal / Key Requirements *</label>
                    <textarea
                      className="input resize-none text-sm"
                      rows={5}
                      placeholder="Briefly describe your focus goals, geographic interests, and timeline..."
                      value={form.message}
                      onChange={set('message')}
                    />
                  </div>

                  <Button type="submit" loading={sending} className="w-full justify-center" size="lg">
                    <Send size={16} /> Submit CSR Proposal
                  </Button>

                  <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                    This inquiry is private, secure, and will be routed directly to the Devkalp Foundation CSR Advisory Board.
                  </p>
                </form>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* About Devkalp / Our Services & Campaigns Section */}
      <section className="bg-white border-t border-slate-100 py-20 overflow-hidden text-center">
        <div className="page-container px-4">
          <p className="font-accent italic text-saffron-600 text-lg mb-2">Our Mission</p>
          <h2 className="font-display text-3xl font-bold text-trust-900 mb-4">About Devkalp</h2>
          <p className="text-slate-600 text-sm leading-relaxed max-w-3xl mx-auto mb-6">
            Devkalp Foundation is dedicated to creating a healthier, more inclusive, and sustainable future. Our programs, like Care On Wheels, provide preventive healthcare, while skilling and employment matchmaking support thousands with livelihood opportunities. We empower local communities through accessible healthcare, vocational training, and green sustainability initiatives. By driving impact at the grassroots level, Devkalp is committed to transforming lives and fostering long-term social change.
          </p>
          <p className="font-display text-lg font-bold text-trust-800 mb-10">We are dedicated to:</p>

          {/* Horizontally scrollable container */}
          <div
            ref={scrollRefServices}
            onMouseDown={handleMouseDownS}
            onMouseLeave={handleMouseLeaveS}
            onMouseUp={handleMouseUpS}
            onMouseMove={handleMouseMoveS}
            onScroll={handleScrollServices}
            className="flex overflow-x-auto gap-6 pb-8 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 cursor-grab active:cursor-grabbing select-none"
          >
            {[...CSR_SERVICES, ...CSR_SERVICES, ...CSR_SERVICES].map((s, index) => (
              <div key={index} className="w-[340px] sm:w-[380px] shrink-0 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100/80 shadow-xs hover:shadow-md transition-all duration-355 flex flex-col text-left justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${s.iconBg} ${s.iconBorder} ${s.iconColor}`}>
                      <ServiceIcon name={s.icon} />
                    </div>
                    <h3 className="font-display text-lg font-bold text-trust-900">{s.title}</h3>
                  </div>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-body">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supporters Testimonials Section */}
      <section className="bg-slate-100/50 border-t border-slate-200/40 py-20 overflow-hidden">
        <div className="page-container px-4 text-center">
          <p className="font-accent italic text-saffron-600 text-lg mb-2">Partner Feedback</p>
          <h2 className="font-display text-3xl font-bold text-trust-900 mb-2">What Devkalp's Supporters Say</h2>
          <p className="text-slate-500 text-sm mt-1 max-w-lg mx-auto mb-12">
            Words that inspire us and help our intent meet impact.
          </p>

          {/* Horizontally scrollable container */}
          <div
            ref={scrollRefTestimonials}
            onMouseDown={handleMouseDownT}
            onMouseLeave={handleMouseLeaveT}
            onMouseUp={handleMouseUpT}
            onMouseMove={handleMouseMoveT}
            onScroll={handleScrollTestimonials}
            className="flex overflow-x-auto gap-6 pb-8 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 cursor-grab active:cursor-grabbing select-none"
          >
            {[...CSR_TESTIMONIALS, ...CSR_TESTIMONIALS, ...CSR_TESTIMONIALS].map((t, index) => (
              <div key={index} className="w-[380px] sm:w-[450px] shrink-0 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs hover:shadow-md transition-all duration-350 flex flex-col justify-between text-left">
                <div>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-8 font-medium font-body">
                    {t.message}
                  </p>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-auto">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full font-bold text-sm flex items-center justify-center border ${t.avatarBg} ${t.avatarText} ${t.avatarBg.includes('saffron') ? 'border-saffron-200' : 'border-trust-200'}`}>
                      {t.initial}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm">{t.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t.title}</p>
                    </div>
                  </div>
                  <div className="shrink-0 select-none">
                    <TestimonialLogo type={t.logo} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
