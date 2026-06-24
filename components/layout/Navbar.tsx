'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { Menu, X, LogOut, User } from 'lucide-react'
import { clsx } from 'clsx'
import { useAuthStore, getDashboardPath } from '@/lib/store'
import toast from 'react-hot-toast'

const NAV_LINKS = [
  { href: '/campaigns', label: 'Campaigns' },
  { href: '/jobs',      label: 'Jobs' },
  { href: '/donate',    label: 'Donate' },
  { href: '/matrimony', label: 'Matrimony' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, user, clearAuth } = useAuthStore()

  function handleLogout() {
    clearAuth()
    toast.success('Logged out successfully')
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-display text-xl font-semibold text-trust-950">
          Devkalp Foundation
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={clsx(
                'px-3.5 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname.startsWith(l.href)
                  ? 'text-trust-800 bg-trust-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Auth */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated && user ? (
            <>
              <Link
                href={getDashboardPath(user.role)}
                className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <User size={16} />
                {user.full_name.split(' ')[0]}
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <LogOut size={15} />
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                Sign in
              </Link>
              <Link href="/auth/register" className="text-sm font-semibold bg-trust-800 text-white px-4 py-2 rounded-xl hover:bg-trust-700 transition-colors">
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1">
          {NAV_LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-slate-100 mt-2">
            {isAuthenticated && user ? (
              <button onClick={handleLogout} className="w-full text-left px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                Sign out
              </button>
            ) : (
              <Link href="/auth/login" onClick={() => setOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-trust-700 hover:bg-trust-50 rounded-lg transition-colors">
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
