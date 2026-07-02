'use client'

import DashboardLayout from './DashboardLayout'
import {
  Users, HeartHandshake, HandHeart, Briefcase,
  Leaf, Activity, Heart, BarChart2,
} from 'lucide-react'
import type { ReactNode } from 'react'

const ADMIN_NAV = [
  { href: '/admin',            label: 'Overview',     icon: <BarChart2 size={15} /> },
  { href: '/admin/users',      label: 'Users',        icon: <Users size={15} /> },
  { href: '/admin/matrimony',  label: 'Matrimony',    icon: <HeartHandshake size={15} /> },
  { href: '/admin/donations',  label: 'Donations',    icon: <HandHeart size={15} /> },
  { href: '/admin/jobs',       label: 'Jobs',         icon: <Briefcase size={15} /> },
  { href: '/admin/campaigns',  label: 'Campaigns',    icon: <Leaf size={15} /> },
  { href: '/admin/volunteers', label: 'Volunteers',   icon: <Heart size={15} /> },
  { href: '/admin/counselors', label: 'Counselors',   icon: <Users size={15} /> },
  { href: '/admin/activity',   label: 'Activity Log', icon: <Activity size={15} /> },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardLayout navItems={ADMIN_NAV} title="Admin">
      {children}
    </DashboardLayout>
  )
}
