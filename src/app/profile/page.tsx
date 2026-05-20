'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { Navbar } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Globe, LogOut, LayoutDashboard, ClipboardList, MessageCircle } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'

export default function ProfilePage() {
  const { user, profile, setProfile } = useAuthStore()
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [bio, setBio] = useState(profile?.bio || '')
  const [country, setCountry] = useState(profile?.country || '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '')
      setBio(profile.bio || '')
      setCountry(profile.country || '')
    }
  }, [profile])

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { data, error } = await supabase
        .from('profiles')
        .update({ display_name: displayName, bio, country })
        .eq('id', user!.id)
        .select()
        .single()

      if (!error && data) {
        setProfile(data as typeof profile)
        setEditing(false)
      }
    } catch {
      // Supabase unreachable — save locally only
      setProfile({ ...profile, display_name: displayName, bio, country } as typeof profile)
      setEditing(false)
    }
    setSaving(false)
  }

  const handleSignOut = async () => {
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      await supabase.auth.signOut()
    } catch {
      // Supabase unreachable
    }
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">My Profile</CardTitle>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-100 text-slate-600 uppercase">
                {profile.role}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-2xl font-bold">
                {profile.display_name?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{profile.display_name || 'Unnamed'}</h3>
                <p className="text-sm text-slate-500 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> {user.email}
                </p>
              </div>
            </div>

            {editing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-700 font-semibold">Display Name</Label>
                  <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="h-10" />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 font-semibold">Bio</Label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself"
                    rows={3}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 font-semibold">Country</Label>
                  <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Where are you from" className="h-10" />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {profile.bio && (
                  <div>
                    <Label className="text-slate-400 text-xs">Bio</Label>
                    <p className="text-sm mt-1">{profile.bio}</p>
                  </div>
                )}
                {profile.country && (
                  <div className="flex items-center gap-1 text-sm text-slate-500">
                    <Globe className="w-3.5 h-3.5" /> {profile.country}
                  </div>
                )}
                <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                  Edit Profile
                </Button>
              </div>
            )}

            {/* Quick Links */}
            <div className="pt-4 border-t space-y-2">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Quick Links</p>
              <div className="grid grid-cols-2 gap-2">
                <Link href="/chat">
                  <Button variant="outline" className="w-full gap-2 h-10">
                    <MessageCircle className="w-4 h-4" /> Messages
                  </Button>
                </Link>
                {profile.role === 'tourist' && (
                  <Link href="/orders">
                    <Button variant="outline" className="w-full gap-2 h-10">
                      <ClipboardList className="w-4 h-4" /> My Orders
                    </Button>
                  </Link>
                )}
                {profile.role === 'guide' && (
                  <Link href="/dashboard">
                    <Button variant="outline" className="w-full gap-2 h-10">
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Sign out */}
            <div className="pt-4 border-t">
              <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50 w-full" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" /> Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
