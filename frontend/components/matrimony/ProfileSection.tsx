'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { HeartHandshake, User, Heart, Star, Edit2, Camera, ChevronRight } from 'lucide-react'
import { Badge, Button, Card, Spinner } from '@/components/ui'
import { matrimonyApi } from '@/lib/api'
import toast from 'react-hot-toast'

const NAV = [
  { href: '/dashboard/matrimony',            icon: <HeartHandshake size={18} />, label: 'Overview' },
  { href: '/dashboard/matrimony/profile',    icon: <User size={18} />,           label: 'My Profile' },
  { href: '/dashboard/matrimony/matches',    icon: <Heart size={18} />,          label: 'Matches' },
  { href: '/dashboard/matrimony/evaluation', icon: <Star size={18} />,           label: 'Readiness Eval.' },
  { href: '/dashboard/matrimony/family',     icon: <User size={18} />,           label: 'Family Details' },
]

const FIELD_LABELS: Record<string, string> = {
  date_of_birth: 'Date of Birth', gender: 'Gender', height_cm: 'Height (cm)',
  religion: 'Religion', caste: 'Caste', city: 'City', state: 'State',
  education: 'Education', occupation: 'Occupation', annual_income: 'Annual Income',
  family_type: 'Family Type', marriage_status: 'Marital Status', children: 'Children',
  blood_group: 'Blood Group',
}

export default function ProfileSection({ id }: { id?: string }) {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    matrimonyApi.getMyProfile()
      .then(r => setProfile(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (!profile) return (
    <div id={id} className="scroll-mt-32 w-full pt-10 border-t border-slate-100 mt-10">
      <div className="max-w-xl mx-auto py-20 px-6 text-center space-y-6">
        <div className="w-20 h-20 bg-trust-50 border border-trust-100 rounded-3xl flex items-center justify-center mx-auto text-trust-600 shadow-inner">
          <HeartHandshake size={36} />
        </div>
        <div className="space-y-2">
          <h2 className="font-display text-2xl font-bold text-trust-900">Set Up Your Matrimony Profile</h2>
          <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
            Create your personalized profile to start receiving handpicked match suggestions aligned with your life values.
          </p>
        </div>
        <div className="pt-4">
          <Link href="/matrimony/register">
            <Button size="lg" variant="secondary" className="group shadow-warm font-semibold">
              Create Profile Now <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )

  return (
    <div id={id} className="scroll-mt-32 w-full pt-10 border-t border-slate-100 mt-10">
      <div className="p-4 md:p-6 space-y-5 max-w-4xl mx-auto">
        
        {/* Page Title & Edit Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl md:text-2xl font-bold text-trust-900">My Matrimony Profile</h1>
            <p className="text-slate-500 text-xs mt-0.5">Your registered profile details reviewed by our counseling team.</p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <Badge status={profile.status} className="px-2.5 py-0.5 text-[10px]" />
            <Link href="/matrimony/register">
              <Button size="sm" variant="ghost" className="shadow-none text-xs h-8 py-0 px-3">
                <Edit2 size={12} /> Edit Profile
              </Button>
            </Link>
          </div>
        </div>

        {/* Status Alert Banner */}
        {profile.status === 'pending' && (
          <div className="bg-amber-50/50 border border-amber-100 text-amber-800 rounded-2xl p-3 px-4 flex items-center gap-2 text-xs font-medium">
            <span className="shrink-0 text-sm">⏳</span>
            <p className="min-w-0 truncate">
              <span className="font-bold">Under Counselor Review</span> — Our matrimonial counselors are verifying your profile. This usually takes 1-2 business days.
            </p>
          </div>
        )}
        {profile.status === 'rejected' && (
          <div className="bg-rose-50/50 border border-rose-100 text-rose-800 rounded-2xl p-3 px-4 flex items-center gap-2 text-xs font-medium">
            <span className="shrink-0 text-sm">❌</span>
            <p className="min-w-0 truncate">
              <span className="font-bold">Changes Required</span> — Reason: {profile.rejection_reason || 'Please contact our counseling team to update your details.'}
            </p>
          </div>
        )}
        {profile.status === 'approved' && (
          <div className="bg-emerald-50/50 border border-emerald-100 text-emerald-800 rounded-2xl p-3 px-4 flex items-center gap-2 text-xs font-medium">
            <span className="shrink-0 text-sm">✨</span>
            <p className="min-w-0 truncate">
              <span className="font-bold">Active & Verified</span> — Your profile is active. Our counselors are currently reviewing compatibility with other verified candidates.
            </p>
          </div>
        )}

        {/* Profile Card Header */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-card flex flex-col sm:flex-row gap-4 sm:items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-trust-50/40 rounded-full blur-2xl pointer-events-none" />
          
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-trust-100 to-indigo-50 border border-slate-100 overflow-hidden flex items-center justify-center text-trust-700 text-2xl font-display font-bold shrink-0 shadow-inner">
            {profile.photos?.length > 0 ? (
              <img src={profile.photos[0]} alt="" className="w-full h-full object-cover" />
            ) : (
              profile.gender === 'female' ? '👩' : '👨'
            )}
          </div>
          
          <div className="flex-1 min-w-0 space-y-1">
            <h2 className="font-display text-lg font-bold text-trust-900 capitalize">
              {profile.gender === 'female' ? 'Sister' : 'Brother'} Candidate
            </h2>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 font-semibold">
              <span>📍 {profile.city}, {profile.state}</span>
              <span className="text-slate-300">•</span>
              <span>🎂 {profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</span>
              <span className="text-slate-300">•</span>
              <span className="capitalize">💍 {profile.marriage_status?.replace(/_/g, ' ')}</span>
            </div>
          </div>
        </div>

        {/* Photos Grid */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-card">
          <h3 className="font-display text-sm font-bold text-trust-900 mb-3 flex items-center gap-1.5">
            📸 Uploaded Photos
          </h3>
          {profile.photos?.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {profile.photos.map((url: string, i: number) => (
                <div key={i} className="group relative aspect-square rounded-xl overflow-hidden border border-slate-100 bg-slate-50 shadow-sm hover:shadow-md transition-shadow">
                  <img src={url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Camera size={20} className="text-slate-300 mx-auto mb-1.5" />
              <p className="text-slate-400 text-xs">No photos uploaded yet.</p>
            </div>
          )}
        </div>

        {/* Personal Details Dashboard Block */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-card">
          <h3 className="font-display text-sm font-bold text-trust-900 mb-4.5 flex items-center gap-1.5">
            👤 Profile Details
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-y-4 gap-x-6">
            {Object.entries(FIELD_LABELS).map(([key, label]) => (
              profile[key] !== null && profile[key] !== undefined && (
                <div key={key} className="border-b border-slate-50 pb-1.5">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                  <p className="text-xs font-semibold text-slate-700 capitalize mt-0.5">
                    {String(profile[key]).replace(/_/g, ' ')}
                  </p>
                </div>
              )
            ))}
          </div>
        </div>

        {/* About, Values & Preferences Section */}
        {(profile.bio || profile.values || profile.expectations || profile.hobbies?.length > 0) && (
          <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-card space-y-4">
            <h3 className="font-display text-sm font-bold text-trust-900 flex items-center gap-1.5">
              💬 About & Personal Values
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {profile.bio && (
                <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-100">
                  <p className="text-[10px] font-bold text-trust-800 uppercase tracking-wider mb-1">About Me</p>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">{profile.bio}</p>
                </div>
              )}
              
              {profile.values && (
                <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-100">
                  <p className="text-[10px] font-bold text-trust-800 uppercase tracking-wider mb-1">My Values & Background</p>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">{profile.values}</p>
                </div>
              )}
              
              {profile.expectations && (
                <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-100">
                  <p className="text-[10px] font-bold text-trust-800 uppercase tracking-wider mb-1">Partner Expectations</p>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">{profile.expectations}</p>
                </div>
              )}
            </div>
            
            {profile.hobbies?.length > 0 && (
              <div className="pt-1">
                <p className="text-[10px] font-bold text-trust-800 uppercase tracking-wider mb-2">Hobbies & Interests</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.hobbies.map((h: string) => (
                    <span key={h} className="px-2.5 py-1 bg-trust-50 text-trust-700 text-[10px] rounded-lg font-semibold border border-trust-100/50 capitalize shadow-sm">
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
      </div>
    </div>
  )
}
