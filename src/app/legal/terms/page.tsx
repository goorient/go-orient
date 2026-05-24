'use client'

import { Navbar } from '@/components/layout/navbar'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button onClick={() => window.history.back()} className="flex items-center gap-1 text-slate-500 hover:text-slate-900 p-2 -ml-2 rounded-lg hover:bg-slate-100 mb-6">
          <ArrowLeft className="w-5 h-5" /> Back
        </button>

        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-sm text-slate-400 mb-8">Last updated: May 24, 2026</p>

        <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 space-y-6 text-sm text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">1. Acceptance of Terms</h2>
            <p>By accessing or using the Go Orient platform (&quot;Service&quot;), you agree to be bound by these Terms of Service. If you do not agree, please do not use our Service. Go Orient is operated by Go Orient Technology Co., Ltd. (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;).</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">2. Description of Service</h2>
            <p>Go Orient is an online platform that connects international travelers with local guides in China. Our Service includes:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Browsing and booking tour plans created by verified local guides</li>
              <li>Content discovery through our feed (travel tips, photos, and stories)</li>
              <li>In-app messaging between travelers and guides</li>
              <li>Secure payment processing with escrow protection</li>
              <li>Visa information and application guidance</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">3. User Accounts</h2>
            <p>You must create an account to use certain features. You are responsible for:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Providing accurate and complete registration information</li>
              <li>Maintaining the security of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use</li>
            </ul>
            <p className="mt-2">You may register as either a <strong>Tourist</strong> (traveler) or a <strong>Guide</strong> (local service provider).</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">4. Guide Responsibilities</h2>
            <p>As a Guide on our platform, you agree to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Provide accurate information about your qualifications, experience, and services</li>
              <li>Maintain valid licenses and certifications as required by local regulations</li>
              <li>Deliver tour services as described in your published plans</li>
              <li>Maintain appropriate insurance coverage</li>
              <li>Treat all travelers with respect and prioritize their safety</li>
              <li>Respond to booking requests and messages in a timely manner</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">5. Booking and Payments</h2>
            <p>All payments are processed through our secure escrow system:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Escrow Protection:</strong> Funds are held in escrow until the tour is completed and confirmed by the traveler.</li>
              <li><strong>Pricing:</strong> All prices are displayed in Chinese Yuan (CNY). Currency conversion is the traveler&apos;s responsibility.</li>
              <li><strong>Cancellation:</strong> Cancellation policies are outlined in each tour plan. Refunds are subject to the specific cancellation terms.</li>
              <li><strong>Disputes:</strong> If a dispute arises, both parties may contact our support team for mediation.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">6. Content Policy</h2>
            <p>You retain ownership of content you post on Go Orient. By posting content, you grant us a non-exclusive license to display and distribute it on our platform. You agree not to post:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>False, misleading, or deceptive content</li>
              <li>Content that infringes on others&apos; intellectual property</li>
              <li>Offensive, discriminatory, or illegal material</li>
              <li>Spam or unauthorized promotional content</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">7. Prohibited Conduct</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Circumvent our payment system to avoid fees</li>
              <li>Harass, threaten, or intimidate other users</li>
              <li>Use the platform for any illegal purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Impersonate another person or entity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">8. Limitation of Liability</h2>
            <p>Go Orient acts as a platform connecting travelers and guides. We are not a party to any agreement between travelers and guides. We are not liable for:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>The quality, safety, or legality of tour services</li>
              <li>Actions or omissions of guides or travelers</li>
              <li>Personal injury, property damage, or other losses during tours</li>
              <li>Any indirect, incidental, or consequential damages</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">9. Termination</h2>
            <p>We may suspend or terminate your account if you violate these Terms. You may delete your account at any time by contacting us. Upon termination, your right to use the Service ceases immediately.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">10. Governing Law</h2>
            <p>These Terms are governed by the laws of the People&apos;s Republic of China. Any disputes shall be resolved through arbitration in Beijing, China.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">11. Changes to Terms</h2>
            <p>We may update these Terms from time to time. We will notify registered users of material changes via email or platform notification. Continued use of the Service after changes constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">12. Contact</h2>
            <p>If you have questions about these Terms, please contact us at:</p>
            <p className="mt-1"><strong>Go Orient Technology Co., Ltd.</strong></p>
            <p>Email: legal@go-orient.com</p>
          </section>
        </div>

        <div className="mt-6 text-center">
          <Link href="/legal/privacy" className="text-sm text-slate-500 hover:text-slate-900 underline">View our Privacy Policy →</Link>
        </div>
      </div>
    </div>
  )
}
