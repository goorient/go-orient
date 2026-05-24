'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { createBrowserClient } from '@supabase/ssr'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ClipboardList, Clock, CheckCircle, AlertCircle, Wallet } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface Order {
  id: string
  order_number: string
  plan_title: string
  guide_name: string
  travel_date: string
  travel_end_date: string
  group_size: number
  total_price: number
  status: string
  cover_image_url: string
}

const DEMO_ORDERS: Order[] = [
  { id: 'demo-order-1', order_number: 'GO-20260512-ABC123', plan_title: 'Classic Beijing 3-Day Tour', guide_name: 'Li Wei', travel_date: '2026-05-20', travel_end_date: '2026-05-22', group_size: 2, total_price: 7600, status: 'guide_accepted', cover_image_url: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400&h=250&fit=crop' },
  { id: 'demo-order-2', order_number: 'GO-20260508-DEF456', plan_title: 'Great Wall Sunset Experience', guide_name: 'Li Wei', travel_date: '2026-05-25', travel_end_date: '2026-05-25', group_size: 1, total_price: 800, status: 'pending_payment', cover_image_url: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400&h=250&fit=crop' },
  { id: 'demo-order-3', order_number: 'GO-20260410-GHI789', plan_title: 'Chengdu Panda & Food Tour', guide_name: 'Liu Yang', travel_date: '2026-04-10', travel_end_date: '2026-04-12', group_size: 3, total_price: 5400, status: 'funds_released', cover_image_url: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=400&h=250&fit=crop' },
]

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending_payment: { label: 'Pending Payment', color: 'bg-amber-100 text-amber-700' },
  paid_to_escrow: { label: 'Escrowed', color: 'bg-blue-100 text-blue-700' },
  guide_accepted: { label: 'Accepted', color: 'bg-green-100 text-green-700' },
  service_in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  service_completed: { label: 'Completed', color: 'bg-green-100 text-green-700' },
  tourist_confirmed: { label: 'Confirmed', color: 'bg-green-100 text-green-700' },
  funds_released: { label: 'Released', color: 'bg-slate-100 text-slate-600' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700' },
}

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
]

export default function OrdersPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>(DEMO_ORDERS)
  const [activeTab, setActiveTab] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    const loadOrders = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { data } = await supabase
          .from('orders')
          .select('id, order_number, plan_snapshot, agreed_price_cny, travel_start_date, travel_end_date, group_size, escrow_status, guide_id')
          .eq('tourist_id', user!.id)
          .order('created_at', { ascending: false })

        if (data && data.length > 0) {
          // Fetch guide names
          const guideIds = [...new Set(data.map((o: Record<string, unknown>) => o.guide_id as string))]
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, display_name')
            .in('id', guideIds)
          const nameMap = new Map(profiles?.map((p: Record<string, unknown>) => [p.id as string, p.display_name as string]))

          const mapped: Order[] = data.map((o: Record<string, unknown>) => ({
            id: o.id as string,
            order_number: o.order_number as string,
            plan_title: (o.plan_snapshot as Record<string, string>)?.title || 'Tour Plan',
            guide_name: nameMap.get(o.guide_id as string) || 'Guide',
            travel_date: o.travel_start_date as string,
            travel_end_date: o.travel_end_date as string,
            group_size: o.group_size as number,
            total_price: o.agreed_price_cny as number,
            status: o.escrow_status as string,
            cover_image_url: (o.plan_snapshot as Record<string, string>)?.cover_image_url || '',
          }))
          setOrders(mapped)
        }
      } catch {
        // Keep demo data
      }
      setLoading(false)
    }
    loadOrders()
  }, [user, router])

  if (!user) return null

  const filtered = activeTab === 'all' ? orders
    : activeTab === 'upcoming' ? orders.filter(o => ['pending_payment', 'paid_to_escrow'].includes(o.status))
    : activeTab === 'active' ? orders.filter(o => ['guide_accepted', 'service_in_progress'].includes(o.status))
    : orders.filter(o => ['service_completed', 'tourist_confirmed', 'funds_released'].includes(o.status))

  const totalSpent = orders.filter(o => ['service_completed', 'tourist_confirmed', 'funds_released'].includes(o.status)).reduce((s, o) => s + o.total_price, 0)

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) } catch { return d }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <motion.div
        className="max-w-2xl mx-auto px-4 py-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold mb-1">My Orders</h1>
        <p className="text-slate-400 text-sm mb-6">Track your bookings and trips.</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-lg font-bold">{orders.filter(o => ['guide_accepted', 'service_in_progress'].includes(o.status)).length}</p>
              <p className="text-xs text-slate-500">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-lg font-bold">{orders.filter(o => ['pending_payment'].includes(o.status)).length}</p>
              <p className="text-xs text-slate-500">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-lg font-bold text-green-600">¥{totalSpent.toLocaleString()}</p>
              <p className="text-xs text-slate-500">Total Spent</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-slate-100 p-1 rounded-lg">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold mb-1">No orders yet</h3>
              <p className="text-slate-500 text-sm mb-4">Browse tour plans and book your first trip!</p>
              <Link href="/plans">
                <Button>Browse Plans</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((order, i) => {
              const statusConfig = STATUS_LABELS[order.status] || { label: order.status, color: 'bg-slate-100 text-slate-500' }
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                >
                  <Link href={`/orders/${order.id}`}>
                    <Card className="hover:border-slate-300 transition-colors cursor-pointer overflow-hidden">
                      <CardContent className="p-0">
                        {order.cover_image_url && (
                          <div className="h-28 bg-slate-100 overflow-hidden">
                            <img src={order.cover_image_url} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                          </div>
                        )}
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <p className="font-semibold text-sm leading-tight">{order.plan_title}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${statusConfig.color}`}>
                              {statusConfig.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-400">
                            <span>Guide: {order.guide_name}</span>
                            <span>{formatDate(order.travel_date)}</span>
                            <span>{order.group_size} {order.group_size === 1 ? 'person' : 'people'}</span>
                          </div>
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                            <span className="text-xs text-slate-400">#{order.order_number}</span>
                            <span className="font-bold text-sm">¥{order.total_price.toLocaleString()}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>
    </div>
  )
}
