import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-trust-950 text-white py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <p className="font-display text-lg font-semibold mb-2">Devkalp Foundation</p>
            <p className="text-trust-200 text-sm leading-relaxed">
              Empowering communities through matrimony, health campaigns, employment, and volunteering.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-trust-400 mb-3">Quick Links</p>
            <ul className="space-y-2 text-sm text-trust-200">
              {[
                { href: '/campaigns', label: 'Campaigns' },
                { href: '/jobs',      label: 'Jobs' },
                { href: '/donate',    label: 'Donate' },
                { href: '/matrimony', label: 'Matrimony' },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-trust-400 mb-3">Account</p>
            <ul className="space-y-2 text-sm text-trust-200">
              <li><Link href="/auth/login" className="hover:text-white transition-colors">Sign In</Link></li>
              <li><Link href="/auth/register" className="hover:text-white transition-colors">Register</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-trust-800 pt-6 text-center text-xs text-trust-400">
          © {new Date().getFullYear()} Devkalp Foundation. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
