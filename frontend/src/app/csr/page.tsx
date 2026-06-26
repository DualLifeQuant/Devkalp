import { useState } from 'react'
import { Mail, Phone, MapPin, Send, Check, Shield, Award, Landmark, Building2, HelpCircle } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Button } from '@/components/ui'
import toast from 'react-hot-toast'
import { csrApi } from '@/lib/api'

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
                    desc: 'All corporate contributions qualify for tax deductions under Section 80G and Section 12A of the Income Tax Act, 1961.',
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
    </div>
  )
}
