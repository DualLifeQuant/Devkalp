'use client'
import { clsx } from 'clsx'
import { useEffect, useState, useCallback } from 'react'

// ── Skeleton primitives ───────────────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx('skeleton', className)} />
}

export function SkeletonCard({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={clsx('bg-white rounded-2xl border border-slate-100 p-6 shadow-card', className)}>
      <div className="flex gap-4 mb-4">
        <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4 rounded-full" />
          <Skeleton className="h-3 w-1/2 rounded-full" />
        </div>
      </div>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={clsx('h-3 rounded-full mb-2', i === lines - 1 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  )
}

export function SkeletonList({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div className={clsx('space-y-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} lines={2} />
      ))}
    </div>
  )
}

export function SkeletonGrid({ count = 6, cols = 3, className }: { count?: number; cols?: 2|3|4; className?: string }) {
  const colClass = { 2: 'grid-cols-1 sm:grid-cols-2', 3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3', 4: 'grid-cols-2 md:grid-cols-4' }[cols]
  return (
    <div className={clsx('grid gap-4', colClass, className)}>
      {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} lines={2} />)}
    </div>
  )
}

export function SkeletonStats({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-card">
          <Skeleton className="h-3 w-24 rounded-full mb-3" />
          <Skeleton className="h-7 w-16 rounded-xl" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonTableRow() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-slate-100">
      <Skeleton className="w-9 h-9 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-40 rounded-full" />
        <Skeleton className="h-3 w-24 rounded-full" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
      {Array.from({ length: rows }).map((_, i) => <SkeletonTableRow key={i} />)}
    </div>
  )
}

// ── Error state (full-page section replacement) ───────────────────────────────
interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
  retryCount?: number
  autoRetrySeconds?: number
  className?: string
}

export function ErrorState({
  title = 'Failed to load',
  description = 'Something went wrong. Please try again.',
  onRetry,
  retryCount = 0,
  autoRetrySeconds,
  className,
}: ErrorStateProps) {
  const [countdown, setCountdown] = useState(autoRetrySeconds ?? 0)

  useEffect(() => {
    if (!autoRetrySeconds || !onRetry) return
    setCountdown(autoRetrySeconds)
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(interval); onRetry(); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [autoRetrySeconds, onRetry])

  return (
    <div className={clsx('text-center py-14 px-6', className)}>
      <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-400 flex items-center justify-center mx-auto mb-4">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <p className="font-display text-lg text-slate-700 mb-1.5">{title}</p>
      <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed mb-1">{description}</p>
      {retryCount > 0 && (
        <p className="text-xs text-slate-300 mb-4">Attempt {retryCount} failed</p>
      )}
      {autoRetrySeconds && countdown > 0 && (
        <p className="text-xs text-slate-400 mb-3">Retrying in {countdown}s…</p>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-5 py-2.5 bg-trust-800 text-white text-sm font-semibold rounded-xl hover:bg-trust-700 transition-colors"
        >
          {retryCount > 0 ? 'Try again' : 'Retry'}
        </button>
      )}
    </div>
  )
}

// ── InlineError (non-blocking, sits above content) ────────────────────────────
export function InlineError({
  message,
  onRetry,
  className,
}: {
  message: string
  onRetry?: () => void
  className?: string
}) {
  return (
    <div className={clsx('flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm', className)}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" className="shrink-0">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <span className="text-red-700 flex-1">{message}</span>
      {onRetry && (
        <button onClick={onRetry} className="text-xs font-semibold text-red-700 hover:text-red-900 underline shrink-0 transition-colors">
          Retry
        </button>
      )}
    </div>
  )
}

// ── Page loader ───────────────────────────────────────────────────────────────
export function PageLoader() {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-trust-200 border-t-trust-600 rounded-full animate-spin" />
        <p className="text-sm text-slate-400">Loading…</p>
      </div>
    </div>
  )
}

// ── useRetryHandler — reusable retry with count tracking ─────────────────────
export function useRetryHandler(refetchFn: () => void) {
  const [retryCount, setRetryCount] = useState(0)

  const retry = useCallback(() => {
    setRetryCount(n => n + 1)
    refetchFn()
  }, [refetchFn])

  const reset = useCallback(() => setRetryCount(0), [])

  return { retry, reset, retryCount }
}
