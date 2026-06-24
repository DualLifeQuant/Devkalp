'use client'
import { useEffect, useState } from 'react'
import { Users, CheckCircle, Clock, X, Calendar, ClipboardList } from 'lucide-react'
import AdminLayout from '@/components/layout/AdminLayout'
import { Badge, Button, Card, Spinner, EmptyState, StatsCard } from '@/components/ui'
import { volunteersApi, campaignsApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

export default function AdminVolunteersPage() {
  const [volunteers, setVolunteers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [selected, setSelected] = useState<any>(null)
  const [notes, setNotes] = useState('')
  const [campaigns, setCampaigns] = useState<any[]>([])

  // Task Modal State
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [assignee, setAssignee] = useState<any>(null)
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    hours_estimated: 2,
    due_date: '',
    campaign_id: '',
  })

  const load = async () => {
    setLoading(true)
    try {
      const res = await volunteersApi.adminAll({ status: filter !== 'all' ? filter : undefined, limit: 100 })
      setVolunteers(res.data.items || [])
    } catch { toast.error('Failed to load volunteers') }
    finally { setLoading(false) }
  }

  const loadCampaigns = async () => {
    try {
      const res = await campaignsApi.list({ limit: 100 })
      setCampaigns(res.data.items || [])
    } catch {}
  }

  useEffect(() => {
    load()
  }, [filter])

  useEffect(() => {
    loadCampaigns()
  }, [])

  const handleOpenTaskModal = (volunteer: any) => {
    setAssignee(volunteer)
    setTaskForm({
      title: '',
      description: '',
      hours_estimated: 2,
      due_date: '',
      campaign_id: '',
    })
    setShowTaskModal(true)
  }

  const handleAssignTask = async () => {
    if (!taskForm.title) {
      toast.error('Task title is required')
      return
    }
    try {
      await volunteersApi.assignTask({
        volunteer_id: assignee.id,
        title: taskForm.title,
        description: taskForm.description || undefined,
        hours_estimated: taskForm.hours_estimated || undefined,
        due_date: taskForm.due_date || undefined,
        campaign_id: taskForm.campaign_id || undefined,
      })
      toast.success('Task assigned successfully!')
      setShowTaskModal(false)
    } catch {
      toast.error('Failed to assign task')
    }
  }

  const approve = async (id: string, approve: boolean) => {
    try {
      await volunteersApi.approve(id, { approve, notes })
      toast.success(`Volunteer ${approve ? 'approved' : 'deactivated'}`)
      setSelected(null)
      load()
    } catch { toast.error('Failed') }
  }

  const pending = volunteers.filter(v => v.status === 'pending').length

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 space-y-6">
        <div>
          <h1 className="font-display text-2xl text-trust-900">Volunteers</h1>
          <p className="text-slate-500 text-sm mt-0.5">Review and manage volunteer registrations.</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <StatsCard label="Pending Review" value={pending} icon={<Clock size={17}/>} color="saffron"/>
          <StatsCard label="Active" value={volunteers.filter(v=>v.status==='active').length} icon={<CheckCircle size={17}/>} color="sage"/>
          <StatsCard label="Total" value={volunteers.length} icon={<Users size={17}/>} color="trust"/>
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

        {loading ? <div className="flex justify-center py-12"><Spinner size="lg"/></div> : (
          <div className="space-y-3">
            {volunteers.length===0 ? <EmptyState icon={<Users size={22}/>} title="No volunteers found"/> :
              volunteers.map((v:any) => (
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
                      <div className="flex gap-3 text-xs text-slate-400 mt-1">
                        <span>💪 {v.tasks_completed || 0} tasks completed</span>
                        <span>⏱️ {v.hours_contributed || 0} hours contributed</span>
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
                    <div className="flex gap-2 items-center shrink-0">
                      {v.status === 'pending' && (
                        <div className="flex gap-1.5">
                          <button onClick={()=>approve(v.id, true)}
                            className="p-2 bg-sage-500 text-white rounded-lg hover:bg-sage-600 transition-colors" title="Approve">
                            <CheckCircle size={15}/>
                          </button>
                          <button onClick={()=>approve(v.id, false)}
                            className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors" title="Reject">
                            <X size={15}/>
                          </button>
                        </div>
                      )}
                      {v.status === 'active' && (
                        <Button size="sm" variant="secondary" onClick={() => handleOpenTaskModal(v)}>
                          Assign Task
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            }
          </div>
        )}

        {/* Assign Task Modal */}
        {showTaskModal && assignee && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowTaskModal(false)}>
            <div className="bg-white rounded-3xl shadow-float w-full max-w-lg overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClipboardList className="text-trust-600" size={20} />
                  <h2 className="font-display text-lg text-trust-900">Assign Task to {assignee.user_name}</h2>
                </div>
                <button onClick={() => setShowTaskModal(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="label">Task Title *</label>
                  <input className="input text-sm" placeholder="e.g. Conduct Swasthya Kanya health workshop"
                    value={taskForm.title} onChange={e => setTaskForm(prev => ({ ...prev, title: e.target.value }))} />
                </div>

                <div>
                  <label className="label">Task Description</label>
                  <textarea className="input resize-none text-sm" rows={3} placeholder="Provide details about what the volunteer needs to do..."
                    value={taskForm.description} onChange={e => setTaskForm(prev => ({ ...prev, description: e.target.value }))} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Estimated Hours</label>
                    <input type="number" className="input text-sm" placeholder="2"
                      value={taskForm.hours_estimated} onChange={e => setTaskForm(prev => ({ ...prev, hours_estimated: parseInt(e.target.value) || 0 }))} />
                  </div>
                  <div>
                    <label className="label">Due Date</label>
                    <input type="date" className="input text-sm"
                      value={taskForm.due_date} onChange={e => setTaskForm(prev => ({ ...prev, due_date: e.target.value }))} />
                  </div>
                </div>

                <div>
                  <label className="label">Related Campaign (Optional)</label>
                  <select className="input text-sm"
                    value={taskForm.campaign_id} onChange={e => setTaskForm(prev => ({ ...prev, campaign_id: e.target.value }))}>
                    <option value="">None / General</option>
                    {campaigns.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 flex gap-3 justify-end bg-slate-50">
                <Button variant="ghost" onClick={() => setShowTaskModal(false)}>Cancel</Button>
                <Button variant="secondary" onClick={handleAssignTask}>Assign Task</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
