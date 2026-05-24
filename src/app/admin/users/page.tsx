'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createBrowserClient } from '@supabase/ssr'
import { motion } from 'framer-motion'
import { Users, Search, Shield, Map, UserCircle } from 'lucide-react'

interface UserRow {
  id: string
  display_name: string
  email: string
  role: string
  avatar_url: string | null
  country: string | null
  created_at: string
  guide_profile?: {
    verification_status: string
    specialties: string[]
    service_cities: string[]
  } | null
}

export default function AdminUsersPage() {
  const { user } = useAuthStore()
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')

  useEffect(() => {
    if (!user) return
    const load = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { data } = await supabase
          .from('profiles')
          .select('*, guide_profiles(verification_status, specialties, service_cities)')
          .order('created_at', { ascending: false })

        if (data) {
          const mapped: UserRow[] = data.map((p: Record<string, unknown>) => ({
            id: p.id as string,
            display_name: p.display_name as string,
            email: p.email as string,
            role: p.role as string,
            avatar_url: p.avatar_url as string | null,
            country: p.country as string | null,
            created_at: (p.created_at as string).split('T')[0],
            guide_profile: p.guide_profiles as UserRow['guide_profile'],
          }))
          setUsers(mapped)
        }
      } catch {
        // Supabase unreachable
      }
      setLoading(false)
    }
    load()
  }, [user])

  const filtered = users.filter(u => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return u.display_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    }
    return true
  })

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
      </div>
    )
  }

  const roleCounts = {
    all: users.length,
    tourist: users.filter(u => u.role === 'tourist').length,
    guide: users.filter(u => u.role === 'guide').length,
    admin: users.filter(u => u.role === 'admin').length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-slate-500 text-sm">Manage platform users and guides.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full h-10 rounded-md border border-slate-300 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>
        <div className="flex gap-1">
          {(['all', 'tourist', 'guide', 'admin'] as const).map(role => (
            <Button
              key={role}
              variant={roleFilter === role ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRoleFilter(role)}
              className="text-xs"
            >
              {role === 'all' ? 'All' : role.charAt(0).toUpperCase() + role.slice(1)}
              <span className="ml-1 opacity-60">{roleCounts[role]}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Users List */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No users found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((u, i) => (
            <motion.div
              key={u.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  {u.avatar_url ? (
                    <img src={u.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover shrink-0 border" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {u.display_name?.[0] || '?'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm truncate">{u.display_name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                        u.role === 'admin' ? 'bg-amber-100 text-amber-700' :
                        u.role === 'guide' ? 'bg-green-100 text-green-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {u.role}
                      </span>
                      {u.role === 'guide' && u.guide_profile && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          u.guide_profile.verification_status === 'verified' ? 'bg-blue-100 text-blue-700' :
                          u.guide_profile.verification_status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {u.guide_profile.verification_status}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate">{u.email}</p>
                    {u.role === 'guide' && u.guide_profile && (
                      <div className="flex items-center gap-2 mt-0.5">
                        {u.guide_profile.service_cities?.length > 0 && (
                          <span className="text-xs text-slate-400 flex items-center gap-0.5">
                            <Map className="w-3 h-3" />{u.guide_profile.service_cities.slice(0, 2).join(', ')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 shrink-0">{u.created_at}</span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
