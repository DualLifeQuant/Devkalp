import { useEffect, useState } from 'react'
import { Plus, School, Users, CheckCircle, Calendar, X, Camera, Video } from 'lucide-react'
import { HeartHandshake, Briefcase, Leaf, Heart } from 'lucide-react'
import AdminLayout from '@/components/layout/AdminLayout'
import { Badge, Button, Card, Spinner, StatsCard, EmptyState } from '@/components/ui'
import { campaignsApi, sessionApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

const isVideoUrl = (url: string): boolean => {
  if (!url) return false
  const videoExtensions = ['.mp4', '.webm', '.mov', '.ogg', '.mkv', '.avi']
  const lowerUrl = url.toLowerCase()
  return (
    videoExtensions.some(ext => lowerUrl.endsWith(ext) || lowerUrl.includes(ext + '?')) ||
    lowerUrl.includes('/video/upload/')
  )
}


export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [sessions, setSessions] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sessionLoading, setSessionLoading] = useState(false)
  const [showNewSession, setShowNewSession] = useState(false)
  const [showAttendance, setShowAttendance] = useState<any>(null)
  const [newSession, setNewSession] = useState({ title: '', school_name: '', session_date: '', duration_minutes: 90, facilitator_name: '', topics_covered: '' })
  const [attendance, setAttendance] = useState({ girls: 0, boys: 0, teachers: 0, notes: '', outcomes: '', challenges: '' })

  // Campaign Form State
  const [showCampaignModal, setShowCampaignModal] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<any>(null)
  const [campaignForm, setCampaignForm] = useState({
    title: '',
    category: 'health',
    city: '',
    venue: '',
    event_date: '',
    short_description: '',
    description: '',
    notes: '',
    cover_image: '',
    media_gallery: [] as string[],
    status: 'active',
    is_registration_open: true,
    max_registrations: 100,
  })
  const [uploadingCover, setUploadingCover] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)

  const loadCampaigns = async () => {
    setLoading(true)
    try {
      const r = await campaignsApi.list({ limit: 30 })
      setCampaigns(r.data.items || [])
    } catch {
      toast.error('Failed to load campaigns')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCampaigns()
  }, [])

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingCover(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await campaignsApi.uploadImage(formData)
      setCampaignForm(prev => ({ ...prev, cover_image: res.data.url }))
      toast.success('Cover image uploaded!')
    } catch {
      toast.error('Failed to upload cover image')
    } finally {
      setUploadingCover(false)
    }
  }

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploadingGallery(true)
    const uploadedUrls: string[] = []
    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData()
        formData.append('file', files[i])
        const res = await campaignsApi.uploadImage(formData)
        uploadedUrls.push(res.data.url)
      }
      setCampaignForm(prev => ({
        ...prev,
        media_gallery: [...prev.media_gallery, ...uploadedUrls]
      }))
      toast.success(`Uploaded ${files.length} photo(s)!`)
    } catch {
      toast.error('Failed to upload some gallery photos')
    } finally {
      setUploadingGallery(false)
    }
  }

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploadingVideo(true)
    const uploadedUrls: string[] = []
    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData()
        formData.append('file', files[i])
        const res = await campaignsApi.uploadVideo(formData)
        uploadedUrls.push(res.data.url)
      }
      setCampaignForm(prev => ({
        ...prev,
        media_gallery: [...prev.media_gallery, ...uploadedUrls]
      }))
      toast.success(`Uploaded ${files.length} video(s)!`)
    } catch {
      toast.error('Failed to upload some gallery videos')
    } finally {
      setUploadingVideo(false)
    }
  }

  const removeGalleryPhoto = (url: string) => {
    setCampaignForm(prev => ({
      ...prev,
      media_gallery: prev.media_gallery.filter(u => u !== url)
    }))
  }

  const saveCampaign = async () => {
    if (!campaignForm.title || !campaignForm.description) {
      toast.error('Title and description are required')
      return
    }
    try {
      if (editingCampaign) {
        await campaignsApi.update(editingCampaign.id, campaignForm)
        toast.success('Campaign updated successfully!')
      } else {
        await campaignsApi.create(campaignForm)
        toast.success('Campaign created successfully!')
      }
      setShowCampaignModal(false)
      loadCampaigns()
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to save campaign')
    }
  }

  const handleEditCampaign = async (c: any) => {
    setEditingCampaign(c)
    const loadId = toast.loading('Loading campaign details...')
    try {
      const res = await campaignsApi.get(c.slug)
      const full = res.data
      setCampaignForm({
        title: full.title || '',
        category: full.category || 'health',
        city: full.city || '',
        venue: full.venue || '',
        event_date: full.event_date ? new Date(full.event_date).toISOString().slice(0, 16) : '',
        short_description: full.short_description || '',
        description: full.description || '',
        notes: full.notes || '',
        cover_image: full.cover_image || '',
        media_gallery: full.media_gallery || [],
        status: full.status || 'active',
        is_registration_open: full.is_registration_open !== false,
        max_registrations: full.max_registrations || 100,
      })
      toast.dismiss(loadId)
      setShowCampaignModal(true)
    } catch {
      toast.dismiss(loadId)
      toast.error('Failed to load campaign details')
    }
  }

  const loadCampaignSessions = async (campaign: any) => {
    setSelected(campaign)
    setSessionLoading(true)
    try {
      const [sRes, aRes] = await Promise.allSettled([
        sessionApi.byCampaign(campaign.id),
        sessionApi.analytics(campaign.id),
      ])
      if (sRes.status === 'fulfilled') setSessions(sRes.value.data || [])
      if (aRes.status === 'fulfilled') setAnalytics(aRes.value.data)
    } catch { toast.error('Failed to load sessions') }
    finally { setSessionLoading(false) }
  }

  const createSession = async () => {
    if (!newSession.title || !newSession.session_date) { toast.error('Title and date required'); return }
    try {
      await sessionApi.create({
        ...newSession,
        campaign_id: selected.id,
        topics_covered: newSession.topics_covered ? newSession.topics_covered.split(',').map(s => s.trim()) : [],
        session_number: sessions.length + 1,
      })
      toast.success('Session created!')
      setShowNewSession(false)
      setNewSession({ title: '', school_name: '', session_date: '', duration_minutes: 90, facilitator_name: '', topics_covered: '' })
      loadCampaignSessions(selected)
    } catch (e: any) { toast.error(e?.response?.data?.detail || 'Failed') }
  }

  const recordAttendance = async () => {
    try {
      await sessionApi.bulkAttendance(showAttendance.id, attendance)
      toast.success('Attendance recorded!')
      setShowAttendance(null)
      setAttendance({ girls: 0, boys: 0, teachers: 0, notes: '', outcomes: '', challenges: '' })
      loadCampaignSessions(selected)
    } catch { toast.error('Failed to record attendance') }
  }

  return (
    <AdminLayout>
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl text-trust-900">Campaigns & Sessions</h1>
            <p className="text-slate-500 text-sm mt-1">Track school visits, attendance, and impact.</p>
          </div>
          {!selected && (
            <Button size="sm" variant="secondary" onClick={() => {
              setEditingCampaign(null);
              setCampaignForm({
                title: '',
                category: 'health',
                city: '',
                venue: '',
                event_date: '',
                short_description: '',
                description: '',
                notes: '',
                cover_image: '',
                media_gallery: [],
                status: 'active',
                is_registration_open: true,
                max_registrations: 100,
              });
              setShowCampaignModal(true);
            }}>
              <Plus size={15} /> New Campaign
            </Button>
          )}
          {selected && (
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => { setSelected(null); setSessions([]); setAnalytics(null) }}>← All Campaigns</Button>
              <Button size="sm" variant="secondary" onClick={() => setShowNewSession(true)}>
                <Plus size={15} /> New Session
              </Button>
            </div>
          )}
        </div>

        {loading ? <div className="flex justify-center py-16"><Spinner size="lg" /></div> : !selected ? (
          /* Campaign List */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaigns.map(c => (
              <Card key={c.id} className="p-5 flex flex-col justify-between" hover>
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-display text-base text-trust-900 leading-tight flex-1 mr-2">{c.title}</h3>
                    <Badge status={c.status} />
                  </div>
                  <p className="text-sm text-slate-500 mb-3 capitalize">{c.category}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                    {c.city && <span className="flex items-center gap-1"><School size={12} /> {c.city}</span>}
                    <span className="flex items-center gap-1"><Users size={12} /> {c.registration_count || 0} registered</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="ghost" className="flex-1 justify-center" onClick={() => loadCampaignSessions(c)}>
                    Sessions
                  </Button>
                  <Button size="sm" variant="secondary" className="px-3" onClick={() => handleEditCampaign(c)}>
                    Edit
                  </Button>
                </div>
              </Card>
            ))}
            {campaigns.length === 0 && <EmptyState icon={<Leaf size={24} />} title="No campaigns yet" />}
          </div>
        ) : (
          /* Campaign Sessions View */
          <div className="space-y-6">
            {/* Campaign header */}
            <Card className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center shrink-0">
                  <Leaf size={18} className="text-sage-700" />
                </div>
                <div>
                  <h2 className="font-display text-xl text-trust-900">{selected.title}</h2>
                  <p className="text-xs text-slate-400 capitalize">{selected.category}</p>
                </div>
              </div>
            </Card>

            {/* Analytics */}
            {analytics && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard label="Total Sessions" value={analytics.total_sessions} icon={<Calendar size={18} />} color="trust" />
                <StatsCard label="Completed" value={analytics.completed_sessions} icon={<CheckCircle size={18} />} color="sage" />
                <StatsCard label="Students Reached" value={(analytics.total_students_reached || 0).toLocaleString('en-IN')} icon={<Users size={18} />} color="saffron" />
                <StatsCard label="Unique Schools" value={analytics.unique_schools} icon={<School size={18} />} color="trust" />
              </div>
            )}

            {/* Gender breakdown */}
            {analytics && (analytics.girls_reached > 0 || analytics.boys_reached > 0) && (
              <Card className="p-5">
                <p className="font-semibold text-slate-700 text-sm mb-4">Attendance Breakdown</p>
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <p className="font-display text-2xl text-trust-800">{(analytics.girls_reached || 0).toLocaleString()}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Girls</p>
                  </div>
                  <div>
                    <p className="font-display text-2xl text-sage-700">{(analytics.boys_reached || 0).toLocaleString()}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Boys</p>
                  </div>
                  <div>
                    <p className="font-display text-2xl text-saffron-700">{(analytics.teachers_reached || 0).toLocaleString()}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Teachers</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Sessions List */}
            {sessionLoading ? <div className="flex justify-center py-8"><Spinner /></div> : (
              <div className="space-y-3">
                {sessions.length === 0 ? (
                  <EmptyState icon={<Calendar size={24} />} title="No sessions yet" description="Create your first session." action={<Button size="sm" onClick={() => setShowNewSession(true)}>Add Session</Button>} />
                ) : sessions.map((s: any) => (
                  <Card key={s.id} className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={clsx(
                        'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg',
                        s.status === 'completed' ? 'bg-sage-100 text-sage-600' : 'bg-saffron-100 text-saffron-600'
                      )}>
                        {s.status === 'completed' ? <CheckCircle size={18} /> : <Calendar size={18} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-semibold text-slate-800 text-sm">{s.title}</p>
                          <span className={clsx('badge text-xs', s.status === 'completed' ? 'badge-approved' : 'badge-pending')}>
                            {s.status}
                          </span>
                        </div>
                        {s.school_name && (
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <School size={11} /> {s.school_name}
                          </p>
                        )}
                        <div className="flex gap-4 mt-2 text-xs text-slate-400">
                          <span>📅 {new Date(s.session_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          <span>⏱ {s.duration_minutes} mins</span>
                          {s.total_attended > 0 && <span>👥 {s.total_attended} attended</span>}
                        </div>
                        {s.topics_covered?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {s.topics_covered.map((t: string) => (
                              <span key={t} className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-lg">{t}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      {s.status !== 'completed' && (
                        <Button size="sm" variant="secondary" onClick={() => setShowAttendance(s)}>
                          Record Attendance
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* New Session Modal */}
        {showNewSession && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowNewSession(false)}>
            <div className="bg-white rounded-3xl shadow-float w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-display text-xl text-trust-900">Create Session</h2>
                <button onClick={() => setShowNewSession(false)}><X size={18} /></button>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { label: 'Session Title *', key: 'title', placeholder: 'e.g. Menstrual Hygiene Awareness – Day 1' },
                  { label: 'School Name', key: 'school_name', placeholder: 'Government Middle School, Wardha' },
                  { label: 'Facilitator', key: 'facilitator_name', placeholder: 'Name of facilitator / volunteer' },
                  { label: 'Topics Covered (comma-separated)', key: 'topics_covered', placeholder: 'hygiene, nutrition, awareness' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="label">{f.label}</label>
                    <input className="input text-sm" placeholder={f.placeholder}
                      value={(newSession as any)[f.key]} onChange={e => setNewSession(prev => ({ ...prev, [f.key]: e.target.value }))} />
                  </div>
                ))}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="label">Session Date & Time *</label>
                    <input type="datetime-local" className="input text-sm"
                      value={newSession.session_date} onChange={e => setNewSession(prev => ({ ...prev, session_date: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">Duration (min)</label>
                    <input type="number" className="input text-sm" value={newSession.duration_minutes}
                      onChange={e => setNewSession(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) }))} />
                  </div>
                </div>
                <Button onClick={createSession} className="w-full justify-center">Create Session</Button>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Modal */}
        {showAttendance && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowAttendance(null)}>
            <div className="bg-white rounded-3xl shadow-float w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="font-display text-xl text-trust-900">Record Attendance</h2>
                  <p className="text-xs text-slate-400 mt-0.5">{showAttendance.title}</p>
                </div>
                <button onClick={() => setShowAttendance(null)}><X size={18} /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Girls', key: 'girls', emoji: '👧' },
                    { label: 'Boys', key: 'boys', emoji: '👦' },
                    { label: 'Teachers', key: 'teachers', emoji: '👩‍🏫' },
                  ].map(f => (
                    <div key={f.key} className="text-center">
                      <p className="text-2xl mb-1">{f.emoji}</p>
                      <label className="label text-center">{f.label}</label>
                      <input type="number" min="0" className="input text-center text-lg font-semibold"
                        value={(attendance as any)[f.key]}
                        onChange={e => setAttendance(prev => ({ ...prev, [f.key]: parseInt(e.target.value) || 0 }))} />
                    </div>
                  ))}
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-slate-500">Total</p>
                  <p className="font-display text-3xl font-semibold text-trust-800">
                    {attendance.girls + attendance.boys + attendance.teachers}
                  </p>
                </div>
                {[
                  { label: 'Session Notes', key: 'notes', placeholder: 'How did the session go?' },
                  { label: 'Key Outcomes', key: 'outcomes', placeholder: 'What was achieved?' },
                  { label: 'Challenges', key: 'challenges', placeholder: 'Any difficulties faced?' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="label">{f.label}</label>
                    <textarea className="input resize-none text-sm" rows={2} placeholder={f.placeholder}
                      value={(attendance as any)[f.key]}
                      onChange={e => setAttendance(prev => ({ ...prev, [f.key]: e.target.value }))} />
                  </div>
                ))}
                <Button onClick={recordAttendance} variant="sage" className="w-full justify-center">
                  <CheckCircle size={16} /> Save Attendance
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Create / Edit Campaign Modal */}
        {showCampaignModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowCampaignModal(false)}>
            <div className="bg-white rounded-3xl shadow-float w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-display text-xl text-trust-900">
                  {editingCampaign ? 'Edit Campaign Details' : 'Create New Campaign'}
                </h2>
                <button onClick={() => setShowCampaignModal(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
              </div>
              
              <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Left Column: Basic Info */}
                  <div className="space-y-4">
                    <div>
                      <label className="label">Campaign Title *</label>
                      <input className="input text-sm" placeholder="e.g. Swasthya Kanya Health Campaign"
                        value={campaignForm.title} onChange={e => setCampaignForm(prev => ({ ...prev, title: e.target.value }))} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="label">Category *</label>
                        <select className="input text-sm appearance-none bg-no-repeat bg-[right_12px_center]"
                          value={campaignForm.category} onChange={e => setCampaignForm(prev => ({ ...prev, category: e.target.value }))}>
                          <option value="health">Health</option>
                          <option value="education">Education</option>
                          <option value="environment">Environment</option>
                          <option value="community">Community</option>
                        </select>
                      </div>
                      <div>
                        <label className="label">Status</label>
                        <select className="input text-sm"
                          value={campaignForm.status} onChange={e => setCampaignForm(prev => ({ ...prev, status: e.target.value }))}>
                          <option value="active">Active</option>
                          <option value="draft">Draft</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="label">City</label>
                        <input className="input text-sm" placeholder="e.g. Surat"
                          value={campaignForm.city} onChange={e => setCampaignForm(prev => ({ ...prev, city: e.target.value }))} />
                      </div>
                      <div>
                        <label className="label">Venue</label>
                        <input className="input text-sm" placeholder="e.g. municipal school"
                          value={campaignForm.venue} onChange={e => setCampaignForm(prev => ({ ...prev, venue: e.target.value }))} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="label">Event Date & Time</label>
                        <input type="datetime-local" className="input text-sm"
                          value={campaignForm.event_date} onChange={e => setCampaignForm(prev => ({ ...prev, event_date: e.target.value }))} />
                      </div>
                      <div>
                        <label className="label">Max Registrations</label>
                        <input type="number" className="input text-sm"
                          value={campaignForm.max_registrations} onChange={e => setCampaignForm(prev => ({ ...prev, max_registrations: parseInt(e.target.value) || 0 }))} />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <input type="checkbox" id="reg-open" className="w-4 h-4 rounded text-trust-600 focus:ring-trust-500 border-slate-300"
                        checked={campaignForm.is_registration_open} onChange={e => setCampaignForm(prev => ({ ...prev, is_registration_open: e.target.checked }))} />
                      <label htmlFor="reg-open" className="text-sm font-semibold text-slate-700 select-none cursor-pointer">Allow public registrations</label>
                    </div>

                    <div>
                      <label className="label">Short Description</label>
                      <textarea className="input resize-none text-sm" rows={2} placeholder="A short catchphrase or description..."
                        value={campaignForm.short_description} onChange={e => setCampaignForm(prev => ({ ...prev, short_description: e.target.value }))} />
                    </div>

                    <div>
                      <label className="label">Full Description *</label>
                      <textarea className="input resize-none text-sm" rows={4} placeholder="Detailed campaign overview and goals..."
                        value={campaignForm.description} onChange={e => setCampaignForm(prev => ({ ...prev, description: e.target.value }))} />
                    </div>
                  </div>

                  {/* Right Column: Media, Photos & Notes */}
                  <div className="space-y-4">
                    <div>
                      <label className="label">Cover Image</label>
                      <div className="flex gap-4 items-center">
                        <label className="flex-1 border-2 border-dashed border-slate-200 hover:border-trust-400 rounded-2xl p-4 text-center cursor-pointer flex flex-col items-center gap-1.5 transition-colors">
                          <Camera size={20} className="text-slate-400" />
                          <span className="text-xs text-slate-500 font-medium">
                            {uploadingCover ? 'Uploading cover...' : 'Upload cover photo'}
                          </span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} disabled={uploadingCover} />
                        </label>
                        {campaignForm.cover_image && (
                          <div className="w-24 h-20 rounded-xl overflow-hidden shadow-inner border border-slate-100 shrink-0 relative group">
                            <img src={campaignForm.cover_image} alt="Cover Preview" className="w-full h-full object-cover" />
                            <button type="button" onClick={() => setCampaignForm(prev => ({ ...prev, cover_image: '' }))}
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="label">Gallery Photos</label>
                      <div className="space-y-3">
                        <label className="border-2 border-dashed border-slate-200 hover:border-trust-400 rounded-2xl p-4 text-center cursor-pointer flex flex-col items-center gap-1.5 transition-colors">
                          <Camera size={20} className="text-slate-400" />
                          <span className="text-xs text-slate-500 font-medium">
                            {uploadingGallery ? 'Uploading photos...' : 'Select and upload multiple gallery photos'}
                          </span>
                          <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} disabled={uploadingGallery} />
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="label">Gallery Videos</label>
                      <div className="space-y-3">
                        <label className="border-2 border-dashed border-slate-200 hover:border-trust-400 rounded-2xl p-4 text-center cursor-pointer flex flex-col items-center gap-1.5 transition-colors">
                          <Video size={20} className="text-slate-400" />
                          <span className="text-xs text-slate-500 font-medium">
                            {uploadingVideo ? 'Uploading videos...' : 'Select and upload multiple gallery videos'}
                          </span>
                          <input type="file" accept="video/*" multiple className="hidden" onChange={handleVideoUpload} disabled={uploadingVideo} />
                        </label>
                      </div>
                    </div>

                    {campaignForm.media_gallery.length > 0 && (
                      <div>
                        <label className="label">Uploaded Media Gallery</label>
                        <div className="grid grid-cols-4 gap-2 pt-1">
                          {campaignForm.media_gallery.map((url, idx) => (
                            <div key={idx} className="aspect-square rounded-xl overflow-hidden border border-slate-100 shadow-inner relative group bg-slate-50">
                              {isVideoUrl(url) ? (
                                <video src={url} className="w-full h-full object-cover" muted />
                              ) : (
                                <img src={url} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                              )}
                              <button type="button" onClick={() => removeGalleryPhoto(url)}
                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}


                    <div>
                      <label className="label">Campaign Impact Notes (one note per line)</label>
                      <textarea className="input resize-none text-sm" rows={5} placeholder="Write key outcomes / impact notes here&#10;e.g. Over 100+ community members directly benefited&#10;e.g. Successfully partnered with municipal schools"
                        value={campaignForm.notes} onChange={e => setCampaignForm(prev => ({ ...prev, notes: e.target.value }))} />
                    </div>
                  </div>

                </div>
              </div>
              
              <div className="p-6 border-t border-slate-100 flex gap-3 justify-end bg-slate-50 rounded-b-3xl">
                <Button variant="ghost" onClick={() => setShowCampaignModal(false)}>Cancel</Button>
                <Button variant="secondary" onClick={saveCampaign}>
                  {editingCampaign ? 'Save Changes' : 'Create Campaign'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
