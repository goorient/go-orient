'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import { XCircle } from 'lucide-react'
import Link from 'next/link'

function CancelContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order_id')

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Payment Cancelled</h2>
        <p className="text-slate-500 mb-6">
          Your payment was not processed. You can try again later from your order page.
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
      </div>
    </div>
  )
}

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
        </div>
      </div>
    }>
      <CancelContent />
    </Suspense>
  )
}
