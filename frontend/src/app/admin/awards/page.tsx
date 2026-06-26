import { useEffect, useState } from 'react'
import { Trophy, Calendar, Plus, Edit, Trash2, X, Search, Globe, Eye, EyeOff, Camera } from 'lucide-react'
import AdminLayout from '@/components/layout/AdminLayout'
import { Badge, Button, Card, Spinner, EmptyState } from '@/components/ui'
import { awardsApi, adminApi } from '@/lib/api'
import toast from 'react-hot-toast'

export default function AdminAwardsPage() {
  const [awards, setAwards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<any>(null) // For modal (create/edit)
  const [showModal, setShowModal] = useState(false)

  const [form, setForm] = useState({
    title: '',
    issuer: '',
    date_given: '',
    description: '',
    image_url: '',
    link: '',
    is_active: true,
  })

  const [uploadingImage, setUploadingImage] = useState(false)

  const loadAwards = async () => {
    setLoading(true)
    try {
      const res = await awardsApi.list({ active_only: false })
      if (Array.isArray(res.data)) {
        setAwards(res.data)
      } else {
        setAwards([])
      }
    } catch {
      toast.error('Failed to load awards')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAwards()
  }, [])

  const handleOpenCreate = () => {
    setSelected(null)
    setForm({
      title: '',
      issuer: '',
      date_given: '',
      description: '',
      image_url: '',
      link: '',
      is_active: true,
    })
    setShowModal(true)
  }

  const handleOpenEdit = (award: any) => {
    setSelected(award)
    setForm({
      title: award.title || '',
      issuer: award.issuer || '',
      date_given: award.date_given || '',
      description: award.description || '',
      image_url: award.image_url || '',
      link: award.link || '',
      is_active: award.is_active ?? true,
    })
    setShowModal(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImage(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await adminApi.uploadImage(formData)
      setForm(prev => ({ ...prev, image_url: res.data.url }))
      toast.success('Image uploaded successfully!')
    } catch {
      toast.error('Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this award/achievement?')) return
    try {
      await awardsApi.delete(id)
      toast.success('Award deleted successfully')
      loadAwards()
    } catch {
      toast.error('Failed to delete award')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title) {
      toast.error('Title is required')
      return
    }
    try {
      if (selected) {
        // Edit mode
        await awardsApi.update(selected.id, form)
        toast.success('Award updated successfully')
      } else {
        // Create mode
        await awardsApi.create(form)
        toast.success('Award added successfully')
      }
      setShowModal(false)
      loadAwards()
    } catch {
      toast.error('Failed to save award details')
    }
  }

  const filteredAwards = awards.filter(a => {
    const term = search.toLowerCase()
    return (
      (a.title || '').toLowerCase().includes(term) ||
      (a.issuer || '').toLowerCase().includes(term) ||
      (a.description || '').toLowerCase().includes(term)
    )
  })

  return (
    <AdminLayout>
      <div className="p-6 md:p-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-2xl text-trust-900 flex items-center gap-2">
              <Trophy className="text-saffron-500" size={24} />
              Awards & Achievements
            </h1>
            <p className="text-slate-500 text-sm mt-1">Add, edit, or remove corporate recognitions. Deactivated awards will automatically hide from the home page.</p>
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto">
            {/* Search bar */}
            <div className="relative flex-1 sm:w-64 sm:flex-none">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Search size={15} />
              </span>
              <input
                type="text"
                placeholder="Search awards..."
                className="input pl-9 pr-4 py-2 text-xs w-full border border-slate-200 rounded-xl outline-none focus:border-trust-500"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            
            <Button onClick={handleOpenCreate} className="gap-1.5 whitespace-nowrap">
              <Plus size={16} /> Add Award
            </Button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : filteredAwards.length === 0 ? (
          <EmptyState
            icon={<Trophy size={28} className="text-slate-300" />}
            title="No awards found"
            description={search ? "No awards match your search term." : "Click 'Add Award' to add your first recognition certificate."}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAwards.map((a) => (
              <Card
                key={a.id}
                className="overflow-hidden flex flex-col justify-between hover:border-trust-200 transition-all group"
              >
                <div>
                  {/* Image wrapper */}
                  {a.image_url ? (
                    <div className="relative aspect-[16/9] w-full bg-slate-100 overflow-hidden border-b border-slate-100">
                      <img src={a.image_url} alt={a.title} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" />
                    </div>
                  ) : (
                    <div className="relative aspect-[16/9] w-full bg-slate-50 flex items-center justify-center border-b border-slate-100 text-slate-300">
                      <Trophy size={48} className="stroke-[1.5]" />
                    </div>
                  )}

                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-saffron-700 bg-saffron-50 px-2 py-0.5 rounded-md border border-saffron-100 uppercase tracking-wider">
                        {a.issuer || 'NGO Award'}
                      </span>
                      {a.is_active ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sage-700 bg-sage-50 px-2 py-0.5 rounded-md border border-sage-100">
                          <Eye size={10} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                          <EyeOff size={10} /> Inactive
                        </span>
                      )}
                    </div>

                    <h3 className="font-display font-bold text-slate-800 text-base leading-snug line-clamp-2">{a.title}</h3>
                    
                    {a.date_given && (
                      <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                        <Calendar size={11} /> Given: {a.date_given}
                      </p>
                    )}

                    {a.description && (
                      <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">
                        {a.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                  {a.link ? (
                    <a href={a.link} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-trust-600 hover:underline flex items-center gap-1">
                      <Globe size={12} /> Certificate Link
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400">No link details</span>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenEdit(a)}
                      className="p-2 rounded-lg bg-white border border-slate-200 hover:border-trust-300 text-slate-500 hover:text-trust-600 transition-colors shadow-2xs"
                      title="Edit Award"
                    >
                      <Edit size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="p-2 rounded-lg bg-white border border-slate-200 hover:border-red-200 text-slate-500 hover:text-red-600 transition-colors shadow-2xs"
                      title="Delete Award"
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
                  <Trophy className="text-saffron-500" size={20} />
                  <h2 className="font-display text-lg text-trust-900">
                    {selected ? 'Edit Award Details' : 'Add Recognition Award'}
                  </h2>
                </div>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-4">
                  <div>
                    <label className="label">Award Title *</label>
                    <input
                      className="input text-sm"
                      placeholder="e.g. Excellence in Social Healthcare"
                      value={form.title}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Issuer / Board</label>
                      <input
                        className="input text-sm"
                        placeholder="e.g. Gujarat Welfare Alliance"
                        value={form.issuer}
                        onChange={e => setForm(f => ({ ...f, issuer: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="label">Date Given</label>
                      <input
                        className="input text-sm"
                        placeholder="e.g. March 2026"
                        value={form.date_given}
                        onChange={e => setForm(f => ({ ...f, date_given: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">Award Description</label>
                    <textarea
                      className="input resize-none text-sm"
                      rows={3}
                      placeholder="Describe what the recognition was given for and the project impact..."
                      value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="label text-xs font-bold text-slate-700">Award Image</label>
                    <div className="space-y-2">
                      <div className="flex gap-4 items-center">
                        <label className="flex-1 border-2 border-dashed border-slate-200 hover:border-trust-400 rounded-2xl p-4 text-center cursor-pointer flex flex-col items-center gap-1.5 transition-colors">
                          <Camera size={20} className="text-slate-400" />
                          <span className="text-xs text-slate-500 font-medium">
                            {uploadingImage ? 'Uploading image...' : 'Click to upload image'}
                          </span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                        </label>
                        {form.image_url && (
                          <div className="w-24 h-20 rounded-xl overflow-hidden shadow-inner border border-slate-100 shrink-0 relative group">
                            <img src={form.image_url} alt="Award Preview" className="w-full h-full object-cover" />
                            <button type="button" onClick={() => setForm(prev => ({ ...prev, image_url: '' }))}
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
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
                          placeholder="Or paste an image URL here..."
                          value={form.image_url}
                          onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="label">Verification Link / VPA</label>
                    <input
                      className="input text-sm"
                      placeholder="e.g. https://verify-award.com/check/123"
                      value={form.link}
                      onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
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
                    {selected ? 'Save Changes' : 'Create Award'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
