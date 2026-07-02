import React, { forwardRef, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Loader2, AlertCircle } from 'lucide-react'
import { clsx } from 'clsx'

/* ── BUTTON ──────────────────────────────────────────────────── */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'sage' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: ReactNode
}

export function Button({
  variant = 'primary', size = 'md', loading = false,
  children, className, disabled, ...props
}: ButtonProps) {
  const base = 'inline-flex items-center gap-2 font-semibold rounded-xl transition-all duration-200 select-none disabled:opacity-60 disabled:cursor-not-allowed'
  const variants = {
    primary:   'bg-trust-800 text-white hover:bg-trust-700 shadow-trust',
    secondary: 'bg-saffron-400 text-trust-900 hover:bg-saffron-300 shadow-warm',
    ghost:     'bg-transparent border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50',
    sage:      'bg-sage-600 text-white hover:bg-sage-700',
    danger:    'bg-red-600 text-white hover:bg-red-700',
  }
  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-sm',
  }
  return (
    <motion.button
      whileHover={disabled || loading ? {} : { scale: 1.02 }}
      whileTap={disabled || loading ? {} : { scale: 0.97 }}
      className={clsx(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...(props as any)}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : null}
      {children}
    </motion.button>
  )
}

/* ── INPUT ───────────────────────────────────────────────────── */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, className, ...props }, ref) => (
    <div className="w-full">
      {label && <label className="label">{label}</label>}
      <div className="relative">
        {icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={clsx(
            'input transition-all duration-200',
            icon && 'pl-10',
            error && 'border-red-400 focus:border-red-500 focus:ring-red-100',
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
          <AlertCircle size={11} /> {error}
        </p>
      )}
      {hint && !error && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  )
)
Input.displayName = 'Input'

/* ── SELECT ──────────────────────────────────────────────────── */
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, ...props }, ref) => (
    <div className="w-full">
      {label && <label className="label">{label}</label>}
      <select
        ref={ref}
        className={clsx('input bg-white appearance-none cursor-pointer', error && 'border-red-400', className)}
        {...props}
      >
        <option value="">Select…</option>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  )
)
Select.displayName = 'Select'

/* ── TEXTAREA ────────────────────────────────────────────────── */
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => (
    <div className="w-full">
      {label && <label className="label">{label}</label>}
      <textarea
        ref={ref}
        className={clsx('input resize-none', error && 'border-red-400', className)}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  )
)
Textarea.displayName = 'Textarea'

/* ── BADGE ───────────────────────────────────────────────────── */
const BADGE_MAP: Record<string, string> = {
  active:             'bg-sage-100 text-sage-700',
  approved:           'bg-sage-100 text-sage-700',
  completed:          'bg-sage-100 text-sage-700',
  selected:           'bg-sage-100 text-sage-700',
  open:               'bg-sage-100 text-sage-700',
  pending:            'bg-amber-100 text-amber-700',
  shortlisted:        'bg-trust-100 text-trust-700',
  interview_scheduled:'bg-trust-100 text-trust-700',
  suggested:          'bg-saffron-100 text-saffron-700',
  interested:         'bg-pink-100 text-pink-700',
  rejected:           'bg-red-100 text-red-600',
  closed:             'bg-slate-100 text-slate-500',
  inactive:           'bg-slate-100 text-slate-500',
  draft:              'bg-slate-100 text-slate-500',
}

export function Badge({ status, label, className }: { status?: string; label?: string; className?: string }) {
  const text = label || (status ? status.replace(/_/g, ' ') : '')
  const style = BADGE_MAP[status || ''] || 'bg-slate-100 text-slate-600'
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize', style, className)}>
      {text}
    </span>
  )
}

/* ── CARD ────────────────────────────────────────────────────── */
export function Card({ children, className, hover = false }: {
  children: ReactNode; className?: string; hover?: boolean
}) {
  return (
    <div className={clsx(
      'bg-white rounded-2xl border border-slate-100 shadow-card',
      hover && 'hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200',
      className
    )}>
      {children}
    </div>
  )
}

/* ── STATS CARD ──────────────────────────────────────────────── */
const STATS_PALETTE: Record<string, { bg: string; icon: string; value: string }> = {
  trust:   { bg: 'bg-trust-50',   icon: 'text-trust-500',   value: 'text-trust-800'   },
  saffron: { bg: 'bg-saffron-50', icon: 'text-saffron-500', value: 'text-saffron-700' },
  sage:    { bg: 'bg-sage-50',    icon: 'text-sage-500',    value: 'text-sage-700'    },
  warm:    { bg: 'bg-warm-50',    icon: 'text-warm-500',    value: 'text-warm-700'    },
}

export function StatsCard({ label, value, icon, color = 'trust', sub }: {
  label: string; value: string | number; icon?: ReactNode; color?: string; sub?: string
}) {
  const pal = STATS_PALETTE[color] || STATS_PALETTE.trust
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-500 font-medium mb-1.5 leading-none">{label}</p>
          <p className={clsx('font-display text-2xl font-semibold leading-none', pal.value)}>{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
        {icon && (
          <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', pal.bg, pal.icon)}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── SPINNER ─────────────────────────────────────────────────── */
export function Spinner({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const s = size === 'sm' ? 16 : size === 'lg' ? 36 : 24
  return <Loader2 size={s} className={clsx('animate-spin text-trust-600', className)} />
}

/* ── EMPTY STATE ─────────────────────────────────────────────── */
export function EmptyState({ icon, title, description, action }: {
  icon?: ReactNode; title: string; description?: string; action?: ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="text-center py-14 px-6"
    >
      {icon && (
        <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
          {icon}
        </div>
      )}
      <p className="font-display text-lg text-slate-700 mb-1.5">{title}</p>
      {description && <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  )
}

/* ── AVATAR ──────────────────────────────────────────────────── */
export function Avatar({ name, src, size = 'md' }: { name: string; src?: string; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const dim = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-xl' }
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  if (src) {
    return <img src={src} alt={name} className={clsx('rounded-full object-cover', dim[size])} />
  }
  return (
    <div className={clsx('rounded-full bg-trust-100 text-trust-700 font-bold flex items-center justify-center shrink-0', dim[size])}>
      {initials}
    </div>
  )
}

/* ── SECTION TITLE ───────────────────────────────────────────── */
export function SectionTitle({ title, subtitle, center = false }: { title: string; subtitle?: string; center?: boolean }) {
  return (
    <div className={clsx('mb-8', center && 'text-center')}>
      <h2 className="section-title mb-2">{title}</h2>
      {subtitle && <p className="text-slate-500 leading-relaxed">{subtitle}</p>}
    </div>
  )
}

/* ── PROGRESS BAR ────────────────────────────────────────────── */
export function ProgressBar({ value, max = 100, color = 'trust', label }: {
  value: number; max?: number; color?: string; label?: string
}) {
  const pct = Math.min((value / max) * 100, 100)
  const colors: Record<string, string> = {
    trust:   'bg-trust-500',
    saffron: 'bg-saffron-400',
    sage:    'bg-sage-500',
  }
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>{label}</span>
          <span>{pct.toFixed(0)}%</span>
        </div>
      )}
      <div className="w-full bg-slate-100 rounded-full h-2">
        <motion.div
          className={clsx('h-2 rounded-full', colors[color] || colors.trust)}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  )
}

/* ── MODAL ───────────────────────────────────────────────────── */
export function Modal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title?: string; children: ReactNode
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="relative bg-white rounded-3xl shadow-float w-full max-w-lg max-h-[90vh] overflow-y-auto z-10"
      >
        {title && (
          <div className="px-7 py-5 border-b border-slate-100">
            <h2 className="font-display text-xl text-trust-900">{title}</h2>
          </div>
        )}
        <div className="p-7">{children}</div>
      </motion.div>
    </div>
  )
}

export { default as VirtualPhone } from './VirtualPhone'
