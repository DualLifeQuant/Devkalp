import { useEffect, useState } from 'react'
import { Image as ImageIcon, Calendar, Plus, Edit, Trash2, X, Search, Eye, EyeOff, Camera, Upload, Check, AlertCircle, Settings, Save } from 'lucide-react'
import AdminLayout from '@/components/layout/AdminLayout'
import { Button, Card, Spinner, EmptyState } from '@/components/ui'
import { galleryApi, adminApi } from '@/lib/api'
import toast from 'react-hot-toast'

type GalleryCategory = {
  id: string
  value: string
  label: string
  order_index: number
}

export default function AdminGalleryPage() {
  const [items, setItems] = useState<any[]>([])
  const [categories, setCategories] = useState<GalleryCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<any>(null) // For modal (create/edit)
  const [showModal, setShowModal] = useState(false)

  const [form, setForm] = useState({
    title: '',
    description: '',
    image_url: '',
    category: '',
    is_active: true,
  })

  const [uploadingImage, setUploadingImage] = useState(false)

  const [bulkCategory, setBulkCategory] = useState('')
  const [bulkFiles, setBulkFiles] = useState<File[]>([])
  const [bulkUploads, setBulkUploads] = useState<{ name: string; status: 'idle' | 'uploading' | 'success' | 'error' }[]>([])
  const [isBulkUploading, setIsBulkUploading] = useState(false)

  // ── Category Management State ──
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [newCatLabel, setNewCatLabel] = useState('')
  const [editingCatId, setEditingCatId] = useState<string | null>(null)
  const [editingCatLabel, setEditingCatLabel] = useState('')
  const [savingCategory, setSavingCategory] = useState(false)

  const loadGallery = async () => {
    setLoading(true)
    try {
      const res = await galleryApi.list({ active_only: false })
      if (Array.isArray(res.data)) {
        setItems(res.data)
      } else {
        setItems([])
      }
    } catch {
      toast.error('Failed to load gallery items')
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const res = await galleryApi.categories()
      const cats = Array.isArray(res.data) ? res.data : []
      setCategories(cats)
      // Default the bulk/create category selects to the first available category
      if (cats.length > 0) {
        setBulkCategory(prev => prev || cats[0].value)
        setForm(prev => ({ ...prev, category: prev.category || cats[0].value }))
      }
    } catch {
      toast.error('Failed to load categories')
    }
  }

  useEffect(() => {
    loadGallery()
    loadCategories()
  }, [])

  const slugify = (label: string) =>
    label.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')

  const handleOpenCreate = () => {
    setSelected(null)
    setForm({
      title: '',
      description: '',
      image_url: '',
      category: categories[0]?.value || '',
      is_active: true,
    })
    setBulkCategory(categories[0]?.value || '')
    setBulkFiles([])
    setBulkUploads([])
    setShowModal(true)
  }

  const handleOpenEdit = (item: any) => {
    setSelected(item)
    setForm({
      title: item.title || '',
      description: item.description || '',
      image_url: item.image_url || '',
      category: item.category || categories[0]?.value || '',
      is_active: item.is_active ?? true,
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
      toast.success('Gallery photo uploaded!')
    } catch {
      toast.error('Failed to upload gallery photo')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleBulkUpload = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (bulkFiles.length === 0) {
      toast.error('Please select at least one photo to upload')
      return
    }
    if (!bulkCategory) {
      toast.error('Please select a category')
      return
    }
    try {
      setIsBulkUploading(true)
      const initialStatuses = bulkFiles.map(f => ({ name: f.name, status: 'idle' as const }))
      setBulkUploads(initialStatuses)

      let successCount = 0
      for (let i = 0; i < bulkFiles.length; i++) {
        const file = bulkFiles[i]
        setBulkUploads(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'uploading' } : s))
        const formData = new FormData()
        formData.append('file', file)
        try {
          const uploadRes = await adminApi.uploadImage(formData)
          const imageUrl = uploadRes.data.url

          await galleryApi.create({
            title: '',
            description: '',
            image_url: imageUrl,
            category: bulkCategory,
            is_active: true
          })
          setBulkUploads(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'success' } : s))
          successCount++
        } catch (err: any) {
          toast.error(`Error uploading ${file.name}: ${err?.response?.data?.detail || err?.message || err}`)
          setBulkUploads(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'error' } : s))
        }
      }

      setIsBulkUploading(false)
      if (successCount === bulkFiles.length) {
        toast.success(`Successfully uploaded all ${successCount} photos!`)
        setShowModal(false)
        setBulkFiles([])
        setBulkUploads([])
        loadGallery()
      } else if (successCount > 0) {
        toast.success(`Uploaded ${successCount} of ${bulkFiles.length} photos. Some failed.`)
        loadGallery()
      } else {
        toast.error('Failed to upload any photos.')
      }
    } catch (outerErr: any) {
      toast.error(`System error: ${outerErr?.message || outerErr}`)
      setIsBulkUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this photo from the gallery?')) return
    try {
      await galleryApi.delete(id)
      toast.success('Photo deleted successfully')
      loadGallery()
    } catch {
      toast.error('Failed to delete photo')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.image_url) {
      toast.error('Image URL is required')
      return
    }
    try {
      if (selected) {
        await galleryApi.update(selected.id, form)
        toast.success('Photo details updated successfully')
      } else {
        await galleryApi.create(form)
        toast.success('Photo added to gallery successfully')
      }
      setShowModal(false)
      loadGallery()
    } catch {
      toast.error('Failed to save photo details')
    }
  }

  // ── Category CRUD Handlers ──

  const handleAddCategory = async () => {
    if (!newCatLabel.trim()) {
      toast.error('Please enter a category name')
      return
    }
    setSavingCategory(true)
    try {
      await galleryApi.createCategory({
        value: slugify(newCatLabel),
        label: newCatLabel.trim(),
        order_index: categories.length,
      })
      toast.success('Category added successfully')
      setNewCatLabel('')
      loadCategories()
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to add category')
    } finally {
      setSavingCategory(false)
    }
  }

  const startEditCategory = (cat: GalleryCategory) => {
    setEditingCatId(cat.id)
    setEditingCatLabel(cat.label)
  }

  const cancelEditCategory = () => {
    setEditingCatId(null)
    setEditingCatLabel('')
  }

  const saveEditCategory = async (cat: GalleryCategory) => {
    if (!editingCatLabel.trim()) {
      toast.error('Category name cannot be empty')
      return
    }
    setSavingCategory(true)
    try {
      await galleryApi.updateCategory(cat.id, { label: editingCatLabel.trim() })
      toast.success('Category updated successfully')
      cancelEditCategory()
      loadCategories()
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to update category')
    } finally {
      setSavingCategory(false)
    }
  }

  const handleDeleteCategory = async (cat: GalleryCategory) => {
    const inUse = items.some(item => item.category === cat.value)
    const warning = inUse
      ? `"${cat.label}" is used by existing gallery photos. Deleting it will NOT delete those photos, but they will show without a valid category. Continue?`
      : `Delete category "${cat.label}"?`
    if (!window.confirm(warning)) return
    try {
      await galleryApi.deleteCategory(cat.id)
      toast.success('Category deleted successfully')
      loadCategories()
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to delete category')
    }
  }

  const getCategoryLabel = (val: string) => {
    const cat = categories.find(c => c.value === val)
    return cat ? cat.label : val ? val.charAt(0).toUpperCase() + val.slice(1) : 'Uncategorized'
  }

  const filteredItems = items.filter(item => {
    const term = search.toLowerCase()
    return (
      (item.title || '').toLowerCase().includes(term) ||
      (item.category || '').toLowerCase().includes(term) ||
      (item.description || '').toLowerCase().includes(term)
    )
  })

  return (
    <AdminLayout>
      <div className="p-6 md:p-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-2xl text-trust-900 flex items-center gap-2">
              <ImageIcon className="text-saffron-500" size={24} />
              Media Gallery Management
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Add, update, or remove photos shown on the public Media & Gallery page.
            </p>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            {/* Search bar */}
            <div className="relative flex-1 sm:w-64 sm:flex-none">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Search size={15} />
              </span>
              <input
                type="text"
                placeholder="Search photos..."
                className="input pl-9 pr-4 py-2 text-xs w-full border border-slate-200 rounded-xl outline-none focus:border-trust-500"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <button
              onClick={() => setShowCategoryModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:border-trust-300 hover:text-trust-700 transition-colors whitespace-nowrap"
            >
              <Settings size={15} /> Categories
            </button>

            <Button onClick={handleOpenCreate} className="gap-1.5 whitespace-nowrap">
              <Plus size={16} /> Add Photos
            </Button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : filteredItems.length === 0 ? (
          <EmptyState
            icon={<ImageIcon size={28} className="text-slate-300" />}
            title="No media found"
            description={search ? "No photos match your search query." : "Click 'Add Photo' to upload and post your first visual record."}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden flex flex-col justify-between hover:border-trust-200 transition-all group"
              >
                <div>
                  <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden border-b border-slate-100">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                    />
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-saffron-700 bg-saffron-50 px-2 py-0.5 rounded-md border border-saffron-100 uppercase tracking-wider">
                        {getCategoryLabel(item.category)}
                      </span>
                      {item.is_active ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sage-700 bg-sage-50 px-2 py-0.5 rounded-md border border-sage-100">
                          <Eye size={10} /> Public
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                          <EyeOff size={10} /> Hidden
                        </span>
                      )}
                    </div>

                    {item.created_at && (
                      <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                        <Calendar size={11} /> Posted: {new Date(item.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    )}
                  </div>
                </div>

                <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-end bg-slate-50/50 gap-2">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-2 rounded-lg bg-white border border-slate-200 hover:border-trust-300 text-slate-500 hover:text-trust-600 transition-colors shadow-2xs"
                    title="Edit Photo"
                  >
                    <Edit size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-lg bg-white border border-slate-200 hover:border-red-200 text-slate-500 hover:text-red-600 transition-colors shadow-2xs"
                    title="Delete Photo"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => !isBulkUploading && setShowModal(false)}>
            <div className="bg-white rounded-3xl shadow-float w-full max-w-lg overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {selected ? <ImageIcon className="text-saffron-500" size={20} /> : <Upload className="text-saffron-500" size={20} />}
                  <h2 className="font-display text-lg text-trust-900">
                    {selected ? 'Edit Photo Details' : 'Add Photos to Gallery'}
                  </h2>
                </div>
                <button onClick={() => !isBulkUploading && setShowModal(false)} className="text-slate-400 hover:text-slate-600" disabled={isBulkUploading}><X size={18} /></button>
              </div>

              {categories.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">
                  No categories exist yet. Please add a category first using the "Categories" button before adding photos.
                </div>
              ) : selected ? (
                /* Edit Mode: Single Photo Form */
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                  <div className="p-6 space-y-4">
                    <div>
                      <label className="label text-xs font-bold text-slate-700">Category *</label>
                      <select
                        className="input text-sm"
                        value={form.category}
                        onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                        required
                      >
                        {categories.map(c => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="label text-xs font-bold text-slate-700">Gallery Photo</label>
                      <div className="space-y-2">
                        <div className="flex gap-4 items-center">
                          <label className="flex-1 border-2 border-dashed border-slate-200 hover:border-trust-400 rounded-2xl p-4 text-center cursor-pointer flex flex-col items-center gap-1.5 transition-colors">
                            <Camera size={20} className="text-slate-400" />
                            <span className="text-xs text-slate-500 font-medium">
                              {uploadingImage ? 'Uploading photo...' : 'Click to upload photo'}
                            </span>
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                          </label>
                          {form.image_url && (
                            <div className="w-24 h-20 rounded-xl overflow-hidden shadow-inner border border-slate-100 shrink-0 relative group bg-slate-50">
                              <img src={form.image_url} alt="Photo Preview" className="w-full h-full object-cover" />
                              <button type="button" onClick={() => setForm(prev => ({ ...prev, image_url: '' }))}
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
                            placeholder="Or paste an image URL/filename here..."
                            value={form.image_url}
                            onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                            required
                          />
                        </div>
                      </div>
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
                        Mark as Active (will show on public page)
                      </label>
                    </div>
                  </div>

                  <div className="p-6 border-t border-slate-100 flex gap-3 justify-end bg-slate-50">
                    <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                    <button
                      type="submit"
                      onClick={handleSubmit}
                      className="inline-flex items-center gap-2 font-semibold rounded-xl transition-all duration-200 select-none disabled:opacity-60 disabled:cursor-not-allowed bg-saffron-400 text-trust-900 hover:bg-saffron-300 shadow-warm px-5 py-2.5 text-sm"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                /* Create Mode: Bulk Photo Upload Flow */
                <form onSubmit={handleBulkUpload} className="flex-1 flex flex-col overflow-hidden">
                  <div className="p-6 space-y-4 flex-1 overflow-y-auto max-h-[60vh]">
                    <div>
                      <label className="label text-xs font-bold text-slate-700">Select Category *</label>
                      <select
                        className="input text-sm bg-white"
                        value={bulkCategory}
                        onChange={e => setBulkCategory(e.target.value)}
                        disabled={isBulkUploading}
                        required
                      >
                        {categories.map(c => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="label text-xs font-bold text-slate-700">Select Photos *</label>
                      <label className="border-2 border-dashed border-slate-200 hover:border-trust-400 rounded-2xl p-6 text-center cursor-pointer flex flex-col items-center gap-2 transition-colors">
                        <Camera size={24} className="text-slate-400" />
                        <span className="text-sm font-semibold text-slate-700">
                          Select Photo(s) to Upload
                        </span>
                        <span className="text-xs text-slate-500">
                          {bulkFiles.length > 0 ? `${bulkFiles.length} file(s) selected` : 'Drag & drop or click to choose files'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          disabled={isBulkUploading}
                          onChange={e => {
                            const files = Array.from(e.target.files || [])
                            setBulkFiles(files)
                            setBulkUploads(files.map(f => ({ name: f.name, status: 'idle' })))
                          }}
                        />
                      </label>
                    </div>

                    {bulkUploads.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-slate-600">Upload Status</p>
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 max-h-40 overflow-y-auto space-y-2">
                          {bulkUploads.map((up, i) => (
                            <div key={i} className="flex items-center justify-between text-xs">
                              <span className="text-slate-700 truncate max-w-[70%]">{up.name}</span>
                              <span className="font-semibold shrink-0">
                                {up.status === 'idle' && <span className="text-slate-400">Waiting...</span>}
                                {up.status === 'uploading' && <span className="text-trust-600 animate-pulse">Uploading...</span>}
                                {up.status === 'success' && <span className="text-sage-600 flex items-center gap-1"><Check size={12} /> Success</span>}
                                {up.status === 'error' && <span className="text-red-500 flex items-center gap-1"><AlertCircle size={12} /> Failed</span>}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-6 border-t border-slate-100 flex gap-3 justify-end bg-slate-50">
                    <Button type="button" variant="ghost" onClick={() => setShowModal(false)} disabled={isBulkUploading}>
                      Cancel
                    </Button>
                    <button
                      type="submit"
                      onClick={handleBulkUpload}
                      disabled={isBulkUploading || bulkFiles.length === 0}
                      className="inline-flex items-center gap-2 font-semibold rounded-xl transition-all duration-200 select-none disabled:opacity-60 disabled:cursor-not-allowed bg-saffron-400 text-trust-900 hover:bg-saffron-300 shadow-warm px-5 py-2.5 text-sm"
                    >
                      {isBulkUploading ? 'Uploading...' : `Upload ${bulkFiles.length} Photo(s)`}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Manage Categories Modal */}
        {showCategoryModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowCategoryModal(false)}>
            <div className="bg-white rounded-3xl shadow-float w-full max-w-md overflow-hidden flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="text-saffron-500" size={20} />
                  <h2 className="font-display text-lg text-trust-900">Manage Categories</h2>
                </div>
                <button onClick={() => setShowCategoryModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={18} />
                </button>
              </div>

              {/* Add new category */}
              <div className="p-6 border-b border-slate-100 space-y-2">
                <label className="label text-xs font-bold text-slate-700">Add New Category</label>
                <div className="flex gap-2">
                  <input
                    className="input text-sm flex-1"
                    placeholder="e.g. Youth Programs"
                    value={newCatLabel}
                    onChange={e => setNewCatLabel(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCategory() } }}
                  />
                  <button
                    onClick={handleAddCategory}
                    disabled={savingCategory}
                    className="px-4 py-2 rounded-xl bg-trust-800 text-white text-sm font-semibold hover:bg-trust-700 transition-colors disabled:opacity-60 flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <Plus size={15} /> Add
                  </button>
                </div>
              </div>

              {/* Existing categories list */}
              <div className="p-6 flex-1 overflow-y-auto space-y-2">
                {categories.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-6">No categories yet. Add one above.</p>
                ) : (
                  categories.map(cat => (
                    <div key={cat.id} className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                      {editingCatId === cat.id ? (
                        <>
                          <input
                            className="input text-sm flex-1 py-1.5"
                            value={editingCatLabel}
                            onChange={e => setEditingCatLabel(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); saveEditCategory(cat) } }}
                            autoFocus
                          />
                          <button
                            onClick={() => saveEditCategory(cat)}
                            disabled={savingCategory}
                            className="p-2 rounded-lg bg-sage-50 text-sage-600 hover:bg-sage-100 transition-colors"
                            title="Save"
                          >
                            <Save size={14} />
                          </button>
                          <button
                            onClick={cancelEditCategory}
                            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-700 transition-colors"
                            title="Cancel"
                          >
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{cat.label}</p>
                            <p className="text-[10px] text-slate-400">{cat.value}</p>
                          </div>
                          <button
                            onClick={() => startEditCategory(cat)}
                            className="p-2 rounded-lg bg-white border border-slate-200 hover:border-trust-300 text-slate-500 hover:text-trust-600 transition-colors"
                            title="Edit"
                          >
                            <Edit size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat)}
                            className="p-2 rounded-lg bg-white border border-slate-200 hover:border-red-200 text-slate-500 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
                <Button type="button" variant="ghost" onClick={() => setShowCategoryModal(false)}>Close</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}