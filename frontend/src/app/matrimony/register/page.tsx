import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Heart, ArrowRight, ArrowLeft, Check, Camera, Upload, X } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Input, Select, Textarea, Button } from '@/components/ui'
import { matrimonyApi } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'
import Seo from '@/components/common/Seo'

const STEPS = ['Personal', 'Background', 'Career', 'Photo & Bio']

export default function MatrimonyRegisterPage() {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors }, trigger } = useForm()

  const STEP_FIELDS: Record<number, string[]> = {
    0: ['date_of_birth', 'gender', 'city', 'state'],
    1: ['religion'],
    2: ['education', 'occupation'],
    3: [],
  }

  const handleNext = async () => {
    const valid = await trigger(STEP_FIELDS[step] as any)
    if (valid) setStep(s => s + 1)
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return }
    setPhotoFile(file)
    const reader = new FileReader()
    reader.onload = e => setPhotoPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const removePhoto = () => {
    setPhotoFile(null)
    setPhotoPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Seo
        title="Create Matrimony Profile"
        description="Register your matrimony profile with Devkalp Foundation's counselor-led matchmaking program."
        path="/matrimony/register"
      />
      <div className="text-center p-8 max-w-sm">
        <div className="w-14 h-14 rounded-2xl bg-trust-100 flex items-center justify-center mx-auto mb-4">
          <Heart size={24} className="text-trust-700" />
        </div>
        <h2 className="font-display text-2xl text-trust-900 mb-2">Sign in required</h2>
        <p className="text-slate-500 text-sm mb-6">Create an account with the Matrimony role to proceed.</p>
        <Link to="/auth/register"><Button className="w-full justify-center">Create Account →</Button></Link>
      </div>
    </div>
  )

  const onSubmit = async (data: any) => {
    setLoading(true)
    try {
      await matrimonyApi.createProfile({
        date_of_birth:  data.date_of_birth,
        gender:         data.gender,
        height_cm:      data.height_cm ? parseInt(data.height_cm) : null,
        religion:       data.religion,
        caste:          data.caste,
        city:           data.city || 'Surat',
        state:          data.state || 'Gujarat',
        country:        'India',
        education:      data.education,
        occupation:     data.occupation,
        annual_income:  data.annual_income,
        family_type:    data.family_type,
        marriage_status: data.marriage_status || 'never_married',
        bio:            data.bio,
        hobbies:        data.hobbies ? data.hobbies.split(',').map((h: string) => h.trim()).filter(Boolean) : [],
        values:         data.values,
        expectations:   data.expectations,
      })

      // Upload photo if selected
      if (photoFile) {
        try {
          const form = new FormData()
          form.append('file', photoFile)
          await matrimonyApi.uploadPhoto(form)
        } catch {
          // Photo upload failed but profile was created - non-fatal
          toast('Profile created. Photo upload failed — you can add it from your dashboard.', { icon: '⚠️' })
        }
      }

      toast.success('Profile submitted! Admin will review within 1–2 working days.')
      navigate('/dashboard/matrimony')
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Failed to create profile')
    } finally { setLoading(false) }
  }

  const stepFields = [
    /* 0 — Personal */
    <div key="personal" className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Date of Birth *" type="date" error={errors.date_of_birth?.message as string}
          {...register('date_of_birth', { required: 'Required' })} />
        <Select label="Gender *" error={errors.gender?.message as string}
          options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }]}
          {...register('gender', { required: 'Required' })} />
      </div>
      <Input label="Height (cm)" type="number" placeholder="170" {...register('height_cm')} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="City *" placeholder="Surat" error={errors.city?.message as string}
          {...register('city', { required: 'Required' })} />
        <Input label="State *" placeholder="Gujarat" error={errors.state?.message as string}
          {...register('state', { required: 'Required' })} />
      </div>
    </div>,

    /* 1 — Background */
    <div key="background" className="space-y-4">
      <Input label="Religion *" placeholder="Hindu / Jain / Muslim…" error={errors.religion?.message as string}
        {...register('religion', { required: 'Required' })} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Community / Caste" placeholder="Patel, Jain, Brahmin…" {...register('caste')} />
        <Input label="Mother Tongue" placeholder="Gujarati, Hindi…" {...register('language')} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select label="Family Type"
          options={[{ value: 'nuclear', label: 'Nuclear' }, { value: 'joint', label: 'Joint' }, { value: 'extended', label: 'Extended' }]}
          {...register('family_type')} />
        <Select label="Marital Status"
          options={[{ value: 'never_married', label: 'Never Married' }, { value: 'divorced', label: 'Divorced' }, { value: 'widowed', label: 'Widowed' }]}
          {...register('marriage_status')} />
      </div>
    </div>,

    /* 2 — Career */
    <div key="career" className="space-y-4">
      <Input label="Highest Education *" placeholder="B.Tech / MBA / MBBS…" error={errors.education?.message as string}
        {...register('education', { required: 'Required' })} />
      <Input label="Occupation *" placeholder="Software Engineer / Doctor…" error={errors.occupation?.message as string}
        {...register('occupation', { required: 'Required' })} />
      <Input label="Employer / Organisation" placeholder="Company or organisation name" {...register('employer')} />
      <Select label="Annual Income"
        options={[
          { value: 'below_3l', label: 'Below ₹3 LPA' },
          { value: '3_5l',     label: '₹3–5 LPA' },
          { value: '5_10l',    label: '₹5–10 LPA' },
          { value: '10_20l',   label: '₹10–20 LPA' },
          { value: '20_plus',  label: '₹20+ LPA' },
        ]}
        {...register('annual_income')} />
    </div>,

    /* 3 — Photo & Bio */
    <div key="bio" className="space-y-5">
      {/* Photo upload */}
      <div>
        <p className="label">Profile Photo</p>
        <div className="flex items-start gap-5">
          {/* Preview */}
          <div className="shrink-0">
            {photoPreview ? (
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-trust-200">
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                <button type="button" onClick={removePhoto}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-colors">
                  <X size={10} />
                </button>
              </div>
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <Camera size={24} className="text-slate-400" />
              </div>
            )}
          </div>

          {/* Upload area */}
          <div className="flex-1">
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoChange} />
            <button type="button" onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-5 py-2.5 border-2 border-dashed border-slate-300 text-slate-600 text-sm font-medium rounded-xl hover:border-trust-400 hover:text-trust-700 transition-all mb-2 w-full justify-center">
              <Upload size={15} /> {photoFile ? 'Change Photo' : 'Upload Photo'}
            </button>
            {photoFile ? (
              <p className="text-xs text-slate-500 text-center">
                {photoFile.name} · {(photoFile.size / 1024).toFixed(0)} KB
              </p>
            ) : (
              <p className="text-xs text-slate-400 text-center">JPG, PNG, WEBP · Max 5MB</p>
            )}
          </div>
        </div>
      </div>

      <Textarea label="About Yourself" placeholder="Tell us about your personality, values, and what you're looking for in a partner…" rows={4}
        {...register('bio')} />
      <Input label="Hobbies (comma-separated)" placeholder="Reading, cooking, hiking, music…"
        {...register('hobbies')} />
      <Textarea label="Your Values" placeholder="What values matter most to you in life and marriage?" rows={2}
        {...register('values')} />
      <Textarea label="Partner Expectations" placeholder="What are you looking for in a life partner?" rows={2}
        {...register('expectations')} />
    </div>,
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <Seo
        title="Create Matrimony Profile"
        description="Register your matrimony profile with Devkalp Foundation's counselor-led matchmaking program."
        path="/matrimony/register"
      />
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="page-container max-w-2xl">
          {/* Header */}
          <div className="text-center mb-10 pt-8">
            <div className="inline-flex w-14 h-14 rounded-2xl bg-trust-100 items-center justify-center mb-4">
              <Heart size={26} className="text-trust-700" />
            </div>
            <h1 className="font-display text-3xl text-trust-900 mb-2">Create Matrimony Profile</h1>
            <p className="text-slate-500 text-sm">Your information is private and only shared with admin and counselors.</p>
          </div>

          {/* Progress */}
          <div className="flex items-center mb-8">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200',
                    i < step ? 'bg-sage-500 text-white' : i === step ? 'bg-trust-800 text-white' : 'bg-slate-200 text-slate-500')}>
                    {i < step ? <Check size={13} /> : i + 1}
                  </div>
                  <p className={clsx('text-xs mt-1 font-medium', i === step ? 'text-trust-700' : 'text-slate-400')}>{s}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={clsx('flex-1 h-0.5 mx-2 mb-4 transition-colors duration-200', i < step ? 'bg-sage-400' : 'bg-slate-200')} />
                )}
              </div>
            ))}
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-card">
            <h2 className="font-display text-xl text-trust-900 mb-6">{STEPS[step]}</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
              {stepFields[step]}
              <div className="flex gap-3 mt-8">
                {step > 0 && (
                  <Button type="button" variant="ghost" onClick={() => setStep(s => s - 1)} className="flex-1 justify-center">
                    <ArrowLeft size={15} /> Back
                  </Button>
                )}
                {step < STEPS.length - 1 ? (
                  <Button type="button" onClick={handleNext} className="flex-1 justify-center">
                    Next <ArrowRight size={15} />
                  </Button>
                ) : (
                  <Button type="submit" loading={loading} variant="secondary" className="flex-1 justify-center">
                    Submit Profile ✓
                  </Button>
                )}
              </div>
            </form>
          </div>

          <p className="text-center text-xs text-slate-400 mt-4">
            Your profile will be reviewed by our team within 1–2 working days. You'll be notified on approval.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  )
}
