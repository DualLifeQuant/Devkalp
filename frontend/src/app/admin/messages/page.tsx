import { useEffect, useState } from 'react'
import { Mail, Phone, Calendar, Trash2, Eye, Search, HeartHandshake, HandHeart, Users, Briefcase, X, MessageSquare, Inbox } from 'lucide-react'
import AdminLayout from '@/components/layout/AdminLayout'
import { Badge, Button, Card, Spinner, EmptyState } from '@/components/ui'
import { enquiriesApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

const ENQUIRY_TYPES = [
  { value: 'all', label: 'All Messages', icon: <Inbox size={15} /> },
  { value: 'general', label: 'General Enquiry', icon: <Mail size={15} /> },
  { value: 'matrimony', label: 'Matrimony Services', icon: <HeartHandshake size={15} /> },
  { value: 'donation', label: 'Donation / Partnership', icon: <HandHeart size={15} /> },
  { value: 'volunteer', label: 'Volunteer Registration', icon: <Users size={15} /> },
  { value: 'careers', label: 'Career Opportunities', icon: <Briefcase size={15} /> },
]

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<any>(null)

  const loadMessages = async () => {
    setLoading(true)
    try {
      const res = await enquiriesApi.list({ enquiry_type: filter, limit: 100 })
      setMessages(res.data.items || [])
    } catch {
      toast.error('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMessages()
  }, [filter])

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!window.confirm('Are you sure you want to permanently delete this message?')) return
    try {
      await enquiriesApi.delete(id)
      toast.success('Message deleted successfully')
      if (selected?.id === id) setSelected(null)
      loadMessages()
    } catch {
      toast.error('Failed to delete message')
    }
  }

  // Filter local search
  const filteredMessages = messages.filter(m => {
    const term = search.toLowerCase()
    return (
      (m.name || '').toLowerCase().includes(term) ||
      (m.email || '').toLowerCase().includes(term) ||
      (m.message || '').toLowerCase().includes(term) ||
      (m.phone || '').toLowerCase().includes(term)
    )
  })

  const getTypeName = (val: string) => {
    const matched = ENQUIRY_TYPES.find(t => t.value === val)
    return matched ? matched.label : val
  }

  const getTypeBadgeColor = (val: string) => {
    switch (val) {
      case 'matrimony': return 'bg-rose-50 border border-rose-100 text-rose-700'
      case 'donation': return 'bg-emerald-50 border border-emerald-100 text-emerald-700'
      case 'volunteer': return 'bg-sky-50 border border-sky-100 text-sky-700'
      case 'careers': return 'bg-amber-50 border border-amber-100 text-amber-700'
      default: return 'bg-slate-50 border border-slate-200 text-slate-700'
    }
  }

  return (
    <AdminLayout>
      <div className="p-6 md:p-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-2xl text-trust-900">User Contact Messages</h1>
            <p className="text-slate-500 text-sm mt-1">Review and manage general enquiries, matrimony support, donation partnership, and volunteer requests.</p>
          </div>
          
          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={15} />
            </span>
            <input
              type="text"
              placeholder="Search sender or message..."
              className="input pl-9 pr-4 py-2 text-xs w-full border border-slate-200 rounded-xl outline-none focus:border-trust-500"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
          {ENQUIRY_TYPES.map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={clsx(
                'flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-colors',
                filter === tab.value
                  ? 'bg-trust-800 text-white border-trust-800'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-trust-300'
              )}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Messages List / Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : filteredMessages.length === 0 ? (
          <EmptyState
            icon={<Inbox size={28} className="text-slate-400" />}
            title="No messages found"
            description={search ? "No messages match your search term." : "No enquiries registered in this category."}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredMessages.map((msg) => (
              <Card
                key={msg.id}
                className="hover:border-trust-300 group transition-all duration-200 flex flex-col justify-between"
                hover
              >
                {/* Clickable message content */}
                <div 
                  onClick={() => setSelected(msg)} 
                  className="p-5 flex-1 cursor-pointer"
                >
                  {/* Message Top Details */}
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <span className={clsx("px-2 py-0.5 text-[10px] rounded-lg font-bold uppercase tracking-wider", getTypeBadgeColor(msg.enquiry_type))}>
                      {getTypeName(msg.enquiry_type)}
                    </span>
                    <button
                      onClick={(e) => handleDelete(msg.id, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200"
                      title="Delete Message"
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
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>

                  {/* Message Preview */}
                  <p className="text-slate-600 text-xs mt-3.5 leading-relaxed line-clamp-3 bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                    {msg.message}
                  </p>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 text-xs">
                  <span className="text-[10px] text-slate-400 truncate max-w-[150px]">{msg.email}</span>
                  <button 
                    onClick={() => setSelected(msg)}
                    className="flex items-center gap-1 text-trust-600 font-bold hover:text-trust-800 transition-colors"
                  >
                    <Eye size={12} /> View Details
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Message Details Modal */}
        {selected && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelected(null)}>
            <div className="bg-white rounded-3xl shadow-float w-full max-w-lg max-h-[90vh] overflow-y-auto relative" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-display text-xl text-trust-900">Enquiry Message Details</h2>
                <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 space-y-5">
                
                {/* Type & Date Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <span className={clsx("px-2.5 py-0.5 text-xs rounded-full font-bold uppercase tracking-wider", getTypeBadgeColor(selected.enquiry_type))}>
                      {getTypeName(selected.enquiry_type)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Calendar size={13} />
                    {new Date(selected.created_at).toLocaleString()}
                  </p>
                </div>

                {/* Sender Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Sender Name</p>
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

                {/* Message Content */}
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Message Content</p>
                  <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 text-slate-700 text-xs leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                    {selected.message}
                  </div>
                </div>

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
                    <Trash2 size={15} /> Delete Message
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
