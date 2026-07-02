'use client'
import { useState, useEffect } from 'react'
import { Camera, FileText, UploadCloud, Trash2, ShieldCheck, AlertCircle, ArrowLeft, ArrowRight, Save, Plus } from 'lucide-react'
import { Button, Card } from '@/components/ui'
import { useCreateMatrimonyProfile, useUpdateMatrimonyProfile } from '@/hooks/useApiQueries'
import { matrimonyApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

const TABS = [
  { id: 'personal', label: '1. Personal & Location' },
  { id: 'religion_education', label: '2. Education & Religion' },
  { id: 'family_bio', label: '3. Family & Expectations' },
  { id: 'photos', label: '4. Photos & Verification' },
]

const EMPTY_PROFILE = {
  date_of_birth: '',
  gender: 'male',
  height_cm: '',
  weight_kg: '',
  complexion: '',
  blood_group: '',
  religion: 'Hindu',
  caste: '',
  sub_caste: '',
  gotra: '',
  manglik: 'no',
  city: '',
  state: '',
  country: 'India',
  education: '',
  occupation: '',
  employer: '',
  annual_income: '',
  family_type: 'nuclear',
  family_status: 'middle_class',
  father_occupation: '',
  mother_occupation: '',
  siblings: '',
  marriage_status: 'never_married',
  children: 0,
  bio: '',
  hobbies: [] as string[],
  values: '',
  expectations: '',
}

interface ProfileTabProps {
  profile: any
  profileNotFound: boolean
  refetchProfile: () => void
}

export default function ProfileTab({ profile, profileNotFound, refetchProfile }: ProfileTabProps) {
  const [activeTab, setActiveTab] = useState('personal')
  const [form, setForm] = useState<any>(EMPTY_PROFILE)
  const [hobbyInput, setHobbyInput] = useState('')
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [uploadingIdProof, setUploadingIdProof] = useState(false)
  const [uploadingBiodata, setUploadingBiodata] = useState(false)
  const [idProofType, setIdProofType] = useState('Aadhaar')

  const createMutation = useCreateMatrimonyProfile()
  const updateMutation = useUpdateMatrimonyProfile()
  const hasProfile = !!profile

  // Sync profile details to form state
  useEffect(() => {
    if (profile) {
      setForm({
        ...profile,
        date_of_birth: profile.date_of_birth ? String(profile.date_of_birth) : '',
        height_cm: profile.height_cm ? String(profile.height_cm) : '',
        weight_kg: profile.weight_kg ? String(profile.weight_kg) : '',
        hobbies: profile.hobbies || [],
      })
    }
  }, [profile])

  const handleInputChange = (field: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [field]: value }))
  }

  // Handle saving details
  const saveDetails = async () => {
    if (!form.date_of_birth) { toast.error('Date of birth is required'); return }
    if (!form.city || !form.state) { toast.error('City and State are required'); return }
    if (!form.religion) { toast.error('Religion is required'); return }
    if (!form.education || !form.occupation) { toast.error('Education and Occupation are required'); return }

    const payload = {
      ...form,
      height_cm: form.height_cm ? parseInt(form.height_cm) : null,
      weight_kg: form.weight_kg ? parseInt(form.weight_kg) : null,
      children: form.children ? parseInt(form.children) : 0,
    }

    try {
      if (profileNotFound) {
        await createMutation.mutateAsync(payload)
        toast.success('Profile created successfully! Please upload photos next.')
        setActiveTab('photos')
      } else {
        await updateMutation.mutateAsync(payload)
        toast.success('Profile details saved! Status set to pending review.')
      }
      refetchProfile()
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Failed to save profile.')
    }
  }

  // Handle Photo Upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return
    if (!hasProfile) {
      toast.error('Please save your profile details first before uploading photos.')
      return
    }

    setUploadingPhoto(true)
    const file = e.target.files[0]
    const formData = new FormData()
    formData.append('file', file)

    try {
      await matrimonyApi.uploadPhoto(formData)
      toast.success('Photo uploaded successfully!')
      refetchProfile()
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Failed to upload photo.')
    } finally {
      setUploadingPhoto(false)
    }
  }

  // Handle Photo Delete
  const handlePhotoDelete = async (photoUrl: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return

    try {
      await matrimonyApi.deletePhoto(photoUrl)
      toast.success('Photo deleted successfully.')
      refetchProfile()
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Failed to delete photo.')
    }
  }

  // Handle ID Proof Upload
  const handleIdProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return
    if (!hasProfile) {
      toast.error('Please save your profile details first before uploading ID proof.')
      return
    }

    setUploadingIdProof(true)
    const file = e.target.files[0]
    const formData = new FormData()
    formData.append('file', file)

    try {
      await matrimonyApi.uploadIdProof(formData, idProofType)
      toast.success('ID proof uploaded successfully!')
      refetchProfile()
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Failed to upload ID proof.')
    } finally {
      setUploadingIdProof(false)
    }
  }

  // Handle Biodata Upload
  const handleBiodataUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return
    if (!hasProfile) {
      toast.error('Please save your profile details first before uploading biodata.')
      return
    }

    setUploadingBiodata(true)
    const file = e.target.files[0]
    const formData = new FormData()
    formData.append('file', file)

    try {
      await matrimonyApi.uploadBiodata(formData)
      toast.success('Biodata uploaded successfully!')
      refetchProfile()
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Failed to upload biodata.')
    } finally {
      setUploadingBiodata(false)
    }
  }

  // Hobby management helper
  const addHobby = () => {
    if (!hobbyInput.trim()) return
    if (form.hobbies.includes(hobbyInput.trim())) {
      toast.error('Hobby already added')
      return
    }
    setForm((f: any) => ({ ...f, hobbies: [...f.hobbies, hobbyInput.trim()] }))
    setHobbyInput('')
  }

  const removeHobby = (hobby: string) => {
    setForm((f: any) => ({ ...f, hobbies: f.hobbies.filter((h: string) => h !== hobby) }))
  }

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Tab Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="font-display text-2xl text-trust-900 font-bold">Matrimony Profile Builder</h2>
          <p className="text-slate-500 text-sm mt-1">
            {profileNotFound
              ? 'Complete your profile details to start matchmaking. Photos and details are checked manually.'
              : 'Keep your information updated. Note that edits will require counselor review.'
            }
          </p>
        </div>
      </div>

      {/* Warning banner */}
      {hasProfile && profile.status === 'approved' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 items-start shadow-xs">
          <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={18} />
          <div className="text-xs text-slate-600 leading-normal">
            <span className="font-bold text-amber-800">Status Alert:</span> Editing your profile details will revert your status back to <span className="font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded-md">PENDING</span> for counselor review. You will temporarily not appear in suggested match pools until re-approved.
          </div>
        </div>
      )}

      {/* Tab Navigation links */}
      <div className="border-b border-slate-100 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            disabled={profileNotFound && tab.id === 'photos'}
            className={clsx(
              'px-4 py-2.5 border-b-2 text-xs md:text-sm font-semibold whitespace-nowrap transition-all focus:outline-none',
              activeTab === tab.id
                ? 'border-trust-700 text-trust-800'
                : 'border-transparent text-slate-400 hover:text-slate-600 disabled:opacity-40 disabled:pointer-events-none'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Form Content Cards */}
      <Card className="p-6 md:p-8 bg-white border-slate-100 shadow-card rounded-3xl">
        
        {/* TAB 1: PERSONAL DETAILS */}
        {activeTab === 'personal' && (
          <div className="space-y-6">
            <h3 className="font-display text-lg font-bold text-slate-800">1. Personal Info & Location</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Date of Birth *</label>
                <input
                  type="date"
                  className="input text-sm w-full"
                  value={form.date_of_birth}
                  onChange={e => handleInputChange('date_of_birth', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Gender *</label>
                <select
                  className="input bg-white text-sm w-full capitalize"
                  value={form.gender}
                  onChange={e => handleInputChange('gender', e.target.value)}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Height (in cm)</label>
                <input
                  type="number"
                  className="input text-sm w-full"
                  placeholder="e.g. 172"
                  value={form.height_cm}
                  onChange={e => handleInputChange('height_cm', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Weight (in kg)</label>
                <input
                  type="number"
                  className="input text-sm w-full"
                  placeholder="e.g. 68"
                  value={form.weight_kg}
                  onChange={e => handleInputChange('weight_kg', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Complexion</label>
                <input
                  type="text"
                  className="input text-sm w-full"
                  placeholder="e.g. Fair, Medium, Wheatish"
                  value={form.complexion || ''}
                  onChange={e => handleInputChange('complexion', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Blood Group</label>
                <select
                  className="input bg-white text-sm w-full"
                  value={form.blood_group || ''}
                  onChange={e => handleInputChange('blood_group', e.target.value)}
                >
                  <option value="">Select Blood Group</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Disability (if any)</label>
                <input
                  type="text"
                  className="input text-sm w-full"
                  placeholder="e.g. None, Visually Impaired, etc."
                  value={form.disability || ''}
                  onChange={e => handleInputChange('disability', e.target.value)}
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5">
              <h4 className="font-semibold text-slate-800 text-sm mb-3">📍 Address & Location</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">City *</label>
                  <input
                    type="text"
                    className="input text-sm w-full"
                    placeholder="e.g. Nagpur"
                    value={form.city}
                    onChange={e => handleInputChange('city', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">State *</label>
                  <input
                    type="text"
                    className="input text-sm w-full"
                    placeholder="e.g. Maharashtra"
                    value={form.state}
                    onChange={e => handleInputChange('state', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Country</label>
                  <input
                    type="text"
                    className="input text-sm w-full"
                    value={form.country}
                    onChange={e => handleInputChange('country', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={() => setActiveTab('religion_education')} className="flex items-center gap-1.5 bg-trust-800">
                Next Step <ArrowRight size={14} />
              </Button>
            </div>
          </div>
        )}

        {/* TAB 2: RELIGION, EDUCATION & CAREER */}
        {activeTab === 'religion_education' && (
          <div className="space-y-6">
            <h3 className="font-display text-lg font-bold text-slate-800">2. Religious & Career Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Religion *</label>
                <input
                  type="text"
                  className="input text-sm w-full"
                  placeholder="e.g. Hindu, Muslim, Sikh, Jain, Christian"
                  value={form.religion}
                  onChange={e => handleInputChange('religion', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Caste</label>
                <input
                  type="text"
                  className="input text-sm w-full"
                  placeholder="e.g. Brahmin, Maratha, etc."
                  value={form.caste || ''}
                  onChange={e => handleInputChange('caste', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Sub-Caste</label>
                <input
                  type="text"
                  className="input text-sm w-full"
                  placeholder="e.g. Deshastha"
                  value={form.sub_caste || ''}
                  onChange={e => handleInputChange('sub_caste', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Gotra</label>
                <input
                  type="text"
                  className="input text-sm w-full"
                  placeholder="e.g. Kashyap"
                  value={form.gotra || ''}
                  onChange={e => handleInputChange('gotra', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Manglik Status</label>
                <select
                  className="input bg-white text-sm w-full"
                  value={form.manglik || 'no'}
                  onChange={e => handleInputChange('manglik', e.target.value)}
                >
                  <option value="no">Non-Manglik</option>
                  <option value="yes">Manglik</option>
                  <option value="partial">Anshik (Partial) Manglik</option>
                  <option value="dont_know">Don't Know</option>
                </select>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5">
              <h4 className="font-semibold text-slate-800 text-sm mb-3">🎓 Education & Occupation</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Education *</label>
                  <input
                    type="text"
                    className="input text-sm w-full"
                    placeholder="e.g. B.Tech in Computer Science"
                    value={form.education}
                    onChange={e => handleInputChange('education', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Occupation *</label>
                  <input
                    type="text"
                    className="input text-sm w-full"
                    placeholder="e.g. Software Engineer"
                    value={form.occupation}
                    onChange={e => handleInputChange('occupation', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Employer / Company</label>
                  <input
                    type="text"
                    className="input text-sm w-full"
                    placeholder="e.g. TCS, Infosys, Self-Employed"
                    value={form.employer || ''}
                    onChange={e => handleInputChange('employer', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Annual Income</label>
                  <input
                    type="text"
                    className="input text-sm w-full"
                    placeholder="e.g. 8-10 Lakhs Per Annum"
                    value={form.annual_income || ''}
                    onChange={e => handleInputChange('annual_income', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-50">
              <Button variant="secondary" onClick={() => setActiveTab('personal')} className="flex items-center gap-1.5">
                <ArrowLeft size={14} /> Back
              </Button>
              <Button onClick={() => setActiveTab('family_bio')} className="flex items-center gap-1.5 bg-trust-800">
                Next Step <ArrowRight size={14} />
              </Button>
            </div>
          </div>
        )}

        {/* TAB 3: FAMILY & EXPECTATIONS */}
        {activeTab === 'family_bio' && (
          <div className="space-y-6">
            <h3 className="font-display text-lg font-bold text-slate-800">3. Family Background & Values</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Family Type</label>
                <select
                  className="input bg-white text-sm w-full capitalize"
                  value={form.family_type || 'nuclear'}
                  onChange={e => handleInputChange('family_type', e.target.value)}
                >
                  <option value="nuclear">Nuclear</option>
                  <option value="joint">Joint</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Family Status</label>
                <select
                  className="input bg-white text-sm w-full capitalize"
                  value={form.family_status || 'middle_class'}
                  onChange={e => handleInputChange('family_status', e.target.value)}
                >
                  <option value="middle_class">Middle Class</option>
                  <option value="upper_middle_class">Upper Middle Class</option>
                  <option value="upper_class">Upper Class</option>
                  <option value="lower_middle_class">Lower Middle Class</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Father's Occupation</label>
                <input
                  type="text"
                  className="input text-sm w-full"
                  placeholder="e.g. Business Owner"
                  value={form.father_occupation || ''}
                  onChange={e => handleInputChange('father_occupation', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Mother's Occupation</label>
                <input
                  type="text"
                  className="input text-sm w-full"
                  placeholder="e.g. Homemaker"
                  value={form.mother_occupation || ''}
                  onChange={e => handleInputChange('mother_occupation', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Siblings Details</label>
                <input
                  type="text"
                  className="input text-sm w-full"
                  placeholder="e.g. 1 elder brother (married), 1 younger sister"
                  value={form.siblings || ''}
                  onChange={e => handleInputChange('siblings', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Marriage Status</label>
                <select
                  className="input bg-white text-sm w-full"
                  value={form.marriage_status || 'never_married'}
                  onChange={e => handleInputChange('marriage_status', e.target.value)}
                >
                  <option value="never_married">Never Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                  <option value="awaiting_divorce">Awaiting Divorce</option>
                </select>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5 space-y-4">
              <h4 className="font-semibold text-slate-800 text-sm">📝 About Me & Partner Expectations</h4>
              
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Bio / Personal Introduction</label>
                <textarea
                  className="input text-sm w-full resize-none"
                  rows={4}
                  placeholder="Describe your personality, goals, lifestyle, and interests..."
                  value={form.bio || ''}
                  onChange={e => handleInputChange('bio', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Partner Expectations</label>
                <textarea
                  className="input text-sm w-full resize-none"
                  rows={3}
                  placeholder="What are you looking for in a partner (education, occupation, values, family role)..."
                  value={form.expectations || ''}
                  onChange={e => handleInputChange('expectations', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">My Core Values</label>
                <textarea
                  className="input text-sm w-full resize-none"
                  rows={2}
                  placeholder="State your personal principles or family values..."
                  value={form.values || ''}
                  onChange={e => handleInputChange('values', e.target.value)}
                />
              </div>

              {/* Hobbies list */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Hobbies & Interests</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    className="input text-sm flex-1"
                    placeholder="e.g. Reading, Traveling, Cooking"
                    value={hobbyInput}
                    onChange={e => setHobbyInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addHobby())}
                  />
                  <Button type="button" size="sm" onClick={addHobby} className="bg-trust-850">
                    <Plus size={14} /> Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.hobbies.map((h: string) => (
                    <span key={h} className="text-xs bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1 rounded-full flex items-center gap-1.5">
                      {h}
                      <button type="button" onClick={() => removeHobby(h)} className="text-slate-400 hover:text-red-500 font-bold">×</button>
                    </span>
                  ))}
                  {form.hobbies.length === 0 && <p className="text-xs text-slate-400">No hobbies added yet.</p>}
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setActiveTab('religion_education')} className="flex items-center gap-1.5">
                <ArrowLeft size={14} /> Back
              </Button>
              <Button onClick={saveDetails} loading={createMutation.isPending || updateMutation.isPending} className="flex items-center gap-1.5 bg-trust-800">
                <Save size={15} /> Save Details
              </Button>
            </div>
          </div>
        )}

        {/* TAB 4: PHOTOS & ID PROOF */}
        {activeTab === 'photos' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Photos */}
            <div>
              <h3 className="font-display text-lg font-bold text-slate-800 flex items-center gap-2">
                <Camera className="text-trust-700" size={20} /> Candidate Photos (Compulsory)
              </h3>
              <p className="text-xs text-slate-500 mt-1.5">
                At least one profile photo is required to display your face to counselor-vetted matches. Files must be clear front-facing portrait pictures.
              </p>

              {/* Photo Previews */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {profile?.photos?.map((url: string, index: number) => {
                  const isOnlyPhoto = profile.photos.length <= 1
                  return (
                    <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-100 shadow-sm group bg-slate-50">
                      <img src={url} alt={`Profile Photo ${index + 1}`} className="w-full h-full object-cover" />
                      
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          disabled={isOnlyPhoto}
                          onClick={() => handlePhotoDelete(url)}
                          className={clsx(
                            'p-2.5 rounded-full text-white transition-all shadow-md',
                            isOnlyPhoto 
                              ? 'bg-slate-400 cursor-not-allowed opacity-50' 
                              : 'bg-red-600 hover:bg-red-700 hover:scale-105 active:scale-95'
                          )}
                          title={isOnlyPhoto ? "At least one photo is compulsory" : "Delete Photo"}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {index === 0 && (
                        <span className="absolute bottom-2 left-2 text-[10px] font-bold bg-trust-800 text-white px-2 py-0.5 rounded-md shadow-sm">
                          Primary
                        </span>
                      )}
                    </div>
                  )
                })}

                <label className={clsx(
                  'aspect-square rounded-2xl border-2 border-dashed border-slate-200 hover:border-trust-400 bg-slate-50/50 hover:bg-trust-50/10 flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all',
                  uploadingPhoto && 'opacity-50 pointer-events-none'
                )}>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                  {uploadingPhoto ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-trust-700 border-t-transparent" />
                  ) : (
                    <>
                      <UploadCloud className="text-slate-400 hover:text-trust-600 transition-colors animate-float-gentle" size={24} />
                      <span className="text-xs font-semibold text-slate-600 mt-2">Upload Photo</span>
                      <span className="text-[10px] text-slate-400 mt-1">PNG, JPG, JPEG</span>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* ID Proof Verification */}
            <div className="border-t border-slate-100 pt-6">
              <h3 className="font-display text-lg font-bold text-slate-800 flex items-center gap-2">
                <ShieldCheck className="text-trust-700" size={20} /> Verification Documents
              </h3>
              <p className="text-xs text-slate-500 mt-1.5">
                Upload an official identity card. These documents are strictly confidential and visible only to verifying administrative counselors.
              </p>

              <div className="mt-4 bg-slate-50 rounded-2xl p-5 border border-slate-100/80 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Document Type</label>
                    <select
                      className="input bg-white text-sm w-full"
                      value={idProofType}
                      onChange={e => setIdProofType(e.target.value)}
                    >
                      <option value="Aadhaar">Aadhaar Card (UIDAI)</option>
                      <option value="Passport">Passport</option>
                      <option value="PAN">PAN Card</option>
                      <option value="Driving_License">Driving License</option>
                    </select>
                  </div>

                  <label className={clsx(
                    'px-5 py-2.5 rounded-xl border border-slate-200 hover:border-trust-300 bg-white text-sm font-semibold text-slate-700 cursor-pointer shadow-sm hover:bg-slate-50 transition-all text-center flex items-center gap-2 w-full sm:w-auto justify-center',
                    uploadingIdProof && 'opacity-50 pointer-events-none'
                  )}>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={handleIdProofUpload}
                    />
                    <FileText size={16} />
                    {uploadingIdProof ? 'Uploading...' : 'Choose File'}
                  </label>
                </div>

                {profile?.id_proof_url && (
                  <div className="bg-sage-50 border border-sage-100 rounded-xl p-3 flex items-center justify-between shadow-2xs">
                    <span className="text-xs text-sage-800 font-semibold flex items-center gap-1.5">
                      🛡️ ID Document Uploaded ({profile.id_proof_type || 'Verified'})
                    </span>
                    <a
                      href={profile.id_proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-trust-700 hover:underline font-bold"
                    >
                      View Document →
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Biodata Upload */}
            <div className="border-t border-slate-100 pt-6">
              <h3 className="font-display text-lg font-bold text-slate-800 flex items-center gap-2">
                <FileText className="text-trust-700" size={20} /> Biodata Document
              </h3>
              <p className="text-xs text-slate-500 mt-1.5">
                Upload your biodata document. This will be shared with the administrator/counselor and displayed on the admin panel to evaluate your profile.
              </p>

              <div className="mt-4 bg-slate-50 rounded-2xl p-5 border border-slate-100/80 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-500">Supported formats: PDF, JPEG, PNG</p>
                  </div>

                  <label className={clsx(
                    'px-5 py-2.5 rounded-xl border border-slate-200 hover:border-trust-300 bg-white text-sm font-semibold text-slate-700 cursor-pointer shadow-sm hover:bg-slate-50 transition-all text-center flex items-center gap-2 w-full sm:w-auto justify-center',
                    uploadingBiodata && 'opacity-50 pointer-events-none'
                  )}>
                    <input
                      type="file"
                      accept=".pdf,image/jpeg,image/png"
                      className="hidden"
                      onChange={handleBiodataUpload}
                    />
                    <UploadCloud size={16} />
                    {uploadingBiodata ? 'Uploading...' : 'Choose Biodata'}
                  </label>
                </div>

                {profile?.biodata_url && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center justify-between shadow-2xs">
                    <span className="text-xs text-blue-800 font-semibold flex items-center gap-1.5">
                      📄 Biodata Document Uploaded
                    </span>
                    <a
                      href={profile.biodata_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-trust-700 hover:underline font-bold"
                    >
                      View Biodata →
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-4 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setActiveTab('family_bio')} className="flex items-center gap-1.5">
                <ArrowLeft size={14} /> Back
              </Button>
            </div>

          </div>
        )}

      </Card>
    </div>
  )
}
