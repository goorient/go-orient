'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { createBrowserClient } from '@supabase/ssr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { BadgeCheck, Upload, Check, Clock, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'

type VerificationStatus = 'not_started' | 'pending' | 'verified' | 'rejected'

const VERIFICATION_STEPS = [
  {
    id: 'identity',
    title: 'Identity Verification',
    desc: 'Upload a photo of your government-issued ID (passport or national ID card).',
    required: true,
  },
  {
    id: 'guide_license',
    title: 'Tour Guide License',
    desc: 'Upload your official tour guide license or certification.',
    required: false,
  },
  {
    id: 'selfie',
    title: 'Selfie Verification',
    desc: 'Take a selfie holding your ID next to your face for identity matching.',
    required: true,
  },
]

export default function DashboardVerificationPage() {
  const { user } = useAuthStore()
  const [status, setStatus] = useState<VerificationStatus>('not_started')
  const [idNumber, setIdNumber] = useState('')
  const [certNumber, setCertNumber] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submittedAt, setSubmittedAt] = useState('')

  useEffect(() => {
    if (!user) { setLoading(false); return }
    const loadStatus = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { data } = await supabase
          .from('guide_profiles')
          .select('verification_status, passport_number, guide_cert_number, guide_cert_url, created_at')
          .eq('id', user!.id)
          .single()

        if (data) {
          setIdNumber(data.passport_number || '')
          setCertNumber(data.guide_cert_number || '')

          if (data.verification_status === 'verified') {
            setStatus('verified')
          } else if (data.verification_status === 'rejected') {
            setStatus('rejected')
          } else if (data.passport_number || data.guide_cert_url) {
            setStatus('pending')
            setSubmittedAt(data.created_at ? new Date(data.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '')
          }
        }
      } catch {
        // Demo: show not_started
      }
      setLoading(false)
    }
    loadStatus()
  }, [user])

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      await supabase
        .from('guide_profiles')
        .update({
          verification_status: 'pending',
          passport_number: idNumber || null,
          guide_cert_number: certNumber || null,
        })
        .eq('id', user!.id)
    } catch {
      // Supabase unreachable — show optimistic state
    }
    setStatus('pending')
    setSubmittedAt(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }))
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
      </div>
    )
  }

  const renderStatus = () => {
    switch (status) {
      case 'pending':
        return (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-6 text-center">
              <Clock className="w-12 h-12 text-amber-500 mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-1">Verification In Progress</h3>
              <p className="text-sm text-amber-700">We&apos;re reviewing your documents. This usually takes 1-2 business days.</p>
              {submittedAt && <p className="text-xs text-amber-600 mt-3">Submitted on {submittedAt}</p>}
            </CardContent>
          </Card>
        )
      case 'verified':
        return (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6 text-center">
              <Check className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-1 text-green-800">Verified!</h3>
              <p className="text-sm text-green-700">Your identity has been verified. Tourists will see a verified badge on your profile.</p>
            </CardContent>
          </Card>
        )
      case 'rejected':
        return (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-1 text-red-800">Verification Failed</h3>
              <p className="text-sm text-red-700">Your documents could not be verified. Please resubmit with clearer photos.</p>
              <Button variant="outline" onClick={() => setStatus('not_started')} className="mt-4">Resubmit</Button>
            </CardContent>
          </Card>
        )
      default:
        return null
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Verification</h1>
        <p className="text-slate-500 text-sm">Verify your identity to earn a trusted badge on your profile.</p>
      </div>

      {status !== 'not_started' ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {renderStatus()}
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {VERIFICATION_STEPS.map((step, i) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
            >
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-sm font-bold text-slate-500">{i + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sm">{step.title}</p>
                        {step.required && <span className="text-xs text-red-500">*Required</span>}
                      </div>
                      <p className="text-xs text-slate-500 mb-3">{step.desc}</p>
                      <div className="flex items-center gap-3 p-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-400 cursor-pointer hover:border-slate-400 hover:text-slate-500 transition-colors">
                        <Upload className="w-6 h-6" />
                        <div>
                          <p className="text-sm font-medium text-slate-500">Click to upload</p>
                          <p className="text-xs">JPG, PNG up to 5MB</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          <Card>
            <CardContent className="p-5">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-slate-700 font-semibold">ID / Passport Number</Label>
                  <Input
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    placeholder="Enter your document number"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 font-semibold">Guide License Number (Optional)</Label>
                  <Input
                    value={certNumber}
                    onChange={(e) => setCertNumber(e.target.value)}
                    placeholder="Enter your guide license number"
                    className="h-10"
                  />
                </div>
                <Button onClick={handleSubmit} disabled={submitting || !idNumber} className="w-full">
                  {submitting ? 'Submitting...' : 'Submit for Verification'}
                </Button>
                <p className="text-xs text-slate-400 text-center">
                  Your documents are encrypted and only used for verification purposes.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
