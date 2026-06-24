'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PageLoader } from '@/components/common/LoadingStates'

export default function FamilyRedirectPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/dashboard/matrimony?tab=family')
  }, [router])

  return <PageLoader />
}
