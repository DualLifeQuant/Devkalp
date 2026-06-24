/**
 * Dynamic import wrappers for heavy/conditional components.
 * Use these for components that:
 * - Are only rendered conditionally (modals, drawers)
 * - Import heavy third-party libs (recharts, framer-motion)
 *
 * Usage: import { LazyAreaChart } from '@/components/lazy'
 */

import dynamic from 'next/dynamic'

// ── Heavy recharts (bundled ~300KB gzipped) ──────────────────────────────────
// Only used in admin stats — defer load until needed
export const LazyAreaChart = dynamic(
  () => import('recharts').then(m => ({ default: m.AreaChart })),
  { ssr: false }
)
export const LazyBarChart = dynamic(
  () => import('recharts').then(m => ({ default: m.BarChart })),
  { ssr: false }
)
export const LazyLineChart = dynamic(
  () => import('recharts').then(m => ({ default: m.LineChart })),
  { ssr: false }
)
