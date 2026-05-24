'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { Card, CardContent } from '@/components/ui/card'
import { createBrowserClient } from '@supabase/ssr'
import { Users, FileText, Map, ClipboardList, Wallet, TrendingUp, Eye, Heart } from 'lucide-react'
import { motion } from 'framer-motion'

interface StatCard {
  label: string
  value: string | number
  icon: React.ElementType
  color: string
}

export default function AdminOverviewPage() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<StatCard[]>([])
  const [recentPosts, setRecentPosts] = useState<Record<string, unknown>[]>([])
  const [recentOrders, setRecentOrders] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const [usersRes, guidesRes, postsRes, plansRes, ordersRes, payoutsRes] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('guide_profiles').select('id', { count: 'exact', head: true }),
          supabase.from('posts').select('id', { count: 'exact', head: true }).eq('status', 'published'),
          supabase.from('tour_plans').select('id', { count: 'exact', head: true }).eq('status', 'published'),
          supabase.from('orders').select('id', { count: 'exact', head: true }),
          supabase.from('payout_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        ])

        setStats([
          { label: 'Total Users', value: usersRes.count ?? 0, icon: Users, color: 'text-blue-600 bg-blue-50' },
          { label: 'Verified Guides', value: guidesRes.count ?? 0, icon: Users, color: 'text-green-600 bg-green-50' },
          { label: 'Published Posts', value: postsRes.count ?? 0, icon: FileText, color: 'text-purple-600 bg-purple-50' },
          { label: 'Published Plans', value: plansRes.count ?? 0, icon: Map, color: 'text-amber-600 bg-amber-50' },
          { label: 'Total Orders', value: ordersRes.count ?? 0, icon: ClipboardList, color: 'text-cyan-600 bg-cyan-50' },
          { label: 'Pending Payouts', value: payoutsRes.count ?? 0, icon: Wallet, color: 'text-red-600 bg-red-50' },
        ])

        const { data: posts } = await supabase
          .from('posts')
          .select('id, title, status, created_at, author:profiles!posts_author_id_fkey(display_name)')
          .order('created_at', { ascending: false })
          .limit(5)
        if (posts) setRecentPosts(posts as unknown as Record<string, unknown>[])

        const { data: orders } = await supabase
          .from('orders')
          .select('id, order_number, escrow_status, agreed_price_cny, created_at, tourist:profiles!orders_tourist_id_fkey(display_name), guide:profiles!orders_guide_id_fkey(display_name)')
          .order('created_at', { ascending: false })
          .limit(5)
        if (orders) setRecentOrders(orders as unknown as Record<string, unknown>[])
      } catch {
        // Supabase unreachable
      }
      setLoading(false)
    }
    load()
  }, [user])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Overview</h1>
        <p className="text-slate-500 text-sm">Platform analytics and management.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-slate-500">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Posts */}
        <Card>
          <CardContent className="p-5">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Recent Posts
            </h3>
            {recentPosts.length === 0 ? (
              <p className="text-sm text-slate-400">No posts yet.</p>
            ) : (
              <div className="space-y-3">
                {recentPosts.map((post) => (
                  <div key={post.id as string} className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{post.title as string}</p>
                      <p className="text-xs text-slate-400">
                        by {(post.author as Record<string, string>)?.display_name || 'Unknown'} · {(post.created_at as string).split('T')[0]}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                      post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {post.status as string}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardContent className="p-5">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <ClipboardList className="w-4 h-4" /> Recent Orders
            </h3>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-slate-400">No orders yet.</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id as string} className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{order.order_number as string}</p>
                      <p className="text-xs text-slate-400">
                        {(order.tourist as Record<string, string>)?.display_name || 'Tourist'} → {(order.guide as Record<string, string>)?.display_name || 'Guide'} · ¥{order.agreed_price_cny as number}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 shrink-0 ml-2">
                      {(order.escrow_status as string)?.replace(/_/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
