'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { Heart, Mail, Lock, User, Phone, Eye, EyeOff, HeartHandshake, HandHeart, Briefcase, Users } from 'lucide-react'
import { authApi } from '@/lib/api'
import { useAuthStore, getDashboardPath, UserRole } from '@/lib/store'
import { Input, Button } from '@/components/ui'
import { auditLog } from '@/lib/audit/auditLog'
import { syncUserToERP } from '@/lib/integrations/erp'
import { journey } from '@/lib/analytics'
import { RegisterFormSchema, type RegisterFormData } from '@/lib/validation/schemas'
import { clsx } from 'clsx'
}

const ROLES: { value: UserRole; icon: React.ReactNode; label: string; desc: string; color: string }[] = [
  { value: 'matrimony', icon: <HeartHandshake size={22} />, label: 'Matrimony', desc: 'Looking for a life partner', color: 'border-trust-300 bg-trust-50 text-trust-700' },
  { value: 'donor',     icon: <HandHeart size={22} />,     label: 'Donor',     desc: 'Want to support our causes', color: 'border-saffron-300 bg-saffron-50 text-saffron-700' },
  { value: 'candidate', icon: <Briefcase size={22} />,     label: 'Job Seeker', desc: 'Looking for opportunities', color: 'border-sage-300 bg-sage-50 text-sage-700' },
  { value: 'volunteer', icon: <Users size={22} />,         label: 'Volunteer',  desc: 'Want to give my time', color: 'border-warm-300 bg-warm-50 text-warm-700' },
]

export default function RegisterPage() {
  const [role, setRole] = useState<UserRole>('donor')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterFormSchema),
  })
  const { setAuth } = useAuthStore()
  const router = useRouter()

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true)
    try {
      const res = await authApi.register({
        full_name: data.full_name,
        email: data.email,
        phone: data.phone || undefined,
        password: data.password,
        role,
      })
      const { access_token, refresh_token, user } = res.data
      setAuth(user, access_token, refresh_token)
      auditLog('user.register', { userId: user.id, userRole: user.role })
      journey.register(user.role)
      syncUserToERP({ id: user.id, full_name: user.full_name, email: user.email, phone: data.phone, role: user.role })
      toast.success(`Welcome, ${user.full_name.split(' ')[0]}! 🎉`)
      router.push(getDashboardPath(user.role))
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-trust-900 to-trust-800 relative overflow-hidden flex-col p-14">
        <div className="absolute inset-0 bg-hero-pattern opacity-30" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-saffron-500/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <Link href="/">
            <Image src="/logo.png" alt="Devkalp Foundation Logo" width={130} height={44} className="object-contain h-10 w-auto brightness-0 invert opacity-90" />
          </Link>
        </div>
        <div className="relative z-10 mt-auto mb-8">
          <p className="font-accent italic text-saffron-300 text-lg mb-3">A space built on trust</p>
          <h2 className="font-display text-4xl font-semibold text-white mb-5 leading-tight">
            Your journey with us starts here.
          </h2>
          <div className="space-y-3">
            {[
              'Private & confidential profiles',
              'Human counselors, not algorithms',
              'Transparent impact tracking',
            ].map(f => (
              <div key={f} className="flex items-center gap-2.5 text-white/70 text-sm">
                <span className="w-5 h-5 rounded-full bg-saffron-400/20 flex items-center justify-center shrink-0">
                  <span className="w-2 h-2 rounded-full bg-saffron-400" />
                </span>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-start justify-center p-6 md:p-12 overflow-y-auto bg-white">
        <div className="w-full max-w-lg py-8">
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <Image src="/logo.png" alt="Devkalp Foundation Logo" width={120} height={40} className="object-contain h-9 w-auto" />
          </Link>

          <h1 className="font-display text-3xl font-semibold text-trust-900 mb-1">Create Account</h1>
          <p className="text-slate-500 mb-8">Join thousands of families who trust Devkalp.</p>

          {/* Step 1: Role Selection */}
          {step === 1 && (
            <div>
              <p className="text-sm font-medium text-slate-700 mb-4">I am joining as a…</p>
              <div className="grid grid-cols-2 gap-3 mb-8 xs:grid-cols-1 min-[380px]:grid-cols-2">
                {ROLES.map(r => (
                  <button key={r.value} type="button" onClick={() => setRole(r.value)}
                    className={clsx(
                      'p-4 rounded-2xl border-2 text-left transition-all duration-200',
                      role === r.value ? r.color + ' shadow-sm' : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    )}>
                    <div className="mb-2">{r.icon}</div>
                    <p className="font-semibold text-sm">{r.label}</p>
                    <p className="text-xs opacity-70 mt-0.5">{r.desc}</p>
                  </button>
                ))}
              </div>
              <Button onClick={() => setStep(2)} className="w-full justify-center" size="lg">
                Continue →
              </Button>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Selected role pill */}
              <div className="flex items-center gap-2 mb-2">
                <button type="button" onClick={() => setStep(1)} className="text-xs text-trust-600 hover:underline">← Change role</button>
                <span className="text-xs text-slate-400">·</span>
                <span className={clsx('badge', ROLES.find(r => r.value === role)?.color)}>
                  {ROLES.find(r => r.value === role)?.label}
                </span>
              </div>

              <Input label="Full Name" placeholder="Rahul Sharma" icon={<User size={16} />}
                error={errors.full_name?.message}
                {...register('full_name', { required: 'Full name is required', minLength: { value: 2, message: 'Name too short' } })}
              />
              <Input label="Email Address" type="email" placeholder="rahul@example.com" icon={<Mail size={16} />}
                error={errors.email?.message}
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' }
                })}
              />
              <Input label="Phone Number" type="tel" placeholder="+91 98765 43210" icon={<Phone size={16} />}
                hint="Used for important notifications only"
                {...register('phone')}
              />
              <div className="relative">
                <Input label="Password" type={showPass ? 'text' : 'password'} placeholder="At least 8 characters" icon={<Lock size={16} />}
                  error={errors.password?.message}
                  {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Minimum 8 characters' } })}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 bottom-3 text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <Input label="Confirm Password" type="password" placeholder="Repeat your password" icon={<Lock size={16} />}
                error={errors.confirm_password?.message}
                {...register('confirm_password', {
                  required: 'Please confirm your password',
                  validate: v => v === watch('password') || 'Passwords do not match'
                })}
              />

              <p className="text-xs text-slate-400 leading-relaxed">
                By creating an account, you agree to our{' '}
                <Link href="/terms" className="text-trust-600 hover:underline">Terms of Service</Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-trust-600 hover:underline">Privacy Policy</Link>.
              </p>

              <Button type="submit" loading={loading} className="w-full justify-center" size="lg">
                Create My Account
              </Button>
            </form>
          )}

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-trust-700 font-medium hover:text-trust-900">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
