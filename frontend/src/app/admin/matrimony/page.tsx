import { useEffect, useState } from 'react'
import { HeartHandshake, Briefcase, Leaf, Heart, Users, Check, X, Eye, Link2, Calendar, MessageSquare, Bell, Sparkles, ChevronRight, Trash2 } from 'lucide-react'
import AdminLayout from '@/components/layout/AdminLayout'
import { Badge, Button, Card, Spinner, EmptyState } from '@/components/ui'
import { matrimonyApi, counselorsApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

export default function AdminMatrimonyPage() {
  const [profiles, setProfiles] = useState<any[]>([])
  const [matches, setMatches] = useState<any[]>([])
  const [interests, setInterests] = useState<any[]>([])
  const [filter, setFilter] = useState('pending')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)
  const [actionNotes, setActionNotes] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [suggestMode, setSuggestMode] = useState(false)
  const [suggestPair, setSuggestPair] = useState<[string,string]>(['',''])

  const [approvedProfiles, setApprovedProfiles] = useState<any[]>([])
  const [loadingApproved, setLoadingApproved] = useState(false)
  const [search1, setSearch1] = useState('')
  const [search2, setSearch2] = useState('')
  const [showDropdown1, setShowDropdown1] = useState(false)
  const [showDropdown2, setShowDropdown2] = useState(false)

  // Status updating state
  const [updatingMatchId, setUpdatingMatchId] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState('')

  // Arrange Meeting modal states
  const [showArrangeModal, setShowArrangeModal] = useState(false)
  const [selectedMatchForMeeting, setSelectedMatchForMeeting] = useState<any>(null)
  const [meetingDate, setMeetingDate] = useState('')
  const [meetingMode, setMeetingMode] = useState('video')
  const [familyPresent, setFamilyPresent] = useState(true)
  const [submittingMeeting, setSubmittingMeeting] = useState(false)

  useEffect(() => {
    if (suggestMode) {
      const fetchApproved = async () => {
        setLoadingApproved(true)
        try {
          const res = await matrimonyApi.adminProfiles({ status: 'approved', limit: 200 })
          setApprovedProfiles(res.data.items || [])
        } catch {
          toast.error('Failed to load approved profiles')
        } finally {
          setLoadingApproved(false)
        }
      }
      fetchApproved()
    }
  }, [suggestMode])

  const load = async () => {
    setLoading(true)
    try {
      if (filter === 'matches') {
        const res = await matrimonyApi.adminMatches()
        setMatches(res.data || [])
      } else if (filter === 'interests') {
        const res = await matrimonyApi.adminInterestsSummary()
        setInterests(res.data || [])
      } else {
        const res = await matrimonyApi.adminProfiles({ status: filter, limit: 50 })
        setProfiles(res.data.items || [])
      }
    } catch { toast.error('Failed to load profiles') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [filter])

  const approveProfile = async (id: string, approve: boolean) => {
    try {
      await matrimonyApi.adminApprove(id, {
        action: approve ? 'approve' : 'reject',
        notes: actionNotes,
        reason: rejectReason,
      })
      toast.success(approve ? 'Profile approved! User notified.' : 'Profile rejected.')
      setSelected(null)
      load()
    } catch { toast.error('Action failed') }
  }

  const handleDeleteProfile = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this matrimony profile? All associated matches and meetings will be deleted as well.")) return
    try {
      await matrimonyApi.adminDeleteProfile(id)
      toast.success("Profile deleted successfully")
      load()
    } catch {
      toast.error("Failed to delete profile")
    }
  }

  const suggestMatch = async () => {
    if (!suggestPair[0] || !suggestPair[1]) {
      toast.error('Select both profiles')
      return
    }
    try {
      await matrimonyApi.adminSuggest({ profile1_id: suggestPair[0], profile2_id: suggestPair[1], notes: actionNotes })
      toast.success('Match suggested! Both users notified.')
      setSuggestMode(false)
      setSuggestPair(['', ''])
      setActionNotes('')
      load()
    } catch (e: any) { toast.error(e?.response?.data?.detail || 'Failed') }
  }

  const handleUpdateMatchStatus = async (matchId: string, newStatus: string) => {
    try {
      await matrimonyApi.adminUpdateMatch(matchId, { status: newStatus })
      toast.success('Match status updated!')
      load()
    } catch {
      toast.error('Failed to update match status')
    }
  }

  const handleOpenArrangeMeeting = (match: any) => {
    setSelectedMatchForMeeting(match)
    setMeetingDate('')
    setMeetingMode('video')
    setFamilyPresent(true)
    setShowArrangeModal(true)
  }

  const handleArrangeMeetingSubmit = async () => {
    if (!meetingDate) {
      toast.error('Please select a meeting date & time')
      return
    }
    setSubmittingMeeting(true)
    try {
      await counselorsApi.assignSession({
        matrimony_profile_id: selectedMatchForMeeting.profile1_id,
        matrimony_profile2_id: selectedMatchForMeeting.profile2_id,
        session_date: meetingDate,
        mode: meetingMode,
        family_present: familyPresent,
        relation_status: 'meeting_scheduled',
      })
      toast.success('Family meeting arranged successfully!')
      setShowArrangeModal(false)
      setSelectedMatchForMeeting(null)
      load()
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Failed to arrange meeting')
    } finally {
      setSubmittingMeeting(false)
    }
  }

  return (
    <AdminLayout>
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl text-trust-900">Matrimony Profiles & Matches</h1>
            <p className="text-slate-500 text-sm mt-1">Review profiles, suggest matches, and track relations and meeting history.</p>
          </div>
          <Button size="sm" variant="secondary" onClick={() => setSuggestMode(true)}>
            <Link2 size={15} /> Suggest Match
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['pending', 'approved', 'rejected', 'matches', 'interests', 'all'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={clsx('px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors',
                filter === f ? 'bg-trust-800 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-trust-300')}>
              {f === 'matches' ? 'Matches & Relations' : f === 'interests' ? 'User Interests' : f}
            </button>
          ))}
        </div>

        {loading ? <div className="flex justify-center py-16"><Spinner size="lg" /></div> : (
          <>
            {filter === 'interests' ? (
              interests.length === 0 ? (
                <EmptyState icon={<Heart size={24} className="text-rose-500" />} title="No user interests recorded" description="When candidates express interest in other profiles, they will appear here." />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {interests.map((userInterest: any) => (
                    <Card key={userInterest.profile_id} className="p-6 border border-slate-100/80 bg-white relative overflow-hidden group shadow-sm hover:shadow-md transition-all duration-200 rounded-3xl">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500"></div>
                      
                      {/* User Header */}
                      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                        <div className="w-12 h-12 rounded-2xl bg-trust-50 border border-trust-100 overflow-hidden shrink-0">
                          {userInterest.photos?.[0] ? (
                            <img src={userInterest.photos[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-trust-700 font-display text-lg font-bold">
                              {userInterest.name?.[0] || '?'}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <h3 className="font-semibold text-slate-800 text-sm truncate flex items-center gap-1.5">
                            {userInterest.name}
                            <span className={`inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                              userInterest.gender === 'male' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-pink-50 text-pink-600 border border-pink-100'
                            }`}>
                              {userInterest.gender === 'male' ? 'Groom' : 'Bride'}
                            </span>
                          </h3>
                          <p className="text-xs text-slate-400">{userInterest.age} yrs · {userInterest.city}</p>
                        </div>
                        <div className="bg-rose-50 border border-rose-100 text-rose-600 text-[10px] px-2 py-1 rounded-xl font-bold flex items-center gap-1 shrink-0">
                          <Heart size={10} className="fill-rose-600" />
                          {userInterest.interested_count} {userInterest.interested_count === 1 ? 'Like' : 'Likes'}
                        </div>
                      </div>

                      {/* Interested In profiles */}
                      <div className="mt-4 space-y-3">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-left">Interested in:</p>
                        {userInterest.interested_in.map((target: any) => (
                          <div key={target.profile_id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50/70 hover:bg-slate-50 border border-slate-100 rounded-2xl transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                                {target.photos?.[0] ? (
                                  <img src={target.photos[0]} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-400 font-display text-sm font-semibold">
                                    {target.name?.[0] || '?'}
                                  </div>
                                )}
                              </div>
                              <div className="text-left min-w-0">
                                <p className="text-xs font-semibold text-slate-800 truncate flex items-center gap-1">
                                  {target.name}
                                  <span className="text-[10px] text-slate-400 font-normal">({target.city})</span>
                                </p>
                                <p className="text-[10px] text-slate-400 capitalize">{target.gender}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap self-end sm:self-auto">
                              {target.liked_back ? (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-lg shrink-0">
                                  <Sparkles size={9} /> Mutual
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[9px] font-medium text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded-lg shrink-0">
                                  Sent
                                </span>
                              )}

                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedMatchForMeeting({
                                    profile1_id: userInterest.profile_id,
                                    profile1_name: userInterest.name,
                                    profile1_gender: userInterest.gender,
                                    profile2_id: target.profile_id,
                                    profile2_name: target.name,
                                    profile2_gender: target.gender,
                                  });
                                  setMeetingDate('');
                                  setMeetingMode('video');
                                  setFamilyPresent(true);
                                  setShowArrangeModal(true);
                                }}
                                className={clsx(
                                  'py-1 px-2.5 text-[10px] font-bold rounded-xl flex items-center gap-1 shrink-0',
                                  target.liked_back 
                                    ? 'bg-rose-600 text-white hover:bg-rose-700' 
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                                )}
                              >
                                <Calendar size={10} /> Arrange Meeting
                              </Button>

                              {!target.liked_back && (
                                <button
                                  onClick={async () => {
                                    try {
                                      await matrimonyApi.adminNotifySuggest(target.match_id)
                                      toast.success(`Suggested / Nudged ${target.name} successfully!`)
                                    } catch {
                                      toast.error('Failed to suggest match')
                                    }
                                  }}
                                  title="Suggest match to partner / Nudge response"
                                  className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-trust-400 text-trust-600 transition-colors"
                                >
                                  <Bell size={10} />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              )
            ) : filter === 'matches' ? (
              matches.length === 0 ? (
                <EmptyState icon={<HeartHandshake size={24} />} title="No matches found" description="Suggested matches between grooms and brides will appear here." />
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {matches.map((m: any) => (
                    <Card key={m.id} className="p-6 border border-slate-100">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                        {/* Partners overview */}
                        <div className="flex items-center gap-4 flex-wrap md:flex-nowrap">
                          {/* Groom */}
                          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-left min-w-[200px]">
                            <p className="text-[10px] text-trust-600 font-bold uppercase tracking-wider mb-1">Groom (Boy)</p>
                            <p className="font-semibold text-slate-800 text-sm">{m.profile1_name}</p>
                            <p className="text-xs text-slate-400 capitalize">{m.profile1_gender}</p>
                            {m.profile1_response && (
                              <span className="inline-block text-[9px] font-bold text-sage-600 bg-sage-50 border border-sage-100 px-2 py-0.5 rounded-md mt-1 capitalize">
                                Response: {m.profile1_response}
                              </span>
                            )}
                          </div>

                          <div className="text-slate-300 font-display font-medium text-lg">➕</div>

                          {/* Bride */}
                          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-left min-w-[200px]">
                            <p className="text-[10px] text-rose-600 font-bold uppercase tracking-wider mb-1">Bride (Girl)</p>
                            <p className="font-semibold text-slate-800 text-sm">{m.profile2_name}</p>
                            <p className="text-xs text-slate-400 capitalize">{m.profile2_gender}</p>
                            {m.profile2_response && (
                              <span className="inline-block text-[9px] font-bold text-sage-600 bg-sage-50 border border-sage-100 px-2 py-0.5 rounded-md mt-1 capitalize">
                                Response: {m.profile2_response}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Match Status & Action */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Relation Status</p>
                            <span className={clsx('text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider border',
                              m.status === 'accepted' ? 'bg-sage-50 text-sage-700 border-sage-200' :
                              m.status === 'declined' ? 'bg-red-50 text-red-700 border-red-200' :
                              m.status === 'meeting_scheduled' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              m.status === 'interested' ? 'bg-trust-50 text-trust-700 border-trust-200' :
                              'bg-slate-50 text-slate-600 border-slate-200'
                            )}>
                              {m.status.replace('_', ' ')}
                            </span>
                          </div>

                          <div className="sm:mt-4">
                            <select 
                              className="input bg-white text-xs font-semibold border border-slate-200 rounded-xl p-2 outline-none"
                              value={m.status}
                              onChange={e => handleUpdateMatchStatus(m.id, e.target.value)}
                            >
                              <option value="suggested">Suggested</option>
                              <option value="interested">Interested</option>
                              <option value="meeting_scheduled">Meeting Scheduled</option>
                              <option value="accepted">Accepted</option>
                              <option value="declined">Declined</option>
                              <option value="closed">Closed</option>
                            </select>
                          </div>

                          {/* Arrange Family Meeting Button for Mutual Interest */}
                          {m.profile1_response === 'interested' && m.profile2_response === 'interested' && (
                            <button
                              onClick={() => handleOpenArrangeMeeting(m)}
                              className="sm:mt-4 flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl transition-all shadow-sm shrink-0"
                            >
                              <Calendar size={13} className="text-rose-600 animate-pulse" /> Arrange Family Meeting
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Meetings/Counseling History */}
                      <div className="pt-5 text-left">
                        <p className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-1.5">
                          <Calendar size={14} className="text-trust-600" /> Meetings & Counseling History
                        </p>
                        {(!m.meetings_history || m.meetings_history.length === 0) ? (
                          <p className="text-xs text-slate-400 italic">No counseling sessions scheduled for this pair yet.</p>
                        ) : (
                          <div className="space-y-3 relative pl-4 before:absolute before:left-1 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                            {m.meetings_history.map((s: any) => (
                              <div key={s.id} className="relative pl-4 group">
                                <div className={clsx('absolute -left-[17px] top-1.5 w-3 h-3 rounded-full border-2 border-white',
                                  s.status === 'completed' ? 'bg-sage-500' : 'bg-amber-500'
                                )} />
                                <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100/60 text-xs">
                                  <div className="flex justify-between items-start flex-wrap gap-1 mb-1">
                                    <span className="font-bold text-slate-600">
                                      {new Date(s.session_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <span className={clsx('text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full',
                                      s.status === 'completed' ? 'bg-sage-100 text-sage-700' : 'bg-amber-100 text-amber-700'
                                    )}>
                                      {s.status} ({s.mode})
                                    </span>
                                  </div>
                                  <p className="text-slate-500 mb-0.5">
                                    <strong className="text-slate-700 font-medium">Counselor:</strong> {s.counselor_name}
                                  </p>
                                  {s.topics_covered && s.topics_covered.length > 0 && (
                                    <p className="text-slate-500 mb-0.5">
                                      <strong className="text-slate-700 font-medium">Topics:</strong> {s.topics_covered.join(', ')}
                                    </p>
                                  )}
                                  {s.session_notes && (
                                    <p className="text-slate-500 italic mt-1 bg-white p-2 rounded-lg border border-slate-100">
                                      "{s.session_notes}"
                                    </p>
                                  )}
                                  {s.recommendations && (
                                    <p className="text-trust-700 mt-1">
                                      💡 <strong className="font-bold">Recommendations:</strong> {s.recommendations}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )
            ) : (
              profiles.length === 0 ? (
                <EmptyState icon={<HeartHandshake size={24} />} title="No profiles" description={`No ${filter} profiles found.`} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {profiles.map((p: any) => (
                    <Card key={p.id} className="p-5" hover>
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 rounded-2xl bg-trust-100 overflow-hidden shrink-0">
                          {p.photos?.[0] ? (
                            <img src={p.photos[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-trust-700 font-display text-lg">
                              {p.user_name?.[0] || '?'}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1.5">
                            <p className="font-semibold text-slate-800 text-sm truncate">{p.user_name}</p>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <Badge status={p.status} />
                              <button onClick={() => handleDeleteProfile(p.id)}
                                className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Delete Profile">
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-slate-500">{p.age} yrs · {p.gender} · {p.city}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{p.education}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 mb-4 bg-slate-50 rounded-xl p-3">
                        <span><strong className="text-slate-700">Religion:</strong> {p.religion}</span>
                        <span><strong className="text-slate-700">Caste:</strong> {p.caste || '—'}</span>
                        <span><strong className="text-slate-700">Occupation:</strong> {p.occupation}</span>
                        <span><strong className="text-slate-700">Income:</strong> {p.annual_income || '—'}</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setSelected(p)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition-colors">
                          <Eye size={13} /> Details
                        </button>
                        {p.status === 'pending' && (
                          <>
                            <button onClick={() => { setSelected(p); setActionNotes('') }}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-sage-500 text-white text-xs font-medium hover:bg-sage-600 transition-colors">
                              <Check size={13} /> Approve
                            </button>
                            <button onClick={() => approveProfile(p.id, false)}
                              className="py-2 px-3 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition-colors">
                              <X size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )
            )}
          </>
        )}

        {/* Profile Detail Modal */}
        {selected && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelected(null)}>
            <div className="bg-white rounded-3xl shadow-float w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-display text-xl text-trust-900">{selected.user_name}</h2>
                <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-slate-100"><X size={18} /></button>
              </div>
              <div className="p-6 space-y-4">
                {/* Photos */}
                {selected.photos?.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {selected.photos.map((url: string, i: number) => (
                      <img key={i} src={url} alt="" className="w-24 h-24 rounded-xl object-cover shrink-0" />
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    ['Email', selected.user_email], ['Phone', selected.user_phone],
                    ['Date of Birth', selected.date_of_birth], ['Age', selected.age + ' years'],
                    ['Height', selected.height_cm ? selected.height_cm + ' cm' : '—'],
                    ['Religion', selected.religion], ['Caste', selected.caste || '—'],
                    ['Education', selected.education], ['Occupation', selected.occupation],
                    ['City', selected.city], ['Income', selected.annual_income || '—'],
                  ].map(([label, val]) => (
                    <div key={label as string}>
                      <p className="text-xs text-slate-400">{label}</p>
                      <p className="font-medium text-slate-800">{val || '—'}</p>
                    </div>
                  ))}
                </div>
                {selected.bio && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Bio</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{selected.bio}</p>
                  </div>
                )}
                {selected.id_proof_url && (
                  <a href={selected.id_proof_url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-trust-600 hover:underline">
                    View ID Proof ({selected.id_proof_type}) →
                  </a>
                )}
                {selected.biodata_url && (
                  <div className="pt-1">
                    <a href={selected.biodata_url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-trust-600 hover:underline font-semibold">
                      📄 View Biodata Document →
                    </a>
                  </div>
                )}
                <div>
                  <label className="label">Admin Notes</label>
                  <textarea value={actionNotes} onChange={e => setActionNotes(e.target.value)}
                    className="input resize-none" rows={3} placeholder="Add internal notes…" />
                </div>
                {selected.status === 'pending' && (
                  <div>
                    <label className="label">Rejection Reason (if rejecting)</label>
                    <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                      className="input resize-none" rows={2} placeholder="Reason for rejection…" />
                  </div>
                )}
              </div>
              <div className="p-6 pt-0 flex gap-3">
                {selected.status === 'pending' && (
                  <>
                    <Button onClick={() => approveProfile(selected.id, true)} variant="sage" className="flex-1 justify-center">
                      <Check size={16} /> Approve Profile
                    </Button>
                    <Button onClick={() => approveProfile(selected.id, false)} variant="danger" className="flex-1 justify-center">
                      <X size={16} /> Reject
                    </Button>
                  </>
                )}
                <Button onClick={() => { handleDeleteProfile(selected.id); setSelected(null); }} className="flex-1 justify-center bg-red-600 text-white hover:bg-red-700 border-none">
                  <Trash2 size={16} /> Delete Profile
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Suggest Match Modal */}
        {suggestMode && (() => {
          const p1 = approvedProfiles.find(p => p.id === suggestPair[0])
          const p2 = approvedProfiles.find(p => p.id === suggestPair[1])
          const filteredApproved1 = approvedProfiles.filter(p => p.id !== suggestPair[1] && ((p.user_name || '').toLowerCase().includes(search1.toLowerCase()) || (p.city || '').toLowerCase().includes(search1.toLowerCase()) || (p.gender || '').toLowerCase().includes(search1.toLowerCase())))
          const filteredApproved2 = approvedProfiles.filter(p => p.id !== suggestPair[0] && ((p.user_name || '').toLowerCase().includes(search2.toLowerCase()) || (p.city || '').toLowerCase().includes(search2.toLowerCase()) || (p.gender || '').toLowerCase().includes(search2.toLowerCase())))

          return (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSuggestMode(false)}>
              <div className="bg-white rounded-3xl shadow-float w-full max-w-md relative" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="font-display text-xl text-trust-900">Suggest a Match</h2>
                  <button onClick={() => setSuggestMode(false)} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                    <X size={18} />
                  </button>
                </div>
                
                <div className="p-6 space-y-4 text-left">
                  <p className="text-sm text-slate-500">Search and select two approved profiles to suggest as a potential match.</p>
                  
                  {/* Profile 1 Selector */}
                  <div className="relative">
                    <label className="label text-xs font-semibold text-slate-700 mb-1 block">Profile 1</label>
                    {p1 ? (
                      <div className="flex items-center gap-3 p-3 bg-trust-50 rounded-2xl border border-trust-200">
                        <div className="w-10 h-10 rounded-xl bg-trust-100 overflow-hidden shrink-0">
                          {p1.photos?.[0] ? (
                            <img src={p1.photos[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-trust-700 font-bold text-sm">
                              {p1.user_name?.[0]}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-800 text-xs truncate">{p1.user_name}</p>
                          <p className="text-[10px] text-slate-500">{p1.age} yrs · {p1.gender} · {p1.city}</p>
                        </div>
                        <button 
                          onClick={() => setSuggestPair(['', suggestPair[1]])}
                          className="p-1.5 rounded-lg hover:bg-trust-100 text-red-600 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <input 
                          className="input text-xs w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-trust-500" 
                          placeholder="Search profile 1 by name, gender, city..."
                          value={search1}
                          onChange={e => {
                            setSearch1(e.target.value)
                            setShowDropdown1(true)
                          }}
                          onFocus={() => setShowDropdown1(true)}
                        />
                        {showDropdown1 && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowDropdown1(false)} />
                            <div className="absolute left-0 right-0 z-20 mt-1 max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg p-1 space-y-1">
                              {loadingApproved ? (
                                <div className="p-3 text-center text-xs text-slate-400">Loading approved profiles...</div>
                              ) : filteredApproved1.length === 0 ? (
                                <div className="p-3 text-center text-xs text-slate-400">No matching approved profiles</div>
                              ) : (
                                filteredApproved1.map(p => (
                                  <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => {
                                      setSuggestPair([p.id, suggestPair[1]])
                                      setShowDropdown1(false)
                                      setSearch1('')
                                    }}
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
                                      <p className="text-[10px] text-slate-500">{p.age} yrs · {p.gender} · {p.city}</p>
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

                  {/* Profile 2 Selector */}
                  <div className="relative">
                    <label className="label text-xs font-semibold text-slate-700 mb-1 block">Profile 2</label>
                    {p2 ? (
                      <div className="flex items-center gap-3 p-3 bg-trust-50 rounded-2xl border border-trust-200">
                        <div className="w-10 h-10 rounded-xl bg-trust-100 overflow-hidden shrink-0">
                          {p2.photos?.[0] ? (
                            <img src={p2.photos[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-trust-700 font-bold text-sm">
                              {p2.user_name?.[0]}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-800 text-xs truncate">{p2.user_name}</p>
                          <p className="text-[10px] text-slate-500">{p2.age} yrs · {p2.gender} · {p2.city}</p>
                        </div>
                        <button 
                          onClick={() => setSuggestPair([suggestPair[0], ''])}
                          className="p-1.5 rounded-lg hover:bg-trust-100 text-red-600 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <input 
                          className="input text-xs w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-trust-500" 
                          placeholder="Search profile 2 by name, gender, city..."
                          value={search2}
                          onChange={e => {
                            setSearch2(e.target.value)
                            setShowDropdown2(true)
                          }}
                          onFocus={() => setShowDropdown2(true)}
                        />
                        {showDropdown2 && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowDropdown2(false)} />
                            <div className="absolute left-0 right-0 z-20 mt-1 max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg p-1 space-y-1">
                              {loadingApproved ? (
                                <div className="p-3 text-center text-xs text-slate-400">Loading approved profiles...</div>
                              ) : filteredApproved2.length === 0 ? (
                                <div className="p-3 text-center text-xs text-slate-400">No matching approved profiles</div>
                              ) : (
                                filteredApproved2.map(p => (
                                  <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => {
                                      setSuggestPair([suggestPair[0], p.id])
                                      setShowDropdown2(false)
                                      setSearch2('')
                                    }}
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
                                      <p className="text-[10px] text-slate-500">{p.age} yrs · {p.gender} · {p.city}</p>
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

                  <div>
                    <label className="label text-xs font-semibold text-slate-700 mb-1 block">Counselor Notes</label>
                    <textarea 
                      className="input resize-none w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-trust-500 text-xs" 
                      rows={3} 
                      placeholder="Why are these profiles compatible?"
                      value={actionNotes} 
                      onChange={e => setActionNotes(e.target.value)} 
                    />
                  </div>
                  
                  <Button 
                    onClick={suggestMatch} 
                    className="w-full justify-center py-2.5 text-xs font-bold flex items-center gap-1.5"
                  >
                    <Link2 size={15} /> Suggest This Match
                  </Button>
                </div>
              </div>
            </div>
          )
        })()}

        {/* Arrange Family Meeting Modal */}
        {showArrangeModal && selectedMatchForMeeting && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => { setShowArrangeModal(false); setSelectedMatchForMeeting(null); }}>
            <div className="bg-white rounded-3xl shadow-float w-full max-w-md relative" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-display text-xl text-trust-900">Arrange Family Meeting</h2>
                <button onClick={() => { setShowArrangeModal(false); setSelectedMatchForMeeting(null); }} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                  <X size={18} />
                </button>
              </div>
              
              <div className="p-6 space-y-5 text-left">
                <p className="text-xs text-slate-500 bg-slate-50 rounded-xl p-3 leading-relaxed">
                  Both <strong>{selectedMatchForMeeting.profile1_name}</strong> and <strong>{selectedMatchForMeeting.profile2_name}</strong> have expressed interest. Schedule a family meeting to connect them.
                </p>

                {/* Partners Display */}
                <div className="flex items-center justify-between gap-3 p-3.5 bg-rose-50/40 rounded-2xl border border-rose-100/60">
                  <div className="text-center flex-1">
                    <p className="font-semibold text-slate-800 text-xs truncate">{selectedMatchForMeeting.profile1_name}</p>
                    <p className="text-[10px] text-slate-400 capitalize">{selectedMatchForMeeting.profile1_gender}</p>
                  </div>
                  <div className="text-rose-400 font-bold text-xs shrink-0">❤️</div>
                  <div className="text-center flex-1">
                    <p className="font-semibold text-slate-800 text-xs truncate">{selectedMatchForMeeting.profile2_name}</p>
                    <p className="text-[10px] text-slate-400 capitalize">{selectedMatchForMeeting.profile2_gender}</p>
                  </div>
                </div>

                {/* Meeting Date & Time */}
                <div>
                  <label className="label text-xs font-semibold text-slate-700 mb-1 block">Meeting Date & Time</label>
                  <input
                    type="datetime-local"
                    className="input text-xs w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-trust-500"
                    value={meetingDate}
                    onChange={e => setMeetingDate(e.target.value)}
                  />
                </div>

                {/* Meeting Mode */}
                <div>
                  <label className="label text-xs font-semibold text-slate-700 mb-1 block">Mode</label>
                  <select
                    className="input text-xs w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:border-trust-500 bg-white"
                    value={meetingMode}
                    onChange={e => setMeetingMode(e.target.value)}
                  >
                    <option value="video">Video Call (Online)</option>
                    <option value="in_person">In-Person (Face to Face)</option>
                    <option value="audio">Audio Call</option>
                  </select>
                </div>

                {/* Family Presence Toggle */}
                <div className="flex items-center justify-between bg-slate-50 rounded-xl p-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Family Members Present</p>
                    <p className="text-[10px] text-slate-500">Arrange as a family-to-family introduction meeting</p>
                  </div>
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-trust-600 border-slate-300 rounded focus:ring-trust-500 cursor-pointer"
                    checked={familyPresent}
                    onChange={e => setFamilyPresent(e.target.checked)}
                  />
                </div>

                <Button
                  onClick={handleArrangeMeetingSubmit}
                  className="w-full justify-center py-2.5 text-xs font-bold flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white"
                  disabled={submittingMeeting}
                >
                  {submittingMeeting ? (
                    <Spinner size="sm" />
                  ) : (
                    <>
                      <Calendar size={15} /> Confirm & Schedule Meeting
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
