'use client'
import { useEffect, useState } from 'react'
import { HeartHandshake, User, Heart, Star, Plus, Trash2, X, Check, Edit2 } from 'lucide-react'
import { Button, Card, Spinner, EmptyState } from '@/components/ui'
import { familyApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

const NAV = [
  { href: '/dashboard/matrimony',            icon: <HeartHandshake size={18} />, label: 'Overview' },
  { href: '/dashboard/matrimony/profile',    icon: <User size={18} />,           label: 'My Profile' },
  { href: '/dashboard/matrimony/matches',    icon: <Heart size={18} />,          label: 'Matches' },
  { href: '/dashboard/matrimony/evaluation', icon: <Star size={18} />,           label: 'Readiness Eval.' },
  { href: '/dashboard/matrimony/family',     icon: <User size={18} />,           label: 'Family Details' },
]

const RELATIONS = ['father', 'mother', 'brother', 'sister', 'guardian', 'uncle', 'aunt', 'other']
const RELATION_ICONS: Record<string, string> = {
  father: '👨', mother: '👩', brother: '👦', sister: '👧',
  guardian: '🛡️', uncle: '👴', aunt: '👵', other: '👤',
}

const EMPTY_FORM = {
  relation: 'father', full_name: '', age: '', occupation: '',
  phone: '', email: '', city: '', is_primary_contact: false, consent_given: false, notes: '',
}

export default function FamilySection({ id }: { id?: string }) {
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState<any>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const load = () => {
    familyApi.getMembers()
      .then(r => setMembers(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const save = async () => {
    if (!form.full_name || !form.relation) { toast.error('Name and relation are required'); return }
    setSaving(true)
    try {
      const payload = { ...form, age: form.age ? parseInt(form.age) : null }
      if (editing) {
        await familyApi.update(editing, payload)
        toast.success('Family member updated')
      } else {
        await familyApi.add(payload)
        toast.success('Family member added')
      }
      setShowForm(false)
      setEditing(null)
      setForm(EMPTY_FORM)
      load()
    } catch (e: any) { toast.error(e?.response?.data?.detail || 'Failed') }
    finally { setSaving(false) }
  }

  const remove = async (id: string, name: string) => {
    if (!confirm(`Remove ${name} from family details?`)) return
    try {
      await familyApi.remove(id)
      toast.success('Removed')
      load()
    } catch { toast.error('Failed') }
  }

  const openEdit = (m: any) => {
    setForm({ ...m, age: m.age ? String(m.age) : '' })
    setEditing(m.id)
    setShowForm(true)
  }

  const openAdd = () => {
    setForm(EMPTY_FORM)
    setEditing(null)
    setShowForm(true)
  }

  return (
    <div id={id} className="scroll-mt-32 w-full pt-10 border-t border-slate-100 mt-10">
      <div className="p-4 md:p-6 space-y-5 max-w-4xl mx-auto">
        
        {/* Title Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-xl md:text-2xl font-bold text-trust-900">Family Details</h1>
            <p className="text-slate-500 text-xs mt-0.5 max-w-lg">
              Provide immediate family background to help counselors build trust and verify compatibility.
            </p>
          </div>
          <Button size="sm" variant="secondary" onClick={openAdd} className="shrink-0 group shadow-warm font-semibold text-xs h-9 py-0">
            <Plus size={14} className="group-hover:rotate-90 transition-transform duration-200" /> Add Family Member
          </Button>
        </div>

        {/* Why this matters info card */}
        <div className="bg-gradient-to-br from-trust-50/50 to-indigo-50/20 border border-trust-100/50 rounded-2xl p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-trust-100/10 rounded-full blur-2xl pointer-events-none" />
          <h4 className="font-semibold text-trust-900 text-xs mb-1 flex items-center gap-1.5">
            ✨ Why Family Involvement Matters
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            At Devkalp Foundation, we honour the critical role of family values in matchmaking. Sharing details helps our counselors facilitate warm introductions with mutual consent. All inputs are held in strict confidentiality.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : members.length === 0 ? (
          <div className="max-w-md mx-auto py-12">
            <EmptyState
              icon={<User size={20} />}
              title="No family members listed"
              description="Add parents or siblings details to verify matching credentials."
              action={
                <Button size="sm" onClick={openAdd} variant="ghost" className="shadow-none text-xs h-8 py-0">
                  <Plus size={12} /> Add First Member
                </Button>
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {members.map((m: any) => (
              <div key={m.id} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-card hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-trust-50 border border-trust-100/50 flex items-center justify-center text-xl shrink-0 shadow-inner">
                    {RELATION_ICONS[m.relation] || '👤'}
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-slate-800 text-sm truncate">{m.full_name}</p>
                      {m.is_primary_contact && (
                        <span className="text-[9px] bg-trust-100 text-trust-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0">
                          Primary
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-y-1 gap-x-3 text-[11px] font-semibold text-slate-500">
                      <span className="capitalize">Relation: <span className="text-slate-800 font-bold">{m.relation}</span></span>
                      {m.age && <span>Age: <span className="text-slate-800 font-bold">{m.age} yrs</span></span>}
                      {m.occupation && <span className="col-span-2 truncate">Occupation: <span className="text-slate-700 font-bold capitalize">{m.occupation}</span></span>}
                      {m.city && <span className="col-span-2">Location: <span className="text-slate-700 font-bold">{m.city}</span></span>}
                      {m.phone && <span className="col-span-2">Phone: <span className="text-slate-700 font-bold font-mono">{m.phone}</span></span>}
                    </div>

                    {m.consent_given && (
                      <div className="pt-1">
                        <span className="text-[9px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold inline-flex items-center gap-1">
                          <Check size={8} className="stroke-[3]" /> Consent Given
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Actions column */}
                  <div className="flex flex-col gap-1 shrink-0 ml-1">
                    <button onClick={() => openEdit(m)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-trust-600 hover:bg-trust-50 transition-colors"
                      title="Edit Member">
                      <Edit2 size={12} />
                    </button>
                    <button onClick={() => remove(m.id, m.full_name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Delete Member">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-3xl shadow-float w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white rounded-t-3xl z-10">
              <h2 className="font-display text-xl font-bold text-trust-900">{editing ? 'Edit' : 'Add'} Family Member</h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-700 transition-colors"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label text-slate-400 uppercase tracking-wider text-[10px] font-bold">Relation</label>
                  <select className="input bg-white text-sm capitalize h-[42px] border-slate-200" value={form.relation}
                    onChange={e => setForm((f: any) => ({ ...f, relation: e.target.value }))}>
                    {RELATIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label text-slate-400 uppercase tracking-wider text-[10px] font-bold">Age</label>
                  <input type="number" className="input text-sm h-[42px] border-slate-200" placeholder="45"
                    value={form.age} onChange={e => setForm((f: any) => ({ ...f, age: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="label text-slate-400 uppercase tracking-wider text-[10px] font-bold">Full Name *</label>
                <input className="input text-sm h-[42px] border-slate-200" placeholder="e.g. Ramesh Sharma"
                  value={form.full_name} onChange={e => setForm((f: any) => ({ ...f, full_name: e.target.value }))} />
              </div>
              {[
                { label: 'Occupation', key: 'occupation', placeholder: 'e.g. Retired teacher' },
                { label: 'Phone', key: 'phone', placeholder: '+91 98765 43210' },
                { label: 'Email', key: 'email', placeholder: 'family@email.com' },
                { label: 'City', key: 'city', placeholder: 'e.g. Nagpur' },
              ].map(f => (
                <div key={f.key}>
                  <label className="label text-slate-400 uppercase tracking-wider text-[10px] font-bold">{f.label}</label>
                  <input className="input text-sm h-[42px] border-slate-200" placeholder={f.placeholder}
                    value={form[f.key]} onChange={e => setForm((fm: any) => ({ ...fm, [f.key]: e.target.value }))} />
                </div>
              ))}
              
              <div className="space-y-3 pt-2">
                {[
                  { key: 'is_primary_contact', label: 'Primary contact person for matchmaking' },
                  { key: 'consent_given', label: 'Aware and has given consent to list their details' },
                ].map(opt => (
                  <div key={opt.key} className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => setForm((f: any) => ({ ...f, [opt.key]: !f[opt.key] }))}>
                    <div className={clsx(
                      'w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all cursor-pointer',
                      form[opt.key] ? 'bg-trust-700 border-trust-700' : 'border-slate-300 group-hover:border-trust-400'
                    )}>
                      {form[opt.key] && <Check size={11} className="text-white stroke-[3]" />}
                    </div>
                    <span className="text-sm font-semibold text-slate-600 select-none cursor-pointer">{opt.label}</span>
                  </div>
                ))}
              </div>
              
              <div>
                <label className="label text-slate-400 uppercase tracking-wider text-[10px] font-bold">Notes (optional)</label>
                <textarea className="input resize-none text-sm border-slate-200" rows={2}
                  placeholder="Any additional family context..."
                  value={form.notes} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} />
              </div>
              <Button onClick={save} loading={saving} className="w-full justify-center h-[44px]">
                {editing ? 'Save Changes' : 'Add Member'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
