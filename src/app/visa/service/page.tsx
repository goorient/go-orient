'use client'

import { useEffect, useState } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { useAuthStore } from '@/stores/auth-store'
import { Check, Shield, Clock, FileText, MessageCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const SERVICE_TIERS = [
  {
    name: 'Standard Review',
    price: '$49',
    timeline: '5-7 business days',
    features: [
      'Document review & checklist',
      'Application form assistance',
      'Email support',
      'One revision included',
    ],
  },
  {
    name: 'Express Package',
    price: '$99',
    timeline: '2-3 business days',
    features: [
      'Everything in Standard',
      'Priority document review',
      'Same-day form preparation',
      'Chat support with expert',
      'Two revisions included',
    ],
    popular: true,
  },
  {
    name: 'VIP Full Service',
    price: '$199',
    timeline: '1-2 business days',
    features: [
      'Everything in Express',
      'Dedicated visa specialist',
      'Document collection assistance',
      'Appointment booking',
      'Status tracking & updates',
      'Unlimited revisions',
    ],
  },
]

export default function VisaServicePage() {
  const { user } = useAuthStore()
  const [showForm, setShowForm] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1500))
    setSubmitted(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <motion.section
        className="bg-gradient-to-br from-amber-600 to-orange-700 text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="flex items-center gap-2 text-amber-200 text-sm mb-4">
            <Link href="/visa" className="hover:text-white transition-colors">Visa Guide</Link>
            <span>/</span>
            <span className="text-white">Premium Service</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Premium Visa Service</h1>
          <p className="text-amber-100 text-lg">Let our visa experts handle the paperwork. Fast, reliable, and stress-free.</p>
        </div>
      </motion.section>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Why Choose Us */}
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { icon: Shield, label: 'Expert Review', desc: 'Former visa officers review your application' },
            { icon: Clock, label: 'Fast Processing', desc: 'Express & rush options available' },
            { icon: FileText, label: 'Form Prep', desc: 'We prepare and verify all forms' },
            { icon: MessageCircle, label: 'Live Support', desc: 'Chat with your visa specialist' },
          ].map((item) => (
            <Card key={item.label}>
              <CardContent className="p-4 text-center">
                <item.icon className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                <p className="font-semibold text-sm">{item.label}</p>
                <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pricing Tiers */}
        <div className="grid md:grid-cols-3 gap-6">
          {SERVICE_TIERS.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 + i * 0.1, duration: 0.4 }}
            >
              <Card className={`h-full flex flex-col ${tier.popular ? 'border-amber-400 ring-2 ring-amber-200 relative' : ''}`}>
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-bold px-3 py-0.5 rounded-full">
                    Most Popular
                  </div>
                )}
                <CardContent className="p-6 flex flex-col flex-1">
                  <p className="font-bold text-lg">{tier.name}</p>
                  <p className="text-3xl font-bold text-amber-600 my-3">{tier.price}</p>
                  <p className="text-xs text-slate-400 mb-4">{tier.timeline}</p>
                  <ul className="space-y-2 mb-6 flex-1">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                        <Check className="w-4 h-4 text-green-500 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${tier.popular ? '' : 'bg-slate-900 hover:bg-slate-800'}`}
                    variant={tier.popular ? 'default' : 'outline'}
                    onClick={() => setShowForm(true)}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Contact Form */}
        {showForm && !submitted && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Request Visa Service</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-semibold">Full Name</Label>
                      <Input placeholder="Your full name" className="h-10" required />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-semibold">Email</Label>
                      <Input type="email" placeholder="your@email.com" className="h-10" required />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-semibold">Nationality</Label>
                      <Input placeholder="e.g., United States" className="h-10" required />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-semibold">Planned Travel Date</Label>
                      <Input type="date" className="h-10" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-semibold">Visa Type Needed</Label>
                    <Input placeholder="e.g., Single Entry L Visa" className="h-10" required />
                  </div>
                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
                    <Button type="submit" disabled={loading} className="flex-1">
                      {loading ? 'Submitting...' : 'Submit Request'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Success */}
        {submitted && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Request Received!</h2>
            <p className="text-slate-500 mb-6">Our visa specialist will contact you within 24 hours.</p>
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}
