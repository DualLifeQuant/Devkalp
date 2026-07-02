'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PageLoader } from '@/components/common/LoadingStates'

export default function EvaluationRedirectPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/dashboard/matrimony?tab=overview')
  }, [router])

  return <PageLoader />
}
