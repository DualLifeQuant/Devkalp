import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageLoader } from '@/components/common/LoadingStates'

export default function ProfileRedirectPage() {
  const navigate = useNavigate()
  useEffect(() => {
    navigate('/dashboard/matrimony?tab=profile', { replace: true })
  }, [navigate])

  return <PageLoader />
}
