'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { HandHeart, TrendingUp, Receipt, Heart } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { StatsCard, Badge, Card, Button, EmptyState, Spinner } from '@/components/ui'
import { donationsApi } from '@/lib/api'

export default function DonorDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    donationsApi.myDonations().then(r => setData(r.data)).catch(()=>{}).finally(()=>setLoading(false))
  }, [])

  const donations = data?.donations || []
  const completed = donations.filter((d:any) => d.status === 'completed')

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 mt-16 md:mt-20 space-y-8">
        <div>
          <h1 className="font-display text-2xl text-trust-900">My Giving Journey</h1>
          <p className="text-slate-500 text-sm mt-1">Every rupee you gave, accounted for.</p>
        </div>
        {loading ? <div className="flex justify-center py-16"><Spinner size="lg"/></div> : <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatsCard label="Total Donated" value={`₹${(data?.total_donated||0).toLocaleString('en-IN')}`} icon={<TrendingUp size={18}/>} color="saffron"/>
            <StatsCard label="Donations Made" value={completed.length} icon={<HandHeart size={18}/>} color="trust"/>
            <StatsCard label="Campaigns Supported" value={new Set(completed.map((d:any)=>d.campaign_id).filter(Boolean)).size} icon={<Heart size={18}/>} color="sage"/>
          </div>
          {donations.length === 0 ? (
            <EmptyState icon={<HandHeart size={24}/>} title="No donations yet"
              description="Your giving journey starts with a single step."
              action={<Link href="/donate"><Button size="sm">Make a Donation →</Button></Link>}/>
          ) : (
            <div>
              <h2 className="font-display text-xl text-trust-900 mb-4">Donation History</h2>
              <div className="space-y-3">
                {donations.map((d:any) => (
                  <Card key={d.id} className="p-5">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        d.status==='completed' ? 'bg-sage-100 text-sage-600' : 'bg-amber-100 text-amber-600'}`}>
                        <Receipt size={18}/>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-slate-800">₹{d.amount.toLocaleString('en-IN')}</p>
                          <Badge status={d.status}/>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {d.receipt_number} · {new Date(d.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>}
      </div>
      <Footer />
    </div>
  )
}
