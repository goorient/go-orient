'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Compass, Map, Users, MessageCircle, User, Shield } from 'lucide-react'
import { NotificationBell } from '@/components/notifications/notification-bell'
import { LanguageToggle } from '@/components/layout/language-toggle'

const MOBILE_NAV_ITEMS = [
  { href: '/', label: 'Discover', icon: Compass },
  { href: '/plans', label: 'Plans', icon: Map },
  { href: '/guides', label: 'Guides', icon: Users },
  { href: '/chat', label: 'Chat', icon: MessageCircle },
  { href: '/profile', label: 'Profile', icon: User },
]

export function Navbar() {
  const { user, profile } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  const handleSignOut = async () => {
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      await supabase.auth.signOut()
    } catch {
      // Supabase unreachable — clear local state only
    }
    router.push('/')
    router.refresh()
  }

  // Don't show mobile nav on dashboard/admin pages (they have their own)
  const isDashboard = pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin')

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Go Orient
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
              Discover
            </Link>
            <Link href="/plans" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
              Tour Plans
            </Link>
            <Link href="/guides" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
              Local Guides
            </Link>
            <Link href="/visa" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
              Visa
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                {profile?.role === 'admin' && (
                  <Link href="/admin">
                    <Button variant="outline" size="sm" className="gap-1"><Shield className="w-3 h-3" /> Admin</Button>
                  </Link>
                )}
                {profile?.role === 'guide' && (
                  <Link href="/dashboard">
                    <Button variant="outline" size="sm">Dashboard</Button>
                  </Link>
                )}
                <NotificationBell />
                <LanguageToggle />
                <Link href="/chat">
                  <Button variant="ghost" size="sm">Chat</Button>
                </Link>
                {profile?.role === 'tourist' && (
                  <Link href="/orders">
                    <Button variant="ghost" size="sm">My Orders</Button>
                  </Link>
                )}
                <Link href="/profile">
                  <Button variant="ghost" size="sm">
                    {profile?.display_name || 'Profile'}
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile: show only sign in/out */}
          <div className="flex md:hidden items-center gap-1">
            <LanguageToggle />
            {user ? (
              <>
                <NotificationBell />
                <LanguageToggle />
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-xs">
                  Sign Out
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button size="sm">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile bottom navigation */}
      {!isDashboard && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-slate-200 z-50">
          <div className="flex items-center">
            {MOBILE_NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex-1 flex flex-col items-center py-2 text-xs transition-colors ${
                    isActive ? 'text-slate-900' : 'text-slate-400'
                  }`}
                >
                  <item.icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-slate-900' : ''}`} />
                  <span className={isActive ? 'font-medium' : ''}>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      )}
    </>
  )
}
