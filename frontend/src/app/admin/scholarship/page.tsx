import { useEffect, useState } from 'react'
import { Mail, Phone, Calendar, Trash2, Eye, Search, X, Inbox, BookOpen, Briefcase } from 'lucide-react'
import AdminLayout from '@/components/layout/AdminLayout'
import { Badge, Button, Card, Spinner, EmptyState } from '@/components/ui'
import { enquiriesApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

const parseScholarshipMessage = (message: string) => {
  if (!message) return { details: {} as Record<string, string>, documents: {} as Record<string, string> }
  const lines = message.split('\n')
  const details: Record<string, string> = {}
  const documents: Record<string, string> = {}
  let isDocsSection = false

  lines.forEach(line => {
    const trimmed = line.trim()
    if (!trimmed) return
    if (trimmed.startsWith('Documents:')) {
      isDocsSection = true
      return
    }
    
    const index = trimmed.indexOf(':')
    if (index !== -1) {
      const key = trimmed.substring(0, index).trim()
      const value = trimmed.substring(index + 1).trim()
      
      const isPaymentMetadataField = key.startsWith('- Payment') || key.startsWith('- Donation') || key.startsWith('- Receipt') || key.startsWith('- Amount') || key.startsWith('Payment Information')

      if (isDocsSection && !isPaymentMetadataField) {
        documents[key] = value
      } else {
        details[key] = value
      }
    }
  })

  return { details, documents }
}

export default function AdminScholarshipsPage() {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<any>(null)

  const loadMessages = async () => {
    setLoading(true)
    try {
      const res = await enquiriesApi.list({ enquiry_type: 'scholarship', limit: 100 })
      setMessages(res.data.items || [])
    } catch {
      toast.error('Failed to load scholarship applications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMessages()
  }, [])

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!window.confirm('Are you sure you want to permanently delete this application record?')) return
    try {
      await enquiriesApi.delete(id)
      toast.success('Application record deleted successfully')
      if (selected?.id === id) setSelected(null)
      loadMessages()
    } catch {
      toast.error('Failed to delete application record')
    }
  }

  const filteredMessages = messages.filter(m => {
    const term = search.toLowerCase()
    return (
      (m.name || '').toLowerCase().includes(term) ||
      (m.email || '').toLowerCase().includes(term) ||
      (m.message || '').toLowerCase().includes(term) ||
      (m.phone || '').toLowerCase().includes(term)
    )
  })

  return (
    <AdminLayout>
      <div className="p-6 md:p-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-2xl text-trust-900 flex items-center gap-2">
              <BookOpen className="text-trust-800" size={24} /> Scholarship Applications
            </h1>
            <p className="text-slate-500 text-sm mt-1">Review and manage scholarship assistance requests (Digital Gujarat and MYSY).</p>
          </div>
          
          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={15} />
            </span>
            <input
              type="text"
              placeholder="Search student or email..."
              className="input pl-9 pr-4 py-2 text-xs w-full border border-slate-200 rounded-xl outline-none focus:border-trust-500"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Messages List / Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : filteredMessages.length === 0 ? (
          <EmptyState
            icon={<Inbox size={28} className="text-slate-400" />}
            title="No applications found"
            description={search ? "No applications match your search term." : "No scholarship applications registered yet."}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredMessages.map((msg) => {
              const scholDetails = parseScholarshipMessage(msg.message);
              
              return (
                <Card
                  key={msg.id}
                  className="hover:border-trust-300 group transition-all duration-200 flex flex-col justify-between"
                  hover
                >
                  <div 
                    onClick={() => setSelected(msg)} 
                    className="p-5 flex-1 cursor-pointer text-left"
                  >
                    {/* Scholarship Tag & Trash */}
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <span className="px-2 py-0.5 text-[10px] rounded-lg font-bold uppercase tracking-wider bg-emerald-50 border border-emerald-100 text-emerald-800">
                        {scholDetails.details['Scholarship Type'] || 'Scholarship'}
                      </span>
                      <button
                        onClick={(e) => handleDelete(msg.id, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200"
                        title="Delete Application"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {/* Sender Details */}
                    <h3 className="font-semibold text-slate-800 text-sm truncate">{msg.name}</h3>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Calendar size={10} />
                      {new Date(msg.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>

                    {/* Details Preview */}
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100/50 mt-4 text-left space-y-1">
                      <p className="text-[11px] text-slate-600">
                        <strong>Student Name:</strong> {msg.name}
                      </p>
                      {scholDetails.details['Admission Fee'] && (
                        <p className="text-[11px] text-slate-600">
                          <strong>Admission Fee:</strong> {scholDetails.details['Admission Fee']}
                        </p>
                      )}
                      {scholDetails.details['Tuition Fee'] && (
                        <p className="text-[11px] text-slate-600">
                          <strong>Tuition Fee:</strong> {scholDetails.details['Tuition Fee']}
                        </p>
                      )}
                      <p className="text-[11px] text-slate-500 font-medium pt-1 border-t border-slate-100 mt-1 flex items-center justify-between">
                        <span>Documents Uploaded:</span>
                        <span className="font-bold text-trust-800">{Object.keys(scholDetails.documents).length} scans</span>
                      </p>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 text-xs">
                    <span className="text-[10px] text-slate-400 truncate max-w-[120px]">{msg.email}</span>
                    <button 
                      onClick={() => setSelected(msg)}
                      className="flex items-center gap-1 text-trust-600 font-bold hover:text-trust-800 transition-colors"
                    >
                      <Eye size={12} /> View Full Details
                    </button>
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {/* Message Details Modal */}
        {selected && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelected(null)}>
            <div className="bg-white rounded-3xl shadow-float w-full max-w-lg max-h-[90vh] overflow-y-auto relative" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-display text-xl text-trust-900">Scholarship Application Details</h2>
                <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 space-y-5 text-left">
                
                {/* Type & Date Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <span className="px-2.5 py-0.5 text-xs rounded-full font-bold uppercase tracking-wider bg-emerald-50 border border-emerald-100 text-emerald-800">
                      {parseScholarshipMessage(selected.message).details['Scholarship Type'] || 'Scholarship'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Calendar size={13} />
                    {new Date(selected.created_at).toLocaleString()}
                  </p>
                </div>

                {/* Student Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Student Name</p>
                    <p className="font-semibold text-slate-800 text-sm">{selected.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Email Address</p>
                    <a href={`mailto:${selected.email}`} className="font-semibold text-trust-600 text-sm hover:underline flex items-center gap-1">
                      <Mail size={12} /> {selected.email}
                    </a>
                  </div>
                  {selected.phone && (
                    <div className="sm:col-span-2">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Phone Number</p>
                      <a href={`tel:${selected.phone}`} className="font-semibold text-slate-800 text-sm hover:text-trust-600 flex items-center gap-1">
                        <Phone size={12} /> {selected.phone}
                      </a>
                    </div>
                  )}
                </div>

                {/* Scholarship Specific Details & Documents */}
                {(() => {
                  const scholDetails = parseScholarshipMessage(selected.message);
                  return (
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Scholarship Details</p>
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs space-y-1.5">
                          <p className="text-slate-800"><strong>Scheme Type:</strong> {scholDetails.details['Scholarship Type'] || 'N/A'}</p>
                          {scholDetails.details['College Start Date'] && <p className="text-slate-800"><strong>College Term Start:</strong> {scholDetails.details['College Start Date']}</p>}
                          {scholDetails.details['College End Date'] && <p className="text-slate-800"><strong>College Term End:</strong> {scholDetails.details['College End Date']}</p>}
                          {scholDetails.details['Admission Fee'] && <p className="text-slate-800"><strong>Admission Fee:</strong> {scholDetails.details['Admission Fee']}</p>}
                          {scholDetails.details['Tuition Fee'] && <p className="text-slate-800"><strong>Tuition Fee:</strong> {scholDetails.details['Tuition Fee']}</p>}
                          {scholDetails.details['Misc Fee'] && <p className="text-slate-800"><strong>Misc Fee:</strong> {scholDetails.details['Misc Fee']}</p>}
                          {scholDetails.details['Exam Fee'] && <p className="text-slate-800"><strong>Exam Fee:</strong> {scholDetails.details['Exam Fee']}</p>}
                          {scholDetails.documents['Payment Screenshot'] && (
                            <div className="mt-3 pt-3 border-t border-slate-200">
                              <p className="text-slate-500 font-bold mb-1.5 uppercase text-[9px] tracking-wider">Payment Screenshot</p>
                              {scholDetails.documents['Payment Screenshot'].toLowerCase().endsWith('.pdf') ? (
                                <a
                                  href={scholDetails.documents['Payment Screenshot']}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-trust-600 hover:underline font-bold text-xs flex items-center gap-1"
                                >
                                  View Payment Document (PDF) →
                                </a>
                              ) : (
                                <a
                                  href={scholDetails.documents['Payment Screenshot']}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-block relative rounded-xl overflow-hidden border border-slate-200 hover:border-trust-500 transition-colors shadow-2xs group"
                                >
                                  <img
                                    src={scholDetails.documents['Payment Screenshot']}
                                    alt="Payment Screenshot"
                                    className="max-w-[200px] max-h-[150px] object-cover rounded-lg group-hover:opacity-90 transition-opacity"
                                  />
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Uploaded Document Scan Attachments</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto">
                          {Object.keys(scholDetails.documents).map((docName) => (
                            <a
                              key={docName}
                              href={scholDetails.documents[docName]}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="border border-slate-200 hover:border-trust-350 hover:bg-slate-50 rounded-xl p-3 bg-white transition-all flex items-center justify-between gap-2 text-xs shadow-2xs font-body text-slate-700 font-bold"
                            >
                              <span className="truncate flex-1">{docName}</span>
                              <span className="text-[10px] font-bold text-trust-600 hover:text-trust-800 shrink-0 select-none">View Scan</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })()}

                {/* Action Buttons */}
                <div className="flex gap-3 border-t border-slate-100 pt-5 mt-6">
                  <Button
                    onClick={() => setSelected(null)}
                    variant="ghost"
                    className="flex-1 justify-center py-2.5"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => handleDelete(selected.id)}
                    variant="danger"
                    className="flex-1 justify-center py-2.5"
                  >
                    <Trash2 size={15} /> Delete Application
                  </Button>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  )
}
