'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createBrowserClient } from '@supabase/ssr'
import { motion } from 'framer-motion'
import { FileText, Map, Search, Eye, Heart, ToggleLeft, ToggleRight } from 'lucide-react'

type ContentType = 'posts' | 'plans'

interface ContentItem {
  id: string
  title: string
  status: string
  views: number
  likes: number
  created_at: string
  author_name?: string
  cover_url?: string
  type: ContentType
}

export default function AdminContentPage() {
  const { user } = useAuthStore()
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<ContentType>('posts')

  useEffect(() => {
    if (!user) return
    const load = async () => {
      setLoading(true)
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        if (tab === 'posts') {
          const { data } = await supabase
            .from('posts')
            .select('id, title, status, view_count, likes_count, created_at, author:profiles!posts_author_id_fkey(display_name), media_urls')
            .order('created_at', { ascending: false })
          if (data) {
            setItems(data.map((p: Record<string, unknown>) => ({
              id: p.id as string,
              title: p.title as string,
              status: p.status as string,
              views: (p.view_count as number) || 0,
              likes: (p.likes_count as number) || 0,
              created_at: (p.created_at as string).split('T')[0],
              author_name: (p.author as Record<string, string>)?.display_name,
              cover_url: (p.media_urls as string[])?.[0],
              type: 'posts',
            })))
          }
        } else {
          const { data } = await supabase
            .from('tour_plans')
            .select('id, title, status, view_count, booking_count, created_at, guide:profiles!tour_plans_guide_id_fkey(display_name), cover_image_url')
            .order('created_at', { ascending: false })
          if (data) {
            setItems(data.map((p: Record<string, unknown>) => ({
              id: p.id as string,
              title: p.title as string,
              status: p.status as string,
              views: (p.view_count as number) || 0,
              likes: (p.booking_count as number) || 0,
              created_at: (p.created_at as string).split('T')[0],
              author_name: (p.guide as Record<string, string>)?.display_name,
              cover_url: p.cover_image_url as string,
              type: 'plans',
            })))
          }
        }
      } catch {
        // Supabase unreachable
      }
      setLoading(false)
    }
    load()
  }, [user, tab])

  const handleToggleStatus = async (item: ContentItem) => {
    const newStatus = item.status === 'published' ? 'hidden' : 'published'
    const table = item.type
    const field = table === 'plans' ? 'booking_count' : 'likes_count'

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      await supabase.from(table).update({ status: newStatus }).eq('id', item.id)
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: newStatus } : i))
    } catch {
      // Supabase unreachable
    }
  }

  const filtered = items.filter(i => {
    if (!search) return true
    const q = search.toLowerCase()
    return i.title.toLowerCase().includes(q) || (i.author_name || '').toLowerCase().includes(q)
  })

  if (loading && items.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Content</h1>
        <p className="text-slate-500 text-sm">Manage posts and tour plans.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <Button variant={tab === 'posts' ? 'default' : 'ghost'} size="sm" onClick={() => setTab('posts')} className="gap-1">
          <FileText className="w-4 h-4" /> Posts
        </Button>
        <Button variant={tab === 'plans' ? 'default' : 'ghost'} size="sm" onClick={() => setTab('plans')} className="gap-1">
          <Map className="w-4 h-4" /> Tour Plans
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search ${tab}...`}
          className="w-full h-10 rounded-md border border-slate-300 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
        />
      </div>

      {/* Content List */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No {tab} found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  {item.cover_url ? (
                    <img src={item.cover_url} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0 border" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      {tab === 'posts' ? <FileText className="w-5 h-5 text-slate-400" /> : <Map className="w-5 h-5 text-slate-400" />}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm truncate">{item.title}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                        item.status === 'published' ? 'bg-green-100 text-green-700' :
                        item.status === 'hidden' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      {item.author_name && <span>by {item.author_name}</span>}
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{item.views}</span>
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{tab === 'plans' ? 'bookings' : 'likes'} {item.likes}</span>
                      <span>{item.created_at}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleStatus(item)}
                    className="shrink-0 gap-1 text-xs"
                  >
                    {item.status === 'published' ? (
                      <><ToggleRight className="w-4 h-4 text-green-600" /> Published</>
                    ) : (
                      <><ToggleLeft className="w-4 h-4 text-slate-400" /> Hidden</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
