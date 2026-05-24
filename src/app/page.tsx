'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Navbar } from '@/components/layout/navbar'
import { FeedCard } from '@/components/feed/feed-card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type { Post } from '@/types/database'

const DEMO_POSTS: Post[] = [
  {
    id: 'demo-1', author_id: 'demo', post_type: 'image', title: 'Sunrise at the Great Wall',
    description: 'An unforgettable morning watching the sun rise over the Great Wall at Mutianyu. The golden light painted the ancient stones in warm hues.',
    media_urls: ['https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=600&h=800&fit=crop'],
    video_url: null, thumbnail_url: null, linked_plan_id: 'demo-plan-1', tags: ['Great Wall', 'Beijing', 'Sunrise'],
    destination: 'Beijing', likes_count: 234, comments_count: 18, favorites_count: 156, shares_count: 45,
    view_count: 3200, status: 'published', created_at: '2026-05-10T08:00:00Z', updated_at: '2026-05-10T08:00:00Z',
    author: { id: 'demo', email: '', display_name: 'Li Wei', avatar_url: null, phone: null, role: 'guide', bio: null, country: null, language: ['en'], created_at: '', updated_at: '' },
  },
  {
    id: 'demo-2', author_id: 'demo', post_type: 'image', title: 'Night View of Shanghai Bund',
    description: 'The Bund at night is a spectacle of lights reflecting off the Huangpu River, with the futuristic skyline of Pudong as backdrop.',
    media_urls: ['https://images.unsplash.com/photo-1537531383496-f4749b8032cf?w=600&h=800&fit=crop'],
    video_url: null, thumbnail_url: null, linked_plan_id: null, tags: ['Shanghai', 'Night', 'City'],
    destination: 'Shanghai', likes_count: 189, comments_count: 12, favorites_count: 98, shares_count: 33,
    view_count: 2800, status: 'published', created_at: '2026-05-09T08:00:00Z', updated_at: '2026-05-09T08:00:00Z',
    author: { id: 'demo', email: '', display_name: 'Li Wei', avatar_url: null, phone: null, role: 'guide', bio: null, country: null, language: ['en'], created_at: '', updated_at: '' },
  },
  {
    id: 'demo-3', author_id: 'demo', post_type: 'image', title: 'Terraced Fields of Longji',
    description: 'The Dragon\'s Backbone rice terraces in Guilin are a marvel of ancient engineering, cascading down the mountainside in emerald layers.',
    media_urls: ['https://images.unsplash.com/photo-1528164344705-47542687000d?w=600&h=800&fit=crop'],
    video_url: null, thumbnail_url: null, linked_plan_id: 'demo-plan-2', tags: ['Guilin', 'Terrace', 'Nature'],
    destination: 'Guilin', likes_count: 312, comments_count: 24, favorites_count: 201, shares_count: 67,
    view_count: 4100, status: 'published', created_at: '2026-05-08T08:00:00Z', updated_at: '2026-05-08T08:00:00Z',
    author: { id: 'demo', email: '', display_name: 'Chen Yu', avatar_url: null, phone: null, role: 'guide', bio: null, country: null, language: ['en'], created_at: '', updated_at: '' },
  },
  {
    id: 'demo-4', author_id: 'demo', post_type: 'image', title: 'Terracotta Warriors in Xi\'an',
    description: 'Standing face-to-face with the Terracotta Army — thousands of life-sized warriors, each with unique facial features.',
    media_urls: ['https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=600&h=800&fit=crop'],
    video_url: null, thumbnail_url: null, linked_plan_id: null, tags: ['Xi\'an', 'History', 'Warriors'],
    destination: 'Xi\'an', likes_count: 276, comments_count: 21, favorites_count: 178, shares_count: 52,
    view_count: 3600, status: 'published', created_at: '2026-05-07T08:00:00Z', updated_at: '2026-05-07T08:00:00Z',
    author: { id: 'demo', email: '', display_name: 'Wang Fang', avatar_url: null, phone: null, role: 'guide', bio: null, country: null, language: ['en'], created_at: '', updated_at: '' },
  },
  {
    id: 'demo-5', author_id: 'demo', post_type: 'image', title: 'Cute Pandas in Chengdu',
    description: 'Chengdu Research Base — watching baby pandas tumble and play is pure joy. The best time to visit is morning feeding time!',
    media_urls: ['https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=600&h=800&fit=crop'],
    video_url: null, thumbnail_url: null, linked_plan_id: 'demo-plan-3', tags: ['Chengdu', 'Panda', 'Wildlife'],
    destination: 'Chengdu', likes_count: 423, comments_count: 35, favorites_count: 289, shares_count: 89,
    view_count: 5200, status: 'published', created_at: '2026-05-06T08:00:00Z', updated_at: '2026-05-06T08:00:00Z',
    author: { id: 'demo', email: '', display_name: 'Li Wei', avatar_url: null, phone: null, role: 'guide', bio: null, country: null, language: ['en'], created_at: '', updated_at: '' },
  },
  {
    id: 'demo-6', author_id: 'demo', post_type: 'image', title: 'West Lake Serenity in Hangzhou',
    description: 'A misty morning at West Lake — willow trees, stone bridges, and pagodas reflected in still waters.',
    media_urls: ['https://images.unsplash.com/photo-1502791451862-7bd8c1df43a7?w=600&h=800&fit=crop'],
    video_url: null, thumbnail_url: null, linked_plan_id: null, tags: ['Hangzhou', 'Lake', 'Peaceful'],
    destination: 'Hangzhou', likes_count: 167, comments_count: 9, favorites_count: 112, shares_count: 28,
    view_count: 2100, status: 'published', created_at: '2026-05-05T08:00:00Z', updated_at: '2026-05-05T08:00:00Z',
    author: { id: 'demo', email: '', display_name: 'Zhang Mei', avatar_url: null, phone: null, role: 'guide', bio: null, country: null, language: ['en'], created_at: '', updated_at: '' },
  },
  {
    id: 'demo-7', author_id: 'demo', post_type: 'image', title: 'Zhangjiajie Avatar Mountains',
    description: 'The towering sandstone pillars that inspired the floating mountains in Avatar. Breathtaking in any weather.',
    media_urls: ['https://images.unsplash.com/photo-1537531383496-f4749b8032cf?w=600&h=900&fit=crop'],
    video_url: null, thumbnail_url: null, linked_plan_id: null, tags: ['Zhangjiajie', 'Mountains', 'Avatar'],
    destination: 'Zhangjiajie', likes_count: 345, comments_count: 29, favorites_count: 234, shares_count: 78,
    view_count: 4500, status: 'published', created_at: '2026-05-04T08:00:00Z', updated_at: '2026-05-04T08:00:00Z',
    author: { id: 'demo', email: '', display_name: 'Chen Yu', avatar_url: null, phone: null, role: 'guide', bio: null, country: null, language: ['en'], created_at: '', updated_at: '' },
  },
  {
    id: 'demo-8', author_id: 'demo', post_type: 'image', title: 'Li River Cruise — Guilin',
    description: 'Gliding down the Li River surrounded by karst peaks — the scenery that graces the 20 yuan banknote.',
    media_urls: ['https://images.unsplash.com/photo-1528164344705-47542687000d?w=600&h=800&fit=crop'],
    video_url: null, thumbnail_url: null, linked_plan_id: 'demo-plan-2', tags: ['Guilin', 'River', 'Cruise'],
    destination: 'Guilin', likes_count: 298, comments_count: 22, favorites_count: 195, shares_count: 61,
    view_count: 3800, status: 'published', created_at: '2026-05-03T08:00:00Z', updated_at: '2026-05-03T08:00:00Z',
    author: { id: 'demo', email: '', display_name: 'Wang Fang', avatar_url: null, phone: null, role: 'guide', bio: null, country: null, language: ['en'], created_at: '', updated_at: '' },
  },
]

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const [usingDemo, setUsingDemo] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const PAGE_SIZE = 20

  const fetchPosts = async (pageNum: number) => {
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
        .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1)

      if (!error && data && data.length > 0) {
        const formatted = data.map((p: Record<string, unknown>) => ({
          ...p,
          author: p.author as Post['author'],
        })) as Post[]

        setPosts(prev => pageNum === 0 ? formatted : [...prev, ...formatted])
        setHasMore(data.length === PAGE_SIZE)
        setUsingDemo(false)
      } else {
        throw new Error('no data')
      }
    } catch {
      if (pageNum === 0) {
        setPosts(DEMO_POSTS)
        setUsingDemo(true)
      }
      setHasMore(false)
    }
    setLoading(false)
  }

  useEffect(() => { fetchPosts(0) }, [])

  const handleLoadMore = useCallback(() => {
    if (!hasMore || loading) return
    const next = page + 1
    setPage(next)
    fetchPosts(next)
  }, [hasMore, loading, page])

  useEffect(() => {
    const el = loadMoreRef.current
    if (!el) return

    observerRef.current = new IntersectionObserver(
      ([target]) => {
        if (target.isIntersecting && hasMore && !loading) handleLoadMore()
      },
      { rootMargin: '200px' }
    )
    observerRef.current.observe(el)
    return () => observerRef.current?.disconnect()
  }, [handleLoadMore, hasMore, loading])

  const getColumns = () => {
    const cols: Post[][] = [[], [], [], []]
    posts.forEach((post, i) => cols[i % 4].push(post))
    return cols
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero */}
      <motion.section
        className="relative overflow-hidden bg-slate-900 text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-4 py-20 text-center relative z-10">
          <motion.h1
            className="text-3xl sm:text-4xl md:text-7xl font-bold tracking-tight mb-6"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Discover China
          </motion.h1>
          <motion.p
            className="text-base md:text-xl text-slate-300 max-w-2xl mx-auto mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Authentic experiences with local guides. From the Great Wall to hidden gems — your journey starts here.
          </motion.p>
          <motion.div
            className="flex flex-wrap justify-center gap-3 mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <Link href="/plans">
              <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100">
                Explore Plans
              </Button>
            </Link>
            <Link href="/guides">
              <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100">
                Find Guides
              </Button>
            </Link>
            <Link href="/visa">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                Visa Guide
              </Button>
            </Link>
          </motion.div>

          {/* Search bar */}
          <motion.div
            className="max-w-xl mx-auto"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Search destinations, plans, guides..."
                className="w-full h-12 rounded-full bg-white/10 border border-white/20 px-5 pr-12 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 backdrop-blur-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const q = (e.target as HTMLInputElement).value.trim()
                    if (q) window.location.href = `/plans?search=${encodeURIComponent(q)}`
                  }
                }}
              />
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                onClick={() => {
                  const input = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement
                  if (input?.value.trim()) window.location.href = `/plans?search=${encodeURIComponent(input.value)}`
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </button>
            </div>
          </motion.div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-slate-900" />
      </motion.section>

      {/* Feed */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold mb-6">Trending</h2>

        {usingDemo && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 mb-4 text-sm text-amber-700">
            Showing demo content. Register as a guide and publish posts to see real content here.
          </div>
        )}
        {posts.length === 0 && !loading ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🌏</div>
            <h3 className="text-2xl font-bold mb-2">No content yet</h3>
            <p className="text-slate-500 mb-6">Be the first to share China with the world!</p>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
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
              {posts.map(post => <FeedCard key={post.id} post={post} />)}
            </div>
            <div className="grid grid-cols-2 md:hidden gap-3">
              {posts.map(post => <FeedCard key={post.id} post={post} />)}
            </div>
          </>
        )}

        <div ref={loadMoreRef} className="py-8 text-center">
          {loading && (
            <div className="inline-block w-6 h-6 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
          )}
          {!hasMore && posts.length > 0 && (
            <p className="text-slate-400 text-sm">No more content</p>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-3">Go Orient</h3>
              <p className="text-sm text-slate-400">Discover China through local eyes. Authentic travel experiences with verified local guides.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Explore</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/plans" className="hover:text-white transition-colors">Tour Plans</Link></li>
                <li><Link href="/guides" className="hover:text-white transition-colors">Local Guides</Link></li>
                <li><Link href="/visa" className="hover:text-white transition-colors">Visa Guide</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">For Guides</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/register" className="hover:text-white transition-colors">Become a Guide</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/visa/service" className="hover:text-white transition-colors">Visa Service</Link></li>
                <li><span className="text-slate-500">help@goorient.com</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 mt-8 pt-6 text-center text-xs text-slate-500">
            &copy; 2026 Go Orient. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
