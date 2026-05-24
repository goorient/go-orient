import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import type Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const adminClient = await createAdminClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const orderId = session.metadata?.order_id
      const paymentIntentId = session.payment_intent as string

      if (orderId && paymentIntentId) {
        await adminClient
          .from('orders')
          .update({
            escrow_status: 'paid_to_escrow',
            paid_at: new Date().toISOString(),
            payment_method: session.payment_method_types?.[0] || 'card',
            stripe_payment_intent_id: paymentIntentId,
          })
          .eq('id', orderId)
          .eq('escrow_status', 'pending_payment') // Prevent double-update
      }
      break
    }

    case 'payment_intent.payment_failed': {
      const pi = event.data.object as Stripe.PaymentIntent
      const orderId = pi.metadata?.order_id
      if (orderId) {
        console.error(`Payment failed for order ${orderId}: ${pi.last_payment_error?.message}`)
      }
      break
    }

    default:
      console.log(`Unhandled Stripe event: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
