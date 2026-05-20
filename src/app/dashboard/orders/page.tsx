'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ClipboardList, Clock, CheckCircle, XCircle, AlertCircle, MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'

interface Order {
  id: string
  tourist_name: string
  tourist_id: string
  plan_title: string
  travel_date: string
  group_size: number
  total_price: number
  status: string
}

const DEMO_ORDERS: Order[] = [
  { id: 'order-1', tourist_name: 'John Smith', tourist_id: 'demo-t1', plan_title: 'Classic Beijing 3-Day Tour', travel_date: '2026-05-20', group_size: 2, total_price: 7600, status: 'guide_accepted' },
  { id: 'order-2', tourist_name: 'Emma Wilson', tourist_id: 'demo-t2', plan_title: 'Great Wall Sunset Experience', travel_date: '2026-05-25', group_size: 1, total_price: 800, status: 'paid_to_escrow' },
  { id: 'order-3', tourist_name: 'Takeshi Yamamoto', tourist_id: 'demo-t3', plan_title: 'Classic Beijing 3-Day Tour', travel_date: '2026-05-18', group_size: 4, total_price: 15200, status: 'service_completed' },
  { id: 'order-4', tourist_name: 'Sarah Chen', tourist_id: 'demo-t4', plan_title: 'Hidden Gems of Beijing', travel_date: '2026-06-01', group_size: 3, total_price: 7200, status: 'pending_payment' },
]

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending_payment: { label: 'Pending Payment', color: 'bg-amber-100 text-amber-700', icon: Clock },
  paid_to_escrow: { label: 'Awaiting Acceptance', color: 'bg-blue-100 text-blue-700', icon: AlertCircle },
  guide_accepted: { label: 'Accepted', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  service_in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700', icon: Clock },
  service_completed: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  tourist_confirmed: { label: 'Confirmed', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  funds_released: { label: 'Paid Out', color: 'bg-slate-100 text-slate-600', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: XCircle },
}

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
]

export default function DashboardOrdersPage() {
  const { user } = useAuthStore()
  const [orders, setOrders] = useState<Order[]>(DEMO_ORDERS)
  const [activeTab, setActiveTab] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const loadOrders = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { data } = await supabase
          .from('orders')
          .select('id, tourist_id, plan_snapshot, agreed_price_cny, travel_start_date, group_size, escrow_status')
          .eq('guide_id', user!.id)
          .order('created_at', { ascending: false })

        if (data && data.length > 0) {
          // Fetch tourist names
          const touristIds = [...new Set(data.map((o: Record<string, unknown>) => o.tourist_id as string))]
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, display_name')
            .in('id', touristIds)

          const nameMap = new Map(profiles?.map((p: Record<string, unknown>) => [p.id as string, p.display_name as string]))

          const mapped: Order[] = data.map((o: Record<string, unknown>) => ({
            id: o.id as string,
            tourist_name: nameMap.get(o.tourist_id as string) || 'Tourist',
            tourist_id: o.tourist_id as string,
            plan_title: (o.plan_snapshot as Record<string, string>)?.title || 'Tour Plan',
            travel_date: o.travel_start_date as string,
            group_size: o.group_size as number,
            total_price: o.agreed_price_cny as number,
            status: o.escrow_status as string,
          }))
          setOrders(mapped)
        }
      } catch {
        // Use demo orders
      }
      setLoading(false)
    }
    loadOrders()
  }, [user])

  const handleAccept = async (orderId: string) => {
    // Optimistic update
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'guide_accepted' } : o))
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      await supabase
        .from('orders')
        .update({ escrow_status: 'guide_accepted', guide_accepted_at: new Date().toISOString() })
        .eq('id', orderId)
    } catch {
      // Supabase unreachable
    }
  }

  const handleReject = async (orderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o))
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      await supabase
        .from('orders')
        .update({ escrow_status: 'cancelled', cancelled_at: new Date().toISOString() })
        .eq('id', orderId)
    } catch {
      // Supabase unreachable
    }
  }

  const handleStartService = async (orderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'service_in_progress' } : o))
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      await supabase
        .from('orders')
        .update({ escrow_status: 'service_in_progress', service_started_at: new Date().toISOString() })
        .eq('id', orderId)
    } catch {
      // Supabase unreachable
    }
  }

  const handleCompleteService = async (orderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'service_completed' } : o))
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      await supabase
        .from('orders')
        .update({ escrow_status: 'service_completed', service_ended_at: new Date().toISOString() })
        .eq('id', orderId)
    } catch {
      // Supabase unreachable
    }
  }

  const filtered = activeTab === 'all' ? orders :
    activeTab === 'pending' ? orders.filter(o => ['pending_payment', 'paid_to_escrow'].includes(o.status)) :
    activeTab === 'active' ? orders.filter(o => ['guide_accepted', 'service_in_progress'].includes(o.status)) :
    orders.filter(o => ['service_completed', 'tourist_confirmed', 'funds_released'].includes(o.status))

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
      </div>
    )
  }

  // Action buttons based on status
  const getActions = (order: Order) => {
    switch (order.status) {
      case 'paid_to_escrow':
        return (
          <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
            <Button size="sm" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAccept(order.id) }} className="flex-1 gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Accept
            </Button>
            <Button size="sm" variant="outline" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleReject(order.id) }} className="flex-1 gap-1 text-red-600 hover:text-red-700">
              <XCircle className="w-3.5 h-3.5" /> Decline
            </Button>
          </div>
        )
      case 'guide_accepted':
        return (
          <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
            <Button size="sm" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleStartService(order.id) }} className="flex-1">
              Start Service
            </Button>
            <Link href={`/chat/demo-conv-1`} className="flex-1" onClick={(e) => e.stopPropagation()}>
              <Button size="sm" variant="outline" className="w-full gap-1">
                <MessageCircle className="w-3.5 h-3.5" /> Chat
              </Button>
            </Link>
          </div>
        )
      case 'service_in_progress':
        return (
          <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
            <Button size="sm" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCompleteService(order.id) }} className="flex-1 gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Mark Complete
            </Button>
            <Link href={`/chat/demo-conv-1`} className="flex-1" onClick={(e) => e.stopPropagation()}>
              <Button size="sm" variant="outline" className="w-full gap-1">
                <MessageCircle className="w-3.5 h-3.5" /> Chat
              </Button>
            </Link>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-slate-500 text-sm">Manage your tour bookings.</p>
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

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold">{orders.filter(o => ['paid_to_escrow'].includes(o.status)).length}</p>
            <p className="text-xs text-slate-500">Needs Action</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold">{orders.filter(o => ['guide_accepted', 'service_in_progress'].includes(o.status)).length}</p>
            <p className="text-xs text-slate-500">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-green-600">¥{orders.filter(o => ['service_completed', 'funds_released'].includes(o.status)).reduce((s, o) => s + o.total_price, 0).toLocaleString()}</p>
            <p className="text-xs text-slate-500">Revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold mb-1">No orders yet</h3>
            <p className="text-slate-500 text-sm">Orders will appear here when tourists book your plans.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((order, i) => {
            const config = STATUS_CONFIG[order.status] || { label: order.status, color: 'bg-slate-100 text-slate-500', icon: Clock }
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
              >
                <Card className="hover:border-slate-300 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-sm">{order.tourist_name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{order.plan_title}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                      <span>{order.travel_date}</span>
                      <span>{order.group_size} people</span>
                      <span className="font-medium text-slate-700">¥{order.total_price.toLocaleString()}</span>
                    </div>
                    {getActions(order)}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
