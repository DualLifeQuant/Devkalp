'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { authApi } from '@/lib/api'
import { useAuthStore, getDashboardPath } from '@/lib/store'
import { Input, Button } from '@/components/ui'

interface LoginForm { email: string; password: string }

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>()
  const { setAuth } = useAuthStore()
  const router = useRouter()

  const onSubmit = async (data: LoginForm) => {
    setLoading(true)
    try {
      const res = await authApi.login(data.email, data.password)
      const { access_token, refresh_token, user } = res.data
      setAuth(user, access_token, refresh_token)
      toast.success(`Welcome back, ${user.full_name.split(' ')[0]}!`)
      router.push(getDashboardPath(user.role))
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-trust-950 relative overflow-hidden flex-col justify-between p-14">
        <div className="absolute inset-0 bg-hero-pattern opacity-30" />
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-saffron-500/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <Link href="/">
            <Image src="/devkalp-logo-removebg-preview.png" alt="Devkalp Foundation Logo" width={130} height={44} className="object-contain h-24 w-auto  opacity-90" />
          </Link>
          <div className="relative z-10">
          <p className="font-accent italic text-saffron-300 text-lg mb-3">Welcome back</p>
          <h2 className="font-display text-4xl font-semibold text-white mb-4 leading-tight">
            Every journey begins with a single step of trust.
          </h2>
          <p className="text-white/60 leading-relaxed">
            Sign in to access your personalised space — whether you're finding a match, tracking a donation, or checking your application status.
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex -space-x-2">
            {['P', 'R', 'M', 'A'].map((i, idx) => (
              <div key={idx} className="w-8 h-8 rounded-full bg-trust-700 border-2 border-trust-950 flex items-center justify-center text-xs text-white font-medium">{i}</div>
            ))}
          </div>
          <p className="text-white/50 text-sm">Join 2,400+ families on the platform</p>
        </div>
        </div>
        
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="mb-8 lg:hidden inline-block">
            <Image src="/logo.png" alt="Devkalp Foundation Logo" width={120} height={40} className="object-contain h-9 w-auto" />
          </Link>

          <h1 className="font-display text-3xl font-semibold text-trust-900 mb-1">Sign In</h1>
          <p className="text-slate-500 mb-8">Good to see you again.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              icon={<Mail size={16} />}
              error={errors.email?.message}
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' }
              })}
            />
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label !mb-0">Password</label>
                <Link href="/auth/forgot-password" className="text-xs text-trust-600 hover:text-trust-800">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input pl-10 pr-10"
                  placeholder="Your password"
                  {...register('password', { required: 'Password is required' })}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <Button type="submit" loading={loading} className="w-full justify-center" size="lg">
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            New to Devkalp?{' '}
            <Link href="/auth/register" className="text-trust-700 font-medium hover:text-trust-900">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
