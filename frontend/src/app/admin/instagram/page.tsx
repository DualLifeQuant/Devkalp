import { useEffect, useState } from 'react'
import { Instagram, Plus, Edit, Trash2, X, Search, Globe, Eye, EyeOff, Camera, Heart, MessageCircle } from 'lucide-react'
import { Badge, Button, Card, Spinner, EmptyState } from '@/components/ui'
import { instagramApi, adminApi } from '@/lib/api'
import toast from 'react-hot-toast'

export default function AdminInstagramPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<any>(null) // For modal (create/edit)
  const [showModal, setShowModal] = useState(false)

  const [form, setForm] = useState({
    post_url: '',
    image_url: '',
    caption: '',
    likes_count: 0,
    comments_count: 0,
    is_active: true,
  })

  const [uploadingImage, setUploadingImage] = useState(false)

  const loadPosts = async () => {
    setLoading(true)
    try {
      const res = await instagramApi.list({ active_only: false })
      if (Array.isArray(res.data)) {
        setPosts(res.data)
      } else {
        setPosts([])
      }
    } catch {
      toast.error('Failed to load Instagram posts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPosts()
  }, [])

  const handleOpenCreate = () => {
    setSelected(null)
    setForm({
      post_url: '',
      image_url: '',
      caption: '',
      likes_count: Math.floor(Math.random() * 200) + 50,
      comments_count: Math.floor(Math.random() * 20) + 5,
      is_active: true,
    })
    setShowModal(true)
  }

  const handleOpenEdit = (post: any) => {
    setSelected(post)
    setForm({
      post_url: post.post_url || '',
      image_url: post.image_url || '',
      caption: post.caption || '',
      likes_count: post.likes_count || 0,
      comments_count: post.comments_count || 0,
      is_active: post.is_active ?? true,
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
      toast.success('Post image uploaded successfully!')
    } catch {
      toast.error('Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this post?')) return
    try {
      await instagramApi.delete(id)
      toast.success('Post deleted successfully')
      loadPosts()
    } catch {
      toast.error('Failed to delete post')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.post_url) {
      toast.error('Post URL is required')
      return
    }
    if (!form.image_url) {
      toast.error('Image URL/Upload is required')
      return
    }
    try {
      if (selected) {
        // Edit mode
        await instagramApi.update(selected.id, form)
        toast.success('Instagram post updated successfully')
      } else {
        // Create mode
        await instagramApi.create(form)
        toast.success('Instagram post added successfully')
      }
      setShowModal(false)
      loadPosts()
    } catch {
      toast.error('Failed to save post details')
    }
  }

  const filteredPosts = posts.filter(p => {
    const term = search.toLowerCase()
    return (p.caption || '').toLowerCase().includes(term) || (p.post_url || '').toLowerCase().includes(term)
  })

  return (
      <div className="p-6 md:p-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-2xl text-trust-900 flex items-center gap-2">
              <Instagram className="text-pink-500" size={24} />
              Instagram Feed Mockup Manager
            </h1>
            <p className="text-slate-500 text-sm mt-1">Add, edit, or remove Instagram posts. These will render dynamically inside the virtual 3D phone screen.</p>
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto">
            {/* Search bar */}
            <div className="relative flex-1 sm:w-64 sm:flex-none">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Search size={15} />
              </span>
              <input
                type="text"
                placeholder="Search captions/URLs..."
                className="input pl-9 pr-4 py-2 text-xs w-full border border-slate-200 rounded-xl outline-none focus:border-trust-500"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            
            <Button onClick={handleOpenCreate} className="gap-1.5 whitespace-nowrap bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 border-none">
              <Plus size={16} /> Link Instagram Post
            </Button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <EmptyState
            icon={<Instagram size={28} className="text-slate-300" />}
            title="No posts found"
            description={search ? "No posts match your search term." : "Click 'Link Instagram Post' to add your first post."}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredPosts.map((p) => (
              <Card
                key={p.id}
                className="overflow-hidden flex flex-col justify-between hover:border-pink-200 transition-all group"
              >
                <div>
                  {/* Photo wrapper */}
                  <div className="relative aspect-square w-full bg-slate-50 flex items-center justify-center border-b border-slate-100 overflow-hidden">
                    {p.image_url ? (
                      <img src={p.image_url} alt="Instagram Post" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <Instagram size={48} className="text-slate-200" />
                    )}
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-slate-500 font-medium truncate flex-1" title={p.post_url}>
                        {p.post_url}
                      </p>
                      {p.is_active ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sage-700 bg-sage-50 px-2 py-0.5 rounded-md border border-sage-100 shrink-0">
                          <Eye size={10} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200 shrink-0">
                          <EyeOff size={10} /> Inactive
                        </span>
                      )}
                    </div>
                    {p.caption && (
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {p.caption}
                      </p>
                    )}
                    <div className="flex items-center gap-4 pt-1 text-slate-500 text-xs font-semibold">
                      <span className="flex items-center gap-1">
                        <Heart size={13} className="text-red-500 fill-red-500/20" /> {p.likes_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle size={13} className="text-blue-500 fill-blue-500/10" /> {p.comments_count}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <a href={p.post_url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-pink-600 hover:underline flex items-center gap-1">
                    <Globe size={12} /> Open Link
                  </a>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="p-2 rounded-lg bg-white border border-slate-200 hover:border-pink-300 text-slate-500 hover:text-pink-600 transition-colors shadow-2xs"
                      title="Edit Post"
                    >
                      <Edit size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-2 rounded-lg bg-white border border-slate-200 hover:border-red-200 text-slate-500 hover:text-red-600 transition-colors shadow-2xs"
                      title="Delete Post"
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
                  <Instagram className="text-pink-500" size={20} />
                  <h2 className="font-display text-lg text-trust-900">
                    {selected ? 'Edit Instagram Post' : 'Link Instagram Post'}
                  </h2>
                </div>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-4">
                  <div>
                    <label className="label">Instagram Post URL *</label>
                    <input
                      className="input text-sm"
                      placeholder="e.g. https://www.instagram.com/p/CeEducationPost/"
                      value={form.post_url}
                      onChange={e => setForm(f => ({ ...f, post_url: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <label className="label text-xs font-bold text-slate-700">Post Image *</label>
                    <div className="space-y-2">
                      <div className="flex gap-4 items-center">
                        <label className="flex-1 border-2 border-dashed border-slate-200 hover:border-pink-400 rounded-2xl p-4 text-center cursor-pointer flex flex-col items-center gap-1.5 transition-colors">
                          <Camera size={20} className="text-slate-400" />
                          <span className="text-xs text-slate-500 font-medium">
                            {uploadingImage ? 'Uploading image...' : 'Click to upload post image'}
                          </span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                        </label>
                        {form.image_url && (
                          <div className="w-20 h-20 rounded-xl overflow-hidden shadow-inner border border-slate-100 bg-slate-50 shrink-0 relative group flex items-center justify-center p-1">
                            <img src={form.image_url} alt="Instagram Preview" className="h-full w-full object-cover rounded-lg" />
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
                          placeholder="Or paste post image URL (e.g. static path / web URL)..."
                          value={form.image_url}
                          onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="label">Caption / Description</label>
                    <textarea
                      className="input text-sm h-24 py-2 resize-none"
                      placeholder="Enter post description/hashtags..."
                      value={form.caption}
                      onChange={e => setForm(f => ({ ...f, caption: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Likes Mock Count</label>
                      <input
                        type="number"
                        className="input text-sm"
                        value={form.likes_count}
                        onChange={e => setForm(f => ({ ...f, likes_count: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <label className="label">Comments Mock Count</label>
                      <input
                        type="number"
                        className="input text-sm"
                        value={form.comments_count}
                        onChange={e => setForm(f => ({ ...f, comments_count: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      className="w-4 h-4 text-pink-600 border-slate-300 rounded focus:ring-pink-500"
                      checked={form.is_active}
                      onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                    />
                    <label htmlFor="is_active" className="text-xs font-semibold text-slate-700 select-none cursor-pointer">
                      Mark as Active (will show on the phone screen feed)
                    </label>
                  </div>
                </div>

                <div className="p-6 border-t border-slate-100 flex gap-3 justify-end bg-slate-50">
                  <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                  <Button type="submit" className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 border-none text-white font-bold">
                    {selected ? 'Save Changes' : 'Link Post'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
  )
}
