import { useState } from 'react'
import { Heart, Check, Shield } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Button } from '@/components/ui'
import { useAuthStore } from '@/lib/store'
import { donationsApi } from '@/lib/api'
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
  const [showQR, setShowQR] = useState(false)
  const [donationId, setDonationId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [completing, setCompleting] = useState(false)
  const { user } = useAuthStore()

  const PRESETS = [100, 500, 1000, 2500, 5000]

  const handleNextStep = async () => {
    const finalAmount = custom ? parseFloat(custom) : amount
    if (!finalAmount || finalAmount < 1) { toast.error('Please enter a valid amount'); return }
    if (!name && !user) { toast.error('Please enter your name'); return }
    if (!email && !user) { toast.error('Please enter your email'); return }
    
    setLoading(true)
    try {
      const res = await donationsApi.initiate({
        amount: finalAmount,
        campaign_id: campaign?.id || null,
        donor_name: user ? user.full_name : (name || undefined),
        donor_email: user ? user.email : (email || undefined),
        donor_phone: user ? user.phone : (phone || undefined),
        donor_pan: pan || undefined,
      })
      setDonationId(res.data.donation_id)
      setShowQR(true)
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to initiate donation')
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async () => {
    if (!donationId) return
    setCompleting(true)
    try {
      await donationsApi.mockComplete(donationId)
      toast.success("Thank you for your generous donation! We have processed and saved it. 🙏")
      onClose()
      window.location.reload()
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to complete donation')
    } finally {
      setCompleting(false)
    }
  }

  if (showQR) {
    const finalAmount = custom ? parseFloat(custom) : amount

    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-3xl shadow-float w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="p-6 border-b border-slate-100 text-center">
            <p className="font-accent italic text-saffron-600 text-sm mb-1">Step 2: Scan & Pay</p>
            <h2 className="font-display text-2xl text-trust-900">Scan QR Code</h2>
          </div>
          <div className="p-6 flex flex-col items-center text-center space-y-5">
            <p className="text-slate-600 text-sm">
              Please scan the QR code using GPay, PhonePe, Paytm, or any UPI app to complete your donation of <strong className="text-trust-800">₹{finalAmount.toLocaleString('en-IN')}</strong>.
            </p>
            
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center">
              <img src="/donation_qr.jpg" alt="UPI QR Code" className="w-[200px] h-[200px] object-contain" />
            </div>

            <div className="w-full pt-4 space-y-2.5">
              <Button onClick={handleComplete} loading={completing} className="w-full justify-center" size="lg">
                I have completed the payment
              </Button>
              <button onClick={() => setShowQR(false)} disabled={completing} className="w-full text-slate-500 hover:text-slate-700 text-sm font-semibold py-2">
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    )
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
              {['Direct UPI Transfer', 'Tax receipt under Section 80G', 'Transparent impact reports'].map(f => (
                <li key={f} className="flex items-center gap-1.5 text-xs text-sage-700">
                  <Check size={11} /> {f}
                </li>
              ))}
            </ul>
          </div>

          <Button onClick={handleNextStep} loading={loading} className="w-full justify-center" size="lg">
            <Heart size={18} className="fill-white/50" />
            Donate ₹{(custom ? parseFloat(custom) : amount).toLocaleString('en-IN')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function DonatePage() {
  const [donatingTo, setDonatingTo] = useState<any | null>(null)

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

      {donatingTo !== null && <DonateModal campaign={donatingTo?.id ? donatingTo : null} onClose={() => setDonatingTo(null)} />}
      <Footer />
    </div>
  )
}
