'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, Plus, Eye, Heart, Image, X, Check, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'

interface Post {
  id: string
  title: string
  description: string
  status: 'draft' | 'published'
  views: number
  likes: number
  media_urls: string[]
  tags: string[]
  destination: string
  created_at: string
}

const DEMO_POSTS: Post[] = [
  { id: 'post-1', title: 'Best sunrise spots on the Great Wall', description: 'An unforgettable morning watching the sun rise over the Great Wall at Mutianyu.', status: 'published', views: 342, likes: 47, media_urls: [], tags: ['Great Wall', 'Sunrise'], destination: 'Beijing', created_at: '2026-05-10' },
  { id: 'post-2', title: 'Hidden hutong cafes you must try', description: 'The best-kept secrets of Beijing\'s hutong cafe scene.', status: 'published', views: 218, likes: 31, media_urls: [], tags: ['Beijing', 'Cafe'], destination: 'Beijing', created_at: '2026-05-08' },
  { id: 'post-3', title: 'Night food markets in Beijing', description: 'A guide to the best night food markets in Beijing.', status: 'draft', views: 0, likes: 0, media_urls: [], tags: ['Food', 'Beijing'], destination: 'Beijing', created_at: '2026-05-11' },
]

export default function DashboardPostsPage() {
  const { user } = useAuthStore()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form state
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newDestination, setNewDestination] = useState('')
  const [newTags, setNewTags] = useState<string[]>([])
  const [newTagInput, setNewTagInput] = useState('')
  const [newMediaUrls, setNewMediaUrls] = useState<string[]>([])
  const [newMediaInput, setNewMediaInput] = useState('')

  // Load posts
  useEffect(() => {
    if (!user) return
    const loadPosts = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { data } = await supabase
          .from('posts')
          .select('*')
          .eq('author_id', user!.id)
          .order('created_at', { ascending: false })

        if (data && data.length > 0) {
          const mapped: Post[] = data.map((p: Record<string, unknown>) => ({
            id: p.id as string,
            title: p.title as string,
            description: (p.description as string) || '',
            status: (p.status === 'published' ? 'published' : 'draft') as Post['status'],
            views: (p.view_count as number) || 0,
            likes: (p.likes_count as number) || 0,
            media_urls: (p.media_urls as string[]) || [],
            tags: (p.tags as string[]) || [],
            destination: (p.destination as string) || '',
            created_at: (p.created_at as string).split('T')[0],
          }))
          setPosts(mapped)
        } else {
          setPosts(DEMO_POSTS)
        }
      } catch {
        setPosts(DEMO_POSTS)
      }
      setLoading(false)
    }
    loadPosts()
  }, [user])

  const resetForm = () => {
    setNewTitle(''); setNewDesc(''); setNewDestination('')
    setNewTags([]); setNewTagInput('')
    setNewMediaUrls([]); setNewMediaInput('')
  }

  const handleCreate = async () => {
    if (!newTitle || !user) return
    setSaving(true)

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      await supabase.from('posts').insert({
        author_id: user.id,
        post_type: 'image',
        title: newTitle,
        description: newDesc,
        media_urls: newMediaUrls,
        tags: newTags,
        destination: newDestination || null,
        status: 'draft',
      })
    } catch {
      // Supabase unreachable
    }

    const post: Post = {
      id: `post-${Date.now()}`,
      title: newTitle,
      description: newDesc,
      status: 'draft',
      views: 0,
      likes: 0,
      media_urls: newMediaUrls,
      tags: newTags,
      destination: newDestination,
      created_at: new Date().toISOString().split('T')[0],
    }
    setPosts(prev => [post, ...prev])
    setShowCreate(false)
    resetForm()
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Content</h1>
          <p className="text-slate-500 text-sm">Share travel tips and attract tourists.</p>
        </div>
        {!showCreate && (
          <Button onClick={() => { resetForm(); setShowCreate(true) }} className="gap-1">
            <Plus className="w-4 h-4" /> New Post
          </Button>
        )}
      </div>

      {showCreate && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="mb-6">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold">Create New Post</h3>
                <Button variant="ghost" size="sm" onClick={() => { setShowCreate(false); resetForm() }}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-700 font-semibold">Title *</Label>
                  <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Give your post a catchy title" className="h-10" />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700 font-semibold">Description</Label>
                  <textarea
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Share your tips, story, or recommendation..."
                    rows={4}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-semibold">Destination</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input value={newDestination} onChange={(e) => setNewDestination(e.target.value)} placeholder="e.g., Beijing" className="h-10 pl-9" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-semibold">Tags</Label>
                    <div className="flex gap-1">
                      <Input
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        placeholder="Add tag..."
                        className="h-10"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newTagInput.trim()) {
                            e.preventDefault()
                            setNewTags([...newTags, newTagInput.trim()])
                            setNewTagInput('')
                          }
                        }}
                      />
                      <Button variant="outline" size="sm" onClick={() => {
                        if (newTagInput.trim()) {
                          setNewTags([...newTags, newTagInput.trim()])
                          setNewTagInput('')
                        }
                      }}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {newTags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {newTags.map((tag) => (
                      <span key={tag} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
                        {tag}
                        <button onClick={() => setNewTags(newTags.filter(t => t !== tag))}><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Media URLs */}
                <div className="space-y-2">
                  <Label className="text-slate-700 font-semibold">Photos</Label>
                  {newMediaUrls.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {newMediaUrls.map((url, i) => (
                        <div key={i} className="relative group">
                          <img src={url} alt="" className="w-full h-20 object-cover rounded-lg border" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                          <button onClick={() => setNewMediaUrls(newMediaUrls.filter((_, j) => j !== i))} className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-2.5 h-2.5" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-1">
                    <Input
                      value={newMediaInput}
                      onChange={(e) => setNewMediaInput(e.target.value)}
                      placeholder="Paste image URL..."
                      className="h-10"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newMediaInput.trim()) {
                          e.preventDefault()
                          setNewMediaUrls([...newMediaUrls, newMediaInput.trim()])
                          setNewMediaInput('')
                        }
                      }}
                    />
                    <Button variant="outline" size="sm" onClick={() => {
                      if (newMediaInput.trim()) {
                        setNewMediaUrls([...newMediaUrls, newMediaInput.trim()])
                        setNewMediaInput('')
                      }
                    }}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" onClick={() => { setShowCreate(false); resetForm() }}>Cancel</Button>
                  <Button onClick={handleCreate} disabled={!newTitle || saving}>
                    {saving ? 'Saving...' : 'Save Draft'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {!showCreate && (
        posts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold mb-1">No posts yet</h3>
              <p className="text-slate-500 text-sm mb-4">Share your local knowledge to attract tourists.</p>
              <Button onClick={() => { resetForm(); setShowCreate(true) }} className="gap-1">
                <Plus className="w-4 h-4" /> Create Post
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {posts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
              >
                <Card>
                  <CardContent className="p-4 flex items-center gap-4">
                    {post.media_urls.length > 0 ? (
                      <img src={post.media_urls[0]} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0 border" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-slate-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm truncate">{post.title}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                          post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {post.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.views}</span>
                        <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{post.likes}</span>
                        <span>{post.created_at}</span>
                        {post.destination && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{post.destination}</span>}
                      </div>
                      {post.tags.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {post.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="text-xs text-slate-400">#{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <Link href={`/feed/${post.id}`}>
                      <Button variant="ghost" size="sm" className="shrink-0 text-xs">Edit</Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
