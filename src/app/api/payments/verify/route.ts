import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import type Stripe from 'stripe'

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session_id')
  if (!sessionId) {
    return NextResponse.json({ error: 'session_id required' }, { status: 400 })
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['payment_intent'],
  })

  const paymentIntent = session.payment_intent as Stripe.PaymentIntent
  const orderId = session.metadata?.order_id

  if (!orderId || !paymentIntent) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 400 })
  }

  const isAuthorized = paymentIntent.status === 'requires_capture'
  const paymentMethod = session.payment_method_types?.[0] || 'card'

  if (isAuthorized) {
    const adminClient = await createAdminClient()
    await adminClient
      .from('orders')
      .update({
        escrow_status: 'paid_to_escrow',
        paid_at: new Date().toISOString(),
        payment_method: paymentMethod,
        stripe_payment_intent_id: paymentIntent.id,
      })
      .eq('id', orderId)
      .eq('escrow_status', 'pending_payment') // Idempotent
  }

  return NextResponse.json({
    success: isAuthorized,
    orderId,
    status: paymentIntent.status,
  })
}
