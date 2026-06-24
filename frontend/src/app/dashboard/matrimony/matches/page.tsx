import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageLoader } from '@/components/common/LoadingStates'

export default function MatchesRedirectPage() {
  const navigate = useNavigate()
  useEffect(() => {
    navigate('/dashboard/matrimony?tab=matches', { replace: true })
  }, [navigate])

  return <PageLoader />
}
