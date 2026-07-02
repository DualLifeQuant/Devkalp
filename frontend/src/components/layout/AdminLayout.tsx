import DashboardLayout from './DashboardLayout'
import { LayoutDashboard, HeartHandshake, UserCheck, Briefcase, HandHeart, Leaf, Heart, Users, Activity, Mail, Building2, Trophy, Newspaper, Image, Handshake, Instagram, BookOpen } from 'lucide-react'

const ADMIN_NAV = [
  { href: '/admin',               icon: <LayoutDashboard size={17}/>, label: 'Dashboard' },
  { href: '/admin/matrimony',     icon: <HeartHandshake size={17}/>,  label: 'Matrimony' },
  { href: '/admin/counselors',    icon: <UserCheck size={17}/>,       label: 'Counselors' },
  { href: '/admin/jobs',          icon: <Briefcase size={17}/>,       label: 'Jobs & Hiring' },
  { href: '/admin/donations',     icon: <HandHeart size={17}/>,       label: 'Donations' },
  { href: '/admin/campaigns',     icon: <Leaf size={17}/>,            label: 'Campaigns' },
  { href: '/admin/volunteers',    icon: <Heart size={17}/>,           label: 'Volunteers' },
  { href: '/admin/messages',      icon: <Mail size={17}/>,            label: 'Messages' },
  { href: '/admin/scholarship',   icon: <BookOpen size={17}/>,        label: 'Scholarships' },
  { href: '/admin/csr',           icon: <Building2 size={17}/>,       label: 'CSR Inquiries' },
  { href: '/admin/awards',        icon: <Trophy size={17}/>,          label: 'Awards & Honors' },
  { href: '/admin/press',         icon: <Newspaper size={17}/>,       label: 'Press & Media' },
  { href: '/admin/gallery',       icon: <Image size={17}/>,           label: 'Media Gallery' },
  { href: '/admin/partners',      icon: <Handshake size={17}/>,       label: 'Partners & Sponsors' },
  { href: '/admin/instagram',     icon: <Instagram size={17}/>,       label: 'Instagram Feed' },
  { href: '/admin/users',         icon: <Users size={17}/>,           label: 'All Users' },
  { href: '/admin/activity',      icon: <Activity size={17}/>,        label: 'Activity Logs' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout navItems={ADMIN_NAV} title="Admin Panel">
      {children}
    </DashboardLayout>
  )
}
