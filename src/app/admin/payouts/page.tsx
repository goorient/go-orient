'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createBrowserClient } from '@supabase/ssr'
import { motion } from 'framer-motion'
import { Wallet, Check, X } from 'lucide-react'

interface PayoutRow {
  id: string
  guide_id: string
  guide_name: string
  amount_cny: number
  status: string
  bank_info: Record<string, string>
  requested_at: string
  notes: string | null
}

export default function AdminPayoutsPage() {
  const { user } = useAuthStore()
  const [payouts, setPayouts] = useState<PayoutRow[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { data } = await supabase
          .from('payout_requests')
          .select('id, guide_id, amount_cny, status, bank_info, requested_at, notes, guide:profiles!payout_requests_guide_id_fkey(display_name)')
          .order('requested_at', { ascending: false })

        if (data) {
          setPayouts(data.map((p: Record<string, unknown>) => ({
            id: p.id as string,
            guide_id: p.guide_id as string,
            guide_name: (p.guide as Record<string, string>)?.display_name || 'Guide',
            amount_cny: p.amount_cny as number,
            status: p.status as string,
            bank_info: (p.bank_info as Record<string, string>) || {},
            requested_at: (p.requested_at as string)?.split('T')[0] || '',
            notes: p.notes as string | null,
          })))
        }
      } catch {
        // Supabase unreachable
      }
      setLoading(false)
    }
    load()
  }, [user])

  const handleUpdateStatus = async (payoutId: string, newStatus: 'approved' | 'rejected') => {
    setProcessing(payoutId)
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      await supabase
        .from('payout_requests')
        .update({ status: newStatus, processed_at: new Date().toISOString() })
        .eq('id', payoutId)
      setPayouts(prev => prev.map(p => p.id === payoutId ? { ...p, status: newStatus } : p))
    } catch {
      // Supabase unreachable
    }
    setProcessing(null)
  }

  const filtered = statusFilter === 'all'
    ? payouts
    : payouts.filter(p => p.status === statusFilter)

  const totalPending = payouts
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount_cny, 0)

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Payout Requests</h1>
        <p className="text-slate-500 text-sm">
          {payouts.filter(p => p.status === 'pending').length} pending · ¥{totalPending.toLocaleString()} awaiting
        </p>
      </div>

      {/* Status Filter */}
      <div className="flex gap-1">
        {['all', 'pending', 'approved', 'rejected', 'paid'].map(status => {
          const count = status === 'all' ? payouts.length : payouts.filter(p => p.status === status).length
          if (status !== 'all' && count === 0) return null
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`text-xs px-3 py-1 rounded-full transition-colors ${
                statusFilter === status ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
            </button>
          )
        })}
      </div>

      {/* Payouts List */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Wallet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No payout requests found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((payout, i) => (
            <motion.div
              key={payout.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{payout.guide_name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        payout.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        payout.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                        payout.status === 'paid' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {payout.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {payout.bank_info.bank_name && `${payout.bank_info.bank_name} · `}
                      {payout.bank_info.account_last4 && `****${payout.bank_info.account_last4}`}
                      {payout.bank_info.account_name && ` · ${payout.bank_info.account_name}`}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">Requested: {payout.requested_at}</p>
                  </div>
                  <div className="text-right shrink-0 flex items-center gap-3">
                    <p className="font-bold text-sm">¥{payout.amount_cny.toLocaleString()}</p>
                    {payout.status === 'pending' && (
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStatus(payout.id, 'approved')}
                          disabled={processing === payout.id}
                          className="gap-1 text-xs text-green-600 hover:text-green-700"
                        >
                          <Check className="w-3 h-3" /> Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStatus(payout.id, 'rejected')}
                          disabled={processing === payout.id}
                          className="gap-1 text-xs text-red-600 hover:text-red-700"
                        >
                          <X className="w-3 h-3" /> Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
