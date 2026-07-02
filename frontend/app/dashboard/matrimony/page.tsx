'use client'
import { Suspense, useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { HeartHandshake, User, Heart, Users } from 'lucide-react'
import { useAuthGuard } from '@/hooks/useAuthGuard'
import { useMyMatrimonyProfile, useMyMatches } from '@/hooks/useApiQueries'
import { PageLoader, SkeletonList } from '@/components/common/LoadingStates'

import DashboardHeader from './components/DashboardHeader'
import OverviewTab from './components/OverviewTab'
import ProfileTab from './components/ProfileTab'
import MatchesTab from './components/MatchesTab'
import FamilyTab from './components/FamilyTab'
import { clsx } from 'clsx'

const TABS = [
  { id: 'overview',   label: 'Workspace Overview',   icon: <HeartHandshake size={16} /> },
  { id: 'profile',    label: 'Profile Builder',      icon: <User size={16} /> },
  { id: 'matches',    label: 'Vetted Matches',       icon: <Heart size={16} />, badge: true },
  { id: 'family',     label: 'Family Details',       icon: <Users size={16} /> },
]

function MatrimonyWorkspaceContent() {
  useAuthGuard({ allowedRoles: ['matrimony', 'admin'] })

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const activeTab = searchParams.get('tab') || 'overview'

  const { data: profile, isLoading: profileLoading, error: profileError, refetch: refetchProfile } = useMyMatrimonyProfile()
  const { data: matches = [], isLoading: matchesLoading } = useMyMatches()

  const loading = profileLoading || matchesLoading
  const profileNotFound = (profileError as any)?.response?.status === 404
  const activeMatchesCount = matches.filter((m: any) => !['declined', 'closed'].includes(m.status)).length

  const handleTabChange = (tabId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tabId)
    router.replace(`${pathname}?${params.toString()}`)
  }

  // Pre-validate that activeTab exists in TABS, fallback to overview
  useEffect(() => {
    if (!TABS.some(t => t.id === activeTab)) {
      handleTabChange('overview')
    }
  }, [activeTab])

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Horizontal Top Navbar */}
      <DashboardHeader />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col space-y-6">
        
        {/* Tab Navigation System */}
        <div className="bg-white border border-slate-100 rounded-2xl p-2 shadow-xs shrink-0 flex items-center overflow-x-auto scrollbar-none gap-1 sm:gap-2">
          {TABS.map(tab => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={clsx(
                  'flex items-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap focus:outline-none select-none',
                  isActive
                    ? 'bg-trust-800 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                )}
              >
                <span className={clsx(isActive ? 'text-white' : 'text-slate-400')}>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge && activeMatchesCount > 0 && (
                  <span className={clsx(
                    'px-1.5 py-0.5 text-[10px] font-bold rounded-full transition-all shrink-0',
                    isActive ? 'bg-saffron-400 text-trust-950' : 'bg-trust-100 text-trust-850'
                  )}>
                    {activeMatchesCount}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Workspace Active Content Area */}
        <div className="flex-1">
          {loading ? (
            <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-card">
              <SkeletonList count={3} />
            </div>
          ) : (
            <div className="bg-transparent">
              {activeTab === 'overview' && (
                <OverviewTab 
                  profile={profile}
                  profileNotFound={profileNotFound}
                  matches={matches}
                  activeMatchesCount={activeMatchesCount}
                  onSwitchTab={handleTabChange}
                />
              )}
              {activeTab === 'profile' && (
                <ProfileTab 
                  profile={profile}
                  profileNotFound={profileNotFound}
                  refetchProfile={refetchProfile}
                />
              )}
              {activeTab === 'matches' && (
                <MatchesTab />
              )}
              {activeTab === 'family' && (
                <FamilyTab />
              )}
            </div>
          )}
        </div>

      </main>
    </div>
  )
}

export default function MatrimonyWorkspacePage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <MatrimonyWorkspaceContent />
    </Suspense>
  )
}
