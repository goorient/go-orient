'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { createBrowserClient } from '@supabase/ssr'
import { Navbar } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Check, Clock, MessageCircle, AlertCircle, Shield, XCircle, CreditCard, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const ORDER_STATUSES = [
  { key: 'pending_payment', label: 'Pending Payment' },
  { key: 'paid_to_escrow', label: 'Paid to Escrow' },
  { key: 'guide_accepted', label: 'Guide Accepted' },
  { key: 'service_in_progress', label: 'Trip in Progress' },
  { key: 'service_completed', label: 'Trip Completed' },
  { key: 'tourist_confirmed', label: 'Confirmed by You' },
  { key: 'funds_released', label: 'Payment Released' },
]

interface OrderData {
  id: string
  order_number: string
  plan_title: string
  plan_cover: string
  guide_name: string
  guide_id: string
  travel_start_date: string
  travel_end_date: string
  group_size: number
  agreed_price_cny: number
  escrow_status: string
  conversation_id: string | null
}

function getDemoOrder(id: string): OrderData | null {
  const demos: Record<string, OrderData> = {
    'demo-order-1': {
      id: 'demo-order-1', order_number: 'GO-20260512-ABC123',
      plan_title: 'Classic Beijing 3-Day Tour', plan_cover: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&h=400&fit=crop',
      guide_name: 'Li Wei', guide_id: 'demo',
      travel_start_date: '2026-05-20', travel_end_date: '2026-05-22',
      group_size: 2, agreed_price_cny: 7600, escrow_status: 'guide_accepted', conversation_id: 'demo-conv-1',
    },
    'demo-order-2': {
      id: 'demo-order-2', order_number: 'GO-20260508-DEF456',
      plan_title: 'Great Wall Sunset Experience', plan_cover: '',
      guide_name: 'Li Wei', guide_id: 'demo',
      travel_start_date: '2026-05-25', travel_end_date: '2026-05-25',
      group_size: 1, agreed_price_cny: 800, escrow_status: 'pending_payment', conversation_id: null,
    },
    'demo-order-3': {
      id: 'demo-order-3', order_number: 'GO-20260410-GHI789',
      plan_title: 'Chengdu Panda & Food Tour', plan_cover: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=800&h=400&fit=crop',
      guide_name: 'Liu Yang', guide_id: 'demo',
      travel_start_date: '2026-04-10', travel_end_date: '2026-04-12',
      group_size: 3, agreed_price_cny: 5400, escrow_status: 'funds_released', conversation_id: 'demo-conv-2',
    },
  }
  return demos[id] || demos['demo-order-1']
}

export default function OrderDetailPage() {
  const { orderId } = useParams()
  const { user } = useAuthStore()
  const router = useRouter()
  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [paymentProcessing, setPaymentProcessing] = useState(false)

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    const loadOrder = async () => {
      const id = orderId as string
      const demo = getDemoOrder(id)
      if (demo) { setOrder(demo); setLoading(false); return }

      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { data } = await supabase
          .from('orders')
          .select('id, order_number, plan_snapshot, agreed_price_cny, travel_start_date, travel_end_date, group_size, escrow_status, guide_id')
          .eq('id', id)
          .single()

        if (data) {
          let guideName = 'Guide'
          let conversationId: string | null = null
          try {
            const [profileRes, convRes] = await Promise.all([
              supabase.from('profiles').select('display_name').eq('id', data.guide_id).single(),
              supabase.from('chat_conversations').select('id')
                .or(`and(participant_a.eq.${user!.id},participant_b.eq.${data.guide_id}),and(participant_a.eq.${data.guide_id},participant_b.eq.${user!.id})`)
                .limit(1),
            ])
            if (profileRes.data?.display_name) guideName = profileRes.data.display_name
            if (convRes.data && convRes.data.length > 0) conversationId = convRes.data[0].id
          } catch { /* keep defaults */ }

          const snapshot = data.plan_snapshot as Record<string, string> | null
          setOrder({
            id: data.id,
            order_number: data.order_number,
            plan_title: snapshot?.title || 'Tour Plan',
            plan_cover: snapshot?.cover_image_url || '',
            guide_name: guideName,
            guide_id: data.guide_id,
            travel_start_date: data.travel_start_date,
            travel_end_date: data.travel_end_date,
            group_size: data.group_size,
            agreed_price_cny: data.agreed_price_cny,
            escrow_status: data.escrow_status,
            conversation_id: conversationId,
          })
        } else {
          setOrder(getDemoOrder('demo-order-1'))
        }
      } catch {
        setOrder(getDemoOrder('demo-order-1'))
      }
      setLoading(false)
    }
    loadOrder()
  }, [user, router, orderId])

  const handleConfirmService = async () => {
    if (!order) return
    setActionLoading(true)

    // Update status to tourist_confirmed
    setOrder(prev => prev ? { ...prev, escrow_status: 'tourist_confirmed' } : prev)
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      await supabase
        .from('orders')
        .update({ escrow_status: 'tourist_confirmed', tourist_confirmed_at: new Date().toISOString() })
        .eq('id', order.id)
    } catch { /* optimistic */ }

    // For real orders: capture payment (release from escrow)
    const isDemo = order.id.startsWith('demo-')
    if (!isDemo) {
      try {
        await fetch('/api/payments/release', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: order.id }),
        })
        setOrder(prev => prev ? { ...prev, escrow_status: 'funds_released' } : prev)
      } catch {
        // tourist_confirmed is set, release can be retried
      }
    }

    setActionLoading(false)
  }

  const handleCancel = async () => {
    if (!order) return
    setActionLoading(true)

    const isDemo = order.id.startsWith('demo-')
    if (!isDemo) {
      try {
        const res = await fetch('/api/payments/refund', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: order.id, reason: 'Cancelled by tourist' }),
        })
        const data = await res.json()
        setOrder(prev => prev ? { ...prev, escrow_status: data.newStatus || 'cancelled' } : prev)
      } catch {
        setOrder(prev => prev ? { ...prev, escrow_status: 'cancelled' } : prev)
      }
    } else {
      // Demo: direct Supabase update
      setOrder(prev => prev ? { ...prev, escrow_status: 'cancelled' } : prev)
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        await supabase
          .from('orders')
          .update({ escrow_status: 'cancelled', cancelled_at: new Date().toISOString() })
          .eq('id', order.id)
      } catch { /* optimistic */ }
    }
    setActionLoading(false)
  }

  const handlePayNow = async () => {
    if (!order) return
    setPaymentProcessing(true)

    const isDemo = order.id.startsWith('demo-')
    if (isDemo) {
      // Demo: simulated payment
      await new Promise(r => setTimeout(r, 2000))
      setOrder(prev => prev ? { ...prev, escrow_status: 'paid_to_escrow' } : prev)
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        await supabase
          .from('orders')
          .update({ escrow_status: 'paid_to_escrow', paid_at: new Date().toISOString(), payment_method: 'card' })
          .eq('id', order.id)
      } catch { /* optimistic */ }
      setPaymentProcessing(false)
    } else {
      // Real: redirect to Stripe Checkout
      try {
        const res = await fetch('/api/payments/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: order.id }),
        })
        const data = await res.json()
        if (data.url) {
          window.location.href = data.url
          return // Don't set processing false, page is navigating away
        }
      } catch { /* fall through */ }
      setPaymentProcessing(false)
    }
  }

  if (!user) return null

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!order) return null

  const currentStatusIndex = ORDER_STATUSES.findIndex(s => s.key === order.escrow_status)
  const resolvedIndex = currentStatusIndex >= 0 ? currentStatusIndex : 0

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    } catch {
      return dateStr
    }
  }

  const chatHref = order.conversation_id
    ? `/chat/${order.conversation_id}`
    : `/chat?guide=${order.guide_id}`

  // Tourist action buttons based on status
  const getTouristActions = () => {
    switch (order.escrow_status) {
      case 'pending_payment':
        return (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">Payment Required</p>
                  <p className="text-xs text-amber-600">Complete payment to confirm your booking.</p>
                </div>
              </div>
              <Button size="sm" onClick={handlePayNow} disabled={paymentProcessing} className="gap-1">
                {paymentProcessing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting...</>
                ) : (
                  <><CreditCard className="w-4 h-4" /> Pay Now</>
                )}
              </Button>
            </CardContent>
          </Card>
        )
      case 'service_completed':
        return (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-semibold text-green-800">Trip Completed!</p>
                  <p className="text-xs text-green-600">Confirm to release payment to your guide.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleConfirmService} disabled={actionLoading} className="flex-1 gap-1">
                  <Check className="w-3.5 h-3.5" /> Confirm & Release Payment
                </Button>
                <Link href={chatHref} className="shrink-0">
                  <Button size="sm" variant="outline" className="gap-1">
                    <MessageCircle className="w-3.5 h-3.5" /> Chat
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )
      case 'paid_to_escrow':
      case 'guide_accepted':
        return (
          <div className="flex gap-2">
            <Link href={chatHref} className="flex-1">
              <Button variant="outline" className="w-full gap-1">
                <MessageCircle className="w-4 h-4" /> Chat with Guide
              </Button>
            </Link>
            <Button variant="outline" className="text-red-600 hover:text-red-700 gap-1" onClick={handleCancel} disabled={actionLoading}>
              <XCircle className="w-4 h-4" /> Cancel
            </Button>
          </div>
        )
      case 'service_in_progress':
        return (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-semibold text-blue-800">Trip in Progress</p>
                  <p className="text-xs text-blue-600">Your guide is taking care of you. Enjoy!</p>
                </div>
              </div>
              <Link href={chatHref}>
                <Button size="sm" variant="outline" className="gap-1">
                  <MessageCircle className="w-3.5 h-3.5" /> Chat
                </Button>
              </Link>
            </CardContent>
          </Card>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <motion.div
        className="max-w-2xl mx-auto px-4 py-8 pb-24"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 mb-4 transition-colors px-2 py-2 -ml-2 rounded-lg hover:bg-slate-100"
        >
          &larr; Back to Orders
        </button>

        {/* Cover image */}
        {order.plan_cover && (
          <div className="relative h-40 bg-slate-100 rounded-xl overflow-hidden mb-4">
            <img src={order.plan_cover} alt={order.plan_title} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4">
              <p className="text-white font-bold text-lg leading-tight">{order.plan_title}</p>
            </div>
          </div>
        )}

        <h1 className="text-2xl font-bold mb-1">Order Details</h1>
        <p className="text-slate-400 text-sm mb-6">Order #{order.order_number}</p>

        {/* Tourist action banner */}
        {getTouristActions() && (
          <div className="mb-6">{getTouristActions()}</div>
        )}

        {/* Status timeline */}
        <Card className="mb-6">
          <CardContent className="p-5">
            <h2 className="font-bold mb-4">Order Status</h2>
            <div className="space-y-0">
              {ORDER_STATUSES.map((status, i) => {
                const isCompleted = i <= resolvedIndex
                const isCurrent = i === resolvedIndex
                return (
                  <div key={status.key} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                        isCompleted ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-400'
                      }`}>
                        {isCompleted ? <Check className="w-3.5 h-3.5" /> : <span className="text-xs">{i + 1}</span>}
                      </div>
                      {i < ORDER_STATUSES.length - 1 && (
                        <div className={`w-0.5 flex-1 my-0.5 ${i < resolvedIndex ? 'bg-green-300' : 'bg-slate-200'}`} />
                      )}
                    </div>
                    <div className="pb-4">
                      <p className={`text-sm ${isCurrent ? 'font-bold text-slate-900' : isCompleted ? 'text-slate-600' : 'text-slate-400'}`}>
                        {status.label}
                      </p>
                      {isCurrent && (
                        <p className="text-xs text-amber-600 mt-0.5">Current status</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Order info */}
        <Card className="mb-6">
          <CardContent className="p-5 space-y-3">
            <h2 className="font-bold mb-2">Trip Information</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Plan</span>
                <span className="font-medium">{order.plan_title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Guide</span>
                <span className="font-medium">{order.guide_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Travel Date</span>
                <span className="font-medium">{formatDate(order.travel_start_date)} — {formatDate(order.travel_end_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Group Size</span>
                <span className="font-medium">{order.group_size} {order.group_size === 1 ? 'person' : 'people'}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100">
                <span className="text-slate-500">Total Price</span>
                <span className="font-bold text-lg">¥{order.agreed_price_cny.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment protection info */}
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold">Escrow Protection</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Your payment is held in escrow until you confirm the service is completed. If the guide doesn't deliver, you can request a full refund.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Sticky bottom bar for chat */}
      {order.escrow_status !== 'cancelled' && order.escrow_status !== 'funds_released' && order.escrow_status !== 'tourist_confirmed' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-slate-200 z-50 px-4 py-3" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
            <div>
              <p className="font-bold text-sm">¥{order.agreed_price_cny.toLocaleString()}</p>
              <p className="text-xs text-slate-400">Escrow protected</p>
            </div>
            <div className="flex gap-2">
              <Link href={chatHref}>
                <Button variant="outline" size="sm" className="gap-1">
                  <MessageCircle className="w-4 h-4" /> Chat
                </Button>
              </Link>
              <Link href="/plans">
                <Button size="sm" variant="outline">Browse Plans</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
