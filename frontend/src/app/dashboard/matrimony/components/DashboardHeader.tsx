'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { LogOut, Bell, Home, ArrowLeft } from 'lucide-react'
import { useAuthStore } from '@/lib/store'

export default function DashboardHeader() {
  const { user, clearAuth } = useAuthStore()
  const router = useRouter()
  const [showNotifications, setShowNotifications] = useState(false)

  const handleLogout = () => {
    clearAuth()
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Left Side: Brand Logo & Title */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-1 shrink-0">
              <Image 
                src="/Logo-removebg-preview.png" 
                alt="Devkalp Foundation Logo" 
                width={100} 
                height={32} 
                className="object-contain h-12 w-auto" 
              />
            </Link>
            <div className="hidden sm:block h-5 w-[1px] bg-slate-200" />
            <div className="bg-trust-50 text-trust-800 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-trust-100 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-saffron-500 animate-pulse" />
              Matrimony Workspace
            </div>
          </div>

          {/* Right Side: Navigation & User Actions */}
          <div className="flex items-center gap-3">
            
            {/* Back to Website */}
            <Link 
              href="/"
              className="text-xs text-slate-500 hover:text-trust-700 transition-colors font-medium flex items-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100"
            >
              <Home size={14} />
              <span className="hidden md:inline">Back to Website</span>
            </Link>

            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 relative border border-slate-100/50"
              >
                <Bell size={16} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-saffron-500 rounded-full" />
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-100 rounded-2xl shadow-float p-4 z-50 animate-fade-in text-xs text-slate-500 text-center">
                  You have no new notifications.
                </div>
              )}
            </div>

            {/* Vertical divider */}
            <div className="h-5 w-[1px] bg-slate-200" />

            {/* User Profile Info */}
            {user && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-trust-600 to-trust-800 text-white text-xs font-bold flex items-center justify-center shadow-md">
                  {user.full_name.split(' ').map((w: string) => w[0]).slice(0,2).join('')}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-semibold text-slate-800 leading-none">{user.full_name}</p>
                  <p className="text-[10px] text-slate-400 capitalize mt-0.5">{user.role} member</p>
                </div>
              </div>
            )}

            {/* Logout Action */}
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1.5 border border-slate-100/50"
              title="Sign Out"
            >
              <LogOut size={16} />
              <span className="hidden lg:inline text-xs font-semibold text-slate-600">Sign Out</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  )
}
