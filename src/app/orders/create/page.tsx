'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { Navbar } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Users, Shield, Check } from 'lucide-react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'

interface PlanInfo {
  id: string
  title: string
  price_cny: number
  duration_days: number
  guide_id: string
  guide_name: string
}

function OrderCreateForm() {
  const searchParams = useSearchParams()
  const planId = searchParams.get('plan')
  const { user } = useAuthStore()
  const router = useRouter()

  const [step, setStep] = useState(1)
  const [travelDate, setTravelDate] = useState('')
  const [groupSize, setGroupSize] = useState('1')
  const [emergencyName, setEmergencyName] = useState('')
  const [emergencyPhone, setEmergencyPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [createdOrderId, setCreatedOrderId] = useState('')
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null)

  useEffect(() => {
    if (!user) router.push('/login')
  }, [user, router])

  // Load plan info
  useEffect(() => {
    const loadPlan = async () => {
      if (!planId) {
        // Demo plan info when no plan ID specified
        setPlanInfo({
          id: 'demo-plan-1',
          title: 'Classic Beijing 3-Day Tour',
          price_cny: 3800,
          duration_days: 3,
          guide_id: 'demo-guide-1',
          guide_name: 'Li Wei',
        })
        return
      }

      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { data: plan } = await supabase
          .from('tour_plans')
          .select('id, title, price_cny, duration_days, guide_id')
          .eq('id', planId)
          .single()

        if (plan) {
          // Get guide name
          const { data: guideProfile } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('id', plan.guide_id)
            .single()

          setPlanInfo({
            ...plan,
            guide_name: guideProfile?.display_name || 'Guide',
          })
        } else {
          setPlanInfo({
            id: planId,
            title: 'Tour Plan',
            price_cny: 0,
            duration_days: 1,
            guide_id: '',
            guide_name: 'Guide',
          })
        }
      } catch {
        setPlanInfo({
          id: planId || 'demo-plan-1',
          title: 'Classic Beijing 3-Day Tour',
          price_cny: 3800,
          duration_days: 3,
          guide_id: 'demo-guide-1',
          guide_name: 'Li Wei',
        })
      }
    }
    loadPlan()
  }, [planId])

  if (!user) return null

  const totalPrice = planInfo ? planInfo.price_cny * Number(groupSize) : 0

  const handleSubmit = async () => {
    setLoading(true)

    // Try real Supabase insert
    if (planInfo && planInfo.guide_id && !planInfo.id.startsWith('demo-')) {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        // Generate order number
        const orderNumber = `GO-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

        const endDate = new Date(travelDate)
        endDate.setDate(endDate.getDate() + planInfo.duration_days)

        const { data: order, error } = await supabase
          .from('orders')
          .insert({
            order_number: orderNumber,
            tourist_id: user!.id,
            guide_id: planInfo.guide_id,
            plan_id: planInfo.id,
            plan_snapshot: {
              title: planInfo.title,
              price_cny: planInfo.price_cny,
              duration_days: planInfo.duration_days,
            },
            agreed_price_cny: totalPrice,
            travel_start_date: travelDate,
            travel_end_date: endDate.toISOString().slice(0, 10),
            group_size: Number(groupSize),
            escrow_status: 'pending_payment',
            emergency_contact_name: emergencyName,
            emergency_contact_phone: emergencyPhone,
          })
          .select('id')
          .single()

        if (!error && order) {
          setCreatedOrderId(order.id)
          setSuccess(true)
          setLoading(false)
          return
        }
      } catch {
        // Fall through to demo mode
      }
    }

    // Demo mode
    await new Promise(r => setTimeout(r, 1500))
    setCreatedOrderId('demo-order-1')
    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Booking Request Sent!</h2>
          <p className="text-slate-500 mb-6">
            Your booking request has been sent to the guide. You&apos;ll receive a notification once they respond.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href={`/orders/${createdOrderId}`}>
              <Button>View Order</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">Create Booking</h1>
        {planInfo && (
          <p className="text-slate-500 text-sm mb-6">
            {planInfo.title} by {planInfo.guide_name}
          </p>
        )}

        {/* Progress steps */}
        <div className="flex items-center gap-2 mb-8">
          {[
            { n: 1, label: 'Trip Details' },
            { n: 2, label: 'Safety Info' },
            { n: 3, label: 'Confirm' },
          ].map((s, i) => (
            <div key={s.n} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                step >= s.n ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                {s.n}
              </div>
              <span className={`text-xs ${step >= s.n ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>
                {s.label}
              </span>
              {i < 2 && <div className="flex-1 h-px bg-slate-200" />}
            </div>
          ))}
        </div>

        {/* Step 1: Trip Details */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Trip Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">Travel Start Date</Label>
                <Input
                  type="date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">Group Size</Label>
                <Input
                  type="number"
                  min="1"
                  max="20"
                  value={groupSize}
                  onChange={(e) => setGroupSize(e.target.value)}
                  className="h-10"
                />
                <p className="text-xs text-slate-400">Number of travelers including yourself</p>
              </div>
              {planInfo && (
                <div className="bg-slate-50 rounded-lg p-3 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Price per person</span>
                    <span className="font-medium">¥{planInfo.price_cny.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Duration</span>
                    <span className="font-medium">{planInfo.duration_days} days</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-200 font-bold">
                    <span>Estimated Total</span>
                    <span>¥{totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              )}
              <Button
                className="w-full"
                onClick={() => setStep(2)}
                disabled={!travelDate}
              >
                Next
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Safety Info */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5" /> Safety Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-500">
                In case of emergency during your trip, we need a contact person. This information is only shared with your guide.
              </p>
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">Emergency Contact Name</Label>
                <Input
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  placeholder="Full name"
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">Emergency Contact Phone</Label>
                <Input
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="+1 234 567 8900"
                  className="h-10"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
                <Button onClick={() => setStep(3)} className="flex-1" disabled={!emergencyName || !emergencyPhone}>
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Confirm Booking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                {planInfo && (
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Plan</span>
                    <span className="font-medium">{planInfo.title}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Travel Date</span>
                  <span className="font-medium">{new Date(travelDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Group Size</span>
                  <span className="font-medium">{groupSize} {Number(groupSize) === 1 ? 'person' : 'people'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Emergency Contact</span>
                  <span className="font-medium">{emergencyName}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Emergency Phone</span>
                  <span className="font-medium">{emergencyPhone}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Total Price</span>
                  <span className="font-bold text-lg">¥{totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
                Payment will be collected after the guide accepts your booking request. Your money is held in escrow until service completion.
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">Back</Button>
                <Button onClick={handleSubmit} disabled={loading} className="flex-1">
                  {loading ? 'Submitting...' : 'Submit Booking'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default function OrderCreatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50">
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
        </div>
      </div>
    }>
      <OrderCreateForm />
    </Suspense>
  )
}
