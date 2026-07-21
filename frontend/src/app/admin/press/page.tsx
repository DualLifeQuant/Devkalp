import { useEffect, useState } from 'react'
import { Newspaper, Calendar, Plus, Edit, Trash2, X, Search, Globe, Eye, EyeOff, Camera } from 'lucide-react'
import { Badge, Button, Card, Spinner, EmptyState } from '@/components/ui'
import { pressApi, adminApi } from '@/lib/api'
import toast from 'react-hot-toast'

export default function AdminPressPage() {
  const [pressMentions, setPressMentions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<any>(null) // For modal
  const [showModal, setShowModal] = useState(false)

  const [form, setForm] = useState({
    title: '',
    publisher_name: '',
    logo_url: '',
    article_url: '',
    publish_date: '',
    summary: '',
    is_active: true,
  })

  const [uploadingLogo, setUploadingLogo] = useState(false)

  const loadPress = async () => {
    setLoading(true)
    try {
      const res = await pressApi.list({ active_only: false })
      if (Array.isArray(res.data)) {
        setPressMentions(res.data)
      } else {
        setPressMentions([])
      }
    } catch {
      toast.error('Failed to load press mentions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPress()
  }, [])

  const handleOpenCreate = () => {
    setSelected(null)
    setForm({
      title: '',
      publisher_name: '',
      logo_url: '',
      article_url: '',
      publish_date: '',
      summary: '',
      is_active: true,
    })
    setShowModal(true)
  }

  const handleOpenEdit = (mention: any) => {
    setSelected(mention)
    setForm({
      title: mention.title || '',
      publisher_name: mention.publisher_name || '',
      logo_url: mention.logo_url || '',
      article_url: mention.article_url || '',
      publish_date: mention.publish_date || '',
      summary: mention.summary || '',
      is_active: mention.is_active ?? true,
    })
    setShowModal(true)
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingLogo(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await adminApi.uploadImage(formData)
      setForm(prev => ({ ...prev, logo_url: res.data.url }))
      toast.success('Publisher logo uploaded!')
    } catch {
      toast.error('Failed to upload publisher logo')
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this press mention?')) return
    try {
      await pressApi.delete(id)
      toast.success('Press entry deleted successfully')
      loadPress()
    } catch {
      toast.error('Failed to delete press entry')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.publisher_name) {
      toast.error('Title and Publisher Name are required')
      return
    }
    try {
      if (selected) {
        // Edit mode
        await pressApi.update(selected.id, form)
        toast.success('Press entry updated successfully')
      } else {
        // Create mode
        await pressApi.create(form)
        toast.success('Press entry added successfully')
      }
      setShowModal(false)
      loadPress()
    } catch {
      toast.error('Failed to save press entry details')
    }
  }

  const filteredPress = pressMentions.filter(p => {
    const term = search.toLowerCase()
    return (
      (p.title || '').toLowerCase().includes(term) ||
      (p.publisher_name || '').toLowerCase().includes(term) ||
      (p.summary || '').toLowerCase().includes(term)
    )
  })

  return (
      <div className="p-6 md:p-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-2xl text-trust-900 flex items-center gap-2">
              <Newspaper className="text-trust-600" size={24} />
              Press & Media Coverages
            </h1>
            <p className="text-slate-500 text-sm mt-1">Review, add, and update press releases and news features in "Devkalp in the News".</p>
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto">
            {/* Search bar */}
            <div className="relative flex-1 sm:w-64 sm:flex-none">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Search size={15} />
              </span>
              <input
                type="text"
                placeholder="Search press mentions..."
                className="input pl-9 pr-4 py-2 text-xs w-full border border-slate-200 rounded-xl outline-none focus:border-trust-500"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            
            <Button onClick={handleOpenCreate} className="gap-1.5 whitespace-nowrap">
              <Plus size={16} /> Add Press Entry
            </Button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : filteredPress.length === 0 ? (
          <EmptyState
            icon={<Newspaper size={28} className="text-slate-300" />}
            title="No press mentions found"
            description={search ? "No press entries match your search term." : "Click 'Add Press Entry' to add your first newspaper feature."}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPress.map((p) => (
              <Card
                key={p.id}
                className="hover:border-trust-200 transition-all flex flex-col justify-between h-full group p-5"
                hover
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    {p.logo_url ? (
                      <img src={p.logo_url} alt={p.publisher_name} className="h-7 object-contain opacity-80" />
                    ) : (
                      <span className="text-[10px] font-bold text-trust-700 bg-trust-50 px-2.5 py-0.5 rounded-md border border-trust-100 uppercase tracking-wider">
                        {p.publisher_name}
                      </span>
                    )}

                    {p.is_active ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sage-700 bg-sage-50 px-2 py-0.5 rounded-md border border-sage-100">
                        <Eye size={10} /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                        <EyeOff size={10} /> Inactive
                      </span>
                    )}
                  </div>

                  <h3 className="font-display text-base font-bold text-slate-800 line-clamp-2 leading-snug mb-1">
                    {p.title}
                  </h3>
                  
                  {p.publish_date && (
                    <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mb-3">
                      <Calendar size={11} /> Published: {p.publish_date}
                    </p>
                  )}

                  {p.summary && (
                    <p className="text-slate-500 text-xs leading-relaxed line-clamp-4 bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                      {p.summary}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 mt-5 pt-4">
                  {p.article_url ? (
                    <a
                      href={p.article_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-trust-600 hover:underline flex items-center gap-1"
                    >
                      <Globe size={12} /> Read Article
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400">No article link</span>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="p-2 rounded-lg bg-white border border-slate-200 hover:border-trust-300 text-slate-500 hover:text-trust-600 transition-colors shadow-2xs"
                      title="Edit Press Mention"
                    >
                      <Edit size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-2 rounded-lg bg-white border border-slate-200 hover:border-red-200 text-slate-500 hover:text-red-600 transition-colors shadow-2xs"
                      title="Delete Press Mention"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
            <div className="bg-white rounded-3xl shadow-float w-full max-w-lg overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Newspaper className="text-trust-600" size={20} />
                  <h2 className="font-display text-lg text-trust-900">
                    {selected ? 'Edit Press Entry' : 'Add Press Mention'}
                  </h2>
                </div>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-4">
                  <div>
                    <label className="label">Article Headline *</label>
                    <input
                      className="input text-sm"
                      placeholder="e.g. NGO Devkalp Awarded Charity Transparency Certification"
                      value={form.title}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Publisher Name *</label>
                      <input
                        className="input text-sm"
                        placeholder="e.g. ANI News, The Print"
                        value={form.publisher_name}
                        onChange={e => setForm(f => ({ ...f, publisher_name: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Publish Date</label>
                      <input
                        className="input text-sm"
                        placeholder="e.g. February 2026"
                        value={form.publish_date}
                        onChange={e => setForm(f => ({ ...f, publish_date: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">News Summary</label>
                    <textarea
                      className="input resize-none text-sm"
                      rows={3}
                      placeholder="Enter a brief outline or key highlights of the article..."
                      value={form.summary}
                      onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="label text-xs font-bold text-slate-700">Publisher Logo</label>
                    <div className="space-y-2">
                      <div className="flex gap-4 items-center">
                        <label className="flex-1 border-2 border-dashed border-slate-200 hover:border-trust-400 rounded-2xl p-4 text-center cursor-pointer flex flex-col items-center gap-1.5 transition-colors">
                          <Camera size={20} className="text-slate-400" />
                          <span className="text-xs text-slate-500 font-medium">
                            {uploadingLogo ? 'Uploading logo...' : 'Click to upload logo'}
                          </span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploadingLogo} />
                        </label>
                        {form.logo_url && (
                          <div className="w-24 h-20 rounded-xl overflow-hidden shadow-inner border border-slate-100 shrink-0 relative group bg-slate-50 p-1 flex items-center justify-center">
                            <img src={form.logo_url} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                            <button type="button" onClick={() => setForm(prev => ({ ...prev, logo_url: '' }))}
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold rounded-xl">
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-slate-400 text-xs">URL</span>
                        </div>
                        <input
                          className="input pl-10 text-xs"
                          placeholder="Or paste a logo URL here..."
                          value={form.logo_url}
                          onChange={e => setForm(f => ({ ...f, logo_url: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="label">Article Link URL</label>
                    <input
                      className="input text-sm"
                      placeholder="e.g. https://www.aninews.in/... or external article link"
                      value={form.article_url}
                      onChange={e => setForm(f => ({ ...f, article_url: e.target.value }))}
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      className="w-4 h-4 text-trust-600 border-slate-300 rounded focus:ring-trust-500"
                      checked={form.is_active}
                      onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                    />
                    <label htmlFor="is_active" className="text-xs font-semibold text-slate-700 select-none cursor-pointer">
                      Mark as Active (will show on homepage)
                    </label>
                  </div>
                </div>

                <div className="p-6 border-t border-slate-100 flex gap-3 justify-end bg-slate-50">
                  <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                  <Button type="submit" variant="secondary">
                    {selected ? 'Save Changes' : 'Create Press Entry'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
  )
}
