'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PageLoader } from '@/components/common/LoadingStates'

export default function MatchesRedirectPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/dashboard/matrimony?tab=matches')
  }, [router])

  return <PageLoader />
}
