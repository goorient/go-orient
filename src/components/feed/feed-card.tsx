'use client'

import Link from 'next/link'
import { TiltCard } from '@/components/cards/tilt-card'
import { Heart, Eye, MapPin } from 'lucide-react'
import type { Post } from '@/types/database'

interface FeedCardProps {
  post: Post
}

export function FeedCard({ post }: FeedCardProps) {
  return (
    <Link href={`/feed/${post.id}`}>
      <TiltCard className="rounded-xl overflow-hidden bg-white cursor-pointer break-inside-avoid mb-4">
        <div className="relative aspect-[3/4] bg-slate-100 overflow-hidden">
          {post.media_urls[0] && (
            <img
              src={post.media_urls[0]}
              alt={post.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          )}
          {post.post_type === 'video' && (
            <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
              ▶ Video
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-10">
            <h3 className="text-white text-sm font-medium line-clamp-2">{post.title}</h3>
          </div>
        </div>

        <div className="p-3">
          {post.destination && (
            <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
              <MapPin className="w-3 h-3" />
              {post.destination}
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-medium">
                {post.author?.display_name?.[0] || '?'}
              </div>
              <span className="text-xs text-slate-600 truncate max-w-[70px]">
                {post.author?.display_name || 'Anonymous'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-0.5">
                <Eye className="w-3 h-3" /> {post.view_count}
              </span>
              <span className="flex items-center gap-0.5">
                <Heart className="w-3 h-3" /> {post.favorites_count}
              </span>
            </div>
          </div>
        </div>
      </TiltCard>
    </Link>
  )
}
