'use client'
import { useEffect, useState } from 'react'
import { HandHeart, TrendingUp, Plus, X } from 'lucide-react'
import AdminLayout from '@/components/layout/AdminLayout'
import { Badge, Card, Spinner, EmptyState, StatsCard, Button } from '@/components/ui'
import { donationsApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

export default function AdminDonationsPage() {
  const [donations, setDonations] = useState<any[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [stats, setStats] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'donations'|'campaigns'>('donations')
  const [showNewCampaign, setShowNewCampaign] = useState(false)
  const [newCampaign, setNewCampaign] = useState({ title:'', description:'', short_description:'', target_amount:'' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [dRes, cRes] = await Promise.allSettled([donationsApi.adminAll({ limit:100 }), donationsApi.getCampaigns({ limit:50 })])
        if (dRes.status === 'fulfilled') {
          setDonations(dRes.value.data.items||[])
          setStats({ total: dRes.value.data.total_amount||0, count: dRes.value.data.total||0 })
        }
        if (cRes.status === 'fulfilled') setCampaigns(cRes.value.data.items||[])
      } catch { toast.error('Failed to load') }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const createCampaign = async () => {
    if (!newCampaign.title || !newCampaign.description) { toast.error('Title and description required'); return }
    setSaving(true)
    try {
      await donationsApi.createCampaign({ ...newCampaign, target_amount: newCampaign.target_amount ? parseFloat(newCampaign.target_amount) : null })
      toast.success('Campaign created!')
      setShowNewCampaign(false)
      const cRes = await donationsApi.getCampaigns({ limit:50 })
      setCampaigns(cRes.data.items||[])
    } catch (e:any) { toast.error(e?.response?.data?.detail||'Failed') }
    finally { setSaving(false) }
  }

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl text-trust-900">Donations</h1>
            <p className="text-slate-500 text-sm mt-0.5">Track all donations and manage campaigns.</p>
          </div>
          {tab==='campaigns' && (
            <Button size="sm" variant="secondary" onClick={()=>setShowNewCampaign(true)}>
              <Plus size={15}/> New Campaign
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatsCard label="Total Raised" value={`₹${(stats.total||0).toLocaleString('en-IN')}`} icon={<TrendingUp size={17}/>} color="saffron"/>
          <StatsCard label="Donations" value={stats.count||0} icon={<HandHeart size={17}/>} color="trust"/>
          <StatsCard label="Campaigns" value={campaigns.length} icon={<HandHeart size={17}/>} color="sage"/>
        </div>

        <div className="flex gap-2">
          {(['donations','campaigns'] as const).map(t => (
            <button key={t} onClick={()=>setTab(t)}
              className={clsx('px-5 py-2.5 rounded-xl text-sm font-medium capitalize transition-colors',
                tab===t ? 'bg-trust-800 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-trust-300')}>
              {t}
            </button>
          ))}
        </div>

        {loading ? <div className="flex justify-center py-12"><Spinner size="lg"/></div> : (
          <>
            {tab==='donations' && (
              <div className="space-y-2">
                {donations.length===0 ? <EmptyState icon={<HandHeart size={22}/>} title="No donations yet"/> :
                  donations.map((d:any) => (
                    <Card key={d.id} className="p-4">
                      <div className="flex items-center gap-4">
                        <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold',
                          d.status==='completed' ? 'bg-sage-100 text-sage-700' : 'bg-amber-100 text-amber-700')}>
                          ₹
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-slate-800 text-sm">₹{d.amount?.toLocaleString('en-IN')}</p>
                            <Badge status={d.status}/>
                          </div>
                          <p className="text-xs text-slate-400">{d.donor_name||'Anonymous'} · {d.receipt_number}</p>
                          <p className="text-xs text-slate-400">{new Date(d.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</p>
                        </div>
                      </div>
                    </Card>
                  ))
                }
              </div>
            )}
            {tab==='campaigns' && (
              <div className="space-y-3">
                {campaigns.map((c:any) => (
                  <Card key={c.id} className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-slate-800">{c.title}</p>
                          <Badge status={c.status}/>
                        </div>
                        <p className="text-xs text-slate-500 mb-2">{c.short_description}</p>
                        {c.target_amount && (
                          <div>
                            <div className="flex justify-between text-xs text-slate-500 mb-1">
                              <span>₹{(c.collected_amount||0).toLocaleString('en-IN')} raised</span>
                              <span>Goal: ₹{c.target_amount.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5">
                              <div className="h-1.5 rounded-full bg-saffron-400" style={{width:`${Math.min(((c.collected_amount||0)/c.target_amount)*100,100)}%`}}/>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
                {campaigns.length===0 && <EmptyState icon={<HandHeart size={22}/>} title="No campaigns yet" action={<Button size="sm" onClick={()=>setShowNewCampaign(true)}>Create Campaign</Button>}/>}
              </div>
            )}
          </>
        )}
      </div>

      {showNewCampaign && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={()=>setShowNewCampaign(false)}>
          <div className="bg-white rounded-3xl shadow-float w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-display text-xl text-trust-900">New Donation Campaign</h2>
              <button onClick={()=>setShowNewCampaign(false)}><X size={16}/></button>
            </div>
            <div className="p-6 space-y-4">
              {[{l:'Campaign Title *',k:'title',p:'e.g. Winter Education Drive'},{l:'Short Description',k:'short_description',p:'One line summary'},{l:'Target Amount (₹)',k:'target_amount',p:'200000',type:'number'}].map(f=>(
                <div key={f.k}>
                  <label className="label">{f.l}</label>
                  <input type={f.type||'text'} className="input text-sm" placeholder={f.p} value={(newCampaign as any)[f.k]} onChange={e=>setNewCampaign(d=>({...d,[f.k]:e.target.value}))}/>
                </div>
              ))}
              <div>
                <label className="label">Full Description *</label>
                <textarea className="input resize-none text-sm" rows={4} placeholder="Describe the purpose and impact of this campaign..."
                  value={newCampaign.description} onChange={e=>setNewCampaign(d=>({...d,description:e.target.value}))}/>
              </div>
              <Button onClick={createCampaign} loading={saving} className="w-full justify-center">Create Campaign</Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
