'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import { Check, Loader2, XCircle } from 'lucide-react'
import Link from 'next/link'

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [verifying, setVerifying] = useState(true)
  const [success, setSuccess] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    if (!sessionId) {
      setError('Missing session ID')
      setVerifying(false)
      return
    }

    fetch(`/api/payments/verify?session_id=${sessionId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSuccess(true)
          setOrderId(data.orderId)
        } else {
          setError(data.error || 'Payment verification failed. Please contact support.')
        }
      })
      .catch(() => setError('Network error. Please check your order status.'))
      .finally(() => setVerifying(false))
  }, [searchParams])

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        {verifying ? (
          <>
            <Loader2 className="w-12 h-12 text-slate-400 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Verifying Payment...</h2>
            <p className="text-slate-500 text-sm">Please wait while we confirm your payment.</p>
          </>
        ) : success ? (
          <>
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
            <p className="text-slate-500 mb-2">
              Your payment has been authorized and is held in escrow until the tour is completed.
            </p>
            <p className="text-xs text-slate-400 mb-6">
              Your guide will be notified to accept your booking.
            </p>
            <div className="flex gap-3 justify-center">
              {orderId && (
                <Link href={`/orders/${orderId}`}>
                  <Button>View Order</Button>
                </Link>
              )}
              <Link href="/">
                <Button variant="outline">Back to Home</Button>
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Payment Verification Failed</h2>
            <p className="text-slate-500 mb-6">{error}</p>
            <div className="flex gap-3 justify-center">
              {orderId && (
                <Link href={`/orders/${orderId}`}>
                  <Button variant="outline">View Order</Button>
                </Link>
              )}
              <Link href="/">
                <Button variant="outline">Back to Home</Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
