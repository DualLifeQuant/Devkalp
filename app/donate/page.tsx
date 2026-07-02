'use client'
import { useState } from 'react'
import { Heart, Target, Users, ChevronRight, Check, Shield } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Button, EmptyState } from '@/components/ui'
import { SkeletonGrid } from '@/components/common/LoadingStates'
import { motion, AnimatePresence } from 'framer-motion'
import { donationsApi } from '@/lib/api'
import { useDonationCampaigns, useTransparencyData } from '@/hooks/useApiQueries'
import { useAuthStore } from '@/lib/store'
import { auditDonation } from '@/lib/audit/auditLog'
import { pushDonationToERP } from '@/lib/integrations/erp'
import { journey } from '@/lib/analytics'
import { parseRateLimit } from '@/lib/security/sanitize'
import toast from 'react-hot-toast'

declare global { interface Window { Razorpay: any } }

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max ? Math.min((value / max) * 100, 100) : 0
  return (
    <div className="w-full bg-slate-100 rounded-full h-2">
      <div className="h-2 rounded-full bg-gradient-to-r from-saffron-400 to-saffron-500 transition-all duration-700" style={{ width: `${pct}%` }} />
    </div>
  )
}

function DonateModal({ campaign, onClose }: { campaign: any; onClose: () => void }) {
  const [amount, setAmount] = useState(500)
  const [custom, setCustom] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [pan, setPan] = useState('')
  const [loading, setLoading] = useState(false)
  const { user } = useAuthStore()

  const PRESETS = [100, 500, 1000, 2500, 5000]

  const handleDonate = async () => {
    const finalAmount = custom ? parseFloat(custom) : amount
    if (!finalAmount || finalAmount < 1) { toast.error('Please enter a valid amount'); return }
    if (!name && !user) { toast.error('Please enter your name'); return }
    if (!email && !user) { toast.error('Please enter your email'); return }

    setLoading(true)
    try {
      const res = await donationsApi.initiate({
        amount: finalAmount,
        campaign_id: campaign?.id || null,
        donor_name: name || user?.full_name,
        donor_email: email || user?.email,
        donor_phone: phone || user?.phone,
        donor_pan: pan || null,
      })
      const { order_id, key_id, receipt_number } = res.data

      // Load Razorpay script if not loaded
      if (!window.Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script')
          script.src = 'https://checkout.razorpay.com/v1/checkout.js'
          script.onload = resolve; script.onerror = reject
          document.head.appendChild(script)
        })
      }

      const rzp = new window.Razorpay({
        key: key_id,
        amount: finalAmount * 100,
        currency: 'INR',
        name: 'Devkalp Foundation',
        description: campaign?.title || 'General Donation',
        order_id,
        prefill: { name: name || user?.full_name || '', email: email || user?.email || '', contact: phone || user?.phone || '' },
        theme: { color: '#1e3a8a' },
        handler: async (resp: any) => {
          try {
            const verifyRes = await donationsApi.verify({
              razorpay_order_id: resp.razorpay_order_id,
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_signature: resp.razorpay_signature,
            })
            toast.success(`Thank you! Receipt #${receipt_number} sent to your email. 🙏`)
            // Audit + ERP sync + analytics (all non-blocking)
            const donationId = verifyRes?.data?.id ?? resp.razorpay_payment_id
            auditDonation('completed', donationId, user?.id, finalAmount)
            journey.donationCompleted(finalAmount, receipt_number)
            pushDonationToERP({
              id: donationId,
              amount: finalAmount,
              donor_name: name || user?.full_name,
              donor_email: email || user?.email,
              campaign_id: campaign?.id,
              receipt_number,
            })
            onClose()
          } catch { toast.error('Payment verification failed. Contact support.') }
        },
        modal: { ondismiss: () => toast('Payment cancelled.') }
      })
      rzp.open()
    } catch (e: any) {
      const rl = parseRateLimit(e)
      toast.error(rl.limited ? rl.message : (e?.response?.data?.detail || 'Failed to initiate payment'))
      auditDonation('failed', 'unknown', user?.id, finalAmount)
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-float w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-100">
          <p className="font-accent italic text-saffron-600 text-sm mb-1">You're making a difference</p>
          <h2 className="font-display text-2xl text-trust-900">{campaign?.title || 'Make a Donation'}</h2>
        </div>
        <div className="p-6 space-y-5">
          {/* Amount */}
          <div>
            <label className="label">Choose Amount</label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {PRESETS.map(p => (
                <button key={p} type="button" onClick={() => { setAmount(p); setCustom('') }}
                  className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                    amount === p && !custom ? 'border-trust-700 bg-trust-50 text-trust-800' : 'border-slate-200 text-slate-600 hover:border-trust-300'
                  }`}>
                  ₹{p.toLocaleString('en-IN')}
                </button>
              ))}
              <input type="number" placeholder="Custom" value={custom} onChange={e => { setCustom(e.target.value); setAmount(0) }}
                className="input text-center py-2.5 border-2 col-span-1 text-sm" />
            </div>
          </div>

          {!user && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label">Full Name *</label>
                  <input className="input text-sm" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div>
                  <label className="label">Email *</label>
                  <input className="input text-sm" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label">Phone</label>
                  <input className="input text-sm" placeholder="+91 98765..." value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
                <div>
                  <label className="label">PAN (for 80G)</label>
                  <input className="input text-sm" placeholder="ABCDE1234F" value={pan} onChange={e => setPan(e.target.value.toUpperCase())} />
                </div>
              </div>
            </>
          )}

          <div className="bg-sage-50 border border-sage-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={14} className="text-sage-600" />
              <p className="text-xs font-semibold text-sage-800">100% Secure & Transparent</p>
            </div>
            <ul className="space-y-1">
              {['Secured by Razorpay', 'Tax receipt under Section 80G', 'Transparent impact reports'].map(f => (
                <li key={f} className="flex items-center gap-1.5 text-xs text-sage-700">
                  <Check size={11} /> {f}
                </li>
              ))}
            </ul>
          </div>

          <Button onClick={handleDonate} loading={loading} className="w-full justify-center" size="lg">
            <Heart size={18} className="fill-white/50" />
            Donate ₹{custom || amount.toLocaleString('en-IN')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function DonatePage() {
  const [donatingTo, setDonatingTo] = useState<any | null>(null)

  const { data: campaignsData, isLoading: loading } = useDonationCampaigns()
  const { data: transparency } = useTransparencyData()
  const campaigns: any[] = (campaignsData as any)?.items || []

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-trust-950 to-trust-800 pt-28 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-pattern opacity-20" />
        <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-saffron-500/10 rounded-full blur-3xl" />
        <div className="page-container relative z-10">
          <p className="font-accent italic text-saffron-300 text-lg mb-2">Give with Purpose</p>
          <h1 className="font-display text-5xl font-semibold text-white mb-4">Your Generosity,<br />Fully Accounted For</h1>
          <p className="text-white/60 max-w-xl text-base leading-relaxed mb-8">
            Every rupee you donate is tracked, reported, and shown to you. No ambiguity. No black boxes. Just real impact.
          </p>
          <button onClick={() => setDonatingTo({})} className="btn-secondary text-base px-8 py-4">
            <Heart size={18} /> Donate Now
          </button>
        </div>
      </section>

      {/* Transparency Strip */}
      {transparency && (
        <section className="bg-white py-8 border-b border-slate-100">
          <div className="page-container">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-center">
              <div>
                <p className="font-display text-3xl font-semibold text-trust-800">
                  ₹{(transparency.total_collected / 100000).toFixed(1)}L
                </p>
                <p className="text-slate-500 text-sm">Total Raised</p>
              </div>
              <div>
                <p className="font-display text-3xl font-semibold text-sage-700">
                  {transparency.total_donors.toLocaleString('en-IN')}
                </p>
                <p className="text-slate-500 text-sm">Generous Donors</p>
              </div>
              <div>
                <p className="font-display text-3xl font-semibold text-saffron-700">
                  {campaigns.length}
                </p>
                <p className="text-slate-500 text-sm">Active Campaigns</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Campaigns */}
      <div className="page-container py-16">
        <div className="text-center mb-10">
          <h2 className="section-title">Active Campaigns</h2>
          <p className="text-slate-500 mt-2 text-base">Choose a cause close to your heart</p>
        </div>

        {loading ? (
          <SkeletonGrid count={3} cols={3} />
        ) : campaigns.length === 0 ? (
          <EmptyState icon={<Heart size={24} />} title="No active campaigns" description="Check back soon." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((c: any) => (
              <div key={c.id} className="bg-white rounded-3xl border border-slate-100 overflow-hidden group">
                <div className="h-48 bg-gradient-to-br from-trust-100 to-saffron-100 relative overflow-hidden">
                  {c.cover_image ? (
                    <img src={c.cover_image} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Heart size={48} className="text-saffron-300" />
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="font-display text-lg text-trust-900 mb-2">{c.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-2">{c.short_description}</p>

                  {c.target_amount && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                        <span>Raised: <strong className="text-trust-700">₹{(c.collected_amount || 0).toLocaleString('en-IN')}</strong></span>
                        <span>Goal: ₹{c.target_amount.toLocaleString('en-IN')}</span>
                      </div>
                      <ProgressBar value={c.collected_amount || 0} max={c.target_amount} />
                      {c.progress_pct !== null && (
                        <p className="text-xs text-saffron-700 font-medium mt-1">{c.progress_pct}% funded</p>
                      )}
                    </div>
                  )}

                  <button onClick={() => setDonatingTo(c)}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-trust-800 text-white text-sm font-medium rounded-xl hover:bg-trust-700 transition-colors">
                    <Heart size={15} fill="white" /> Donate to this Campaign
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {donatingTo !== null && <DonateModal campaign={donatingTo?.id ? donatingTo : null} onClose={() => setDonatingTo(null)} />}
      <Footer />
    </div>
  )
}
