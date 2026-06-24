'use client'

import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react'

function cn(...inputs: (string | undefined | null | false)[]): string {
  return twMerge(clsx(inputs))
}

// ── Button ────────────────────────────────────────────────────────────────────

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'
  const variants = {
    primary:   'bg-trust-800 text-white hover:bg-trust-700 active:bg-trust-900',
    secondary: 'bg-white text-trust-800 border border-trust-200 hover:bg-trust-50',
    ghost:     'bg-transparent text-slate-600 hover:bg-slate-100',
    danger:    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
  }
  const sizes = {
    sm: 'px-3.5 py-2 text-sm gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
  }

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
}

// ── Badge ─────────────────────────────────────────────────────────────────────

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted'
  children: ReactNode
  className?: string
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  const variants = {
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-sage-100 text-sage-700',
    warning: 'bg-saffron-100 text-saffron-700',
    danger:  'bg-red-100 text-red-700',
    info:    'bg-trust-100 text-trust-700',
    muted:   'bg-slate-50 text-slate-400',
  }
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', variants[variant], className)}>
      {children}
    </span>
  )
}

// ── Card ──────────────────────────────────────────────────────────────────────

interface CardProps {
  children: ReactNode
  className?: string
  padding?: boolean
}

export function Card({ children, className, padding = true }: CardProps) {
  return (
    <div className={cn('bg-white rounded-2xl border border-slate-100 shadow-card', padding && 'p-6', className)}>
      {children}
    </div>
  )
}

// ── Input ─────────────────────────────────────────────────────────────────────

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export function Input({ label, error, hint, className, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'w-full px-4 py-2.5 text-sm rounded-xl border bg-white text-slate-900 placeholder:text-slate-400 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-trust-500 focus:border-transparent',
          error ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 hover:border-slate-300',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  )
}

// ── StatsCard ─────────────────────────────────────────────────────────────────

interface StatsCardProps {
  label: string
  value: string | number
  icon?: ReactNode
  trend?: { value: number; label?: string }
  color?: string
  className?: string
}

export function StatsCard({ label, value, icon, trend, color = 'bg-trust-50 text-trust-600', className }: StatsCardProps) {
  return (
    <div className={cn('bg-white rounded-2xl border border-slate-100 shadow-card p-5', className)}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
        {icon && (
          <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', color)}>
            {icon}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-900 font-display">{value}</p>
      {trend && (
        <p className={cn('text-xs mt-1', trend.value >= 0 ? 'text-sage-600' : 'text-red-500')}>
          {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
        </p>
      )}
    </div>
  )
}

// ── EmptyState ────────────────────────────────────────────────────────────────

interface EmptyStateProps {
  title?: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
  className?: string
}

export function EmptyState({
  title = 'Nothing here yet',
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('text-center py-14 px-6', className)}>
      {icon && (
        <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-300 flex items-center justify-center mx-auto mb-4">
          {icon}
        </div>
      )}
      <p className="font-display text-lg text-slate-700 mb-1">{title}</p>
      {description && (
        <p className="text-sm text-slate-400 max-w-xs mx-auto leading-relaxed mb-4">{description}</p>
      )}
      {action}
    </div>
  )
}
