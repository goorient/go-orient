'use client'

import { useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useAuthStore } from '@/stores/auth-store'
import type { Profile } from '@/types/database'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setProfile, setLoading } = useAuthStore()

  useEffect(() => {
    let mounted = true

    const init = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const { data: { session } } = await supabase.auth.getSession()

        if (!mounted) return
        setUser(session?.user ?? null)

        if (session?.user) {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (mounted && data) setProfile(data as Profile)
        } else {
          if (mounted) setProfile(null)
        }

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!mounted) return
            setUser(session?.user ?? null)

            if (session?.user) {
              try {
                const { data } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', session.user.id)
                  .single()
                if (mounted && data) setProfile(data as Profile)
              } catch {
                if (mounted) setProfile(null)
              }
            } else {
              if (mounted) setProfile(null)
            }
          }
        )

        return () => {
          subscription.unsubscribe()
        }
      } catch {
        // Supabase unreachable — mark as not loading so pages render
        if (mounted) {
          setUser(null)
          setProfile(null)
        }
      }
    }

    const result = init()

    return () => {
      mounted = false
      result.then(unsub => unsub?.())
    }
  }, [])

  return <>{children}</>
}
