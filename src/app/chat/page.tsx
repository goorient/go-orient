'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { Navbar } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'

interface Conversation {
  id: string
  participant_a: string
  participant_b: string
  related_plan_id: string | null
  last_message_at: string
  last_message_preview: string | null
  otherUser?: {
    display_name: string
    avatar_url: string | null
  }
}

// Demo conversations for when Supabase is unreachable
const DEMO_CONVERSATIONS: Conversation[] = [
  {
    id: 'demo-conv-1',
    participant_a: 'demo-user',
    participant_b: 'demo-guide',
    related_plan_id: null,
    last_message_at: '2026-05-12T10:30:00Z',
    last_message_preview: 'Hi! I\'m interested in your Beijing tour. Can you tell me more about the itinerary?',
    otherUser: { display_name: 'Li Wei', avatar_url: null },
  },
  {
    id: 'demo-conv-2',
    participant_a: 'demo-user',
    participant_b: 'demo-guide-2',
    related_plan_id: null,
    last_message_at: '2026-05-11T08:15:00Z',
    last_message_preview: 'The sunset at the Great Wall was incredible! Thank you for the recommendation.',
    otherUser: { display_name: 'Chen Yu', avatar_url: null },
  },
]

export default function ChatPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [usingDemo, setUsingDemo] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    const loadConversations = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const { data, error } = await supabase
          .from('chat_conversations')
          .select(`
            id,
            participant_a,
            participant_b,
            related_plan_id,
            last_message_at,
            last_message_preview
          `)
          .or(`participant_a.eq.${user!.id},participant_b.eq.${user!.id}`)
          .order('last_message_at', { ascending: false, nullsFirst: false })

        if (error || !data || data.length === 0) {
          setConversations(DEMO_CONVERSATIONS)
          setUsingDemo(true)
          return
        }

        // Fetch other user profiles for each conversation
        const conversationsWithUsers = await Promise.all(
          data.map(async (conv: Conversation) => {
            const otherId = conv.participant_a === user!.id ? conv.participant_b : conv.participant_a
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('display_name, avatar_url')
                .eq('id', otherId)
                .single()
              return { ...conv, otherUser: profile || { display_name: 'User', avatar_url: null } }
            } catch {
              return { ...conv, otherUser: { display_name: 'User', avatar_url: null } }
            }
          })
        )

        setConversations(conversationsWithUsers)
        setUsingDemo(false)
      } catch {
        setConversations(DEMO_CONVERSATIONS)
        setUsingDemo(true)
      }
    }

    loadConversations()
  }, [user, router])

  if (!user) return null

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Messages</h1>

        {usingDemo && conversations.length > 0 && (
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
            Showing demo conversations. Connect to Supabase for real-time messaging.
          </div>
        )}

        {conversations.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-xl font-bold mb-2">No messages yet</h3>
            <p className="text-slate-500 mb-6">
              Start a conversation by chatting with a guide from their profile page.
            </p>
            <Link href="/guides">
              <Button>Browse Guides</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => (
              <Link key={conv.id} href={`/chat/${conv.id}`}>
                <div className="flex items-center gap-3 bg-white rounded-xl p-4 border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-semibold shrink-0">
                    {conv.otherUser?.display_name?.[0] || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm">{conv.otherUser?.display_name || 'User'}</p>
                      <span className="text-xs text-slate-400">
                        {conv.last_message_at ? new Date(conv.last_message_at).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 truncate">{conv.last_message_preview || 'No messages yet'}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
