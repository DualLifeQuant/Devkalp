import { useState } from 'react'
import { Mail, Phone, MapPin, Send, HeartHandshake, HandHeart, Users, Briefcase } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Button } from '@/components/ui'
import toast from 'react-hot-toast'
import { enquiriesApi } from '@/lib/api'

const ENQUIRY_TYPES = [
  { value: 'matrimony', label: 'Matrimony Services', icon: <HeartHandshake size={16} /> },
  { value: 'donation', label: 'Donation / Partnership', icon: <HandHeart size={16} /> },
  { value: 'volunteer', label: 'Volunteer Registration', icon: <Users size={16} /> },
  { value: 'careers', label: 'Career Opportunities', icon: <Briefcase size={16} /> },
  { value: 'general', label: 'General Enquiry', icon: <Mail size={16} /> },
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', enquiry_type: 'general', message: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) { toast.error('Please fill all required fields'); return }
    setSending(true)
    try {
      await enquiriesApi.submit(form)
      setSent(true)
      toast.success("Message sent! We'll get back to you within 24 hours.")
    } catch {
      toast.error('Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <Navbar />

      {/* Hero */}
      <section className="bg-trust-950 pt-28 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-pattern opacity-20" />
        <div className="page-container relative z-10 max-w-2xl">
          <p className="font-accent italic text-saffron-300 text-lg mb-2">We're Here</p>
          <h1 className="font-display text-5xl font-semibold text-white mb-4">Let's Talk</h1>
          <p className="text-white/60 text-lg leading-relaxed">
            Whether you have a question, need guidance, or simply want to connect — reach out.
            A real person will respond.
          </p>
        </div>
      </section>

      <div className="page-container py-16">
        <div className="grid md:grid-cols-5 gap-12">

          {/* Contact Info */}
          <div className="md:col-span-2 space-y-8">
            <div>
              <p className="font-accent italic text-saffron-600 text-lg mb-4">Reach Us Directly</p>
              <div className="space-y-4">
                {[
                  { icon: <Mail size={18} className="text-trust-600" />, label: 'Email', value: 'devkalp986@gmail.com', href: 'mailto:devkalp986@gmail.com' },
                  { icon: <Phone size={18} className="text-trust-600" />, label: 'Phone', value: '+91 91040 98600', href: 'tel:+91 91040 98600' },
                  { icon: <MapPin size={18} className="text-trust-600" />, label: 'Address', value: 'Surat, Gujarat, India', href: null },
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-trust-50 flex items-center justify-center shrink-0 mt-0.5">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-0.5">{item.label}</p>
                      {item.href ? (
                        <a href={item.href} className="text-sm font-medium text-slate-800 hover:text-trust-700 transition-colors">{item.value}</a>
                      ) : (
                        <p className="text-sm font-medium text-slate-800">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-trust-50 to-saffron-50 border border-trust-100 rounded-2xl p-5">
              <p className="font-semibold text-trust-800 text-sm mb-2">Response Time</p>
              <p className="text-slate-600 text-sm leading-relaxed">
                We respond to all enquiries within <strong>24 hours</strong> on working days.
                For urgent matters, please call directly.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Department Contacts</p>
              {[
                { dept: 'Matrimony Counseling', email: 'devkalp986@gmail.com' },
                { dept: 'Donations & Partnerships', email: 'devkalp986@gmail.com' },
                { dept: 'HR / Careers', email: 'devkalp986@gmail.com' },
              ].map(d => (
                <div key={d.dept} className="p-3 bg-white border border-slate-100 rounded-xl">
                  <p className="text-xs font-medium text-slate-700">{d.dept}</p>
                  <a href={`mailto:${d.email}`} className="text-xs text-trust-600 hover:underline">{d.email}</a>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-3">
            {sent ? (
              <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-card">
                <div className="w-16 h-16 rounded-2xl bg-sage-100 flex items-center justify-center mx-auto mb-4">
                  <Send size={28} className="text-sage-600" />
                </div>
                <h2 className="font-display text-2xl text-trust-900 mb-2">Message Sent!</h2>
                <p className="text-slate-500 max-w-xs mx-auto">Thank you for reaching out. Our team will respond within 24 hours.</p>
                <button onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', enquiry_type: 'general', message: '' }) }}
                  className="mt-6 text-sm text-trust-600 hover:underline">
                  Send another message
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-card">
                <h2 className="font-display text-2xl text-trust-900 mb-6">Send a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Enquiry Type */}
                  <div>
                    <label className="label">What is this about?</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {ENQUIRY_TYPES.map(t => (
                        <button key={t.value} type="button" onClick={() => setForm(f => ({ ...f, enquiry_type: t.value }))}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-all ${form.enquiry_type === t.value
                            ? 'border-trust-400 bg-trust-50 text-trust-800 font-medium'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}>
                          {t.icon} {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Full Name *</label>
                      <input className="input text-sm" placeholder="Your name" value={form.name} onChange={set('name')} />
                    </div>
                    <div>
                      <label className="label">Phone</label>
                      <input className="input text-sm" placeholder="+91 98765..." value={form.phone} onChange={set('phone')} />
                    </div>
                  </div>

                  <div>
                    <label className="label">Email Address *</label>
                    <input type="email" className="input text-sm" placeholder="you@example.com" value={form.email} onChange={set('email')} />
                  </div>

                  <div>
                    <label className="label">Your Message *</label>
                    <textarea className="input resize-none text-sm" rows={5}
                      placeholder="Tell us how we can help you..."
                      value={form.message} onChange={set('message')} />
                  </div>

                  <Button type="submit" loading={sending} className="w-full justify-center" size="lg">
                    <Send size={16} /> Send Message
                  </Button>

                  <p className="text-xs text-slate-400 text-center">
                    Your information is kept strictly confidential and used only to respond to your enquiry.
                  </p>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
