'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { clsx } from 'clsx'
import { LogOut } from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import toast from 'react-hot-toast'
import type { ReactNode } from 'react'

interface NavItem {
  href: string
  label: string
  icon: ReactNode
}

interface DashboardLayoutProps {
  children: ReactNode
  navItems: NavItem[]
  title?: string
}

export default function DashboardLayout({ children, navItems, title }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, clearAuth } = useAuthStore()

  function handleLogout() {
    clearAuth()
    toast.success('Signed out')
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen bg-[#fafaf8] flex">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-white border-r border-slate-100 flex flex-col sticky top-0 h-screen">
        <div className="px-5 py-5 border-b border-slate-100">
          <Link href="/" className="font-display text-base font-semibold text-trust-950 leading-tight">
            Devkalp Foundation
          </Link>
          {user && (
            <p className="text-xs text-slate-400 mt-0.5 truncate">{user.full_name}</p>
          )}
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {title && (
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 px-2 mb-2">{title}</p>
          )}
          <ul className="space-y-0.5">
            {navItems.map(item => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={clsx(
                    'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                    pathname === item.href || pathname.startsWith(item.href + '/')
                      ? 'bg-trust-50 text-trust-800'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  <span className="w-4 h-4 shrink-0">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="px-3 py-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
