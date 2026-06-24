'use client'
import { Component, type ReactNode, type ErrorInfo } from 'react'
import * as Sentry from '@sentry/nextjs'
import { logger } from '@/lib/logger'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, info: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  eventId: string | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, eventId: null }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logger.error('React ErrorBoundary caught error', error, {
      componentStack: info.componentStack ?? undefined,
    })
    // Capture in Sentry and store eventId for user feedback
    const eventId = Sentry.captureException(error, {
      extra: { componentStack: info.componentStack },
    })
    this.setState({ eventId: eventId ?? null })
    this.props.onError?.(error, info)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <DefaultErrorFallback
          onReset={() => this.setState({ hasError: false, error: null, eventId: null })}
          eventId={this.state.eventId}
        />
      )
    }
    return this.props.children
  }
}

function DefaultErrorFallback({
  onReset,
  eventId,
}: {
  onReset: () => void
  eventId: string | null
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center">
      <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center mb-4">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <p className="font-display text-lg text-trust-900 mb-1">Something went wrong</p>
      <p className="text-slate-400 text-sm mb-5">
        This section failed to load. Please try refreshing.
      </p>
      {eventId && (
        <p className="text-xs text-slate-300 mb-3 font-mono">Error ID: {eventId.slice(0, 8)}</p>
      )}
      <button
        onClick={onReset}
        className="px-5 py-2.5 bg-trust-800 text-white text-sm font-semibold rounded-xl hover:bg-trust-700 transition-colors"
      >
        Try again
      </button>
    </div>
  )
}

export default ErrorBoundary
