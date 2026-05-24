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

  const { orderId } = await request.json()
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

  // Only the tourist who owns the order (or admin) can release
  const { data: profile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  const isOwner = order.tourist_id === session.user.id
  const isAdmin = profile?.role === 'admin'
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (!['tourist_confirmed', 'service_completed'].includes(order.escrow_status)) {
    return NextResponse.json({ error: 'Order not ready for release' }, { status: 400 })
  }

  // Capture the payment
  if (order.stripe_payment_intent_id) {
    try {
      await stripe.paymentIntents.capture(order.stripe_payment_intent_id)
    } catch (err) {
      console.error('Capture failed:', err)
      return NextResponse.json({ error: 'Capture failed' }, { status: 500 })
    }
  }

  await adminClient
    .from('orders')
    .update({
      escrow_status: 'funds_released',
      funds_released_at: new Date().toISOString(),
    })
    .eq('id', orderId)

  return NextResponse.json({ success: true })
}
