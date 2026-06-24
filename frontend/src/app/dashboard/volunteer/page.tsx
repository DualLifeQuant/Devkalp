'use client'
import { useEffect, useState } from 'react'
import { Users, CheckCircle, Clock, Heart } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { StatsCard, Badge, Card, Button, EmptyState, Spinner } from '@/components/ui'
import { volunteersApi } from '@/lib/api'
import toast from 'react-hot-toast'

export default function VolunteerDashboard() {
  const [profile, setProfile] = useState<any>(null)
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [regData, setRegData] = useState({ occupation:'', city:'', availability:'weekends', motivation:'' })
  const [registering, setRegistering] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const [p,t] = await Promise.allSettled([volunteersApi.myProfile(), volunteersApi.myTasks()])
        if (p.status==='fulfilled') setProfile(p.value.data)
        if (t.status==='fulfilled') setTasks(t.value.data)
      } catch {}
      finally { setLoading(false) }
    }
    load()
  }, [])

  const register = async () => {
    if (!regData.occupation || !regData.city || !regData.motivation) {
      toast.error('Please fill in occupation, city and motivation')
      return
    }
    setRegistering(true)
    try {
      await volunteersApi.register(regData)
      toast.success('Registration submitted! We will review and contact you.')
      const p = await volunteersApi.myProfile()
      setProfile(p.data)
    } catch (e:any) { toast.error(e?.response?.data?.detail || 'Failed') }
    finally { setRegistering(false) }
  }

  const completeTask = async (taskId: string) => {
    try {
      await volunteersApi.completeTask(taskId, { hours_actual: 2 })
      toast.success('Task marked complete!')
      setTasks(t => t.map(x => x.id===taskId ? {...x, is_completed:true} : x))
    } catch { toast.error('Failed') }
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 mt-16 md:mt-20 space-y-8">
        <div>
          <h1 className="font-display text-2xl text-trust-900">Volunteer Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Your contributions make a real difference.</p>
        </div>
        {loading ? <div className="flex justify-center py-16"><Spinner size="lg"/></div> : !profile ? (
          <Card className="p-8 max-w-lg">
            <h2 className="font-display text-xl text-trust-900 mb-2">Register as Volunteer</h2>
            <p className="text-slate-500 text-sm mb-5">Tell us about yourself so we can match you with the right opportunities.</p>
            <div className="space-y-4">
              {[
                { label:'Occupation', key:'occupation', placeholder:'Your current job/profession' },
                { label:'City', key:'city', placeholder:'Your city' },
                { label:'Motivation', key:'motivation', placeholder:'Why do you want to volunteer?' },
              ].map(f => (
                <div key={f.key}>
                  <label className="label">{f.label}</label>
                  <input className="input text-sm" placeholder={f.placeholder}
                    value={(regData as any)[f.key]} onChange={e => setRegData(d => ({...d, [f.key]: e.target.value}))}/>
                </div>
              ))}
              <div>
                <label className="label">Availability</label>
                <select className="input bg-white text-sm" value={regData.availability}
                  onChange={e => setRegData(d => ({...d, availability: e.target.value}))}>
                  <option value="weekends">Weekends only</option>
                  <option value="weekdays">Weekdays only</option>
                  <option value="both">Both weekdays and weekends</option>
                </select>
              </div>
              <Button onClick={register} loading={registering} className="w-full justify-center">Submit Registration</Button>
            </div>
          </Card>
        ) : <>
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
            <Badge status={profile.status}/>
            <p className="text-sm text-slate-600">
              {profile.status==='active' ? 'Your volunteer profile is active.' :
               profile.status==='pending' ? "Your registration is under review. We'll contact you soon." :
               'Your profile is currently inactive.'}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatsCard label="Hours Contributed" value={profile.hours_contributed||0} icon={<Clock size={18}/>} color="trust"/>
            <StatsCard label="Tasks Completed" value={profile.tasks_completed||0} icon={<CheckCircle size={18}/>} color="sage"/>
            <StatsCard label="Active Tasks" value={tasks.filter(t=>!t.is_completed).length} icon={<Heart size={18}/>} color="saffron"/>
          </div>
          <div>
            <h2 className="font-display text-xl text-trust-900 mb-4">My Tasks</h2>
            {tasks.length===0 ? (
              <EmptyState icon={<Users size={20}/>} title="No tasks assigned yet" description="Tasks will appear here once assigned by the team."/>
            ) : (
              <div className="space-y-3">
                {tasks.map((t:any) => (
                  <Card key={t.id} className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${t.is_completed ? 'bg-sage-100 text-sage-600' : 'bg-saffron-50 text-saffron-600'}`}>
                        {t.is_completed ? <CheckCircle size={16}/> : <Clock size={16}/>}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-slate-800">{t.title}</p>
                        {t.description && <p className="text-xs text-slate-500 mt-0.5">{t.description}</p>}
                        {t.due_date && <p className="text-xs text-slate-400 mt-1">Due: {new Date(t.due_date).toLocaleDateString('en-IN')}</p>}
                      </div>
                      {!t.is_completed && (
                        <Button size="sm" variant="sage" onClick={()=>completeTask(t.id)}>Done</Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </>}
      </div>
      <Footer />
    </div>
  )
}
