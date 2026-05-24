'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { Card, CardContent } from '@/components/ui/card'
import { createBrowserClient } from '@supabase/ssr'
import { motion } from 'framer-motion'
import { ClipboardList } from 'lucide-react'

interface OrderRow {
  id: string
  order_number: string
  escrow_status: string
  agreed_price_cny: number
  travel_start_date: string
  group_size: number
  created_at: string
  tourist_name: string
  guide_name: string
}

const STATUS_COLORS: Record<string, string> = {
  pending_payment: 'bg-yellow-100 text-yellow-700',
  paid_to_escrow: 'bg-blue-100 text-blue-700',
  guide_accepted: 'bg-cyan-100 text-cyan-700',
  service_in_progress: 'bg-purple-100 text-purple-700',
  service_completed: 'bg-indigo-100 text-indigo-700',
  tourist_confirmed: 'bg-green-100 text-green-700',
  funds_released: 'bg-emerald-100 text-emerald-700',
  disputed: 'bg-red-100 text-red-700',
  refunded: 'bg-orange-100 text-orange-700',
  cancelled: 'bg-slate-100 text-slate-500',
}

export default function AdminOrdersPage() {
  const { user } = useAuthStore()
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    if (!user) return
    const load = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { data } = await supabase
          .from('orders')
          .select('id, order_number, escrow_status, agreed_price_cny, travel_start_date, group_size, created_at, tourist:profiles!orders_tourist_id_fkey(display_name), guide:profiles!orders_guide_id_fkey(display_name)')
          .order('created_at', { ascending: false })

        if (data) {
          setOrders(data.map((o: Record<string, unknown>) => ({
            id: o.id as string,
            order_number: o.order_number as string,
            escrow_status: o.escrow_status as string,
            agreed_price_cny: o.agreed_price_cny as number,
            travel_start_date: (o.travel_start_date as string) || '',
            group_size: o.group_size as number,
            created_at: (o.created_at as string).split('T')[0],
            tourist_name: (o.tourist as Record<string, string>)?.display_name || 'Tourist',
            guide_name: (o.guide as Record<string, string>)?.display_name || 'Guide',
          })))
        }
      } catch {
        // Supabase unreachable
      }
      setLoading(false)
    }
    load()
  }, [user])

  const filtered = statusFilter === 'all'
    ? orders
    : orders.filter(o => o.escrow_status === statusFilter)

  const totalRevenue = orders
    .filter(o => ['funds_released', 'tourist_confirmed', 'service_completed'].includes(o.escrow_status))
    .reduce((sum, o) => sum + o.agreed_price_cny, 0)

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-slate-500 text-sm">{orders.length} orders · ¥{totalRevenue.toLocaleString()} released</p>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap gap-1">
        <button
          onClick={() => setStatusFilter('all')}
          className={`text-xs px-3 py-1 rounded-full transition-colors ${
            statusFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All ({orders.length})
        </button>
        {Object.entries(STATUS_COLORS).map(([status, color]) => {
          const count = orders.filter(o => o.escrow_status === status).length
          if (count === 0) return null
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`text-xs px-3 py-1 rounded-full transition-colors ${
                statusFilter === status ? 'bg-slate-900 text-white' : `${color.split(' ')[0]} ${color.split(' ')[1]} hover:opacity-80`
              }`}
            >
              {status.replace(/_/g, ' ')} ({count})
            </button>
          )
        })}
      </div>

      {/* Orders List */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No orders found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{order.order_number}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[order.escrow_status] || 'bg-slate-100 text-slate-500'}`}>
                        {order.escrow_status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {order.tourist_name} → {order.guide_name} · {order.group_size} people · {order.travel_start_date || 'TBD'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-sm">¥{order.agreed_price_cny.toLocaleString()}</p>
                    <p className="text-xs text-slate-400">{order.created_at}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
