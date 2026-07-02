'use client'
import { useState } from 'react'
import { Users, CheckCircle, Clock, X } from 'lucide-react'
import AdminLayout from '@/components/layout/AdminLayout'
import { Badge, Button, Card, EmptyState, StatsCard } from '@/components/ui'
import { SkeletonList, InlineError } from '@/components/common/LoadingStates'
import { useAuthGuard } from '@/hooks/useAuthGuard'
import { useAdminVolunteers, useApproveVolunteer } from '@/hooks/useApiQueries'
import { useAuthStore } from '@/lib/store'
import { auditAdmin } from '@/lib/audit/auditLog'
import { syncVolunteerToERP } from '@/lib/integrations/erp'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

export default function AdminVolunteersPage() {
  useAuthGuard({ allowedRoles: ['admin'] })
  const { user: adminUser } = useAuthStore()

  const [filter, setFilter] = useState('pending')
  const [selected, setSelected] = useState<any>(null)
  const [notes, setNotes] = useState('')

  const params = filter !== 'all' ? { status: filter, limit: 100 } : { limit: 100 }
  const { data: volunteers = [], isLoading: loading, isError, refetch } = useAdminVolunteers(params)
  const approveMutation = useApproveVolunteer()

  const approve = async (id: string, shouldApprove: boolean) => {
    try {
      await approveMutation.mutateAsync({ id, data: { approve: shouldApprove, notes } })
      toast.success(`Volunteer ${shouldApprove ? 'approved' : 'deactivated'}`)
      auditAdmin('volunteer_approved', id, adminUser?.id, { approved: shouldApprove, notes })
      if (shouldApprove && selected) {
        syncVolunteerToERP({
          id,
          full_name: selected.user_name ?? selected.full_name ?? '',
          email: selected.user_email,
          phone: selected.user_phone,
          city: selected.city,
        })
      }
      setSelected(null)
      // invalidation handled by useApproveVolunteer hook
    } catch { toast.error('Failed') }
  }

  const pending = (volunteers as any[]).filter((v: any) => v.status === 'pending').length

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 space-y-6">
        <div>
          <h1 className="font-display text-2xl text-trust-900">Volunteers</h1>
          <p className="text-slate-500 text-sm mt-0.5">Review and manage volunteer registrations.</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <StatsCard label="Pending Review" value={pending} icon={<Clock size={17}/>} color="saffron"/>
          <StatsCard label="Active" value={( volunteers as any[]).filter(v=>v.status==='active').length} icon={<CheckCircle size={17}/>} color="sage"/>
          <StatsCard label="Total" value={(volunteers as any[]).length} icon={<Users size={17}/>} color="trust"/>
        </div>

        <div className="flex gap-2">
          {['pending','active','all'].map(f => (
            <button key={f} onClick={()=>setFilter(f)}
              className={clsx('px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors',
                filter===f ? 'bg-trust-800 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-trust-300')}>
              {f} {f==='pending' && pending > 0 && <span className="ml-1 bg-saffron-400 text-trust-900 text-xs font-bold px-1.5 py-0.5 rounded-full">{pending}</span>}
            </button>
          ))}
        </div>

        {isError && <InlineError message="Failed to load." onRetry={() => refetch()} className="mb-4" />}
        {loading ? <div className="space-y-4"><SkeletonStats count={4}/><SkeletonList count={4}/></div> : (
          <div className="space-y-3">
            {(volunteers as any[]).length===0 ? <EmptyState icon={<Users size={22}/>} title="No volunteers found"/> :
              ( volunteers as any[]).map((v:any) => (
                <Card key={v.id} className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-sage-100 text-sage-700 font-semibold text-sm flex items-center justify-center shrink-0">
                      {v.user_name?.[0]||'V'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-slate-800 text-sm">{v.user_name}</p>
                        <Badge status={v.status}/>
                      </div>
                      <p className="text-xs text-slate-500">{v.user_email}</p>
                      <div className="flex gap-3 text-xs text-slate-400 mt-1">
                        {v.city && <span>📍 {v.city}</span>}
                        {v.occupation && <span>💼 {v.occupation}</span>}
                        {v.availability && <span>⏰ {v.availability}</span>}
                      </div>
                      {v.interests?.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {v.interests.map((i:string) => (
                            <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-lg capitalize">{i}</span>
                          ))}
                        </div>
                      )}
                      {v.motivation && <p className="text-xs text-slate-500 italic mt-1 line-clamp-2">"{v.motivation}"</p>}
                    </div>
                    {v.status === 'pending' && (
                      <div className="flex gap-1.5 shrink-0">
                        <button onClick={()=>approve(v.id, true)}
                          className="p-2 bg-sage-500 text-white rounded-lg hover:bg-sage-600 transition-colors">
                          <CheckCircle size={15}/>
                        </button>
                        <button onClick={()=>approve(v.id, false)}
                          className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors">
                          <X size={15}/>
                        </button>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            }
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
