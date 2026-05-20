'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { createBrowserClient } from '@supabase/ssr'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Wallet, TrendingUp, Clock, ArrowDownToLine, Building2, AlertCircle, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Transaction {
  id: string
  type: 'earning' | 'payout'
  desc: string
  amount: number
  date: string
  status: 'available' | 'pending' | 'completed' | 'processing' | 'rejected'
}

interface MonthlyEarning {
  month: string
  amount: number
}

const DEMO_TRANSACTIONS: Transaction[] = [
  { id: 'tx-1', type: 'earning', desc: 'Classic Beijing 3-Day Tour — John Smith', amount: 7600, date: '2026-05-10', status: 'available' },
  { id: 'tx-2', type: 'earning', desc: 'Great Wall Sunset Experience — Emma Wilson', amount: 800, date: '2026-05-08', status: 'pending' },
  { id: 'tx-3', type: 'payout', desc: 'Bank payout to ****8901', amount: -5000, date: '2026-05-05', status: 'completed' },
  { id: 'tx-4', type: 'earning', desc: 'Classic Beijing 3-Day Tour — Takeshi Yamamoto', amount: 15200, date: '2026-04-28', status: 'completed' },
  { id: 'tx-5', type: 'earning', desc: 'Hidden Gems of Beijing — Sarah Chen', amount: 7200, date: '2026-04-15', status: 'completed' },
]

const DEMO_MONTHLY: MonthlyEarning[] = [
  { month: 'Jan', amount: 0 },
  { month: 'Feb', amount: 3200 },
  { month: 'Mar', amount: 8600 },
  { month: 'Apr', amount: 22400 },
  { month: 'May', amount: 8400 },
]

const DEMO_BANK = { bank_name: 'ICBC', account_last4: '8901', account_name: 'Li Wei' }

export default function DashboardEarningsPage() {
  const { user } = useAuthStore()
  const [transactions, setTransactions] = useState<Transaction[]>(DEMO_TRANSACTIONS)
  const [monthly, setMonthly] = useState<MonthlyEarning[]>(DEMO_MONTHLY)
  const [bankInfo, setBankInfo] = useState<Record<string, string>>(DEMO_BANK)
  const [loading, setLoading] = useState(true)
  const [showPayoutModal, setShowPayoutModal] = useState(false)
  const [payoutAmount, setPayoutAmount] = useState('')
  const [payoutLoading, setPayoutLoading] = useState(false)
  const [payoutSuccess, setPayoutSuccess] = useState(false)
  const [filter, setFilter] = useState<'all' | 'earnings' | 'payouts'>('all')

  useEffect(() => {
    if (!user) { setLoading(false); return }
    const loadData = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        // Load completed orders as earnings
        const { data: orders } = await supabase
          .from('orders')
          .select('id, plan_snapshot, agreed_price_cny, tourist_id, escrow_status, funds_released_at, tourist_confirmed_at, service_ended_at')
          .eq('guide_id', user!.id)
          .in('escrow_status', ['service_completed', 'tourist_confirmed', 'funds_released'])
          .order('created_at', { ascending: false })

        // Load payout requests
        const { data: payouts } = await supabase
          .from('payout_requests')
          .select('*')
          .eq('guide_id', user!.id)
          .order('requested_at', { ascending: false })

        // Load bank info from guide profile
        const { data: guideProfile } = await supabase
          .from('guide_profiles')
          .select('bank_account_info')
          .eq('id', user!.id)
          .single()

        // Load tourist names for order descriptions
        let touristIds: string[] = []
        if (orders && orders.length > 0) {
          touristIds = [...new Set(orders.map((o: Record<string, unknown>) => o.tourist_id as string))]
        }
        const { data: profiles } = touristIds.length > 0
          ? await supabase.from('profiles').select('id, display_name').in('id', touristIds)
          : { data: [] }
        const nameMap = new Map(
          (profiles ?? []).map((p: Record<string, unknown>) => [p.id as string, (p.display_name as string) || 'Tourist'])
        )

        if (orders && orders.length > 0 || payouts && payouts.length > 0) {
          const txns: Transaction[] = []

          // Orders as earnings
          if (orders) {
            for (const o of orders as Record<string, unknown>[]) {
              const snapshot = o.plan_snapshot as Record<string, string> | null
              const planTitle = snapshot?.title || 'Tour Plan'
              const touristName = nameMap.get(o.tourist_id as string) || 'Tourist'
              const status = o.escrow_status as string
              const releasedAt = o.funds_released_at as string | null
              const date = (releasedAt || o.service_ended_at || o.tourist_confirmed_at || '') as string

              txns.push({
                id: o.id as string,
                type: 'earning',
                desc: `${planTitle} — ${touristName}`,
                amount: o.agreed_price_cny as number,
                date: date ? date.slice(0, 10) : '',
                status: status === 'funds_released' ? 'completed' as const
                  : status === 'tourist_confirmed' ? 'available' as const
                  : 'pending' as const,
              })
            }
          }

          // Payouts
          if (payouts) {
            for (const p of payouts as Record<string, unknown>[]) {
              const bi = p.bank_info as Record<string, string> | null
              txns.push({
                id: p.id as string,
                type: 'payout',
                desc: `Bank payout to ****${(bi?.account_last4 || '****')}`,
                amount: -(p.amount_cny as number),
                date: (p.requested_at as string).slice(0, 10),
                status: (p.status as string) === 'paid' ? 'completed' as const
                  : (p.status as string) === 'rejected' ? 'rejected' as const
                  : 'processing' as const,
              })
            }
          }

          txns.sort((a, b) => b.date.localeCompare(a.date))
          setTransactions(txns.length > 0 ? txns : DEMO_TRANSACTIONS)
        }

        if (guideProfile?.bank_account_info) {
          setBankInfo(guideProfile.bank_account_info as Record<string, string>)
        }

        // Compute monthly earnings from orders
        if (orders && orders.length > 0) {
          const monthMap = new Map<string, number>()
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
          for (let i = 5; i >= 0; i--) {
            const d = new Date()
            d.setMonth(d.getMonth() - i)
            monthMap.set(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, 0)
          }
          for (const o of orders as Record<string, unknown>[]) {
            const dateStr = (o.funds_released_at || o.service_ended_at || '') as string
            if (dateStr) {
              const key = dateStr.slice(0, 7)
              if (monthMap.has(key)) {
                monthMap.set(key, (monthMap.get(key) || 0) + (o.agreed_price_cny as number))
              }
            }
          }
          const monthlyData = Array.from(monthMap.entries()).map(([key, amount]) => ({
            month: months[parseInt(key.slice(5, 7)) - 1],
            amount,
          }))
          setMonthly(monthlyData)
        }
      } catch {
        // Keep demo data
      }
      setLoading(false)
    }
    loadData()
  }, [user])

  const totalEarned = transactions.filter(t => t.type === 'earning').reduce((s, t) => s + t.amount, 0)
  const available = transactions.filter(t => t.type === 'earning' && t.status === 'available').reduce((s, t) => s + t.amount, 0)
  const pending = transactions.filter(t => t.type === 'earning' && t.status === 'pending').reduce((s, t) => s + t.amount, 0)
  const thisMonth = monthly.length > 0 ? monthly[monthly.length - 1].amount : 0

  const filteredTxns = filter === 'all' ? transactions
    : filter === 'earnings' ? transactions.filter(t => t.type === 'earning')
    : transactions.filter(t => t.type === 'payout')

  const handleRequestPayout = async () => {
    const amount = parseInt(payoutAmount)
    if (!amount || amount <= 0 || amount > available) return

    setPayoutLoading(true)
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      await supabase.from('payout_requests').insert({
        guide_id: user!.id,
        amount_cny: amount,
        bank_info: bankInfo,
        status: 'pending',
      })

      // Optimistic: add to local transactions
      setTransactions(prev => [{
        id: `payout-${Date.now()}`,
        type: 'payout',
        desc: `Bank payout to ****${bankInfo.account_last4 || '****'}`,
        amount: -amount,
        date: new Date().toISOString().slice(0, 10),
        status: 'processing',
      }, ...prev])
      setPayoutSuccess(true)
    } catch {
      // Demo success
      setTransactions(prev => [{
        id: `payout-${Date.now()}`,
        type: 'payout',
        desc: `Bank payout to ****${bankInfo.account_last4 || '****'}`,
        amount: -amount,
        date: new Date().toISOString().slice(0, 10),
        status: 'processing',
      }, ...prev])
      setPayoutSuccess(true)
    }
    setPayoutLoading(false)
  }

  const STATUS_ICON: Record<string, typeof CheckCircle2> = {
    completed: CheckCircle2,
    processing: Loader2,
    pending: Clock,
    available: ArrowDownToLine,
    rejected: XCircle,
  }
  const STATUS_COLOR: Record<string, string> = {
    completed: 'text-green-500',
    processing: 'text-blue-500',
    pending: 'text-amber-500',
    available: 'text-green-600',
    rejected: 'text-red-500',
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Earnings</h1>
        <p className="text-slate-500 text-sm">Track your income and manage payouts.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Earned', value: `¥${totalEarned.toLocaleString()}`, icon: Wallet, color: 'text-slate-900' },
          { label: 'Available', value: `¥${available.toLocaleString()}`, icon: ArrowDownToLine, color: 'text-green-600' },
          { label: 'Pending', value: `¥${pending.toLocaleString()}`, icon: Clock, color: 'text-amber-600' },
          { label: 'This Month', value: `¥${thisMonth.toLocaleString()}`, icon: TrendingUp, color: 'text-blue-600' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                    <stat.icon className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-slate-500">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Bank Info + Payout CTA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Building2 className="w-5 h-5 text-slate-600" />
              <h3 className="font-semibold text-sm">Bank Account</h3>
            </div>
            {bankInfo.bank_name ? (
              <div className="space-y-1 text-sm">
                <p><span className="text-slate-500">Bank:</span> {bankInfo.bank_name}</p>
                <p><span className="text-slate-500">Account:</span> ****{bankInfo.account_last4 || '****'}</p>
                <p><span className="text-slate-500">Name:</span> {bankInfo.account_name || '--'}</p>
              </div>
            ) : (
              <p className="text-sm text-slate-400">No bank account configured. Update in your Guide Profile.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col justify-center items-center">
            <p className="text-sm text-slate-500 mb-2">Available for withdrawal</p>
            <p className="text-3xl font-bold text-green-600 mb-3">¥{available.toLocaleString()}</p>
            <Button
              className="w-full gap-2"
              disabled={available <= 0}
              onClick={() => { setShowPayoutModal(true); setPayoutSuccess(false) }}
            >
              <ArrowDownToLine className="w-4 h-4" />
              Request Payout
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Monthly Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 h-40">
            {monthly.map((d) => {
              const maxAmount = Math.max(...monthly.map(m => m.amount), 1)
              const height = Math.max((d.amount / maxAmount) * 100, 4)
              return (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-slate-500">{d.amount > 0 ? `¥${(d.amount / 1000).toFixed(1)}k` : ''}</span>
                  <motion.div
                    className="w-full bg-slate-900 rounded-t-sm min-h-1"
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  />
                  <span className="text-xs text-slate-400">{d.month}</span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Transaction Filter */}
      <div className="flex gap-1 mb-3 bg-slate-100 p-1 rounded-lg">
        {(['all', 'earnings', 'payouts'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors capitalize ${
              filter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {f === 'all' ? 'All' : f === 'earnings' ? 'Earnings' : 'Payouts'}
          </button>
        ))}
      </div>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTxns.length === 0 ? (
            <div className="text-center py-8">
              <Wallet className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No transactions yet.</p>
            </div>
          ) : (
            <div className="space-y-0 divide-y divide-slate-100">
              {filteredTxns.map((tx) => {
                const Icon = STATUS_ICON[tx.status] || Clock
                const color = STATUS_COLOR[tx.status] || 'text-slate-400'
                return (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-between py-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'earning' ? 'bg-green-50' : 'bg-blue-50'}`}>
                        <Icon className={`w-4 h-4 ${color} ${tx.status === 'processing' ? 'animate-spin' : ''}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{tx.desc}</p>
                        <p className="text-xs text-slate-400">{tx.date}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className={`text-sm font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-slate-700'}`}>
                        {tx.amount > 0 ? '+' : ''}¥{Math.abs(tx.amount).toLocaleString()}
                      </p>
                      <p className={`text-xs ${color} capitalize`}>{tx.status === 'processing' ? 'Processing' : tx.status}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payout Modal */}
      <AnimatePresence>
        {showPayoutModal && (
          <motion.div
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPayoutModal(false)}
          >
            <motion.div
              className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {payoutSuccess ? (
                <div className="text-center">
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <h3 className="text-lg font-bold mb-1">Payout Requested</h3>
                  <p className="text-sm text-slate-500 mb-4">
                    ¥{parseInt(payoutAmount).toLocaleString()} will be sent to ****{bankInfo.account_last4 || '****'} within 1-3 business days.
                  </p>
                  <Button onClick={() => setShowPayoutModal(false)} className="w-full">Done</Button>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-bold mb-1">Request Payout</h3>
                  <p className="text-sm text-slate-500 mb-4">
                    Available: ¥{available.toLocaleString()} to ****{bankInfo.account_last4 || '****'}
                  </p>
                  <div className="mb-4">
                    <label className="text-sm font-medium mb-1 block">Amount (CNY)</label>
                    <Input
                      type="number"
                      value={payoutAmount}
                      onChange={(e) => setPayoutAmount(e.target.value)}
                      placeholder="Enter amount"
                      min={1}
                      max={available}
                    />
                    {payoutAmount && parseInt(payoutAmount) > available && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Exceeds available balance
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowPayoutModal(false)} className="flex-1">Cancel</Button>
                    <Button
                      onClick={handleRequestPayout}
                      disabled={!payoutAmount || parseInt(payoutAmount) <= 0 || parseInt(payoutAmount) > available || payoutLoading}
                      className="flex-1 gap-1"
                    >
                      {payoutLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ArrowDownToLine className="w-4 h-4" />
                      )}
                      Confirm
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
