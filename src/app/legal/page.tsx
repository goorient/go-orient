'use client'

import { Navbar } from '@/components/layout/navbar'
import Link from 'next/link'

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Legal</h1>
        <div className="space-y-4">
          <Link href="/legal/terms" className="block p-6 bg-white rounded-xl border border-slate-200 hover:border-slate-400 transition-colors">
            <h2 className="text-lg font-bold mb-1">Terms of Service</h2>
            <p className="text-sm text-slate-500">Our terms and conditions for using Go Orient.</p>
          </Link>
          <Link href="/legal/privacy" className="block p-6 bg-white rounded-xl border border-slate-200 hover:border-slate-400 transition-colors">
            <h2 className="text-lg font-bold mb-1">Privacy Policy</h2>
            <p className="text-sm text-slate-500">How we collect, use, and protect your personal information.</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
