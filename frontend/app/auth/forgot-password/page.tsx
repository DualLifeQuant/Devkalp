'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Mail, Heart, ArrowLeft, Send } from 'lucide-react'
import { Button } from '@/components/ui'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) { toast.error('Please enter your email'); return }
    setSending(true)
    await new Promise(r => setTimeout(r, 1000))
    setSending(false)
    setSent(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 mb-10 justify-center">
          <div className="w-9 h-9 rounded-xl bg-trust-800 flex items-center justify-center">
            <Heart size={17} className="text-saffron-300 fill-saffron-300" />
          </div>
          <span className="font-display font-semibold text-trust-900 text-lg">Devkalp Foundation</span>
        </Link>

        <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-card">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-2xl bg-sage-100 flex items-center justify-center mx-auto mb-4">
                <Send size={24} className="text-sage-600" />
              </div>
              <h2 className="font-display text-2xl text-trust-900 mb-2">Check your email</h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                If an account exists for <strong>{email}</strong>, we've sent password reset instructions. Check your inbox and spam folder.
              </p>
              <p className="text-xs text-slate-400 mb-4">Didn't receive it? Contact us at</p>
              <a href="mailto:info@devkalpfoundation.org" className="text-sm text-trust-600 hover:underline font-medium">
                info@devkalpfoundation.org
              </a>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl text-trust-900 mb-1">Reset Password</h1>
              <p className="text-slate-500 text-sm mb-6">
                Enter your registered email and we'll send you a link to reset your password.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="email" className="input pl-10 text-sm" placeholder="your@email.com"
                      value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                </div>
                <Button type="submit" loading={sending} className="w-full justify-center" size="lg">
                  Send Reset Link
                </Button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-sm text-slate-500 mt-5">
          <Link href="/auth/login" className="inline-flex items-center gap-1.5 text-trust-600 hover:text-trust-800 font-medium">
            <ArrowLeft size={14} /> Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
