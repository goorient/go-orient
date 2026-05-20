'use client'

import Link from 'next/link'
import { Navbar } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import { TiltCard } from '@/components/cards/tilt-card'
import { Plane, FileText, Clock, Shield, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

const options = [
  {
    title: '240-Hour Transit Visa Exemption',
    description: 'Citizens of 54 countries can stay up to 240 hours (10 days) without a visa when transiting through China.',
    href: '/visa/transit-exemption',
    icon: Plane,
    badge: 'FREE',
    features: ['54 eligible countries', '10-day stay', '24 designated ports'],
  },
  {
    title: 'L Visa Application Guide',
    description: 'Complete guide for applying for a tourist visa (L visa) to China, including requirements and process.',
    href: '/visa/l-visa',
    icon: FileText,
    badge: 'GUIDE',
    features: ['Step-by-step process', 'Document checklist', 'Processing times'],
  },
  {
    title: 'Premium Visa Service',
    description: 'Let our experts handle your visa application. We review documents, prepare forms, and track your application.',
    href: '/visa/service',
    icon: Shield,
    badge: 'PAID',
    features: ['Expert review', 'Form preparation', 'Status tracking'],
  },
]

export default function VisaPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero */}
      <motion.section
        className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <motion.h1
            className="text-4xl md:text-5xl font-bold mb-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            China Visa Guide
          </motion.h1>
          <motion.p
            className="text-lg text-blue-100 max-w-2xl mx-auto"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Everything you need to know about entering China. Free guides, expert advice, and premium visa services.
          </motion.p>
        </div>
      </motion.section>

      {/* Options */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid gap-6 md:grid-cols-3">
          {options.map((option, i) => (
            <motion.div
              key={option.title}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
            >
              <Link href={option.href}>
                <TiltCard className="rounded-xl bg-white p-6 cursor-pointer h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <option.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      option.badge === 'FREE' ? 'bg-green-100 text-green-700' :
                      option.badge === 'PAID' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {option.badge}
                    </span>
                  </div>

                  <h3 className="font-bold text-lg mb-2">{option.title}</h3>
                  <p className="text-slate-500 text-sm mb-4 flex-1">{option.description}</p>

                  <ul className="space-y-2 mb-4">
                    {option.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center text-blue-600 text-sm font-medium pt-4 border-t border-slate-100">
                    Learn more <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </TiltCard>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Quick Info */}
        <div className="mt-12 bg-white rounded-xl p-6 border border-slate-200">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Quick Facts
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <dt className="text-slate-500 mb-1">Standard L Visa Processing</dt>
              <dd className="font-medium">4-5 business days</dd>
            </div>
            <div>
              <dt className="text-slate-500 mb-1">Express Processing</dt>
              <dd className="font-medium">2-3 business days</dd>
            </div>
            <div>
              <dt className="text-slate-500 mb-1">Transit Exemption</dt>
              <dd className="font-medium">Up to 240 hours (10 days)</dd>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
