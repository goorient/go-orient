'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { useAuthStore } from '@/stores/auth-store'
import { Navbar } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Heart, Eye, MessageCircle, Share2, MapPin, Tag, Link as LinkIcon, Send, Clock, DollarSign, Users } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type { Post } from '@/types/database'

interface Comment {
  id: string
  content: string
  user_name: string
  created_at: string
}

const DEMO_COMMENTS: Record<string, Comment[]> = {
  'demo-1': [
    { id: 'c1', content: 'Absolutely stunning! The Mutianyu section is definitely the best.', user_name: 'TravelLover42', created_at: '2026-05-10T12:00:00Z' },
    { id: 'c2', content: 'What time did you arrive to catch the sunrise?', user_name: 'PhotoExplorer', created_at: '2026-05-10T14:30:00Z' },
    { id: 'c3', content: 'I did this tour last month and it was incredible. Highly recommend!', user_name: 'WanderlustKate', created_at: '2026-05-11T09:00:00Z' },
  ],
  'demo-5': [
    { id: 'c4', content: 'Baby pandas are the cutest things ever!', user_name: 'AnimalFan', created_at: '2026-05-06T11:00:00Z' },
    { id: 'c5', content: 'Is the research base open year-round?', user_name: 'NatureLover', created_at: '2026-05-06T15:00:00Z' },
  ],
}

const DEMO_POSTS: Record<string, Post> = {
  'demo-1': {
    id: 'demo-1', author_id: 'demo', post_type: 'image', title: 'Sunrise at the Great Wall',
    description: 'An unforgettable morning watching the sun rise over the Great Wall at Mutianyu. The golden light painted the ancient stones in warm hues. This section of the wall is less crowded than Badaling and offers stunning views in every direction.',
    media_urls: ['https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&h=600&fit=crop'],
    video_url: null, thumbnail_url: null, linked_plan_id: 'demo-plan-1', tags: ['Great Wall', 'Beijing', 'Sunrise'],
    destination: 'Beijing', likes_count: 234, comments_count: 18, favorites_count: 156, shares_count: 45,
    view_count: 3201, status: 'published', created_at: '2026-05-10T08:00:00Z', updated_at: '2026-05-10T08:00:00Z',
    author: { id: 'demo', email: '', display_name: 'Li Wei', avatar_url: null, phone: null, role: 'guide', bio: null, country: null, language: ['en'], created_at: '', updated_at: '' },
  },
  'demo-2': {
    id: 'demo-2', author_id: 'demo', post_type: 'image', title: 'Night View of Shanghai Bund',
    description: 'The Bund at night is a spectacle of lights reflecting off the Huangpu River, with the futuristic skyline of Pudong as backdrop. Best viewed from the Riverside Promenade after 7pm.',
    media_urls: ['https://images.unsplash.com/photo-1537531383496-f4749b8032cf?w=800&h=600&fit=crop'],
    video_url: null, thumbnail_url: null, linked_plan_id: null, tags: ['Shanghai', 'Night', 'City'],
    destination: 'Shanghai', likes_count: 189, comments_count: 12, favorites_count: 98, shares_count: 33,
    view_count: 2801, status: 'published', created_at: '2026-05-09T08:00:00Z', updated_at: '2026-05-09T08:00:00Z',
    author: { id: 'demo', email: '', display_name: 'Li Wei', avatar_url: null, phone: null, role: 'guide', bio: null, country: null, language: ['en'], created_at: '', updated_at: '' },
  },
  'demo-3': {
    id: 'demo-3', author_id: 'demo', post_type: 'image', title: 'Terraced Fields of Longji',
    description: "The Dragon's Backbone rice terraces in Guilin are a marvel of ancient engineering, cascading down the mountainside in emerald layers.",
    media_urls: ['https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&h=600&fit=crop'],
    video_url: null, thumbnail_url: null, linked_plan_id: 'demo-plan-2', tags: ['Guilin', 'Terrace', 'Nature'],
    destination: 'Guilin', likes_count: 312, comments_count: 24, favorites_count: 201, shares_count: 67,
    view_count: 4101, status: 'published', created_at: '2026-05-08T08:00:00Z', updated_at: '2026-05-08T08:00:00Z',
    author: { id: 'demo', email: '', display_name: 'Chen Yu', avatar_url: null, phone: null, role: 'guide', bio: null, country: null, language: ['en'], created_at: '', updated_at: '' },
  },
  'demo-4': {
    id: 'demo-4', author_id: 'demo', post_type: 'image', title: "Terracotta Warriors in Xi'an",
    description: 'Standing face-to-face with the Terracotta Army — thousands of life-sized warriors, each with unique facial features.',
    media_urls: ['https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=800&h=600&fit=crop'],
    video_url: null, thumbnail_url: null, linked_plan_id: null, tags: ["Xi'an", 'History', 'Warriors'],
    destination: "Xi'an", likes_count: 276, comments_count: 21, favorites_count: 178, shares_count: 52,
    view_count: 3601, status: 'published', created_at: '2026-05-07T08:00:00Z', updated_at: '2026-05-07T08:00:00Z',
    author: { id: 'demo', email: '', display_name: 'Wang Fang', avatar_url: null, phone: null, role: 'guide', bio: null, country: null, language: ['en'], created_at: '', updated_at: '' },
  },
  'demo-5': {
    id: 'demo-5', author_id: 'demo', post_type: 'image', title: 'Cute Pandas in Chengdu',
    description: 'Chengdu Research Base — watching baby pandas tumble and play is pure joy. Best time to visit is morning feeding time around 9am.',
    media_urls: ['https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=800&h=600&fit=crop'],
    video_url: null, thumbnail_url: null, linked_plan_id: 'demo-plan-3', tags: ['Chengdu', 'Panda', 'Wildlife'],
    destination: 'Chengdu', likes_count: 423, comments_count: 35, favorites_count: 289, shares_count: 89,
    view_count: 5201, status: 'published', created_at: '2026-05-06T08:00:00Z', updated_at: '2026-05-06T08:00:00Z',
    author: { id: 'demo', email: '', display_name: 'Li Wei', avatar_url: null, phone: null, role: 'guide', bio: null, country: null, language: ['en'], created_at: '', updated_at: '' },
  },
  'demo-f1': {
    id: 'demo-f1', author_id: 'demo', post_type: 'image', title: 'Sunrise at the Great Wall',
    description: 'An unforgettable morning watching the sun rise over the Great Wall at Mutianyu.',
    media_urls: ['https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=600&h=800&fit=crop'],
    video_url: null, thumbnail_url: null, linked_plan_id: 'demo-plan-1', tags: ['Great Wall', 'Beijing'],
    destination: 'Beijing', likes_count: 234, comments_count: 3, favorites_count: 156, shares_count: 45,
    view_count: 3200, status: 'published', created_at: '2026-05-10T08:00:00Z', updated_at: '2026-05-10T08:00:00Z',
    author: { id: 'demo', email: '', display_name: 'Li Wei', avatar_url: null, phone: null, role: 'guide', bio: null, country: null, language: ['en'], created_at: '', updated_at: '' },
  },
  'demo-f2': {
    id: 'demo-f2', author_id: 'demo', post_type: 'image', title: 'Night View of Shanghai Bund',
    description: 'The Bund at night — lights reflecting off the Huangpu River.',
    media_urls: ['https://images.unsplash.com/photo-1537531383496-f4749b8032cf?w=600&h=800&fit=crop'],
    video_url: null, thumbnail_url: null, linked_plan_id: null, tags: ['Shanghai', 'Night'],
    destination: 'Shanghai', likes_count: 189, comments_count: 0, favorites_count: 98, shares_count: 33,
    view_count: 2800, status: 'published', created_at: '2026-05-09T08:00:00Z', updated_at: '2026-05-09T08:00:00Z',
    author: { id: 'demo', email: '', display_name: 'Li Wei', avatar_url: null, phone: null, role: 'guide', bio: null, country: null, language: ['en'], created_at: '', updated_at: '' },
  },
  'demo-f3': {
    id: 'demo-f3', author_id: 'demo', post_type: 'image', title: 'Terraced Fields of Longji',
    description: "Dragon's Backbone rice terraces — a marvel of ancient engineering.",
    media_urls: ['https://images.unsplash.com/photo-1528164344705-47542687000d?w=600&h=800&fit=crop'],
    video_url: null, thumbnail_url: null, linked_plan_id: 'demo-plan-2', tags: ['Guilin', 'Nature'],
    destination: 'Guilin', likes_count: 312, comments_count: 0, favorites_count: 201, shares_count: 67,
    view_count: 4100, status: 'published', created_at: '2026-05-08T08:00:00Z', updated_at: '2026-05-08T08:00:00Z',
    author: { id: 'demo', email: '', display_name: 'Chen Yu', avatar_url: null, phone: null, role: 'guide', bio: null, country: null, language: ['en'], created_at: '', updated_at: '' },
  },
  'demo-f4': {
    id: 'demo-f4', author_id: 'demo', post_type: 'image', title: "Terracotta Warriors in Xi'an",
    description: 'Face-to-face with the Terracotta Army.',
    media_urls: ['https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=600&h=800&fit=crop'],
    video_url: null, thumbnail_url: null, linked_plan_id: null, tags: ["Xi'an", 'History'],
    destination: "Xi'an", likes_count: 276, comments_count: 0, favorites_count: 178, shares_count: 52,
    view_count: 3600, status: 'published', created_at: '2026-05-07T08:00:00Z', updated_at: '2026-05-07T08:00:00Z',
    author: { id: 'demo', email: '', display_name: 'Wang Fang', avatar_url: null, phone: null, role: 'guide', bio: null, country: null, language: ['en'], created_at: '', updated_at: '' },
  },
  'demo-f5': {
    id: 'demo-f5', author_id: 'demo', post_type: 'image', title: 'Cute Pandas in Chengdu',
    description: 'Morning feeding time at the Chengdu Research Base.',
    media_urls: ['https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=600&h=800&fit=crop'],
    video_url: null, thumbnail_url: null, linked_plan_id: 'demo-plan-3', tags: ['Chengdu', 'Panda'],
    destination: 'Chengdu', likes_count: 423, comments_count: 2, favorites_count: 289, shares_count: 78,
    view_count: 5200, status: 'published', created_at: '2026-05-06T08:00:00Z', updated_at: '2026-05-06T08:00:00Z',
    author: { id: 'demo', email: '', display_name: 'Liu Yang', avatar_url: null, phone: null, role: 'guide', bio: null, country: null, language: ['en'], created_at: '', updated_at: '' },
  },
  'demo-f6': {
    id: 'demo-f6', author_id: 'demo', post_type: 'image', title: 'West Lake at Dusk',
    description: "Hangzhou's West Lake painted in golden light at sunset.",
    media_urls: ['https://images.unsplash.com/photo-1599707367812-042e4880e007?w=600&h=800&fit=crop'],
    video_url: null, thumbnail_url: null, linked_plan_id: null, tags: ['Hangzhou', 'Lake'],
    destination: 'Hangzhou', likes_count: 198, comments_count: 0, favorites_count: 132, shares_count: 41,
    view_count: 2900, status: 'published', created_at: '2026-05-05T08:00:00Z', updated_at: '2026-05-05T08:00:00Z',
    author: { id: 'demo', email: '', display_name: 'Zhao Ting', avatar_url: null, phone: null, role: 'guide', bio: null, country: null, language: ['en'], created_at: '', updated_at: '' },
  },
}

export default function PostDetailPage() {
  const { postId } = useParams()
  const router = useRouter()
  const { user } = useAuthStore()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImage, setCurrentImage] = useState(0)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [liked, setLiked] = useState(false)

  useEffect(() => {
    const fetchPost = async () => {
      const demo = DEMO_POSTS[postId as string]
      if (demo) {
        setPost(demo)
        setComments(DEMO_COMMENTS[postId as string] || [])
        setLoading(false)
        return
      }

      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { data, error } = await supabase
          .from('posts')
          .select('*, author:profiles(display_name, avatar_url)')
          .eq('id', postId)
          .single()

        if (!error && data) {
          setPost({ ...data, author: data.author as Post['author'] } as Post)

          // Load comments
          const { data: commentsData } = await supabase
            .from('comments')
            .select('*, user:profiles(display_name)')
            .eq('post_id', postId)
            .order('created_at', { ascending: true })

          if (commentsData) {
            setComments(commentsData.map((c: Record<string, unknown>) => ({
              id: c.id as string,
              content: c.content as string,
              user_name: (c.user as Record<string, unknown>)?.display_name as string || 'User',
              created_at: c.created_at as string,
            })))
          }

          // Increment view
          try { await supabase.rpc('increment_view', { table_name: 'posts', row_id: postId as string }) } catch {}
        }
      } catch {
        // Supabase unreachable
      }
      setLoading(false)
    }
    if (postId) fetchPost()
  }, [postId])

  const handleComment = async () => {
    if (!newComment.trim() || !user || !post) return
    const content = newComment.trim()
    setNewComment('')

    const optimistic: Comment = {
      id: `temp-${Date.now()}`,
      content,
      user_name: 'You',
      created_at: new Date().toISOString(),
    }
    setComments(prev => [...prev, optimistic])

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      await supabase.from('comments').insert({
        post_id: post.id,
        user_id: user.id,
        content,
      })
      await supabase.from('posts').update({ comments_count: post.comments_count + 1 }).eq('id', post.id)
    } catch {
      // Keep optimistic locally
    }
  }

  const handleLike = () => {
    setLiked(!liked)
    if (post) {
      setPost({
        ...post,
        favorites_count: liked ? post.favorites_count - 1 : post.favorites_count + 1,
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🗺️</div>
          <h3 className="text-2xl font-bold mb-2">Post not found</h3>
          <Link href="/"><Button>Back to Home</Button></Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      <Navbar />

      <motion.div
        className="max-w-4xl mx-auto px-4 py-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 mb-4 transition-colors px-2 py-2 -ml-2 rounded-lg hover:bg-slate-100"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="grid md:grid-cols-5 gap-6">
          {/* Image carousel — left 3 cols */}
          <div className="md:col-span-3 space-y-3">
            <div className="relative aspect-[4/3] bg-slate-100 rounded-xl overflow-hidden">
              {post.media_urls[currentImage] && (
                <img src={post.media_urls[currentImage]} alt={post.title} className="w-full h-full object-cover" />
              )}
            </div>
            {post.media_urls.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {post.media_urls.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImage(i)}
                    className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      i === currentImage ? 'border-slate-900' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info — right 2 cols */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <h1 className="text-xl font-bold mb-2">{post.title}</h1>
              {post.description && (
                <p className="text-slate-600 text-sm leading-relaxed">{post.description}</p>
              )}
            </div>

            {/* Author */}
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-sm font-semibold">
                {post.author?.display_name?.[0] || '?'}
              </div>
              <div>
                <p className="font-semibold text-sm">{post.author?.display_name || 'Anonymous'}</p>
                <p className="text-xs text-slate-400">
                  {new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Stats + Actions */}
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {post.view_count}</span>
              <button onClick={handleLike} className={`flex items-center gap-1 ${liked ? 'text-red-500' : 'text-slate-500'} hover:text-red-500 transition-colors`}>
                <Heart className={`w-4 h-4 ${liked ? 'fill-red-500' : ''}`} /> {post.favorites_count}
              </button>
              <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4" /> {post.comments_count}</span>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {post.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                    <Tag className="w-3 h-3" />{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Destination */}
            {post.destination && (
              <div className="flex items-center gap-1 text-sm text-slate-500">
                <MapPin className="w-4 h-4" /> {post.destination}
              </div>
            )}

            {/* Linked plan */}
            {post.linked_plan_id && (
              <Link href={`/plans/${post.linked_plan_id}`}>
                <Card className="hover:border-slate-300 transition-colors cursor-pointer">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-1 text-xs text-slate-400 mb-1">
                      <LinkIcon className="w-3 h-3" /> Related Tour Plan
                    </div>
                    <p className="text-sm font-medium">View this tour plan →</p>
                  </CardContent>
                </Card>
              </Link>
            )}
          </div>
        </div>

        {/* Comments section */}
        <div className="mt-8 border-t border-slate-200 pt-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5" /> Comments ({comments.length})
          </h3>

          {/* Comment input */}
          {user ? (
            <form onSubmit={(e) => { e.preventDefault(); handleComment() }} className="flex gap-2 mb-6">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 h-10"
              />
              <Button type="submit" size="sm" className="h-10 px-3" disabled={!newComment.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          ) : (
            <div className="bg-slate-50 rounded-lg p-3 mb-6 text-sm text-slate-500 text-center">
              <Link href="/login" className="text-blue-600 font-medium">Sign in</Link> to leave a comment.
            </div>
          )}

          {/* Comments list */}
          {comments.length === 0 ? (
            <p className="text-center text-sm text-slate-400 py-8">No comments yet. Be the first!</p>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600 shrink-0">
                    {comment.user_name[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{comment.user_name}</span>
                      <span className="text-xs text-slate-400">
                        {new Date(comment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mt-0.5">{comment.content}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
