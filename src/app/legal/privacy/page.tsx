'use client'

import { Navbar } from '@/components/layout/navbar'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button onClick={() => window.history.back()} className="flex items-center gap-1 text-slate-500 hover:text-slate-900 p-2 -ml-2 rounded-lg hover:bg-slate-100 mb-6">
          <ArrowLeft className="w-5 h-5" /> Back
        </button>

        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-slate-400 mb-8">Last updated: May 24, 2026</p>

        <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 space-y-6 text-sm text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">1. Introduction</h2>
            <p>Go Orient Technology Co., Ltd. (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our platform at go-orient.com.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">2. Information We Collect</h2>
            <h3 className="font-semibold text-slate-800 mt-3 mb-1">2.1 Information You Provide</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Account Information:</strong> Name, email address, phone number, and password</li>
              <li><strong>Profile Information:</strong> Bio, photo, languages, specialties (for guides)</li>
              <li><strong>Identity Documents:</strong> Passport or ID number, guide certification (for verification)</li>
              <li><strong>Payment Information:</strong> Bank account details for payouts (guides only)</li>
              <li><strong>Communications:</strong> Messages sent through our chat system</li>
              <li><strong>Content:</strong> Photos, posts, and tour plan descriptions you publish</li>
            </ul>

            <h3 className="font-semibold text-slate-800 mt-3 mb-1">2.2 Information Collected Automatically</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Device information (browser type, operating system)</li>
              <li>Usage data (pages visited, features used, time spent)</li>
              <li>IP address and approximate location</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">3. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Provide, maintain, and improve our Service</li>
              <li>Process bookings and payments securely</li>
              <li>Verify guide identities and qualifications</li>
              <li>Facilitate communication between travelers and guides</li>
              <li>Send service-related notifications (booking confirmations, messages)</li>
              <li>Provide customer support and resolve disputes</li>
              <li>Detect and prevent fraud or unauthorized activity</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">4. Data Storage and Security</h2>
            <p>Your data is stored on secure servers managed by Supabase (PostgreSQL database) and Vercel (application hosting), both of which employ industry-standard security measures including:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Encryption in transit (TLS/SSL)</li>
              <li>Encryption at rest (AES-256)</li>
              <li>Row-level security policies</li>
              <li>Regular security audits</li>
            </ul>
            <p className="mt-2">Data is processed within the jurisdictions of our service providers. While we take reasonable measures to protect your data, no system is completely secure.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">5. Photo and Media Storage</h2>
            <p>Photos you upload (profile pictures, gallery images, post photos) are stored in Supabase Storage with the following protections:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Access controlled by Row Level Security policies</li>
              <li>Only you can upload or delete photos in your directory</li>
              <li>Profile and gallery photos are publicly visible to platform users</li>
              <li>Verification documents are encrypted and accessible only for verification purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">6. Data Sharing</h2>
            <p>We do not sell your personal data. We may share your information with:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Other Users:</strong> Your public profile (name, photo, bio, specialties) is visible to other platform users</li>
              <li><strong>Service Providers:</strong> Supabase (database), Vercel (hosting), and payment processors as needed</li>
              <li><strong>Legal Authorities:</strong> When required by law, regulation, or legal process</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct your information at any time through your profile</li>
              <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
              <li><strong>Portability:</strong> Export your data in a standard format</li>
              <li><strong>Objection:</strong> Object to certain types of data processing</li>
            </ul>
            <p className="mt-2">To exercise these rights, contact us at privacy@go-orient.com.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">8. Cookies</h2>
            <p>We use essential cookies to maintain your session and authentication state. We do not use tracking cookies or third-party advertising cookies. You can control cookie settings through your browser preferences.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">9. Children&apos;s Privacy</h2>
            <p>Our Service is not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If we become aware that we have collected data from a child, we will take steps to delete it promptly.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">10. International Data Transfers</h2>
            <p>If you are accessing our Service from outside China, please be aware that your data will be transferred to and processed in China. By using our Service, you consent to this transfer.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">11. Data Retention</h2>
            <p>We retain your personal data for as long as your account is active or as needed to provide our Service. If you delete your account, we will delete your personal data within 30 days, except where we are required to retain it by law (such as transaction records for tax purposes).</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">12. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of material changes via email or platform notification. Your continued use of the Service after changes constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">13. Contact Us</h2>
            <p>If you have questions about this Privacy Policy or our data practices, please contact:</p>
            <p className="mt-1"><strong>Go Orient Technology Co., Ltd.</strong></p>
            <p>Data Protection Officer: privacy@go-orient.com</p>
            <p>General inquiries: legal@go-orient.com</p>
          </section>
        </div>

        <div className="mt-6 text-center">
          <Link href="/legal/terms" className="text-sm text-slate-500 hover:text-slate-900 underline">View our Terms of Service →</Link>
        </div>
      </div>
    </div>
  )
}
