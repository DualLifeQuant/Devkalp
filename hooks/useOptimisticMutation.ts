'use client'
import { useCallback, useState, useTransition } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { logger } from '@/lib/logger'
import { trackError } from '@/lib/analytics'
import toast from 'react-hot-toast'

// ── Optimistic mutation hook ──────────────────────────────────────────────────

interface OptimisticOptions<T> {
  /** Query key to optimistically update */
  queryKey: readonly unknown[]
  /** Derive optimistic value from current cache + variables */
  optimisticFn: (current: T, variables: unknown) => T
  /** Run the actual API mutation */
  mutateFn: (variables: unknown) => Promise<unknown>
  /** Toast on success */
  successMessage?: string
  /** Toast on failure */
  errorMessage?: string
  /** Called on success */
  onSuccess?: () => void
}

/**
 * Thin hook that wraps any mutation with optimistic update + rollback on failure.
 *
 * @example
 * const { mutate, isPending } = useOptimisticMutation({
 *   queryKey: queryKeys.myMatches,
 *   optimisticFn: (current, vars) => current.filter(m => m.id !== vars.id),
 *   mutateFn: (vars) => matrimonyApi.respondMatch(vars.id, vars.interested),
 *   successMessage: 'Response saved!',
 * })
 */
export function useOptimisticMutation<T = unknown>({
  queryKey,
  optimisticFn,
  mutateFn,
  successMessage,
  errorMessage = 'Something went wrong. Your changes have been reverted.',
  onSuccess,
}: OptimisticOptions<T>) {
  const qc = useQueryClient()
  const [isPending, startTransition] = useTransition()

  const mutate = useCallback(async (variables: unknown) => {
    // Snapshot previous value for rollback
    const previous = qc.getQueryData<T>(queryKey)

    // Apply optimistic update immediately
    if (previous !== undefined) {
      qc.setQueryData<T>(queryKey, (old) =>
        old !== undefined ? optimisticFn(old, variables) : old
      )
    }

    startTransition(() => { /* keeps UI responsive during update */ })

    try {
      await mutateFn(variables)
      if (successMessage) toast.success(successMessage)
      onSuccess?.()
      // Revalidate from server
      qc.invalidateQueries({ queryKey })
    } catch (err) {
      // Rollback on failure
      if (previous !== undefined) {
        qc.setQueryData<T>(queryKey, previous)
      }
      logger.error('Optimistic mutation failed — rolled back', err)
      trackError('optimistic_mutation_rollback', { queryKey: String(queryKey), error: String(err) })
      toast.error(errorMessage)
    }
  }, [qc, queryKey, optimisticFn, mutateFn, successMessage, errorMessage, onSuccess])

  return { mutate, isPending }
}

// ── Global error recovery ─────────────────────────────────────────────────────

interface ErrorRecoveryState {
  hasError: boolean
  retryCount: number
  lastError: string | null
}

/**
 * Hook for retry UI patterns on failed data loads.
 * Provides non-intrusive retry with exponential backoff awareness.
 */
export function useErrorRecovery(refetchFn: () => void) {
  const [state, setState] = useState<ErrorRecoveryState>({
    hasError: false,
    retryCount: 0,
    lastError: null,
  })

  const setError = useCallback((error: unknown) => {
    const message = (error as any)?.message ?? 'Unknown error'
    setState((s) => ({ ...s, hasError: true, lastError: message }))
    trackError(message, { retryCount: state.retryCount })
  }, [state.retryCount])

  const retry = useCallback(() => {
    setState((s) => ({ ...s, hasError: false, retryCount: s.retryCount + 1 }))
    refetchFn()
  }, [refetchFn])

  const reset = useCallback(() => {
    setState({ hasError: false, retryCount: 0, lastError: null })
  }, [])

  return { ...state, setError, retry, reset }
}

// ── Silent failure guard ──────────────────────────────────────────────────────

/**
 * Wraps any async operation and ensures it never silently fails.
 * Logs the error and optionally shows a toast.
 */
export async function guardedAsync<T>(
  fn: () => Promise<T>,
  opts: {
    fallback: T
    context?: string
    showToast?: boolean
    toastMessage?: string
  }
): Promise<T> {
  try {
    return await fn()
  } catch (err) {
    logger.error(opts.context ?? 'guardedAsync failed', err)
    trackError(opts.context ?? 'guarded_async_failed', { error: String(err) })
    if (opts.showToast) {
      toast.error(opts.toastMessage ?? 'An error occurred. Please try again.')
    }
    return opts.fallback
  }
}
