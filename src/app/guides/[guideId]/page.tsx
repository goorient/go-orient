'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import { TiltCard } from '@/components/cards/tilt-card'
import {
  ArrowLeft, MapPin, Globe, Clock, Shield, MessageCircle, Camera,
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createBrowserClient } from '@supabase/ssr'
import { useAuthStore } from '@/stores/auth-store'

interface GuideDetail {
  id: string
  display_name: string
  avatar_url: string | null
  bio: string | null
  country: string | null
  specialties: string[]
  languages_spoken: string[]
  service_cities: string[]
  years_experience: number
  verification_status: string
  intro: string | null
  gallery_urls: string[]
}

const LANG_LABELS: Record<string, string> = {
  en: '🇬🇧 English', zh: '🇨🇳 中文', jp: '🇯🇵 日本語', ja: '🇯🇵 日本語',
  fr: '🇫🇷 Français', de: '🇩🇪 Deutsch', ko: '🇰🇷 한국어', es: '🇪🇸 Español',
}

const SPECIALTY_COLORS: Record<string, string> = {
  Culture: 'bg-purple-100 text-purple-700', History: 'bg-amber-100 text-amber-700',
  Food: 'bg-red-100 text-red-700', Nature: 'bg-green-100 text-green-700',
  Hiking: 'bg-emerald-100 text-emerald-700', Photography: 'bg-blue-100 text-blue-700',
  Architecture: 'bg-slate-100 text-slate-700', Shopping: 'bg-pink-100 text-pink-700',
  Nightlife: 'bg-indigo-100 text-indigo-700', Wildlife: 'bg-lime-100 text-lime-700',
  'Tea Culture': 'bg-teal-100 text-teal-700', Cycling: 'bg-cyan-100 text-cyan-700',
}

function getDemoGuide(id: string): GuideDetail | null {
  const guides: Record<string, GuideDetail> = {
    'demo-guide-1': {
      id: 'demo-guide-1', display_name: 'Li Wei', avatar_url: null,
      bio: 'Born and raised in Beijing, I grew up listening to my grandmother\'s stories about life in the hutongs during the Qing Dynasty. After studying history at Peking University, I spent years leading tours through the Forbidden City, Great Wall, and hidden corners of old Beijing that most tourists never see.\n\nMy specialty is bringing history to life — not through dry facts, but through the personal stories of the people who lived it. I know the best noodle shops, the quietest temple gardens, and where to watch the sunset over the Forbidden City.\n\nI speak fluent English and Mandarin, and I\'m passionate about sharing the real Beijing with visitors from around the world.',
      country: 'China', specialties: ['Culture', 'History', 'Food'],
      languages_spoken: ['en', 'zh'], service_cities: ['Beijing'],
      years_experience: 5, verification_status: 'verified',
      intro: 'Your storyteller in the heart of Beijing',
      gallery_urls: [
        'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1599707367812-042e4880e007?w=400&h=400&fit=crop',
      ],
    },
    'demo-guide-2': {
      id: 'demo-guide-2', display_name: 'Chen Yu', avatar_url: null,
      bio: 'Professional photographer turned guide. I spent 10 years shooting for National Geographic China before deciding I wanted to share these incredible landscapes with people directly.\n\nI know every sunrise spot in Guilin and Yangshuo. My tours are designed around the best light — we\'ll be at the perfect location when the golden hour hits. I\'ll help you capture stunning photos while sharing the geology and folklore behind these karst formations.\n\nWhether you\'re a serious photographer or just want beautiful memories, I\'ll make sure you see Guilin from angles most people miss.',
      country: 'China', specialties: ['Nature', 'Hiking', 'Photography'],
      languages_spoken: ['en', 'zh'], service_cities: ['Guilin', 'Yangshuo'],
      years_experience: 8, verification_status: 'verified',
      intro: 'Chasing light through karst mountains',
      gallery_urls: [
        'https://images.unsplash.com/photo-1528164344705-47542687000d?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1537531383496-f4749b8032cf?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=400&h=400&fit=crop',
      ],
    },
    'demo-guide-3': {
      id: 'demo-guide-3', display_name: 'Wang Fang', avatar_url: null,
      bio: "Xi'an is my hometown and the Terracotta Warriors are my lifelong passion. I studied archaeology at Northwest University and participated in excavation projects in the area.\n\nI can share details about the warriors that most guides miss — the stories behind individual faces, the bronze chariot discoveries, and the ongoing excavation work. I also lead tours to the Wild Goose Pagoda, the Ancient City Wall, and the Muslim Quarter.\n\nI speak Japanese in addition to English and Mandarin, and I love sharing the food culture of Xi'an — the best roujiamo and biangbiang noodles in the city.",
      country: 'China', specialties: ['History', 'Architecture'],
      languages_spoken: ['en', 'zh', 'jp'], service_cities: ["Xi'an"],
      years_experience: 6, verification_status: 'verified',
      intro: 'Unlock 3000 years of history',
      gallery_urls: [
        'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1599707367812-042e4880e007?w=400&h=400&fit=crop',
      ],
    },
    'demo-guide-4': {
      id: 'demo-guide-4', display_name: 'Zhang Mei', avatar_url: null,
      bio: "Shanghai insider who knows every hidden speakeasy, local market, and rooftop bar. I grew up in the French Concession and watched the city transform.\n\nMy tours are not your typical sightseeing — I take you behind the scenes. We'll explore the art district in M50, hunt for vintage finds in hidden markets, and eat at the best xiaolongbao spots that only locals know about.\n\nAt night, I'll show you Shanghai's incredible cocktail scene and rooftop views. The city truly never sleeps, and neither do my tours.",
      country: 'China', specialties: ['Food', 'Shopping', 'Nightlife'],
      languages_spoken: ['en', 'zh'], service_cities: ['Shanghai'],
      years_experience: 4, verification_status: 'verified',
      intro: 'Shanghai through a local lens',
      gallery_urls: [
        'https://images.unsplash.com/photo-1537531383496-f4749b8032cf?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1599707367812-042e4880e007?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1528164344705-47542687000d?w=400&h=400&fit=crop',
      ],
    },
    'demo-guide-5': {
      id: 'demo-guide-5', display_name: 'Liu Yang', avatar_url: null,
      bio: "Panda lover and certified tea sommelier. I've been volunteering at the Chengdu Research Base since I was a university student, and I know every panda by name.\n\nMy tours combine three of Chengdu's best offerings: getting up close with giant pandas, exploring the city's incredible tea culture (I'll teach you proper gaiwan brewing), and tasting authentic Sichuan cuisine — from mild to melt-your-face-off spicy.\n\nI also lead trips to the nearby bamboo forests and ancient towns. Chengdu is the lifestyle capital of China — let me show you why.",
      country: 'China', specialties: ['Wildlife', 'Food', 'Tea Culture'],
      languages_spoken: ['en', 'zh'], service_cities: ['Chengdu'],
      years_experience: 7, verification_status: 'verified',
      intro: 'Pandas, tea, and the taste of Sichuan',
      gallery_urls: [
        'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1528164344705-47542687000d?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400&h=400&fit=crop',
      ],
    },
    'demo-guide-6': {
      id: 'demo-guide-6', display_name: 'Zhao Ting', avatar_url: null,
      bio: "Cyclist and culture enthusiast. I lead bike tours around West Lake and through Hangzhou's ancient tea villages. After studying art history in Paris, I returned home to share the beauty of Hangzhou with the world.\n\nMy slow-travel philosophy means we take our time — sipping longjing tea at a lakeside pavilion, cycling through bamboo groves, and photographing pagodas at sunset. I speak French and love introducing European visitors to Chinese culture.\n\nHangzhou has inspired poets and painters for centuries. Let me show you why.",
      country: 'China', specialties: ['Culture', 'Photography', 'Cycling'],
      languages_spoken: ['en', 'zh', 'fr'], service_cities: ['Hangzhou'],
      years_experience: 3, verification_status: 'verified',
      intro: 'Two wheels, one beautiful lake',
      gallery_urls: [
        'https://images.unsplash.com/photo-1599707367812-042e4880e007?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1537531383496-f4749b8032cf?w=400&h=400&fit=crop',
      ],
    },
  }
  return guides[id] || null
}

export default function GuideDetailPage() {
  const params = useParams()
  const guideId = params.guideId as string
  const router = useRouter()
  const [guide, setGuide] = useState<GuideDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImage, setCurrentImage] = useState(0)
  const [chatting, setChatting] = useState(false)
  const { user } = useAuthStore()

  const handleChat = async () => {
    if (!user) {
      router.push('/login')
      return
    }
    if (!guide) return
    setChatting(true)

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      // Check if conversation already exists
      const { data: existing } = await supabase
        .from('chat_conversations')
        .select('id')
        .or(`and(participant_a.eq.${user.id},participant_b.eq.${guide.id}),and(participant_a.eq.${guide.id},participant_b.eq.${user.id})`)
        .limit(1)

      if (existing && existing.length > 0) {
        router.push(`/chat/${existing[0].id}`)
        return
      }

      // Create new conversation
      const { data: conv } = await supabase
        .from('chat_conversations')
        .insert({
          participant_a: user.id,
          participant_b: guide.id,
        })
        .select('id')
        .single()

      if (conv) {
        router.push(`/chat/${conv.id}`)
        return
      }
    } catch {
      // Supabase unreachable — use demo conversation
    }

    // Fallback to demo chat
    router.push('/chat/demo-conv-1')
    setChatting(false)
  }

  useEffect(() => {
    const load = async () => {
      const demo = getDemoGuide(guideId)
      if (demo) {
        setGuide(demo)
        setLoading(false)
        return
      }

      try {
        const { createBrowserClient } = await import('@supabase/ssr')
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { data, error } = await supabase
          .from('guide_profiles')
          .select('*, profile:profiles(display_name, avatar_url, bio, country)')
          .eq('id', guideId)
          .single()

        if (!error && data) {
          const p = data.profile as Record<string, unknown>
          setGuide({
            id: data.id,
            display_name: (p?.display_name as string) || 'Guide',
            avatar_url: (p?.avatar_url as string) || null,
            bio: (p?.bio as string) || null,
            country: (p?.country as string) || null,
            specialties: data.specialties || [],
            languages_spoken: data.languages_spoken || [],
            service_cities: data.service_cities || [],
            years_experience: data.years_experience || 0,
            verification_status: data.verification_status || 'pending',
            intro: data.intro || null,
            gallery_urls: data.gallery_urls || [],
          })
        }
      } catch {
        // Supabase unreachable
      }
      setLoading(false)
    }
    load()
  }, [guideId])

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

  if (!guide) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🧭</div>
          <h3 className="text-2xl font-bold mb-2">Guide not found</h3>
          <Link href="/guides"><Button>Browse Guides</Button></Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <motion.div
        className="max-w-3xl mx-auto px-4 py-6 pb-28"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 mb-6 transition-colors px-2 py-2 -ml-2 rounded-lg hover:bg-slate-100"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Profile header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-3xl font-bold mb-4">
            {guide.display_name?.[0] || '?'}
          </div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold">{guide.display_name}</h1>
            {guide.verification_status === 'verified' && (
              <Shield className="w-5 h-5 text-blue-500" />
            )}
          </div>
          {guide.intro && (
            <p className="text-slate-500 italic">{guide.intro}</p>
          )}
          {guide.country && (
            <p className="text-sm text-slate-400 mt-1">{guide.country}</p>
          )}
        </div>

        {/* Photo gallery */}
        {guide.gallery_urls?.length > 0 && (
          <div className="mb-8">
            <div className="relative aspect-[16/9] bg-slate-100 rounded-xl overflow-hidden mb-2">
              {guide.gallery_urls[currentImage] && (
                <img
                  src={guide.gallery_urls[currentImage]}
                  alt={guide.display_name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            {guide.gallery_urls.length > 1 && (
              <div className="flex gap-2 justify-center">
                {guide.gallery_urls.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImage(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      i === currentImage ? 'border-slate-900' : 'border-transparent opacity-50 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* About */}
        {guide.bio && (
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-3">About Me</h2>
            <p className="text-slate-600 leading-relaxed whitespace-pre-line">{guide.bio}</p>
          </div>
        )}

        {/* Info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {/* Specialties */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="font-semibold text-sm text-slate-900 mb-2">Specialties</h3>
            <div className="flex flex-wrap gap-1.5">
              {guide.specialties.map((s) => (
                <span key={s} className={`text-xs px-2 py-0.5 rounded-full font-medium ${SPECIALTY_COLORS[s] || 'bg-slate-100 text-slate-700'}`}>
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="font-semibold text-sm text-slate-900 mb-2">Languages</h3>
            <div className="space-y-1">
              {guide.languages_spoken.map((l) => (
                <p key={l} className="text-sm text-slate-600">{LANG_LABELS[l] || l}</p>
              ))}
            </div>
          </div>

          {/* Service cities */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="font-semibold text-sm text-slate-900 mb-2">Service Areas</h3>
            <div className="flex flex-wrap gap-1.5">
              {guide.service_cities.map((city) => (
                <span key={city} className="inline-flex items-center gap-1 text-xs bg-slate-50 text-slate-600 px-2 py-1 rounded-full border border-slate-200">
                  <MapPin className="w-3 h-3" /> {city}
                </span>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="font-semibold text-sm text-slate-900 mb-2">Experience</h3>
            <p className="text-2xl font-bold text-slate-900">{guide.years_experience}+</p>
            <p className="text-xs text-slate-500">years guiding</p>
          </div>
        </div>
      </motion.div>

      {/* Sticky CTA bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-slate-200 z-50 px-4 py-3" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-bold text-sm md:text-lg truncate">{guide.display_name}</p>
            <p className="text-xs text-slate-400 truncate">{guide.service_cities.join(' · ')}</p>
          </div>
          <Button size="sm" className="gap-1 shrink-0" onClick={handleChat} disabled={chatting}>
            <MessageCircle className="w-4 h-4" /> {chatting ? 'Opening...' : 'Chat'}
          </Button>
        </div>
      </div>
    </div>
  )
}
