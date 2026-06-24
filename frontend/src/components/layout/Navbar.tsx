'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { Menu, X, ChevronDown, LogOut, LayoutDashboard } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore, getDashboardPath } from '@/lib/store'
import { clsx } from 'clsx'

const NAV_LINKS = [
  { href: '/',          label: 'Home' },
  { href: '/matrimony', label: 'Matrimony' },
  { href: '/campaigns', label: 'Campaigns' },
  { href: '/jobs',      label: 'Careers' },
  { href: '/volunteer', label: 'Volunteer' },
  { href: '/about',     label: 'About' },
  { href: '/contact',   label: 'Contact Us' },
]

export default function Navbar({ transparent = false }: { transparent?: boolean }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userMenu, setUserMenu] = useState(false)
  const { user, isLoggedIn, clearAuth } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])
  useEffect(() => { setOpen(false); setUserMenu(false) }, [pathname])

  const glass = transparent && !scrolled && !open

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={clsx(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        glass ? 'bg-transparent' : 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100/80'
      )}
    >
      <div className="page-container">
        <div className="flex items-center justify-between h-16 md:h-[70px]">

          {/* Logo */}
          <Link href="/" className="shrink-0">
            <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.2 }}>
              <Image src="/Logo-removebg-preview.png" alt="Devkalp Foundation Logo" width={120} height={40} priority className={clsx("object-contain h-24 w-auto transition-all duration-300", glass && "brightness-0 invert")} />
            </motion.div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-0.5">
            {NAV_LINKS.map(link => {
              const active = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
              return (
                <Link key={link.href} href={link.href}
                  className={clsx(
                    'relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    active
                      ? glass ? 'text-white' : 'text-trust-700'
                      : glass ? 'text-white/80 hover:text-white' : 'text-slate-600 hover:text-trust-700 hover:bg-slate-50/80'
                  )}>
                  {link.label}
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className={clsx('absolute bottom-0 left-3 right-3 h-0.5 rounded-full', glass ? 'bg-saffron-300' : 'bg-trust-600')}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              )
            })}
          </div>

          {/* Right */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn && user ? (
              <div className="relative">
                <button onClick={() => setUserMenu(v => !v)}
                  className={clsx('flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all', glass ? 'text-white hover:bg-white/10' : 'text-slate-700 hover:bg-slate-100')}>
                  <div className="w-7 h-7 rounded-full bg-trust-100 text-trust-700 text-xs font-bold flex items-center justify-center">
                    {user.full_name.split(' ').map((w: string) => w[0]).slice(0,2).join('')}
                  </div>
                  <span>{user.full_name.split(' ')[0]}</span>
                  <ChevronDown size={14} className={clsx('transition-transform', userMenu && 'rotate-180')} />
                </button>
                <AnimatePresence>
                  {userMenu && (
                    <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.96 }} transition={{ duration: 0.16 }}
                      className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-float border border-slate-100 overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60">
                        <p className="text-sm font-semibold text-slate-800">{user.full_name}</p>
                        <p className="text-xs text-slate-400 capitalize">{user.role}</p>
                      </div>
                      <div className="p-1.5">
                        <Link href={getDashboardPath(user.role)} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                          <LayoutDashboard size={15}/> Dashboard
                        </Link>
                        <button onClick={() => { clearAuth(); router.push('/') }} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors">
                          <LogOut size={15}/> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link href="/auth/login" className={clsx('px-4 py-2 rounded-xl text-sm font-medium transition-all', glass ? 'text-white/90 hover:text-white' : 'text-slate-700 hover:text-trust-700')}>
                  Sign In
                </Link>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link href="/auth/register" className={clsx('px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm', glass ? 'bg-saffron-400 text-trust-900 hover:bg-saffron-300' : 'bg-trust-800 text-white hover:bg-trust-700 shadow-trust')}>
                    Join Us
                  </Link>
                </motion.div>
              </>
            )}
          </div>

          {/* Hamburger */}
          <button onClick={() => setOpen(v => !v)} className={clsx('md:hidden p-2 rounded-xl', glass ? 'text-white' : 'text-slate-700')}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={open ? 'x' : 'm'} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }} className="block">
                {open ? <X size={22}/> : <Menu size={22}/>}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden overflow-hidden bg-white border-t border-slate-100">
            <div className="page-container py-4 space-y-1">
              {NAV_LINKS.map((link, i) => (
                <motion.div key={link.href} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04, duration: 0.2 }}>
                  <Link href={link.href} onClick={() => setOpen(false)}
                    className={clsx('block px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                      (link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)) ? 'bg-trust-50 text-trust-700' : 'text-slate-700 hover:bg-slate-50')}>
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <div className="border-t border-slate-100 pt-2 mt-2 space-y-1">
                {isLoggedIn && user ? (
                  <>
                    <Link href={getDashboardPath(user.role)} onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-xl text-trust-700 text-sm font-medium hover:bg-trust-50 transition-colors">
                      <LayoutDashboard size={16}/> Dashboard
                    </Link>
                    <button onClick={() => { clearAuth(); router.push('/') }} className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-red-600 text-sm font-medium hover:bg-red-50 transition-colors">
                      <LogOut size={16}/> Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login" onClick={() => setOpen(false)} className="block px-4 py-3 rounded-xl text-slate-700 text-sm font-medium hover:bg-slate-50">Sign In</Link>
                    <Link href="/auth/register" onClick={() => setOpen(false)} className="block px-4 py-3 rounded-xl bg-trust-800 text-white text-sm font-semibold text-center hover:bg-trust-700">Join Us — It's Free</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
