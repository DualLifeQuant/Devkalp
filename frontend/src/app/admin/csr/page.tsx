import { useEffect, useState } from 'react'
import { Building2, User, Mail, Phone, Calendar, Search, X, Inbox, Eye, DollarSign, CheckSquare } from 'lucide-react'
import { Badge, Button, Card, Spinner, EmptyState } from '@/components/ui'
import { csrApi } from '@/lib/api'
import toast from 'react-hot-toast'

const CSR_PILLARS = [
  { value: 'health', label: 'Rural Healthcare & Mobile Clinics' },
  { value: 'education', label: 'Child Education & Digital Literacy' },
  { value: 'environment', label: 'Environmental Sustainability & Plantation' },
  { value: 'careers', label: 'Livelihood Skilling & Career Matchmaking' },
  { value: 'community', label: 'Matrimony & Community Welfare Support' },
]

export default function AdminCSRPage() {
  const [inquiries, setInquiries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<any>(null)

  const loadInquiries = async () => {
    setLoading(true)
    try {
      const res = await csrApi.list()
      if (Array.isArray(res.data)) {
        setInquiries(res.data)
      } else {
        setInquiries([])
      }
    } catch (err) {
      toast.error('Failed to load CSR inquiries')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInquiries()
  }, [])

  const filteredInquiries = inquiries.filter(i => {
    const term = search.toLowerCase()
    return (
      (i.company_name || '').toLowerCase().includes(term) ||
      (i.contact_person || '').toLowerCase().includes(term) ||
      (i.email || '').toLowerCase().includes(term) ||
      (i.phone || '').toLowerCase().includes(term) ||
      (i.message || '').toLowerCase().includes(term)
    )
  })

  const getPillarLabel = (val: string) => {
    const found = CSR_PILLARS.find(p => p.value === val)
    return found ? found.label : val
  }

  return (
      <div className="p-6 md:p-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-2xl text-trust-900">CSR Inquiries</h1>
            <p className="text-slate-500 text-sm mt-1">Review and manage corporate CSR proposals, focus areas, and budget indications.</p>
          </div>
          
          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={15} />
            </span>
            <input
              type="text"
              placeholder="Search corporate name or person..."
              className="input pl-9 pr-4 py-2 text-xs w-full border border-slate-200 rounded-xl outline-none focus:border-trust-500"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* List / Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : filteredInquiries.length === 0 ? (
          <EmptyState
            icon={<Inbox size={28} className="text-slate-400" />}
            title="No CSR inquiries found"
            description={search ? "No inquiries match your search term." : "No corporate partnerships submitted yet."}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredInquiries.map((inq) => (
              <Card
                key={inq.id}
                className="hover:border-trust-300 group transition-all duration-200 flex flex-col justify-between"
                hover
              >
                {/* Clickable content */}
                <div 
                  onClick={() => setSelected(inq)} 
                  className="p-5 flex-1 cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <span className="inline-flex items-center gap-1 bg-trust-50 border border-trust-100 text-trust-700 px-2.5 py-0.5 text-[10px] rounded-lg font-bold uppercase tracking-wider">
                      <Building2 size={10} /> Corporate
                    </span>
                    {inq.proposed_budget && (
                      <span className="text-[10px] font-bold text-saffron-700 bg-saffron-50 border border-saffron-100 rounded-lg px-2 py-0.5">
                        {inq.proposed_budget}
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-slate-800 text-sm truncate">{inq.company_name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium flex items-center gap-1">
                    <User size={12} className="text-slate-400" /> {inq.contact_person}
                  </p>

                  <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-2">
                    <Calendar size={10} />
                    {inq.created_at ? new Date(inq.created_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    }) : 'N/A'}
                  </p>

                  {/* Focus Areas Count */}
                  {inq.interest_areas && inq.interest_areas.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {inq.interest_areas.map((p: string) => (
                        <span key={p} className="text-[9px] bg-slate-100 text-slate-600 rounded-md px-1.5 py-0.5 font-semibold">
                          {getPillarLabel(p)}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Message Preview */}
                  <p className="text-slate-600 text-xs mt-3.5 leading-relaxed line-clamp-3 bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                    {inq.message}
                  </p>
                </div>

                {/* Footer Details */}
                <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 text-xs">
                  <span className="text-[10px] text-slate-400 truncate max-w-[150px]">{inq.email}</span>
                  <button 
                    onClick={() => setSelected(inq)}
                    className="flex items-center gap-1 text-trust-600 font-bold hover:text-trust-800 transition-colors"
                  >
                    <Eye size={12} /> View Proposal
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Inquiry Detail Modal */}
        {selected && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelected(null)}>
            <div className="bg-white rounded-3xl shadow-float w-full max-w-lg max-h-[90vh] overflow-y-auto relative" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-display text-xl text-trust-900">CSR Proposal Details</h2>
                <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 space-y-5">
                
                {/* Header info */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 text-xs rounded-full font-bold uppercase tracking-wider bg-trust-50 border border-trust-100 text-trust-700">
                      Corporate CSR
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Calendar size={13} />
                    {selected.created_at ? new Date(selected.created_at).toLocaleString() : 'N/A'}
                  </p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <div className="sm:col-span-2">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Company Name</p>
                    <p className="font-bold text-slate-800 text-base flex items-center gap-1.5">
                      <Building2 size={16} className="text-slate-400 shrink-0" /> {selected.company_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Contact Person</p>
                    <p className="font-semibold text-slate-800 text-sm flex items-center gap-1">
                      <User size={14} className="text-slate-400 shrink-0" /> {selected.contact_person}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Corporate Email</p>
                    <a href={`mailto:${selected.email}`} className="font-semibold text-trust-600 text-sm hover:underline flex items-center gap-1">
                      <Mail size={13} /> {selected.email}
                    </a>
                  </div>
                  {selected.phone && (
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Phone Number</p>
                      <a href={`tel:${selected.phone}`} className="font-semibold text-slate-800 text-sm hover:text-trust-600 flex items-center gap-1">
                        <Phone size={13} /> {selected.phone}
                      </a>
                    </div>
                  )}
                  {selected.proposed_budget && (
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Annual Budget</p>
                      <p className="font-semibold text-saffron-700 text-sm flex items-center gap-0.5">
                        <DollarSign size={13} /> {selected.proposed_budget}
                      </p>
                    </div>
                  )}
                </div>

                {/* Focus Areas */}
                {selected.interest_areas && selected.interest_areas.length > 0 && (
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Focus Pillars of Interest</p>
                    <div className="space-y-1.5">
                      {selected.interest_areas.map((p: string) => (
                        <div key={p} className="flex items-center gap-2 text-xs bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2 text-slate-700">
                          <CheckSquare size={13} className="text-trust-600 shrink-0" />
                          <span>{getPillarLabel(p)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message Content */}
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Key Requirements & Proposal</p>
                  <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 text-slate-700 text-xs leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                    {selected.message}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 border-t border-slate-100 pt-5 mt-6">
                  <Button
                    onClick={() => setSelected(null)}
                    className="w-full justify-center py-2.5"
                  >
                    Close
                  </Button>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
  )
}
