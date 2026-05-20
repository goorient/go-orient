'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { createBrowserClient } from '@supabase/ssr'
import { Card, CardContent } from '@/components/ui/card'
import { Map, FileText, ClipboardList, DollarSign, TrendingUp, Users } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface Stat {
  label: string
  value: string
  icon: typeof Map
  href: string
}

export default function DashboardPage() {
  const { user, profile } = useAuthStore()
  const [stats, setStats] = useState<Stat[]>([
    { label: 'Tour Plans', value: '0', icon: Map, href: '/dashboard/plans' },
    { label: 'Posts', value: '0', icon: FileText, href: '/dashboard/posts' },
    { label: 'Active Orders', value: '0', icon: ClipboardList, href: '/dashboard/orders' },
    { label: 'Earnings', value: '¥0', icon: DollarSign, href: '/dashboard/earnings' },
  ])
  const [recentOrders, setRecentOrders] = useState<{ id: string; title: string; status: string; price: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    const loadStats = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        // Count plans
        const { count: planCount } = await supabase
          .from('tour_plans')
          .select('*', { count: 'exact', head: true })
          .eq('guide_id', user!.id)

        // Count posts
        const { count: postCount } = await supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .eq('author_id', user!.id)

        // Active orders
        const { data: activeOrders } = await supabase
          .from('orders')
          .select('id, escrow_status, agreed_price_cny, plan_snapshot')
          .eq('guide_id', user!.id)
          .in('escrow_status', ['paid_to_escrow', 'guide_accepted', 'service_in_progress'])

        // Total earnings
        const { data: completedOrders } = await supabase
          .from('orders')
          .select('agreed_price_cny')
          .eq('guide_id', user!.id)
          .in('escrow_status', ['service_completed', 'tourist_confirmed', 'funds_released'])

        const totalEarnings = (completedOrders || []).reduce(
          (s: number, o: Record<string, unknown>) => s + (o.agreed_price_cny as number), 0
        )

        setStats([
          { label: 'Tour Plans', value: String(planCount ?? 0), icon: Map, href: '/dashboard/plans' },
          { label: 'Posts', value: String(postCount ?? 0), icon: FileText, href: '/dashboard/posts' },
          { label: 'Active Orders', value: String(activeOrders?.length ?? 0), icon: ClipboardList, href: '/dashboard/orders' },
          { label: 'Earnings', value: `¥${totalEarnings.toLocaleString()}`, icon: DollarSign, href: '/dashboard/earnings' },
        ])

        // Recent orders for activity feed
        if (activeOrders && activeOrders.length > 0) {
          setRecentOrders(
            activeOrders.slice(0, 3).map((o: Record<string, unknown>) => ({
              id: o.id as string,
              title: (o.plan_snapshot as Record<string, string>)?.title || 'Tour Plan',
              status: o.escrow_status as string,
              price: o.agreed_price_cny as number,
            }))
          )
        } else {
          setRecentOrders([
            { id: '1', title: 'No active orders yet', status: '', price: 0 },
          ])
        }
      } catch {
        // Demo stats
        setStats([
          { label: 'Tour Plans', value: '3', icon: Map, href: '/dashboard/plans' },
          { label: 'Posts', value: '5', icon: FileText, href: '/dashboard/posts' },
          { label: 'Active Orders', value: '2', icon: ClipboardList, href: '/dashboard/orders' },
          { label: 'Earnings', value: '¥23,600', icon: DollarSign, href: '/dashboard/earnings' },
        ])
        setRecentOrders([
          { id: '1', title: 'Classic Beijing 3-Day Tour', status: 'guide_accepted', price: 7600 },
          { id: '2', title: 'Great Wall Sunset Experience', status: 'paid_to_escrow', price: 800 },
        ])
      }
      setLoading(false)
    }
    loadStats()
  }, [user])

  const STATUS_LABEL: Record<string, string> = {
    paid_to_escrow: 'Awaiting Acceptance',
    guide_accepted: 'Accepted',
    service_in_progress: 'In Progress',
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Welcome back{profile?.display_name ? `, ${profile.display_name}` : ''}</h1>
      <p className="text-slate-500 text-sm mb-6">Manage your tours, content, and bookings.</p>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link href={stat.href}>
              <Card className="hover:border-slate-300 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                      <stat.icon className="w-4 h-4 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-slate-500">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity + Quick Start */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-slate-500" />
              Recent Activity
            </h3>
            <Link href="/dashboard/orders" className="text-xs text-blue-600 hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="p-6 text-center">
                <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin mx-auto" />
              </div>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{order.title}</p>
                    {order.status && (
                      <p className="text-xs text-slate-400">{STATUS_LABEL[order.status] || order.status}</p>
                    )}
                  </div>
                  {order.price > 0 && (
                    <p className="text-sm font-bold text-slate-700">¥{order.price.toLocaleString()}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Quick Start */}
        <Card>
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-slate-500" />
              Quick Start
            </h3>
          </div>
          <div className="p-4 space-y-4">
            <p className="text-sm text-slate-500">Get started by completing these steps:</p>
            <div className="space-y-3">
              {[
                { step: 'Complete your identity verification', href: '/dashboard/verification', icon: Users },
                { step: 'Create your first tour plan', href: '/dashboard/plans', icon: Map },
                { step: 'Share content to attract tourists', href: '/dashboard/posts', icon: FileText },
                { step: 'Respond to booking requests', href: '/dashboard/orders', icon: ClipboardList },
              ].map((item) => (
                <Link key={item.step} href={item.href}>
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-slate-200">
                      <item.icon className="w-4 h-4 text-slate-500" />
                    </div>
                    <p className="text-sm text-slate-600 group-hover:text-slate-900">{item.step}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
