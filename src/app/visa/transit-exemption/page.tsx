'use client'

import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent } from '@/components/ui/card'
import { Check, AlertTriangle, Globe, Plane, Clock, MapPin } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const ELIGIBLE_COUNTRIES = [
  'Austria', 'Belgium', 'Czech Republic', 'Denmark', 'Estonia', 'Finland', 'France',
  'Germany', 'Greece', 'Hungary', 'Iceland', 'Italy', 'Latvia', 'Lithuania',
  'Luxembourg', 'Malta', 'Netherlands', 'Poland', 'Portugal', 'Romania', 'Slovakia',
  'Slovenia', 'Spain', 'Sweden', 'Switzerland',
  'Russia', 'United Kingdom', 'Ireland', 'Cyprus', 'Bulgaria', 'Serbia', 'Croatia',
  'Bosnia and Herzegovina', 'Montenegro', 'North Macedonia', 'Albania', 'Belarus',
  'Monaco',
  'USA', 'Canada', 'Brazil', 'Mexico', 'Argentina', 'Chile', 'Australia', 'New Zealand',
  'South Korea', 'Japan', 'Singapore', 'Brunei', 'United Arab Emirates', 'Qatar',
]

const DESIGNATED_PORTS = [
  { city: 'Beijing', airports: ['Beijing Capital (PEK)', 'Beijing Daxing (PKX)'] },
  { city: 'Shanghai', airports: ['Shanghai Pudong (PVG)', 'Shanghai Hongqiao (SHA)'] },
  { city: 'Guangzhou', airports: ['Guangzhou Baiyun (CAN)'] },
  { city: 'Chengdu', airports: ['Chengdu Tianfu (TFU)', 'Chengdu Shuangliu (CTU)'] },
  { city: 'Chongqing', airports: ['Chongqing Jiangbei (CKG)'] },
  { city: 'Xi\'an', airports: ['Xi\'an Xianyang (XIY)'] },
  { city: 'Hangzhou', airports: ['Hangzhou Xiaoshan (HGH)'] },
  { city: 'Kunming', airports: ['Kunming Changshui (KMG)'] },
  { city: 'Shenzhen', airports: ['Shenzhen Bao\'an (SZX)'] },
]

export default function TransitExemptionPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero */}
      <motion.section
        className="bg-gradient-to-br from-green-600 to-emerald-700 text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="flex items-center gap-2 text-green-200 text-sm mb-4">
            <Link href="/visa" className="hover:text-white transition-colors">Visa Guide</Link>
            <span>/</span>
            <span className="text-white">Transit Exemption</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">240-Hour Transit Visa Exemption</h1>
          <p className="text-green-100 text-lg">Stay in China for up to 10 days without a visa when transiting to a third country.</p>
          <div className="flex gap-3 mt-6">
            <span className="bg-green-500/30 text-green-100 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
              <Globe className="w-4 h-4" /> 54 Countries
            </span>
            <span className="bg-green-500/30 text-green-100 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
              <Clock className="w-4 h-4" /> Up to 240 Hours
            </span>
            <span className="bg-green-500/30 text-green-100 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
              <Plane className="w-4 h-4" /> 24 Ports
            </span>
          </div>
        </div>
      </motion.section>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Requirements */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">Requirements</h2>
            <ul className="space-y-3">
              {[
                'Valid passport from one of the 54 eligible countries',
                'Confirmed onward ticket to a third country (not the country of departure)',
                'Valid visa or residence permit for the third destination country (if required)',
                'Completed arrival card at the port of entry',
                'Proof of accommodation booking in China (if asked)',
              ].map((req) => (
                <li key={req} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-slate-700 text-sm">{req}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Important Notes */}
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-amber-800 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Important Notes
            </h2>
            <ul className="space-y-2 text-sm text-amber-900">
              <li>The 240-hour period starts from 00:00 on the day following your arrival.</li>
              <li>You must stay within the permitted area (varies by port of entry).</li>
              <li>You cannot leave China from the same port you entered.</li>
              <li>The exemption is for transit only — you need an onward ticket to a third country.</li>
              <li>Overstaying may result in fines, detention, or future entry bans.</li>
            </ul>
          </CardContent>
        </Card>

        {/* Eligible Countries */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">Eligible Countries ({ELIGIBLE_COUNTRIES.length})</h2>
            <div className="flex flex-wrap gap-2">
              {ELIGIBLE_COUNTRIES.map((country) => (
                <span key={country} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm">
                  {country}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Designated Ports */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">Designated Entry Ports</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {DESIGNATED_PORTS.map((port) => (
                <div key={port.city} className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-green-600" />
                    <span className="font-semibold">{port.city}</span>
                  </div>
                  {port.airports.map((airport) => (
                    <p key={airport} className="text-sm text-slate-500 ml-6">{airport}</p>
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* How to Apply */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">How to Use the Transit Exemption</h2>
            <div className="space-y-4">
              {[
                { step: 1, title: 'Book Your Flights', desc: 'Book a flight to China with a confirmed onward ticket to a third country.' },
                { step: 2, title: 'Prepare Documents', desc: 'Ensure your passport is valid, have your onward ticket and any required visas for the next destination.' },
                { step: 3, title: 'Arrive at Designated Port', desc: 'Present your documents at the 240-hour transit exemption counter at immigration.' },
                { step: 4, title: 'Enjoy Your Stay', desc: 'Explore the permitted area for up to 10 days. Book local guides and experiences on our platform!' },
              ].map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-sm shrink-0">
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
      </div>
    </div>
  )
}
