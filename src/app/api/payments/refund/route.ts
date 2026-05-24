import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  // Authenticate user
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {},
      },
    }
  )
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { orderId, reason } = await request.json()
  if (!orderId) {
    return NextResponse.json({ error: 'orderId required' }, { status: 400 })
  }

  const adminClient = await createAdminClient()
  const { data: order } = await adminClient
    .from('orders')
    .select('id, tourist_id, guide_id, escrow_status, stripe_payment_intent_id')
    .eq('id', orderId)
    .single()

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  // Check authorization: tourist, guide, or admin
  const { data: profile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  const isTourist = order.tourist_id === session.user.id
  const isGuide = order.guide_id === session.user.id
  const isAdmin = profile?.role === 'admin'
  if (!isTourist && !isGuide && !isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Process Stripe refund/cancellation
  if (order.stripe_payment_intent_id) {
    const pi = await stripe.paymentIntents.retrieve(order.stripe_payment_intent_id)

    if (pi.status === 'requires_capture') {
      // Authorized but not captured — cancel the authorization
      await stripe.paymentIntents.cancel(order.stripe_payment_intent_id, {
        cancellation_reason: 'requested_by_customer',
      })
    } else if (pi.status === 'succeeded') {
      // Already captured — issue full refund
      await stripe.refunds.create({
        payment_intent: order.stripe_payment_intent_id,
        reason: 'requested_by_customer',
        metadata: { order_id: orderId, reason: reason || '' },
      })
    }
  }

  const newStatus = ['pending_payment', 'paid_to_escrow', 'guide_accepted'].includes(order.escrow_status)
    ? 'cancelled'
    : 'refunded'

  await adminClient
    .from('orders')
    .update({
      escrow_status: newStatus,
      ...(newStatus === 'cancelled' ? { cancelled_at: new Date().toISOString() } : {}),
      ...(reason ? { dispute_reason: reason } : {}),
    })
    .eq('id', orderId)

  return NextResponse.json({ success: true, newStatus })
}
