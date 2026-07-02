'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LogOut, ChevronRight, Menu, X, Bell } from 'lucide-react'
import Image from 'next/image'
import { useAuthStore } from '@/lib/store'
import { Avatar } from '@/components/ui'
import { clsx } from 'clsx'

export interface NavItem {
  href: string
  icon: React.ReactNode
  label: string
  badge?: number
}

interface DashboardLayoutProps {
  children: React.ReactNode
  navItems: NavItem[]
  title: string
}

export default function DashboardLayout({ children, navItems, title }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, clearAuth } = useAuthStore()
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    clearAuth()
    router.push('/')
  }

  const Sidebar = ({ mobile = false }) => (
    <aside className={clsx(
      'flex flex-col h-full bg-white border-r border-slate-100',
      mobile ? 'w-72' : 'w-64'
    )}>
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-100 shrink-0">
        <Image src="/devkalp-logo-removebg-preview.png" alt="Devkalp Foundation Logo" width={110} height={36} className="object-contain h-14 w-auto" />
        <span className="text-[10px] text-slate-400 uppercase tracking-widest leading-none font-medium">{title}</span>
      </div>

      {/* User info */}
      {user && (
        <div className="px-4 py-4 border-b border-slate-50">
          <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-3 py-2.5">
            <Avatar name={user.full_name} src={user.profile_picture} size="sm" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{user.full_name}</p>
              <p className="text-xs text-slate-400 capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href || (
              pathname.startsWith(item.href + '/') &&
              !navItems.some(other => other.href !== item.href && pathname.startsWith(other.href))
            )
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={clsx(
                  'sidebar-link',
                  active && 'sidebar-link-active'
                )}
              >
                <span className={clsx('shrink-0', active ? 'text-white' : 'text-slate-400')}>{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.badge ? (
                  <span className={clsx(
                    'ml-auto text-xs font-semibold px-2 py-0.5 rounded-full',
                    active ? 'bg-white/20 text-white' : 'bg-trust-100 text-trust-700'
                  )}>{item.badge}</span>
                ) : null}
                {active && <ChevronRight size={14} className="ml-auto text-white/60" />}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-slate-100 shrink-0">
        <Link href="/" className="sidebar-link text-xs mb-1 text-slate-400 hover:text-slate-600">
          ← Back to website
        </Link>
        <button
          onClick={handleLogout}
          className="w-full sidebar-link text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-50 flex">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 md:px-6 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            <Menu size={20} />
          </button>
          <div className="md:flex-1" />
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 relative">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-saffron-400 rounded-full" />
            </button>
            {user && (
              <div className="hidden md:flex items-center gap-2 ml-1">
                <Avatar name={user.full_name} src={user.profile_picture} size="sm" />
                <div>
                  <p className="text-sm font-medium text-slate-800 leading-tight">{user.full_name}</p>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
