'use client'
import { useState } from 'react'
import { Plus, Trash2, X, Check, User, AlertCircle } from 'lucide-react'
import { Button, Card, EmptyState } from '@/components/ui'
import { SkeletonList, InlineError } from '@/components/common/LoadingStates'
import { useFamilyMembers, useAddFamilyMember, useUpdateFamilyMember, useRemoveFamilyMember } from '@/hooks/useApiQueries'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

const RELATIONS = ['father', 'mother', 'brother', 'sister', 'guardian', 'uncle', 'aunt', 'other']
const RELATION_ICONS: Record<string, string> = {
  father: '👨', mother: '👩', brother: '👦', sister: '👧',
  guardian: '🛡️', uncle: '👴', aunt: '👵', other: '👤',
}

const EMPTY_FORM = {
  relation: 'father', full_name: '', age: '', occupation: '',
  phone: '', email: '', city: '', is_primary_contact: false, consent_given: false, notes: '',
}

export default function FamilyTab() {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState<any>(EMPTY_FORM)

  const { data: members = [], isLoading: loading, isError, refetch } = useFamilyMembers()
  const addMutation = useAddFamilyMember()
  const updateMutation = useUpdateFamilyMember()
  const removeMutation = useRemoveFamilyMember()

  const save = async () => {
    if (!form.full_name || !form.relation) { 
      toast.error('Name and relation are required')
      return 
    }
    
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
      refetch()
    } catch (e: any) { 
      toast.error(e?.response?.data?.detail || 'Failed to save family details') 
    }
  }

  const remove = async (id: string, name: string) => {
    if (!confirm(`Remove ${name} from family details?`)) return
    try {
      await removeMutation.mutateAsync(id)
      toast.success('Removed family member')
      refetch()
    } catch { 
      toast.error('Failed to remove family member') 
    }
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
    <div className="space-y-6 animate-fade-in">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="font-display text-2xl text-trust-900 font-bold">Family Details</h2>
          <p className="text-slate-500 text-sm mt-1 max-w-lg">
            Adding family details helps our counselors understand your background and involve your family in the matchmaking process at the right time.
          </p>
        </div>
        <Button size="sm" variant="secondary" onClick={openAdd} className="shrink-0 flex items-center gap-1 bg-saffron-500 hover:bg-saffron-600 border-none text-trust-950 font-bold px-4 py-2 text-xs">
          <Plus size={14} /> Add Member
        </Button>
      </div>

      {/* Why this matters */}
      <div className="bg-gradient-to-r from-trust-50/50 to-saffron-50/50 border border-slate-100 rounded-3xl p-5 shadow-xs">
        <p className="text-xs font-bold text-trust-850 uppercase tracking-wider mb-1.5">Why family involvement matters</p>
        <p className="text-xs text-slate-550 leading-relaxed max-w-3xl">
          At Devkalp, we honour the role of family in Indian marriages. Sharing family details helps our counselors
          facilitate meaningful conversations and ensures decisions are made with family support when you're ready.
          All information is kept strictly confidential.
        </p>
      </div>

      {isError && (
        <InlineError 
          message="Failed to load family members." 
          onRetry={() => refetch()} 
          className="mb-4" 
        />
      )}

      {loading ? (
        <SkeletonList count={3} />
      ) : (members as any[]).length === 0 ? (
        <EmptyState
          icon={<User size={32} className="text-trust-300" />}
          title="No family members added yet"
          description="Add your parents, siblings, or guardians to help counselors coordinate introductions."
          action={
            <Button size="sm" onClick={openAdd} className="bg-trust-800 flex items-center gap-1 text-xs px-4 py-2">
              <Plus size={14} /> Add Family Member
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {members.map((m: any) => (
            <Card key={m.id} className="p-5 border-slate-100 hover:shadow-card-hover transition-all duration-300 rounded-3xl flex items-start gap-4 bg-white">
              <div className="w-12 h-12 rounded-2xl bg-saffron-50 flex items-center justify-center text-xl shrink-0 border border-saffron-100/50">
                {RELATION_ICONS[m.relation] || '👤'}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5 gap-2">
                  <p className="font-semibold text-slate-800 text-sm truncate">{m.full_name}</p>
                  {m.is_primary_contact && (
                    <span className="text-[10px] font-bold bg-trust-100/70 border border-trust-200/50 text-trust-800 px-2 py-0.5 rounded-full uppercase shrink-0 tracking-wide">
                      Primary
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 capitalize font-medium">
                  {m.relation}{m.age ? ` · ${m.age} yrs` : ''}
                </p>
                {m.occupation && <p className="text-xs text-slate-400 mt-1">💼 {m.occupation}</p>}
                {m.city && <p className="text-xs text-slate-400">📍 {m.city}</p>}
                {m.phone && <p className="text-xs text-slate-400 mt-0.5">📞 {m.phone}</p>}
                
                {m.consent_given && (
                  <div className="flex items-center gap-1 text-sage-600 text-[10px] font-bold mt-2 bg-sage-50/50 border border-sage-100/50 px-2 py-0.5 rounded-md inline-flex">
                    <Check size={11} className="stroke-[3]" /> Consent Given
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1 shrink-0">
                <button 
                  onClick={() => openEdit(m)}
                  className="p-2 rounded-xl text-slate-400 hover:text-trust-750 hover:bg-trust-50/50 transition-colors"
                  title="Edit details"
                >
                  <Plus size={14} className="rotate-45" />
                </button>
                <button 
                  onClick={() => remove(m.id, m.full_name)}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50/50 transition-colors"
                  title="Remove member"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-3xl shadow-elevated w-full max-w-md max-h-[90vh] overflow-y-auto animate-fade-in" onClick={e => e.stopPropagation()}>
            
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white rounded-t-3xl z-10">
              <h3 className="font-display text-lg font-bold text-trust-900">{editing ? 'Edit' : 'Add'} Family Member</h3>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-600"><X size={16} /></button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Relation</label>
                  <select 
                    className="input bg-white text-sm w-full capitalize" 
                    value={form.relation}
                    onChange={e => setForm((f: any) => ({ ...f, relation: e.target.value }))}
                  >
                    {RELATIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Age</label>
                  <input 
                    type="number" 
                    className="input text-sm w-full" 
                    placeholder="e.g. 52"
                    value={form.age} 
                    onChange={e => setForm((f: any) => ({ ...f, age: e.target.value }))} 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Full Name *</label>
                <input 
                  className="input text-sm w-full" 
                  placeholder="e.g. Ramesh Sharma"
                  value={form.full_name} 
                  onChange={e => setForm((f: any) => ({ ...f, full_name: e.target.value }))} 
                />
              </div>

              {[
                { label: 'Occupation', key: 'occupation', placeholder: 'e.g. Government Officer, Retired' },
                { label: 'Phone Number', key: 'phone', placeholder: '+91 98765 43210' },
                { label: 'Email Address', key: 'email', placeholder: 'name@example.com' },
                { label: 'City of Residence', key: 'city', placeholder: 'e.g. Nagpur, Maharashtra' },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{field.label}</label>
                  <input 
                    className="input text-sm w-full" 
                    placeholder={field.placeholder}
                    value={form[field.key] || ''} 
                    onChange={e => setForm((fm: any) => ({ ...fm, [field.key]: e.target.value }))} 
                  />
                </div>
              ))}

              <div className="space-y-3 pt-2">
                {[
                  { key: 'is_primary_contact', label: 'Primary contact person for matching coordination' },
                  { key: 'consent_given', label: 'This family member is aware of registration and consents' },
                ].map(opt => (
                  <label key={opt.key} className="flex items-start gap-3 cursor-pointer group select-none">
                    <div 
                      className={clsx(
                        'w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all mt-0.5',
                        form[opt.key] ? 'bg-trust-800 border-trust-800 text-white' : 'border-slate-300 group-hover:border-trust-400'
                      )} 
                      onClick={() => setForm((f: any) => ({ ...f, [opt.key]: !f[opt.key] }))}
                    >
                      {form[opt.key] && <Check size={11} className="stroke-[3]" />}
                    </div>
                    <span className="text-xs font-medium text-slate-650">{opt.label}</span>
                  </label>
                ))}
              </div>

              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Additional Notes (Optional)</label>
                <textarea 
                  className="input resize-none text-sm w-full" 
                  rows={2}
                  placeholder="Any additional information..."
                  value={form.notes || ''} 
                  onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} 
                />
              </div>

              <Button 
                onClick={save} 
                loading={addMutation.isPending || updateMutation.isPending} 
                className="w-full justify-center text-xs py-3 mt-2 bg-trust-800"
              >
                {editing ? 'Save Changes' : 'Add Family Member'}
              </Button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
