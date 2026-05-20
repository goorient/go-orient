'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import Link from 'next/link'
import { Navbar } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  FileText,
  Map,
  ClipboardList,
  BadgeCheck,
  Wallet,
  UserCircle,
} from 'lucide-react'

const sidebarItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/profile', label: 'Guide Profile', icon: UserCircle },
  { href: '/dashboard/plans', label: 'Tour Plans', icon: Map },
  { href: '/dashboard/posts', label: 'Content', icon: FileText },
  { href: '/dashboard/orders', label: 'Orders', icon: ClipboardList },
  { href: '/dashboard/verification', label: 'Verification', icon: BadgeCheck },
  { href: '/dashboard/earnings', label: 'Earnings', icon: Wallet },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, isLoading } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!user || profile?.role !== 'guide')) {
      router.push('/')
    }
  }, [user, profile, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="flex justify-center items-center h-screen">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!user || profile?.role !== 'guide') return null

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        {/* Sidebar */}
        <aside className="hidden md:block w-56 shrink-0">
          <nav className="sticky top-20 space-y-1">
            {sidebarItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button variant="ghost" className="w-full justify-start gap-2 text-slate-600 hover:text-slate-900">
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Mobile nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 flex overflow-x-auto">
          {sidebarItems.map((item) => (
            <Link key={item.href} href={item.href} className="flex-1 flex flex-col items-center py-2 text-xs text-slate-500 hover:text-slate-900">
              <item.icon className="w-4 h-4 mb-0.5" />
              <span className="truncate px-1">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Main content */}
        <main className="flex-1 min-w-0 pb-20 md:pb-0">
          {children}
        </main>
      </div>
    </div>
  )
}
