/**
 * @jest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useJobs, useMyMatrimonyProfile } from '@/hooks/useApiQueries'
import { jobsApi, matrimonyApi } from '@/lib/api'

jest.mock('@/lib/api', () => ({
  jobsApi: { list: jest.fn(), apply: jest.fn() },
  matrimonyApi: { getMyProfile: jest.fn() },
  donationsApi: {}, campaignsApi: {}, volunteersApi: {},
  counselorsApi: {}, emotionalApi: {}, familyApi: {}, adminApi: {},
}))

function makeWrapper(retry = false) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry, gcTime: 0 } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: qc }, children)
}

// ── 429 Rate Limit handling ───────────────────────────────────────────────────
describe('API rate limit (429) handling', () => {
  it('useJobs: marks isError on 429', async () => {
    const err = { response: { status: 429, headers: { 'retry-after': '10' } } }
    ;(jobsApi.list as jest.Mock).mockRejectedValue(err)
    const { result } = renderHook(() => useJobs(), { wrapper: makeWrapper(false) })
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.data).toBeDefined() // placeholder intact
  })
})

// ── 500 Server Error ──────────────────────────────────────────────────────────
describe('API 500 handling', () => {
  it('useJobs: marks isError on 500', async () => {
    ;(jobsApi.list as jest.Mock).mockRejectedValue({ response: { status: 500, data: { detail: 'Internal Server Error' } } })
    const { result } = renderHook(() => useJobs(), { wrapper: makeWrapper(false) })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('useMyMatrimonyProfile: marks isError on 500', async () => {
    ;(matrimonyApi.getMyProfile as jest.Mock).mockRejectedValue({ response: { status: 500 } })
    const { result } = renderHook(() => useMyMatrimonyProfile(), { wrapper: makeWrapper(false) })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

// ── Timeout handling ──────────────────────────────────────────────────────────
describe('API timeout handling', () => {
  it('useJobs: treats timeout as error', async () => {
    ;(jobsApi.list as jest.Mock).mockRejectedValue(new Error('timeout of 30000ms exceeded'))
    const { result } = renderHook(() => useJobs(), { wrapper: makeWrapper(false) })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

// ── 404 — should not retry ────────────────────────────────────────────────────
describe('404 handling (no retry)', () => {
  it('useMyMatrimonyProfile: 404 marks isError without retry', async () => {
    ;(matrimonyApi.getMyProfile as jest.Mock).mockRejectedValue({ response: { status: 404 } })
    const { result } = renderHook(() => useMyMatrimonyProfile(), { wrapper: makeWrapper(false) })
    await waitFor(() => expect(result.current.isError).toBe(true))
    // Should only have been called once — no retry for 404
    expect(matrimonyApi.getMyProfile).toHaveBeenCalledTimes(1)
  })
})

// ── Successful data fetch ─────────────────────────────────────────────────────
describe('Successful API calls', () => {
  it('useJobs returns items after success', async () => {
    const items = [{ id: '1', title: 'Test Job', location: 'Surat', job_type: 'full-time', status: 'open', description: '', requirements: '', responsibilities: '', positions: 1, created_at: '2024-01-01' }]
    ;(jobsApi.list as jest.Mock).mockResolvedValue({ data: { items, total: 1 } })
    const { result } = renderHook(() => useJobs(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect((result.current.data as any).items).toHaveLength(1)
    expect((result.current.data as any).items[0].title).toBe('Test Job')
  })
})
