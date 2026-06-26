import { useEffect, useState } from 'react'
import { Handshake, Plus, Edit, Trash2, X, Search, Globe, Eye, EyeOff, Camera } from 'lucide-react'
import AdminLayout from '@/components/layout/AdminLayout'
import { Badge, Button, Card, Spinner, EmptyState } from '@/components/ui'
import { partnersApi, adminApi } from '@/lib/api'
import toast from 'react-hot-toast'

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<any>(null) // For modal (create/edit)
  const [showModal, setShowModal] = useState(false)

  const [form, setForm] = useState({
    name: '',
    logo_url: '',
    website_url: '',
    is_active: true,
  })

  const [uploadingImage, setUploadingImage] = useState(false)

  const loadPartners = async () => {
    setLoading(true)
    try {
      const res = await partnersApi.list({ active_only: false })
      if (Array.isArray(res.data)) {
        setPartners(res.data)
      } else {
        setPartners([])
      }
    } catch {
      toast.error('Failed to load partners')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPartners()
  }, [])

  const handleOpenCreate = () => {
    setSelected(null)
    setForm({
      name: '',
      logo_url: '',
      website_url: '',
      is_active: true,
    })
    setShowModal(true)
  }

  const handleOpenEdit = (partner: any) => {
    setSelected(partner)
    setForm({
      name: partner.name || '',
      logo_url: partner.logo_url || '',
      website_url: partner.website_url || '',
      is_active: partner.is_active ?? true,
    })
    setShowModal(true)
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImage(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await adminApi.uploadImage(formData)
      setForm(prev => ({ ...prev, logo_url: res.data.url }))
      toast.success('Logo uploaded successfully!')
    } catch {
      toast.error('Failed to upload logo')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this partner?')) return
    try {
      await partnersApi.delete(id)
      toast.success('Partner deleted successfully')
      loadPartners()
    } catch {
      toast.error('Failed to delete partner')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name) {
      toast.error('Name is required')
      return
    }
    if (!form.logo_url) {
      toast.error('Logo URL/Upload is required')
      return
    }
    try {
      if (selected) {
        // Edit mode
        await partnersApi.update(selected.id, form)
        toast.success('Partner updated successfully')
      } else {
        // Create mode
        await partnersApi.create(form)
        toast.success('Partner added successfully')
      }
      setShowModal(false)
      loadPartners()
    } catch {
      toast.error('Failed to save partner details')
    }
  }

  const filteredPartners = partners.filter(p => {
    const term = search.toLowerCase()
    return (p.name || '').toLowerCase().includes(term)
  })

  return (
    <AdminLayout>
      <div className="p-6 md:p-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-2xl text-trust-900 flex items-center gap-2">
              <Handshake className="text-saffron-500" size={24} />
              Partners & Sponsors
            </h1>
            <p className="text-slate-500 text-sm mt-1">Add, edit, or remove corporate partners and sponsors. Inactive partners will be hidden from the homepage marquee.</p>
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto">
            {/* Search bar */}
            <div className="relative flex-1 sm:w-64 sm:flex-none">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Search size={15} />
              </span>
              <input
                type="text"
                placeholder="Search partners..."
                className="input pl-9 pr-4 py-2 text-xs w-full border border-slate-200 rounded-xl outline-none focus:border-trust-500"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            
            <Button onClick={handleOpenCreate} className="gap-1.5 whitespace-nowrap">
              <Plus size={16} /> Add Partner
            </Button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : filteredPartners.length === 0 ? (
          <EmptyState
            icon={<Handshake size={28} className="text-slate-300" />}
            title="No partners found"
            description={search ? "No partners match your search term." : "Click 'Add Partner' to add your first sponsor/partner logo."}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredPartners.map((p) => (
              <Card
                key={p.id}
                className="overflow-hidden flex flex-col justify-between hover:border-trust-200 transition-all group"
              >
                <div>
                  {/* Logo wrapper */}
                  <div className="relative aspect-[16/9] w-full bg-slate-50 flex items-center justify-center p-4 border-b border-slate-100 overflow-hidden">
                    {p.logo_url ? (
                      <img src={p.logo_url} alt={p.name} className="max-h-16 max-w-full object-contain group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <Handshake size={48} className="text-slate-200" />
                    )}
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-display font-bold text-slate-800 text-base leading-snug truncate" title={p.name}>
                        {p.name}
                      </h3>
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
                  </div>
                </div>

                <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                  {p.website_url ? (
                    <a href={p.website_url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-trust-600 hover:underline flex items-center gap-1">
                      <Globe size={12} /> Website
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400">No link details</span>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="p-2 rounded-lg bg-white border border-slate-200 hover:border-trust-300 text-slate-500 hover:text-trust-600 transition-colors shadow-2xs"
                      title="Edit Partner"
                    >
                      <Edit size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-2 rounded-lg bg-white border border-slate-200 hover:border-red-200 text-slate-500 hover:text-red-600 transition-colors shadow-2xs"
                      title="Delete Partner"
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
                  <Handshake className="text-saffron-500" size={20} />
                  <h2 className="font-display text-lg text-trust-900">
                    {selected ? 'Edit Partner Details' : 'Add Partner Logo'}
                  </h2>
                </div>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-4">
                  <div>
                    <label className="label">Partner / Corporate Name *</label>
                    <input
                      className="input text-sm"
                      placeholder="e.g. Adobe Inc."
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <label className="label text-xs font-bold text-slate-700">Logo Image *</label>
                    <div className="space-y-2">
                      <div className="flex gap-4 items-center">
                        <label className="flex-1 border-2 border-dashed border-slate-200 hover:border-trust-400 rounded-2xl p-4 text-center cursor-pointer flex flex-col items-center gap-1.5 transition-colors">
                          <Camera size={20} className="text-slate-400" />
                          <span className="text-xs text-slate-500 font-medium">
                            {uploadingImage ? 'Uploading logo...' : 'Click to upload image'}
                          </span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploadingImage} />
                        </label>
                        {form.logo_url && (
                          <div className="w-24 h-20 rounded-xl overflow-hidden shadow-inner border border-slate-100 bg-slate-50 shrink-0 relative group flex items-center justify-center p-2">
                            <img src={form.logo_url} alt="Partner Preview" className="max-h-full max-w-full object-contain" />
                            <button type="button" onClick={() => setForm(prev => ({ ...prev, logo_url: '' }))}
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
                          placeholder="Or paste image URL (e.g. SVG/PNG)..."
                          value={form.logo_url}
                          onChange={e => setForm(f => ({ ...f, logo_url: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="label">Website / Portal URL</label>
                    <input
                      className="input text-sm"
                      placeholder="e.g. https://www.adobe.com"
                      value={form.website_url}
                      onChange={e => setForm(f => ({ ...f, website_url: e.target.value }))}
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
                    {selected ? 'Save Changes' : 'Add Partner'}
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
