'use client'
import DashboardLayout from './DashboardLayout'
import { LayoutDashboard, HeartHandshake, UserCheck, Briefcase, HandHeart, Leaf, Heart, Users, Activity } from 'lucide-react'

const ADMIN_NAV = [
  { href: '/admin',               icon: <LayoutDashboard size={17}/>, label: 'Dashboard' },
  { href: '/admin/matrimony',     icon: <HeartHandshake size={17}/>,  label: 'Matrimony' },
  { href: '/admin/counselors',    icon: <UserCheck size={17}/>,       label: 'Counselors' },
  { href: '/admin/jobs',          icon: <Briefcase size={17}/>,       label: 'Jobs & Hiring' },
  { href: '/admin/donations',     icon: <HandHeart size={17}/>,       label: 'Donations' },
  { href: '/admin/campaigns',     icon: <Leaf size={17}/>,            label: 'Campaigns' },
  { href: '/admin/volunteers',    icon: <Heart size={17}/>,           label: 'Volunteers' },
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
