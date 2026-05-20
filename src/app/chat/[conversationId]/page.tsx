'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { Navbar } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Send } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface Message {
  id: string
  sender_id: string
  content: string
  message_type: string
  is_read: boolean
  created_at: string
}

// Demo messages for demo conversations
const DEMO_MESSAGES: Record<string, { messages: Message[]; otherName: string }> = {
  'demo-conv-1': {
    otherName: 'Li Wei',
    messages: [
      { id: 'dm-1', sender_id: 'demo-user', content: 'Hi! I\'m interested in your Beijing tour. Can you tell me more about the itinerary?', message_type: 'text', is_read: true, created_at: '2026-05-12T10:30:00Z' },
      { id: 'dm-2', sender_id: 'demo-guide', content: 'Hello! Of course! The Classic Beijing 3-Day Tour covers the Great Wall, Forbidden City, Temple of Heaven, and local food markets. Would you like me to customize anything?', message_type: 'text', is_read: true, created_at: '2026-05-12T10:35:00Z' },
      { id: 'dm-3', sender_id: 'demo-user', content: 'That sounds great! Can we add a visit to the Summer Palace?', message_type: 'text', is_read: true, created_at: '2026-05-12T10:37:00Z' },
      { id: 'dm-4', sender_id: 'demo-guide', content: 'Absolutely! I\'ll include the Summer Palace on Day 2. The gardens are beautiful in May. I\'ll update the plan for you.', message_type: 'text', is_read: false, created_at: '2026-05-12T10:40:00Z' },
    ],
  },
  'demo-conv-2': {
    otherName: 'Chen Yu',
    messages: [
      { id: 'dm-5', sender_id: 'demo-user', content: 'The sunset at the Great Wall was incredible! Thank you for the recommendation.', message_type: 'text', is_read: true, created_at: '2026-05-11T08:15:00Z' },
      { id: 'dm-6', sender_id: 'demo-guide-2', content: 'So glad you enjoyed it! The Jinshanling section at sunset is truly magical. Did you get good photos?', message_type: 'text', is_read: true, created_at: '2026-05-11T08:20:00Z' },
    ],
  },
}

export default function ChatRoomPage() {
  const { conversationId } = useParams()
  const { user } = useAuthStore()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [otherName, setOtherName] = useState('Guide')
  const [usingDemo, setUsingDemo] = useState(false)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    const convId = conversationId as string

    // Check if this is a demo conversation
    if (DEMO_MESSAGES[convId]) {
      const demo = DEMO_MESSAGES[convId]
      setMessages(demo.messages)
      setOtherName(demo.otherName)
      setUsingDemo(true)
      return
    }

    // Real Supabase connection
    const initChat = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        // Load conversation info
        const { data: conv } = await supabase
          .from('chat_conversations')
          .select('participant_a, participant_b')
          .eq('id', convId)
          .single()

        if (conv) {
          const otherId = conv.participant_a === user!.id ? conv.participant_b : conv.participant_a
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('id', otherId)
            .single()
          if (profile?.display_name) setOtherName(profile.display_name)
        }

        // Load existing messages
        const { data: msgs } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('conversation_id', convId)
          .order('created_at', { ascending: true })

        if (msgs && msgs.length > 0) {
          setMessages(msgs)
          setUsingDemo(false)
        }

        // Subscribe to new messages via Realtime
        const channel = supabase
          .channel(`chat:${convId}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'chat_messages',
              filter: `conversation_id=eq.${convId}`,
            },
            (payload) => {
              const newMsg = payload.new as Message
              setMessages(prev => {
                // Avoid duplicates
                if (prev.some(m => m.id === newMsg.id)) return prev
                return [...prev, newMsg]
              })
            }
          )
          .subscribe()

        channelRef.current = channel
      } catch {
        // Supabase unreachable — use demo data
        setOtherName('Guide')
        setUsingDemo(true)
      }
    }

    initChat()

    return () => {
      if (channelRef.current) {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [user, router, conversationId])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const handleSend = async () => {
    if (!newMessage.trim()) return

    const content = newMessage.trim()
    setNewMessage('')

    // Optimistic add
    const optimisticMsg: Message = {
      id: `temp-${Date.now()}`,
      sender_id: user!.id,
      content,
      message_type: 'text',
      is_read: false,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, optimisticMsg])

    const convId = conversationId as string

    // If demo conversation, just keep local
    if (usingDemo) return

    // Send to Supabase
    try {
      setSending(true)
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: convId,
          sender_id: user!.id,
          content,
          message_type: 'text',
        })

      if (error) {
        console.error('Failed to send message:', error)
      }

      // Update conversation preview
      await supabase
        .from('chat_conversations')
        .update({
          last_message_at: new Date().toISOString(),
          last_message_preview: content.slice(0, 100),
        })
        .eq('id', convId)
    } catch {
      // Supabase unreachable — message stays local
    } finally {
      setSending(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200">
          <button onClick={() => router.push('/chat')} className="text-slate-500 hover:text-slate-900 p-2 -ml-2 rounded-lg hover:bg-slate-100">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-sm font-semibold">
            {otherName[0]}
          </div>
          <div>
            <p className="font-semibold text-sm">{otherName}</p>
            <p className="text-xs text-green-500">Online</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">👋</div>
              <p className="text-slate-500 text-sm">Say hello! Start the conversation.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                    msg.sender_id === user.id
                      ? 'bg-slate-900 text-white rounded-br-md'
                      : 'bg-white border border-slate-200 text-slate-700 rounded-bl-md'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <div className="bg-white border-t border-slate-200 px-4 py-3" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend() }}
            className="flex gap-2"
          >
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 h-10"
            />
            <Button type="submit" size="sm" className="h-10 px-3" disabled={!newMessage.trim() || sending}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
