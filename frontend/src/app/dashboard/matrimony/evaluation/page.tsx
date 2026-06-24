import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageLoader } from '@/components/common/LoadingStates'

export default function EvaluationRedirectPage() {
  const navigate = useNavigate()
  useEffect(() => {
    navigate('/dashboard/matrimony?tab=overview', { replace: true })
  }, [navigate])

  return <PageLoader />
}
