'use client'
import { useEffect, useState } from 'react'
import { Activity, RefreshCw } from 'lucide-react'
import AdminLayout from '@/components/layout/AdminLayout'
import { Spinner, EmptyState } from '@/components/ui'
import { adminApi } from '@/lib/api'
import { clsx } from 'clsx'

const MODULE_COLORS: Record<string, string> = {
  auth: 'bg-trust-100 text-trust-700',
  matrimony: 'bg-pink-100 text-pink-700',
  jobs: 'bg-sage-100 text-sage-700',
  donations: 'bg-saffron-100 text-saffron-700',
  campaigns: 'bg-green-100 text-green-700',
  admin: 'bg-red-100 text-red-700',
}

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [moduleFilter, setModuleFilter] = useState('')

  const load = () => {
    setLoading(true)
    adminApi.logs({ module: moduleFilter || undefined, limit: 200 })
      .then(r => setLogs(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [moduleFilter])

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl text-trust-900">Activity Logs</h1>
            <p className="text-slate-500 text-sm mt-0.5">Full audit trail of all system actions.</p>
          </div>
          <button onClick={load} className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
            <RefreshCw size={16} />
          </button>
        </div>

        <div className="flex gap-2 flex-wrap">
          {['', 'auth', 'matrimony', 'jobs', 'donations', 'campaigns', 'admin'].map(m => (
            <button key={m} onClick={() => setModuleFilter(m)}
              className={clsx('px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors',
                moduleFilter === m ? 'bg-trust-800 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-trust-300')}>
              {m || 'All'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : logs.length === 0 ? (
          <EmptyState icon={<Activity size={22} />} title="No activity logs yet" description="Actions taken on the platform will appear here." />
        ) : (
          <div className="space-y-1.5">
            {logs.map((log: any) => (
              <div key={log.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                <span className={clsx('text-xs px-2.5 py-1 rounded-lg font-medium capitalize shrink-0',
                  MODULE_COLORS[log.module] || 'bg-slate-100 text-slate-600')}>
                  {log.module}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 truncate">
                    <span className="font-medium">{log.user_name}</span>
                    <span className="text-slate-400 mx-1">·</span>
                    <span className="text-slate-500 capitalize">{log.action?.replace(/_/g, ' ')}</span>
                  </p>
                </div>
                <p className="text-xs text-slate-400 shrink-0">
                  {new Date(log.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
