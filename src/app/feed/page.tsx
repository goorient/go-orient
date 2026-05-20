'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Navbar } from '@/components/layout/navbar'
import { FeedCard } from '@/components/feed/feed-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import type { Post } from '@/types/database'

const DEMO_FEED_POSTS: Post[] = [
  {
    id: 'demo-f1', author_id: 'demo', post_type: 'image', title: 'Sunrise at the Great Wall',
    description: 'An unforgettable morning watching the sun rise over the Great Wall at Mutianyu.',
    media_urls: ['https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=600&h=800&fit=crop'],
    video_url: null, thumbnail_url: null, linked_plan_id: 'demo-plan-1', tags: ['Great Wall', 'Beijing', 'Sunrise'],
    destination: 'Beijing', likes_count: 234, comments_count: 18, favorites_count: 156, shares_count: 45,
    view_count: 3200, status: 'published', created_at: '2026-05-10T08:00:00Z', updated_at: '2026-05-10T08:00:00Z',
    author: { id: 'demo', email: '', display_name: 'Li Wei', avatar_url: null, phone: null, role: 'guide', bio: null, country: null, language: ['en'], created_at: '', updated_at: '' },
  },
  {
    id: 'demo-f2', author_id: 'demo', post_type: 'image', title: 'Night View of Shanghai Bund',
    description: 'The Bund at night is a spectacle of lights reflecting off the Huangpu River.',
    media_urls: ['https://images.unsplash.com/photo-1537531383496-f4749b8032cf?w=600&h=800&fit=crop'],
    video_url: null, thumbnail_url: null, linked_plan_id: null, tags: ['Shanghai', 'Night', 'City'],
    destination: 'Shanghai', likes_count: 189, comments_count: 12, favorites_count: 98, shares_count: 33,
    view_count: 2800, status: 'published', created_at: '2026-05-09T08:00:00Z', updated_at: '2026-05-09T08:00:00Z',
    author: { id: 'demo', email: '', display_name: 'Li Wei', avatar_url: null, phone: null, role: 'guide', bio: null, country: null, language: ['en'], created_at: '', updated_at: '' },
  },
  {
    id: 'demo-f3', author_id: 'demo', post_type: 'image', title: 'Terraced Fields of Longji',
    description: "The Dragon's Backbone rice terraces in Guilin are a marvel of ancient engineering.",
    media_urls: ['https://images.unsplash.com/photo-1528164344705-47542687000d?w=600&h=800&fit=crop'],
    video_url: null, thumbnail_url: null, linked_plan_id: 'demo-plan-2', tags: ['Guilin', 'Terrace', 'Nature'],
    destination: 'Guilin', likes_count: 312, comments_count: 24, favorites_count: 201, shares_count: 67,
    view_count: 4100, status: 'published', created_at: '2026-05-08T08:00:00Z', updated_at: '2026-05-08T08:00:00Z',
    author: { id: 'demo', email: '', display_name: 'Chen Yu', avatar_url: null, phone: null, role: 'guide', bio: null, country: null, language: ['en'], created_at: '', updated_at: '' },
  },
  {
    id: 'demo-f4', author_id: 'demo', post_type: 'image', title: "Terracotta Warriors in Xi'an",
    description: 'Standing face-to-face with the Terracotta Army.',
    media_urls: ['https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=600&h=800&fit=crop'],
    video_url: null, thumbnail_url: null, linked_plan_id: null, tags: ["Xi'an", 'History', 'Warriors'],
    destination: "Xi'an", likes_count: 276, comments_count: 21, favorites_count: 178, shares_count: 52,
    view_count: 3600, status: 'published', created_at: '2026-05-07T08:00:00Z', updated_at: '2026-05-07T08:00:00Z',
    author: { id: 'demo', email: '', display_name: 'Wang Fang', avatar_url: null, phone: null, role: 'guide', bio: null, country: null, language: ['en'], created_at: '', updated_at: '' },
  },
  {
    id: 'demo-f5', author_id: 'demo', post_type: 'image', title: 'Cute Pandas in Chengdu',
    description: 'Morning feeding time at the Chengdu Research Base.',
    media_urls: ['https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=600&h=800&fit=crop'],
    video_url: null, thumbnail_url: null, linked_plan_id: 'demo-plan-3', tags: ['Chengdu', 'Panda', 'Wildlife'],
    destination: 'Chengdu', likes_count: 423, comments_count: 35, favorites_count: 289, shares_count: 78,
    view_count: 5200, status: 'published', created_at: '2026-05-06T08:00:00Z', updated_at: '2026-05-06T08:00:00Z',
    author: { id: 'demo', email: '', display_name: 'Liu Yang', avatar_url: null, phone: null, role: 'guide', bio: null, country: null, language: ['en'], created_at: '', updated_at: '' },
  },
  {
    id: 'demo-f6', author_id: 'demo', post_type: 'image', title: 'West Lake at Dusk',
    description: "Hangzhou's West Lake painted in golden light at sunset.",
    media_urls: ['https://images.unsplash.com/photo-1599707367812-042e4880e007?w=600&h=800&fit=crop'],
    video_url: null, thumbnail_url: null, linked_plan_id: null, tags: ['Hangzhou', 'Lake', 'Sunset'],
    destination: 'Hangzhou', likes_count: 198, comments_count: 15, favorites_count: 132, shares_count: 41,
    view_count: 2900, status: 'published', created_at: '2026-05-05T08:00:00Z', updated_at: '2026-05-05T08:00:00Z',
    author: { id: 'demo', email: '', display_name: 'Zhao Ting', avatar_url: null, phone: null, role: 'guide', bio: null, country: null, language: ['en'], created_at: '', updated_at: '' },
  },
]

const DESTINATIONS = ['All', 'Beijing', 'Shanghai', "Xi'an", 'Chengdu', 'Guilin', 'Hangzhou']

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [destFilter, setDestFilter] = useState('All')
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true)
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { data, error } = await supabase
          .from('posts')
          .select('*, author:profiles(display_name, avatar_url)')
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(40)

        if (!error && data && data.length > 0) {
          const formatted = data.map((p: Record<string, unknown>) => ({
            ...p,
            author: p.author as Post['author'],
          })) as Post[]
          setPosts(formatted)
        } else {
          setPosts(DEMO_FEED_POSTS)
        }
      } catch {
        setPosts(DEMO_FEED_POSTS)
      }
      setLoading(false)
    }
    fetchPosts()
  }, [])

  // Filter
  const filtered = posts.filter((post) => {
    const matchesDest = destFilter === 'All' || post.destination === destFilter
    const matchesSearch = !searchQuery ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.description && post.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (post.tags && post.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())))
    return matchesDest && matchesSearch
  })

  const getColumns = () => {
    const cols: Post[][] = [[], [], [], []]
    filtered.forEach((post, i) => cols[i % 4].push(post))
    return cols
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Explore</h1>
        <p className="text-slate-500 mb-6">Discover authentic China through the eyes of locals</p>

        {/* Search + Filters */}
        <div className="space-y-3 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stories, tips, destinations..."
              className="pl-10 h-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {DESTINATIONS.map((dest) => (
              <Button
                key={dest}
                variant={dest === destFilter ? 'default' : 'outline'}
                size="sm"
                className="shrink-0"
                onClick={() => setDestFilter(dest)}
              >
                {dest}
              </Button>
            ))}
          </div>
        </div>

        {filtered.length === 0 && !loading ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold mb-2">No matching content</h3>
            <p className="text-slate-500 mb-4">Try a different search or destination.</p>
            <Button variant="outline" onClick={() => { setDestFilter('All'); setSearchQuery('') }}>Clear Filters</Button>
          </div>
        ) : (
          <>
            <div className="hidden lg:grid lg:grid-cols-4 gap-4">
              {getColumns().map((col, i) => (
                <div key={i} className="flex flex-col gap-0">
                  {col.map(post => <FeedCard key={post.id} post={post} />)}
                </div>
              ))}
            </div>
            <div className="hidden md:grid md:grid-cols-3 lg:hidden gap-4">
              {filtered.map(post => <FeedCard key={post.id} post={post} />)}
            </div>
            <div className="grid grid-cols-2 md:hidden gap-3">
              {filtered.map(post => <FeedCard key={post.id} post={post} />)}
            </div>
          </>
        )}

        <div ref={loadMoreRef} className="py-8 text-center">
          {loading && (
            <div className="inline-block w-6 h-6 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
          )}
          {!loading && filtered.length > 0 && (
            <p className="text-slate-400 text-sm">End of content</p>
          )}
        </div>
      </div>
    </div>
  )
}
