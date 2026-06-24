'use client'
import { useState } from 'react'
import { HeartHandshake, User, Heart, Star, Plus, Trash2, X, Check } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Button, Card, EmptyState } from '@/components/ui'
import { SkeletonList, InlineError } from '@/components/common/LoadingStates'
import { useAuthGuard } from '@/hooks/useAuthGuard'
import { useFamilyMembers, useAddFamilyMember, useUpdateFamilyMember, useRemoveFamilyMember } from '@/hooks/useApiQueries'
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

export default function FamilyPage() {
  useAuthGuard({ allowedRoles: ['matrimony', 'admin'] })

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState<any>(EMPTY_FORM)
  

  const { data: members = [], isLoading: loading, isError, refetch } = useFamilyMembers()
  const addMutation = useAddFamilyMember()
  const updateMutation = useUpdateFamilyMember()
  const removeMutation = useRemoveFamilyMember()

  const save = async () => {
    if (!form.full_name || !form.relation) { toast.error('Name and relation are required'); return }
    
    try {
      const payload = { ...form, age: form.age ? parseInt(form.age) : null }
      if (editing) {
        await updateMutation.mutateAsync({ id: editing, data: payload })
        toast.success('Family member updated')
      } else {
        await addMutation.mutateAsync(payload)
        toast.success('Family member added')
      }
      setShowForm(false)
      setEditing(null)
      setForm(EMPTY_FORM)
    } catch (e: any) { toast.error(e?.response?.data?.detail || 'Failed') }
    
  }

  const remove = async (id: string, name: string) => {
    if (!confirm(`Remove ${name} from family details?`)) return
    try {
      await removeMutation.mutateAsync(id)
      toast.success('Removed')
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
    <DashboardLayout navItems={NAV} title="Matrimony">
      <div className="p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl text-trust-900">Family Details</h1>
            <p className="text-slate-500 text-sm mt-1 max-w-lg">
              Adding family details helps our counselors understand your background and involve your family in the matchmaking process at the right time.
            </p>
          </div>
          <Button size="sm" variant="secondary" onClick={openAdd}>
            <Plus size={15} /> Add Member
          </Button>
        </div>

        {/* Why this matters */}
        <div className="bg-gradient-to-r from-trust-50 to-saffron-50 border border-trust-100 rounded-2xl p-5">
          <p className="text-sm font-semibold text-trust-800 mb-1">Why family involvement matters</p>
          <p className="text-sm text-slate-600 leading-relaxed">
            At Devkalp, we honour the role of family in Indian marriages. Sharing family details helps our counselors
            facilitate meaningful conversations and ensures decisions are made with family support when you're ready.
            All information is kept confidential.
          </p>
        </div>

        {loading ? (
          <SkeletonList count={3} />
        ) : (members as any[]).length === 0 ? (
          <EmptyState
            icon={<User size={24} />}
            title="No family members added"
            description="Add your immediate family members — parents, siblings — to help us understand your background."
            action={<Button size="sm" onClick={openAdd}><Plus size={14} /> Add Family Member</Button>}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {members.map((m: any) => (
              <Card key={m.id} className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-saffron-50 flex items-center justify-center text-xl shrink-0">
                    {RELATION_ICONS[m.relation] || '👤'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="font-semibold text-slate-800">{m.full_name}</p>
                      <div className="flex gap-1.5">
                        {m.is_primary_contact && (
                          <span className="text-xs bg-trust-100 text-trust-700 px-2 py-0.5 rounded-full font-medium">Primary</span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 capitalize">{m.relation}{m.age ? ` · ${m.age} yrs` : ''}</p>
                    {m.occupation && <p className="text-xs text-slate-400 mt-0.5">{m.occupation}</p>}
                    {m.city && <p className="text-xs text-slate-400">{m.city}</p>}
                    {m.phone && <p className="text-xs text-slate-400">📞 {m.phone}</p>}
                    <div className="flex items-center gap-3 mt-2">
                      {m.consent_given && (
                        <span className="text-xs text-sage-600 flex items-center gap-1"><Check size={10} />Consent given</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <button onClick={() => openEdit(m)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-trust-600 hover:bg-trust-50 transition-colors">
                      <Plus size={13} className="rotate-45" />
                    </button>
                    <button onClick={() => remove(m.id, m.full_name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-3xl shadow-float w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white rounded-t-3xl">
              <h2 className="font-display text-xl text-trust-900">{editing ? 'Edit' : 'Add'} Family Member</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={16} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label">Relation</label>
                  <select className="input bg-white text-sm capitalize" value={form.relation}
                    onChange={e => setForm((f: any) => ({ ...f, relation: e.target.value }))}>
                    {RELATIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Age</label>
                  <input type="number" className="input text-sm" placeholder="45"
                    value={form.age} onChange={e => setForm((f: any) => ({ ...f, age: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="label">Full Name *</label>
                <input className="input text-sm" placeholder="e.g. Ramesh Sharma"
                  value={form.full_name} onChange={e => setForm((f: any) => ({ ...f, full_name: e.target.value }))} />
              </div>
              {[
                { label: 'Occupation', key: 'occupation', placeholder: 'e.g. Retired teacher' },
                { label: 'Phone', key: 'phone', placeholder: '+91 98765 43210' },
                { label: 'Email', key: 'email', placeholder: 'family@email.com' },
                { label: 'City', key: 'city', placeholder: 'e.g. Nagpur' },
              ].map(f => (
                <div key={f.key}>
                  <label className="label">{f.label}</label>
                  <input className="input text-sm" placeholder={f.placeholder}
                    value={form[f.key]} onChange={e => setForm((fm: any) => ({ ...fm, [f.key]: e.target.value }))} />
                </div>
              ))}
              <div className="space-y-2.5">
                {[
                  { key: 'is_primary_contact', label: 'Primary contact person for this process' },
                  { key: 'consent_given', label: 'This family member is aware and has given consent' },
                ].map(opt => (
                  <label key={opt.key} className="flex items-center gap-3 cursor-pointer group">
                    <div className={clsx(
                      'w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all',
                      form[opt.key] ? 'bg-trust-700 border-trust-700' : 'border-slate-300 group-hover:border-trust-400'
                    )} onClick={() => setForm((f: any) => ({ ...f, [opt.key]: !f[opt.key] }))}>
                      {form[opt.key] && <Check size={11} className="text-white" />}
                    </div>
                    <span className="text-sm text-slate-700">{opt.label}</span>
                  </label>
                ))}
              </div>
              <div>
                <label className="label">Notes (optional)</label>
                <textarea className="input resize-none text-sm" rows={2}
                  placeholder="Any additional context..."
                  value={form.notes} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} />
              </div>
              <Button onClick={save} loading={addMutation.isPending || updateMutation.isPending} className="w-full justify-center">
                {editing ? 'Save Changes' : 'Add Member'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
