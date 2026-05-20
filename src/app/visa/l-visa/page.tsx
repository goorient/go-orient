'use client'

import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent } from '@/components/ui/card'
import { Check, FileText, Clock, AlertTriangle, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const DOCUMENT_CHECKLIST = [
  { item: 'Valid passport (at least 6 months remaining, 2+ blank pages)', required: true },
  { item: 'Completed Visa Application Form (Form V.2013)', required: true },
  { item: 'Recent passport photo (48mm x 33mm, white background)', required: true },
  { item: 'Round-trip flight itinerary', required: true },
  { item: 'Hotel bookings or invitation letter from host in China', required: true },
  { item: 'Bank statements (last 3 months, showing sufficient funds)', required: true },
  { item: 'Travel insurance covering China', recommended: true },
  { item: 'Previous Chinese visas (if applicable)', recommended: true },
  { item: 'Copy of previous passport (if applicable)', recommended: true },
]

const VISA_TYPES = [
  {
    type: 'Single Entry',
    validity: '3 months from issue date',
    stay: 'Up to 30 days per entry',
    price: 'Varies by nationality',
  },
  {
    type: 'Double Entry',
    validity: '3-6 months from issue date',
    stay: 'Up to 30 days per entry',
    price: 'Varies by nationality',
  },
  {
    type: 'Multiple Entry (6 months)',
    validity: '6 months from issue date',
    stay: 'Up to 30/60 days per entry',
    price: 'Varies by nationality',
  },
  {
    type: 'Multiple Entry (1 year)',
    validity: '12 months from issue date',
    stay: 'Up to 30/60/90 days per entry',
    price: 'Varies by nationality',
  },
]

const PROCESSING_TIMES = [
  { type: 'Regular', time: '4-5 business days', note: 'Standard processing' },
  { type: 'Express', time: '2-3 business days', note: 'Additional fee applies' },
  { type: 'Rush', time: '1-2 business days', note: 'Highest fee, not always available' },
]

export default function LVisaPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <motion.section
        className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="flex items-center gap-2 text-blue-200 text-sm mb-4">
            <Link href="/visa" className="hover:text-white transition-colors">Visa Guide</Link>
            <span>/</span>
            <span className="text-white">L Visa Guide</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Tourist Visa (L Visa) Application Guide</h1>
          <p className="text-blue-100 text-lg">Complete step-by-step guide for applying for a tourist visa to China.</p>
        </div>
      </motion.section>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Step by Step */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" /> Application Steps
            </h2>
            <div className="space-y-4">
              {[
                { step: 1, title: 'Determine Visa Type', desc: 'Choose between single, double, or multiple entry based on your travel plans.' },
                { step: 2, title: 'Prepare Documents', desc: 'Gather all required documents from the checklist below.' },
                { step: 3, title: 'Complete Online Form', desc: 'Fill out the China Visa Application Form at the Chinese Visa Application Service Center website.' },
                { step: 4, title: 'Book Appointment', desc: 'Schedule an appointment at your nearest Chinese Visa Application Service Center.' },
                { step: 5, title: 'Submit Application', desc: 'Visit the center in person with all original documents and photocopies.' },
                { step: 6, title: 'Pay Fees', desc: 'Pay the visa fee and service charge at the center.' },
                { step: 7, title: 'Collect Visa', desc: 'Return to collect your passport with the visa, or arrange courier delivery.' },
              ].map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{item.title}</p>
                    <p className="text-slate-500 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Document Checklist */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">Document Checklist</h2>
            <div className="space-y-3">
              {DOCUMENT_CHECKLIST.map((doc) => (
                <div key={doc.item} className="flex items-start gap-3">
                  <Check className={`w-5 h-5 mt-0.5 shrink-0 ${doc.required ? 'text-blue-600' : 'text-slate-400'}`} />
                  <div className="flex-1">
                    <span className="text-slate-700 text-sm">{doc.item}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                    doc.required ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {doc.required ? 'Required' : 'Recommended'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Visa Types */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">Visa Types & Validity</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {VISA_TYPES.map((visa) => (
                <div key={visa.type} className="bg-slate-50 rounded-lg p-4">
                  <p className="font-bold mb-2">{visa.type}</p>
                  <div className="space-y-1 text-sm text-slate-600">
                    <p><span className="text-slate-400">Validity:</span> {visa.validity}</p>
                    <p><span className="text-slate-400">Stay:</span> {visa.stay}</p>
                    <p><span className="text-slate-400">Price:</span> {visa.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Processing Times */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" /> Processing Times
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {PROCESSING_TIMES.map((pt) => (
                <div key={pt.type} className="text-center bg-slate-50 rounded-lg p-4">
                  <p className="font-bold mb-1">{pt.type}</p>
                  <p className="text-lg font-semibold text-blue-600">{pt.time}</p>
                  <p className="text-xs text-slate-400 mt-1">{pt.note}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-amber-800 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Tips & Warnings
            </h2>
            <ul className="space-y-2 text-sm text-amber-900">
              <li>Apply at least 1 month before your intended travel date.</li>
              <li>Ensure your passport has at least 6 months of validity remaining.</li>
              <li>All documents must be original plus one photocopy.</li>
              <li>The visa fee varies by nationality — check with your local center.</li>
              <li>Some nationalities may be required to provide additional documents.</li>
              <li>A previous visa refusal does not automatically disqualify you from applying again.</li>
            </ul>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center py-4">
          <p className="text-slate-500 mb-3">Need help with your visa application?</p>
          <Link href="/visa/service" className="inline-flex items-center gap-1 text-blue-600 font-medium hover:underline">
            Try our Premium Visa Service <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
