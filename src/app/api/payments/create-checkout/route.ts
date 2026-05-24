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

  // Fetch order using admin client
  const adminClient = await createAdminClient()
  const { data: order, error } = await adminClient
    .from('orders')
    .select('id, order_number, tourist_id, agreed_price_cny, escrow_status, plan_snapshot')
    .eq('id', orderId)
    .single()

  if (error || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }
  if (order.tourist_id !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  if (order.escrow_status !== 'pending_payment') {
    return NextResponse.json({ error: 'Order not payable' }, { status: 400 })
  }

  // Create Stripe Checkout Session
  const origin = request.headers.get('origin') || 'https://go-orient.com'
  const planSnapshot = order.plan_snapshot as Record<string, unknown>

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card', 'alipay'],
    line_items: [
      {
        price_data: {
          currency: 'cny',
          unit_amount: order.agreed_price_cny * 100, // Stripe expects fen (cents)
          product_data: {
            name: (planSnapshot?.title as string) || 'Tour Plan',
            description: `Order #${order.order_number}`,
          },
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      capture_method: 'manual', // Escrow: authorize but don't capture
      metadata: { order_id: order.id },
    },
    success_url: `${origin}/payments/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/payments/cancel?order_id=${order.id}`,
    metadata: { order_id: order.id },
    customer_email: session.user.email,
  })

  // Save session ID to order
  await adminClient
    .from('orders')
    .update({ stripe_session_id: checkoutSession.id })
    .eq('id', order.id)

  return NextResponse.json({ url: checkoutSession.url })
}
