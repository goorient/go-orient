'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

const FORBIDDEN_NAMES = [
  'admin', 'administrator', 'root', 'system', 'moderator', 'mod',
  'fuck', 'shit', 'damn', 'ass', 'bitch', 'bastard',
  'nazi', 'hitler', 'racist',
  'support', 'help', 'info', 'contact', 'service',
  'test', 'null', 'undefined', 'delete',
]

function validateDisplayName(name: string): string | null {
  const trimmed = name.trim()
  if (trimmed.length < 2) return 'Display name must be at least 2 characters'
  if (trimmed.length > 30) return 'Display name must be under 30 characters'
  if (FORBIDDEN_NAMES.some(w => trimmed.toLowerCase().includes(w))) {
    return 'This name contains restricted words'
  }
  if (!/^[\p{L}\p{N}\s._-]+$/u.test(trimmed)) {
    return 'Name can only contain letters, numbers, spaces, dots, underscores, and hyphens'
  }
  return null
}

function validatePassword(pwd: string): string | null {
  if (pwd.length < 8) return 'Password must be at least 8 characters'
  if (!/[a-zA-Z]/.test(pwd)) return 'Password must contain at least one letter'
  if (!/[0-9]/.test(pwd)) return 'Password must contain at least one number'
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(pwd)) {
    return 'Password must contain at least one special character (!@#$%^&*...)'
  }
  return null
}

function getPasswordStrength(pwd: string): { label: string; color: string; width: string } {
  if (!pwd) return { label: '', color: '', width: '0%' }
  let score = 0
  if (pwd.length >= 8) score++
  if (pwd.length >= 12) score++
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd)) score++
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(pwd)) score++

  if (score <= 1) return { label: 'Weak', color: 'bg-red-400', width: '25%' }
  if (score <= 2) return { label: 'Fair', color: 'bg-amber-400', width: '50%' }
  if (score <= 3) return { label: 'Good', color: 'bg-blue-400', width: '75%' }
  return { label: 'Strong', color: 'bg-green-500', width: '100%' }
}

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [role, setRole] = useState<'tourist' | 'guide'>('tourist')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const nameError = validateDisplayName(displayName)
    if (nameError) { setError(nameError); return }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    const pwdError = validatePassword(password)
    if (pwdError) { setError(pwdError); return }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName.trim(),
          role,
        },
      },
    })

    if (error) {
      if (error.message.includes('already registered')) {
        setError('This email is already registered. Try signing in instead.')
      } else {
        setError(error.message)
      }
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  const strength = getPasswordStrength(password)

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Account Created!</CardTitle>
            <CardDescription>
              Welcome to Go Orient! Your {role} account is ready.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full" onClick={() => router.push('/')}>
              Start Exploring
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">Go Orient</CardTitle>
          <CardDescription>Create your account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200">{error}</div>
            )}

            {/* Role selector */}
            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold">I am a</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('tourist')}
                  className={`p-4 border-2 rounded-xl text-center transition-all ${
                    role === 'tourist'
                      ? 'border-slate-900 bg-slate-900 text-white shadow-lg'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="text-2xl mb-1">🌍</div>
                  <div className="text-sm font-semibold">Tourist</div>
                  <div className="text-xs opacity-70 mt-0.5">Explore China</div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('guide')}
                  className={`p-4 border-2 rounded-xl text-center transition-all ${
                    role === 'guide'
                      ? 'border-slate-900 bg-slate-900 text-white shadow-lg'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="text-2xl mb-1">🏔️</div>
                  <div className="text-sm font-semibold">Guide</div>
                  <div className="text-xs opacity-70 mt-0.5">Share your expertise</div>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-slate-700 font-semibold">Display Name</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="Your name (2-30 characters)"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="h-10 border-slate-300 text-slate-900 placeholder:text-slate-400"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-semibold">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 border-slate-300 text-slate-900 placeholder:text-slate-400"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 font-semibold">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Letters + Numbers + Special chars"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 border-slate-300 text-slate-900 placeholder:text-slate-400"
                required
              />
              {password && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Strength</span>
                    <span className={`font-medium ${
                      strength.label === 'Weak' ? 'text-red-500' :
                      strength.label === 'Fair' ? 'text-amber-500' :
                      strength.label === 'Good' ? 'text-blue-500' :
                      'text-green-500'
                    }`}>{strength.label}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${strength.color} rounded-full transition-all duration-300`} style={{ width: strength.width }} />
                  </div>
                </div>
              )}
              <p className="text-xs text-slate-400">Min 8 chars, must include letter + number + special character</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-700 font-semibold">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-10 border-slate-300 text-slate-900 placeholder:text-slate-400"
                required
              />
              {confirmPassword && confirmPassword !== password && (
                <p className="text-xs text-red-500">Passwords do not match</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full h-10" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
            <div className="text-sm text-center text-slate-500">
              Already have an account?{' '}
              <Link href="/login" className="text-slate-900 hover:underline font-semibold">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
