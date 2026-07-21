import { useEffect, useState } from 'react'
import { UserCheck, Plus, X, Calendar, Heart } from 'lucide-react'
import { Button, Card, Spinner, EmptyState, StatsCard } from '@/components/ui'
import { counselorsApi, matrimonyApi } from '@/lib/api'
import toast from 'react-hot-toast'

export default function AdminCounselorsPage() {
  const [counselors, setCounselors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAssign, setShowAssign] = useState(false)
  const [assignData, setAssignData] = useState({ 
    counselor_profile_id: '', 
    matrimony_profile_id: '', 
    matrimony_profile2_id: '', 
    session_date: '', 
    mode: 'video',
    relation_status: 'meeting_scheduled'
  })
  const [saving, setSaving] = useState(false)

  // Search/Select counselor state
  const [searchCounselor, setSearchCounselor] = useState('')
  const [showCounselorDropdown, setShowCounselorDropdown] = useState(false)
  const [selectedCounselor, setSelectedCounselor] = useState<any | null>(null)

  // Search/Select matrimony user 1 (Boy) state
  const [approvedMatrimonyProfiles, setApprovedMatrimonyProfiles] = useState<any[]>([])
  const [loadingMatrimony, setLoadingMatrimony] = useState(false)
  const [searchMatrimony, setSearchMatrimony] = useState('')
  const [showMatrimonyDropdown, setShowMatrimonyDropdown] = useState(false)
  const [selectedMatrimony, setSelectedMatrimony] = useState<any | null>(null)

  // Search/Select matrimony user 2 (Girl) state
  const [searchMatrimony2, setSearchMatrimony2] = useState('')
  const [showMatrimonyDropdown2, setShowMatrimonyDropdown2] = useState(false)
  const [selectedMatrimony2, setSelectedMatrimony2] = useState<any | null>(null)

  useEffect(() => {
    counselorsApi.adminAll()
      .then(r => setCounselors(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Fetch approved matrimony profiles when assign modal opens
  useEffect(() => {
    if (showAssign) {
      setLoadingMatrimony(true)
      matrimonyApi.adminProfiles({ status: 'approved', limit: 200 })
        .then(r => setApprovedMatrimonyProfiles(r.data.items || []))
        .catch(() => toast.error('Failed to load approved profiles'))
        .finally(() => setLoadingMatrimony(false))
    }
  }, [showAssign])

  const filteredCounselors = counselors.filter(c => 
    (c.user_name || '').toLowerCase().includes(searchCounselor.toLowerCase()) ||
    (c.specialization || '').toLowerCase().includes(searchCounselor.toLowerCase())
  )

  const filteredMatrimonyPartner1 = approvedMatrimonyProfiles.filter(p => 
    (p.id !== selectedMatrimony2?.id) &&
    ((p.user_name || '').toLowerCase().includes(searchMatrimony.toLowerCase()) ||
     (p.city || '').toLowerCase().includes(searchMatrimony.toLowerCase()) ||
     (p.gender || '').toLowerCase().includes(searchMatrimony.toLowerCase()))
  )

  const filteredMatrimonyPartner2 = approvedMatrimonyProfiles.filter(p => {
    if (selectedMatrimony) {
      return p.id !== selectedMatrimony.id && p.gender?.toLowerCase() !== selectedMatrimony.gender?.toLowerCase()
    }
    return p.id !== selectedMatrimony?.id
  }).filter(p => 
    (p.user_name || '').toLowerCase().includes(searchMatrimony2.toLowerCase()) ||
    (p.city || '').toLowerCase().includes(searchMatrimony2.toLowerCase()) ||
    (p.gender || '').toLowerCase().includes(searchMatrimony2.toLowerCase())
  )

  const handleSelectCounselor = (c: any) => {
    setSelectedCounselor(c)
    setAssignData(d => ({ ...d, counselor_profile_id: c.id }))
    setShowCounselorDropdown(false)
    setSearchCounselor('')
  }

  const handleClearCounselor = () => {
    setSelectedCounselor(null)
    setAssignData(d => ({ ...d, counselor_profile_id: '' }))
  }

  const handleSelectMatrimony = (p: any) => {
    setSelectedMatrimony(p)
    setAssignData(d => ({ ...d, matrimony_profile_id: p.id }))
    setShowMatrimonyDropdown(false)
    setSearchMatrimony('')
  }

  const handleClearMatrimony = () => {
    setSelectedMatrimony(null)
    setAssignData(d => ({ ...d, matrimony_profile_id: '' }))
  }

  const handleSelectMatrimony2 = (p: any) => {
    setSelectedMatrimony2(p)
    setAssignData(d => ({ ...d, matrimony_profile2_id: p.id }))
    setShowMatrimonyDropdown2(false)
    setSearchMatrimony2('')
  }

  const handleClearMatrimony2 = () => {
    setSelectedMatrimony2(null)
    setAssignData(d => ({ ...d, matrimony_profile2_id: '' }))
  }

  const handleCloseAssign = () => {
    setShowAssign(false)
    setAssignData({ 
      counselor_profile_id: '', 
      matrimony_profile_id: '', 
      matrimony_profile2_id: '', 
      session_date: '', 
      mode: 'video',
      relation_status: 'meeting_scheduled'
    })
    setSelectedCounselor(null)
    setSelectedMatrimony(null)
    setSelectedMatrimony2(null)
    setSearchCounselor('')
    setSearchMatrimony('')
    setSearchMatrimony2('')
  }

  const assignSession = async () => {
    if (!assignData.matrimony_profile_id) {
      toast.error('Please select the First Partner'); return
    }
    if (!assignData.session_date) {
      toast.error('Please select a session date & time'); return
    }
    setSaving(true)
    try {
      await counselorsApi.assignSession(assignData)
      toast.success('Session assigned successfully!')
      handleCloseAssign()
      // Refresh list
      counselorsApi.adminAll().then(r => setCounselors(r.data || []))
    } catch (e: any) { toast.error(e?.response?.data?.detail || 'Failed to assign session') }
    finally { setSaving(false) }
  }

  return (
    <>
      <div className="p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl text-trust-900">Counselors & Match Sessions</h1>
            <p className="text-slate-500 text-sm mt-0.5">Manage counselors and arrange counseling sessions between matrimony users (boy & girl).</p>
          </div>
          <Button size="sm" variant="secondary" onClick={() => setShowAssign(true)}>
            <Plus size={15} /> Arrange Session
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <StatsCard label="Active Counselors" value={counselors.filter((c: any) => c.is_active).length} icon={<UserCheck size={17} />} color="trust" />
          <StatsCard label="Total Sessions" value={counselors.reduce((s: number, c: any) => s + (c.total_sessions || 0), 0)} icon={<Calendar size={17} />} color="saffron" />
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {counselors.length === 0 ? (
              <div className="col-span-2">
                <EmptyState icon={<UserCheck size={22} />} title="No counselors yet"
                  description="Counselors register using the Counselor role and create their profile from the dashboard." />
              </div>
            ) : counselors.map((c: any) => (
              <Card key={c.id} className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-trust-100 text-trust-700 font-display font-semibold text-lg flex items-center justify-center shrink-0">
                    {c.user_name?.[0] || 'C'}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800">{c.user_name}</p>
                    <p className="text-xs text-slate-400">{c.user_email}</p>
                    {c.specialization && <p className="text-xs text-trust-600 mt-0.5 font-medium">{c.specialization}</p>}
                    <div className="flex gap-3 text-xs text-slate-400 mt-1.5">
                      <span>{c.years_experience} yrs experience</span>
                      <span className="font-medium text-trust-600">{c.total_sessions} sessions</span>
                    </div>
                    {c.languages?.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {c.languages.map((l: string) => (
                          <span key={l} className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-lg">{l}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {showAssign && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={handleCloseAssign}>
          <div className="bg-white rounded-3xl shadow-float w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-display text-xl text-trust-900">Arrange Counseling Session</h2>
              <button onClick={handleCloseAssign} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={16} /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-500 bg-slate-50 rounded-xl p-3 leading-relaxed">
                Select one or two matrimony users (groom and bride) to schedule a meeting and manage relationship status.
              </p>

              {/* Matrimony User 1 Selector */}
              <div className="relative">
                <label className="label text-xs font-semibold text-slate-700 mb-1 block">First Partner (Groom / Bride)</label>
                {selectedMatrimony ? (
                  <div className="flex items-center gap-3 p-3 bg-trust-50 rounded-2xl border border-trust-200">
                    <div className="w-10 h-10 rounded-xl bg-trust-100 overflow-hidden shrink-0">
                      {selectedMatrimony.photos?.[0] ? (
                        <img src={selectedMatrimony.photos[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-trust-700 font-bold text-sm">
                          {selectedMatrimony.user_name?.[0]}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-xs truncate">{selectedMatrimony.user_name}</p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {selectedMatrimony.age} yrs · {selectedMatrimony.gender} · {selectedMatrimony.city}
                      </p>
                    </div>
                    <button 
                      onClick={handleClearMatrimony}
                      className="p-1.5 rounded-lg hover:bg-trust-100 text-red-600 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <input 
                      className="input text-xs w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-trust-500" 
                      placeholder="Search candidate by name, gender, city..."
                      value={searchMatrimony}
                      onChange={e => {
                        setSearchMatrimony(e.target.value)
                        setShowMatrimonyDropdown(true)
                      }}
                      onFocus={() => setShowMatrimonyDropdown(true)}
                    />
                    {showMatrimonyDropdown && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowMatrimonyDropdown(false)} />
                        <div className="absolute left-0 right-0 z-20 mt-1 max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg p-1 space-y-1">
                          {loadingMatrimony ? (
                            <div className="p-3 text-center text-xs text-slate-400">Loading approved profiles...</div>
                          ) : filteredMatrimonyPartner1.length === 0 ? (
                            <div className="p-3 text-center text-xs text-slate-400">No matching approved profiles found</div>
                          ) : (
                            filteredMatrimonyPartner1.map(p => (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => handleSelectMatrimony(p)}
                                className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 text-left transition-colors"
                              >
                                <div className="w-8 h-8 rounded-lg bg-trust-100 overflow-hidden shrink-0">
                                  {p.photos?.[0] ? (
                                    <img src={p.photos[0]} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-trust-700 font-bold text-xs">
                                      {p.user_name?.[0]}
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-slate-800 truncate">{p.user_name}</p>
                                  <p className="text-[10px] text-slate-500 truncate">
                                    {p.age} yrs · {p.gender} · {p.city}
                                  </p>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>

              {/* Matrimony User 2 Selector */}
              <div className="relative">
                <label className="label text-xs font-semibold text-slate-700 mb-1 block">Second Partner (Groom / Bride) <span className="text-slate-400 font-normal">(Optional)</span></label>
                {selectedMatrimony2 ? (
                  <div className="flex items-center gap-3 p-3 bg-trust-50 rounded-2xl border border-trust-200">
                    <div className="w-10 h-10 rounded-xl bg-trust-100 overflow-hidden shrink-0">
                      {selectedMatrimony2.photos?.[0] ? (
                        <img src={selectedMatrimony2.photos[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-trust-700 font-bold text-sm">
                          {selectedMatrimony2.user_name?.[0]}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-xs truncate">{selectedMatrimony2.user_name}</p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {selectedMatrimony2.age} yrs · {selectedMatrimony2.gender} · {selectedMatrimony2.city}
                      </p>
                    </div>
                    <button 
                      onClick={handleClearMatrimony2}
                      className="p-1.5 rounded-lg hover:bg-trust-100 text-red-600 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <input 
                      className="input text-xs w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-trust-500" 
                      placeholder={selectedMatrimony ? `Search opposite gender (${selectedMatrimony.gender?.toLowerCase() === 'male' ? 'female' : 'male'}) by name, city...` : "Search candidate by name, gender, city..."}
                      value={searchMatrimony2}
                      onChange={e => {
                        setSearchMatrimony2(e.target.value)
                        setShowMatrimonyDropdown2(true)
                      }}
                      onFocus={() => setShowMatrimonyDropdown2(true)}
                    />
                    {showMatrimonyDropdown2 && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowMatrimonyDropdown2(false)} />
                        <div className="absolute left-0 right-0 z-20 mt-1 max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg p-1 space-y-1">
                          {loadingMatrimony ? (
                            <div className="p-3 text-center text-xs text-slate-400">Loading approved profiles...</div>
                          ) : filteredMatrimonyPartner2.length === 0 ? (
                            <div className="p-3 text-center text-xs text-slate-400">No matching approved profiles found</div>
                          ) : (
                            filteredMatrimonyPartner2.map(p => (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => handleSelectMatrimony2(p)}
                                className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 text-left transition-colors"
                              >
                                <div className="w-8 h-8 rounded-lg bg-trust-100 overflow-hidden shrink-0">
                                  {p.photos?.[0] ? (
                                    <img src={p.photos[0]} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-trust-700 font-bold text-xs">
                                      {p.user_name?.[0]}
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-slate-800 truncate">{p.user_name}</p>
                                  <p className="text-[10px] text-slate-500 truncate">
                                    {p.age} yrs · {p.gender} · {p.city}
                                  </p>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>

              {/* Relation / Match Status Dropdown (only if both selected) */}
              {selectedMatrimony && selectedMatrimony2 && (
                <div className="p-3.5 bg-rose-50/50 border border-rose-100 rounded-2xl space-y-2">
                  <div className="flex items-center gap-1.5 text-rose-700">
                    <Heart size={14} className="fill-rose-700" />
                    <span className="text-xs font-bold font-display uppercase tracking-wider">Relation & Match Status</span>
                  </div>
                  <select 
                    className="input bg-white text-xs w-full border border-slate-200 rounded-xl p-2" 
                    value={assignData.relation_status}
                    onChange={e => setAssignData(d => ({ ...d, relation_status: e.target.value }))}
                  >
                    <option value="suggested">Counselor Suggested</option>
                    <option value="interested">Mutual Interest</option>
                    <option value="meeting_scheduled">Meeting Scheduled</option>
                    <option value="accepted">Accepted (Match Fixed)</option>
                    <option value="declined">Declined</option>
                    <option value="closed">Closed</option>
                  </select>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    This will automatically create or update the matchmaking status history between these two profiles.
                  </p>
                </div>
              )}

              <div>
                <label className="label text-xs font-semibold text-slate-700 mb-1 block">Session Date & Time</label>
                <input type="datetime-local" className="input text-xs" value={assignData.session_date}
                  onChange={e => setAssignData(d => ({ ...d, session_date: e.target.value }))} />
              </div>
              <div>
                <label className="label text-xs font-semibold text-slate-700 mb-1 block">Mode</label>
                <select className="input bg-white text-xs" value={assignData.mode}
                  onChange={e => setAssignData(d => ({ ...d, mode: e.target.value }))}>
                  <option value="video">Video Call</option>
                  <option value="in-person">In-Person</option>
                  <option value="phone">Phone Call</option>
                </select>
              </div>
              <Button onClick={assignSession} loading={saving} className="w-full justify-center mt-2">
                <Calendar size={15} /> Arrange Session
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
