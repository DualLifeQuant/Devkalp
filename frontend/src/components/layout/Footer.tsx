import Link from 'next/link'
import Image from 'next/image'
import { Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-trust-950 text-slate-300">
      <div className="page-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-block mb-5">
              <Image src="/Logo-removebg-preview.png" alt="Devkalp Foundation Logo" width={120} height={40 } className="object-contain h-32 w-auto opacity-90 brightness-0 invert" />
            </Link>
            <p className="text-sm leading-relaxed text-slate-400 mb-6 font-accent italic">
              "Empowering communities, transforming lives — one family at a time."
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-sage-400 inline-block" />
              Registered NGO · Surat, Gujarat
            </div>
          </div>

          {/* Programs */}
          <div>
            <p className="font-semibold text-white text-sm mb-4 uppercase tracking-wide">Our Work</p>
            <ul className="space-y-2.5 text-sm">
              {[
                ['Matrimony Services', '/matrimony/register'],
                ['Make a Donation', '/donate'],
                ['Health Campaigns', '/campaigns'],
                ['Career Opportunities', '/jobs'],
                ['Volunteer With Us', '/volunteer'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-slate-400 hover:text-saffron-300 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Transparency */}
          <div>
            <p className="font-semibold text-white text-sm mb-4 uppercase tracking-wide">Transparency</p>
            <ul className="space-y-2.5 text-sm">
              {[
                ['Fund Usage Reports', '/donate#transparency'],
                ['Campaign Impact',    '/campaigns#impact'],
                ['Annual Reports',     '/about#reports'],
                ['About Us',           '/about'],
                ['Contact Us',         '/contact'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-slate-400 hover:text-saffron-300 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="font-semibold text-white text-sm mb-4 uppercase tracking-wide">Get in Touch</p>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <Mail size={14} className="text-saffron-400 mt-0.5 shrink-0" />
                <span>devkalp986@gmail.com</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone size={14} className="text-saffron-400 mt-0.5 shrink-0" />
                <span>+91 91040 98600</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin size={14} className="text-saffron-400 mt-0.5 shrink-0" />
                <span>Surat, Gujarat, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2025 Devkalp Foundation. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <Link href="/terms"   className="hover:text-slate-300 transition-colors">Terms of Use</Link>
            <Link href="/80g"     className="hover:text-slate-300 transition-colors">80G Certificate</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
