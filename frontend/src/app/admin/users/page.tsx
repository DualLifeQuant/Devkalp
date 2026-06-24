import { useEffect, useState } from 'react'
import { Users, Search, Shield, ShieldOff } from 'lucide-react'
import AdminLayout from '@/components/layout/AdminLayout'
import { Badge, Card, Spinner, EmptyState, StatsCard } from '@/components/ui'
import { adminApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

const ROLE_COLORS: Record<string,string> = {
  admin: 'bg-red-100 text-red-700', counselor: 'bg-purple-100 text-purple-700',
  matrimony: 'bg-trust-100 text-trust-700', donor: 'bg-saffron-100 text-saffron-700',
  candidate: 'bg-sage-100 text-sage-700', volunteer: 'bg-warm-100 text-warm-700',
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const res = await adminApi.users({ role: roleFilter || undefined, limit: 200 })
      setUsers(res.data.items || [])
      setTotal(res.data.total || 0)
    } catch { toast.error('Failed to load users') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [roleFilter])

  const toggleActive = async (id: string, name: string) => {
    try {
      const res = await adminApi.toggleUser(id)
      toast.success(`${name} ${res.data.is_active ? 'activated' : 'deactivated'}`)
      load()
    } catch { toast.error('Failed') }
  }

  const filtered = users.filter(u => !search ||
    (u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase()))

  const roleCounts = users.reduce((acc:any, u:any) => { acc[u.role] = (acc[u.role]||0)+1; return acc }, {})

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 space-y-6">
        <div>
          <h1 className="font-display text-2xl text-trust-900">All Users</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage platform users across all roles.</p>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {Object.entries(roleCounts).map(([role, count]) => (
            <div key={role} onClick={()=>setRoleFilter(roleFilter===role?'':role)}
              className={clsx('p-3 rounded-xl border cursor-pointer transition-all text-center',
                roleFilter===role ? 'border-trust-400 bg-trust-50' : 'bg-white border-slate-200 hover:border-slate-300')}>
              <p className="text-lg font-display font-semibold text-trust-800">{count as number}</p>
              <p className="text-xs text-slate-500 capitalize mt-0.5">{role}</p>
            </div>
          ))}
        </div>

        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"/>
          <input className="input pl-9 text-sm" placeholder="Search by name or email..."
            value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>

        {loading ? <div className="flex justify-center py-12"><Spinner size="lg"/></div> : (
          <div className="space-y-2">
            {filtered.length===0 ? <EmptyState icon={<Users size={22}/>} title="No users found"/> :
              filtered.map((u:any) => (
                <Card key={u.id} className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-full bg-trust-100 text-trust-700 font-semibold text-sm flex items-center justify-center shrink-0">
                      {u.full_name?.[0]||'?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-800 text-sm">{u.full_name}</p>
                        <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium capitalize', ROLE_COLORS[u.role]||'bg-slate-100 text-slate-600')}>{u.role}</span>
                        {!u.is_active && <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600">Inactive</span>}
                      </div>
                      <p className="text-xs text-slate-400">{u.email}{u.phone ? ` · ${u.phone}` : ''}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-slate-400">Joined {new Date(u.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</p>
                      {u.role !== 'admin' && (
                        <button onClick={()=>toggleActive(u.id, u.full_name)}
                          className={clsx('mt-1 flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg transition-colors',
                            u.is_active ? 'text-red-600 hover:bg-red-50' : 'text-sage-600 hover:bg-sage-50')}>
                          {u.is_active ? <><ShieldOff size={11}/>Deactivate</> : <><Shield size={11}/>Activate</>}
                        </button>
                      )}
                    </div>
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
