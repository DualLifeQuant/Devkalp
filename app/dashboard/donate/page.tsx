'use client'
import Link from 'next/link'
import { HandHeart, TrendingUp, Receipt, Heart } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { StatsCard, Badge, Card, Button, EmptyState } from '@/components/ui'
import { SkeletonStats, SkeletonList, InlineError } from '@/components/common/LoadingStates'
import { useAuthGuard } from '@/hooks/useAuthGuard'
import { useMyDonations } from '@/hooks/useApiQueries'

const NAV = [
  { href: '/dashboard/donate', icon: <HandHeart size={18}/>, label: 'My Donations' },
  { href: '/donate',           icon: <Heart size={18}/>,     label: 'Donate Again' },
]

export default function DonorDashboard() {
  useAuthGuard({ allowedRoles: ['donor', 'admin'] })

  const { data, isLoading: loading, isError, refetch } = useMyDonations()
  const donations: any[] = (data as any)?.donations || []
  const completed = donations.filter((d: any) => d.status === 'completed')

  return (
    <DashboardLayout navItems={NAV} title="Donations">
      <div className="p-6 md:p-8 space-y-8">
        <div>
          <h1 className="font-display text-2xl text-trust-900">My Giving Journey</h1>
          <p className="text-slate-500 text-sm mt-1">Every rupee you gave, accounted for.</p>
        </div>
        {isError && <InlineError message="Failed to load donation history." onRetry={() => refetch()} className="mb-4" />}
        {loading ? <div className="space-y-4"><SkeletonStats count={3}/><SkeletonList count={3}/></div> : <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatsCard label="Total Donated" value={`₹${(data?.total_donated||0).toLocaleString('en-IN')}`} icon={<TrendingUp size={18}/>} color="saffron"/>
            <StatsCard label="Donations Made" value={completed.length} icon={<HandHeart size={18}/>} color="trust"/>
            <StatsCard label="Campaigns Supported" value={new Set(completed.map((d:any)=>d.campaign_id).filter(Boolean)).size} icon={<Heart size={18}/>} color="sage"/>
          </div>
          {donations.length === 0 ? (
            <EmptyState icon={<HandHeart size={24}/>} title="No donations yet"
              description="Your giving journey starts with a single step."
              action={<Link href="/donate"><Button size="sm">Make a Donation →</Button></Link>}/>
          ) : (
            <div>
              <h2 className="font-display text-xl text-trust-900 mb-4">Donation History</h2>
              <div className="space-y-3">
                {donations.map((d:any) => (
                  <Card key={d.id} className="p-5">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        d.status==='completed' ? 'bg-sage-100 text-sage-600' : 'bg-amber-100 text-amber-600'}`}>
                        <Receipt size={18}/>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-slate-800">₹{d.amount.toLocaleString('en-IN')}</p>
                          <Badge status={d.status}/>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {d.receipt_number} · {new Date(d.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>}
      </div>
    </DashboardLayout>
  )
}
