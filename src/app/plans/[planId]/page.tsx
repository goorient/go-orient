'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Navbar } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  ArrowLeft, Clock, Users, MapPin, Star, Check, X as XIcon,
  Calendar, Shield, MessageCircle,
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface PlanDetail {
  id: string
  guide_id: string
  title: string
  subtitle: string | null
  description: string
  cover_image_url: string
  gallery_urls: string[]
  destinations: { city: string; spots: string[] }[]
  itinerary: { day: number; title: string; description: string; spots: string[]; meals: string }[]
  duration_days: number
  max_group_size: number
  price_cny: number
  currency: string
  price_breakdown: Record<string, number>
  includes: string[]
  excludes: string[]
  highlights: string[]
  tags: string[]
  difficulty: string | null
  status: string
  view_count: number
  booking_count: number
  created_at: string
  updated_at: string
  guide?: {
    display_name: string
    avatar_url: string | null
  }
  guide_profile?: {
    rating_avg: number
    review_count: number
    verification_status: string
    specialties: string[]
    languages_spoken: string[]
  }
}

function getDemoPlan(id: string): PlanDetail | null {
  const plans: Record<string, PlanDetail> = {
    'demo-plan-1': {
      id: 'demo-plan-1', guide_id: 'demo', title: 'Classic Beijing 3-Day Tour', subtitle: 'Great Wall · Forbidden City · Temple of Heaven',
      description: 'Experience the best of Beijing in 3 days. Walk the Great Wall at Mutianyu, explore the imperial Forbidden City, and visit the iconic Temple of Heaven. Includes authentic Peking duck dinner.',
      cover_image_url: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&h=500&fit=crop',
      gallery_urls: ['https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=800&h=500&fit=crop'],
      destinations: [{ city: 'Beijing', spots: ['Great Wall (Mutianyu)', 'Forbidden City', 'Temple of Heaven', 'Summer Palace'] }],
      itinerary: [
        { day: 1, title: 'Imperial Beijing', description: 'Explore the Forbidden City and Tiananmen Square, then visit Jingshan Park for a panoramic view.', spots: ['Tiananmen Square', 'Forbidden City', 'Jingshan Park'], meals: 'Lunch, Dinner' },
        { day: 2, title: 'The Great Wall', description: 'Drive to Mutianyu section of the Great Wall. Afternoon visit to the Summer Palace.', spots: ['Great Wall (Mutianyu)', 'Summer Palace'], meals: 'Breakfast, Lunch' },
        { day: 3, title: 'Culture & Departure', description: 'Morning visit to Temple of Heaven, explore hutong neighborhoods, Peking duck farewell dinner.', spots: ['Temple of Heaven', 'Hutong Alleys'], meals: 'Breakfast, Lunch, Dinner' },
      ],
      duration_days: 3, max_group_size: 8, price_cny: 3800, currency: 'CNY',
      price_breakdown: { 'Accommodation': 1200, 'Transport': 800, 'Tickets': 600, 'Meals': 800, 'Guide fee': 400 },
      includes: ['English-speaking guide', 'Hotel (2 nights)', 'All tickets', 'Meals as listed', 'Transport'],
      excludes: ['Flights', 'Personal expenses', 'Travel insurance'],
      highlights: ['Watch sunrise at the Great Wall', 'VIP access to Forbidden City', 'Authentic Peking Duck dinner', 'Traditional hutong experience'],
      tags: ['Beijing', 'Great Wall', 'Culture', 'History'], difficulty: 'easy',
      status: 'published', view_count: 1200, booking_count: 45, created_at: '2026-05-10T08:00:00Z', updated_at: '2026-05-10T08:00:00Z',
      guide: { display_name: 'Li Wei', avatar_url: null },
      guide_profile: { rating_avg: 4.9, review_count: 127, verification_status: 'verified', specialties: ['Culture', 'History'], languages_spoken: ['en', 'zh'] },
    },
    'demo-plan-2': {
      id: 'demo-plan-2', guide_id: 'demo', title: 'Guilin & Yangshuo 4-Day Adventure', subtitle: 'Li River Cruise · Karst Peaks · Rice Terraces',
      description: "Discover the ethereal landscapes of Guilin. Cruise the Li River, cycle through Yangshuo countryside, and hike the Dragon's Backbone rice terraces.",
      cover_image_url: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&h=500&fit=crop',
      gallery_urls: [],
      destinations: [{ city: 'Guilin', spots: ['Li River', 'Yangshuo', 'Longji Terraces', 'Reed Flute Cave'] }],
      itinerary: [
        { day: 1, title: 'Arrive in Guilin', description: 'Explore Reed Flute Cave and Elephant Trunk Hill.', spots: ['Reed Flute Cave', 'Elephant Trunk Hill'], meals: 'Dinner' },
        { day: 2, title: 'Li River Cruise', description: 'Full-day cruise down the Li River to Yangshuo. Evening at West Street.', spots: ['Li River', 'West Street'], meals: 'Breakfast, Lunch' },
        { day: 3, title: 'Yangshuo Countryside', description: 'Bicycle tour through karst countryside, bamboo rafting on Yulong River.', spots: ['Yulong River', 'Moon Hill'], meals: 'Breakfast, Lunch, Dinner' },
        { day: 4, title: "Dragon's Backbone", description: 'Hike the Longji Rice Terraces, visit Zhuang minority village.', spots: ['Longji Terraces'], meals: 'Breakfast, Lunch' },
      ],
      duration_days: 4, max_group_size: 6, price_cny: 4200, currency: 'CNY',
      price_breakdown: { 'Accommodation': 1600, 'Li River Cruise': 500, 'Transport': 600, 'Meals': 900, 'Guide fee': 600 },
      includes: ['English-speaking guide', 'Hotel (3 nights)', 'Li River cruise ticket', 'Bicycle rental', 'Meals as listed'],
      excludes: ['Flights', 'Bamboo rafting (optional)', 'Personal expenses'],
      highlights: ['Li River cruise on a bamboo raft', 'Sunrise at Longji Rice Terraces', 'Cycling through karst valleys', 'Authentic Yao minority dinner'],
      tags: ['Guilin', 'Yangshuo', 'Nature', 'Adventure'], difficulty: 'moderate',
      status: 'published', view_count: 980, booking_count: 32, created_at: '2026-05-09T08:00:00Z', updated_at: '2026-05-09T08:00:00Z',
      guide: { display_name: 'Chen Yu', avatar_url: null },
      guide_profile: { rating_avg: 4.8, review_count: 89, verification_status: 'verified', specialties: ['Nature', 'Hiking'], languages_spoken: ['en', 'zh'] },
    },
    'demo-plan-3': {
      id: 'demo-plan-3', guide_id: 'demo', title: 'Chengdu Panda & Food Tour', subtitle: 'Panda Base · Hotpot · Sichuan Opera',
      description: 'Get up close with giant pandas, indulge in authentic Sichuan cuisine, and experience the magic of Sichuan Opera face-changing.',
      cover_image_url: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=800&h=500&fit=crop',
      gallery_urls: [],
      destinations: [{ city: 'Chengdu', spots: ['Panda Base', 'Jinli Street', 'Wuhou Shrine', 'Kuanzhai Alley'] }],
      itinerary: [
        { day: 1, title: 'Panda Day', description: 'Morning visit to Chengdu Research Base to see pandas at their most active.', spots: ['Panda Research Base', 'Jinli Street'], meals: 'Lunch, Dinner' },
        { day: 2, title: 'Culture & Food', description: 'Explore Wuhou Shrine and Kuanzhai Alley. Evening hotpot dinner and Sichuan Opera.', spots: ['Wuhou Shrine', 'Kuanzhai Alley'], meals: 'Breakfast, Lunch, Dinner' },
      ],
      duration_days: 2, max_group_size: 10, price_cny: 2200, currency: 'CNY',
      price_breakdown: { 'Accommodation': 600, 'Panda Base ticket': 200, 'Meals': 800, 'Opera ticket': 300, 'Guide fee': 300 },
      includes: ['English-speaking guide', 'Hotel (1 night)', 'All tickets', 'Hotpot dinner', 'Sichuan Opera show'],
      excludes: ['Flights', 'Personal expenses', 'Extra drinks'],
      highlights: ['See baby pandas at feeding time', 'Authentic Sichuan hotpot experience', 'Sichuan Opera face-changing show', 'Street food tour at Jinli'],
      tags: ['Chengdu', 'Panda', 'Food', 'Culture'], difficulty: 'easy',
      status: 'published', view_count: 1500, booking_count: 56, created_at: '2026-05-08T08:00:00Z', updated_at: '2026-05-08T08:00:00Z',
      guide: { display_name: 'Li Wei', avatar_url: null },
      guide_profile: { rating_avg: 4.9, review_count: 156, verification_status: 'verified', specialties: ['Food', 'Culture'], languages_spoken: ['en', 'zh'] },
    },
  }
  return plans[id] || null
}

export default function PlanDetailPage() {
  const params = useParams()
  const planId = params.planId as string
  const router = useRouter()
  const [plan, setPlan] = useState<PlanDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImage, setCurrentImage] = useState(0)

  useEffect(() => {
    const load = async () => {
      // Check demo data first
      const demo = getDemoPlan(planId)
      if (demo) {
        setPlan(demo)
        setLoading(false)
        return
      }

      // Fetch from Supabase
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { data, error } = await supabase
          .from('tour_plans')
          .select(`*, guide:profiles!tour_plans_guide_id_fkey(display_name, avatar_url)`)
          .eq('id', planId)
          .single()

        if (!error && data) {
          const { data: guideProfile } = await supabase
            .from('guide_profiles')
            .select('rating_avg, review_count, verification_status, specialties, languages_spoken')
            .eq('id', data.guide_id)
            .single()

          setPlan({
            ...data,
            guide: data.guide as PlanDetail['guide'],
            guide_profile: guideProfile as PlanDetail['guide_profile'],
          })
        }
      } catch {
        // Supabase unreachable
      }
      setLoading(false)
    }
    load()
  }, [planId])

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

  if (!plan) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🗺️</div>
          <h3 className="text-2xl font-bold mb-2">Plan not found</h3>
          <Link href="/plans"><Button>Browse Plans</Button></Link>
        </div>
      </div>
    )
  }

  const allImages = [plan.cover_image_url, ...plan.gallery_urls].filter(Boolean)

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <motion.div
        className="max-w-4xl mx-auto px-4 py-6 pb-32"
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

        {/* Gallery */}
        <div className="space-y-3 mb-6">
          <div className="relative aspect-[16/9] bg-slate-100 rounded-xl overflow-hidden">
            {allImages[currentImage] && (
              <img src={allImages[currentImage]} alt={plan.title} className="w-full h-full object-cover" />
            )}
          </div>
          {allImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {allImages.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImage(i)}
                  className={`shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                    i === currentImage ? 'border-slate-900' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Title & price */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">{plan.title}</h1>
            {plan.subtitle && <p className="text-slate-500">{plan.subtitle}</p>}
          </div>
          <div className="shrink-0 md:text-right">
            <p className="text-xl md:text-2xl font-bold text-slate-900">¥{plan.price_cny.toLocaleString()}</p>
            <p className="text-xs text-slate-400">per person</p>
          </div>
        </div>

        {/* Quick info */}
        <div className="flex flex-wrap gap-3 mb-6">
          <span className="flex items-center gap-1.5 text-sm bg-white px-3 py-1.5 rounded-full border border-slate-200">
            <Clock className="w-4 h-4 text-slate-500" /> {plan.duration_days} days
          </span>
          <span className="flex items-center gap-1.5 text-sm bg-white px-3 py-1.5 rounded-full border border-slate-200">
            <Users className="w-4 h-4 text-slate-500" /> Max {plan.max_group_size} people
          </span>
          {plan.difficulty && (
            <span className="flex items-center gap-1.5 text-sm bg-white px-3 py-1.5 rounded-full border border-slate-200 capitalize">
              {plan.difficulty}
            </span>
          )}
        </div>

        {/* Guide card */}
        <Card className="mb-6">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-semibold">
                {plan.guide?.display_name?.[0] || '?'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{plan.guide?.display_name || 'Guide'}</p>
                  {plan.guide_profile?.verification_status === 'verified' && (
                    <Shield className="w-4 h-4 text-blue-500" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {plan.guide_profile?.rating_avg?.toFixed(1) || '5.0'}
                  </span>
                  <span>({plan.guide_profile?.review_count || 0} reviews)</span>
                </div>
              </div>
            </div>
            <Link href={`/guides/${plan.guide_id}`}>
              <Button variant="outline" size="sm">View Profile</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Description */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-2">About This Tour</h2>
          <p className="text-slate-600 leading-relaxed whitespace-pre-line">{plan.description}</p>
        </div>

        {/* Highlights */}
        {plan.highlights?.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-3">Highlights</h2>
            <div className="grid md:grid-cols-2 gap-2">
              {plan.highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-amber-500 mt-0.5">★</span>
                  <span className="text-slate-600">{h}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Itinerary */}
        {plan.itinerary?.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-3">Itinerary</h2>
            <div className="space-y-0">
              {plan.itinerary.map((day, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {day.day}
                    </div>
                    {i < plan.itinerary.length - 1 && (
                      <div className="w-0.5 flex-1 bg-slate-200 my-1" />
                    )}
                  </div>
                  <div className="pb-6 flex-1">
                    <h3 className="font-semibold text-sm mb-1">{day.title}</h3>
                    <p className="text-slate-500 text-sm mb-2">{day.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {day.spots?.map((spot) => (
                        <span key={spot} className="inline-flex items-center gap-0.5 text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          <MapPin className="w-3 h-3" />{spot}
                        </span>
                      ))}
                      {day.meals && (
                        <span className="text-xs text-slate-400">{day.meals}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Destinations */}
        {plan.destinations?.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-3">Destinations</h2>
            <div className="flex flex-wrap gap-2">
              {plan.destinations.map((d, i) => (
                <span key={i} className="inline-flex items-center gap-1 text-sm bg-white px-3 py-1.5 rounded-full border border-slate-200">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {d.city}
                  <span className="text-slate-400">({d.spots?.length || 0} spots)</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Includes / Excludes */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {plan.includes?.length > 0 && (
            <div>
              <h2 className="text-lg font-bold mb-3">Includes</h2>
              <ul className="space-y-2">
                {plan.includes.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {plan.excludes?.length > 0 && (
            <div>
              <h2 className="text-lg font-bold mb-3">Excludes</h2>
              <ul className="space-y-2">
                {plan.excludes.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <XIcon className="w-4 h-4 text-red-400 shrink-0 mt-0.5" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Price breakdown */}
        {plan.price_breakdown && Object.keys(plan.price_breakdown).length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-3">Price Breakdown</h2>
            <Card>
              <CardContent className="p-4 space-y-2">
                {Object.entries(plan.price_breakdown).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-slate-500">{key}</span>
                    <span className="font-medium">¥{Number(value).toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-100">
                  <span>Total</span>
                  <span>¥{plan.price_cny.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </motion.div>

      {/* Sticky booking bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-slate-200 z-50 px-4 py-3" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="shrink-0">
            <p className="text-lg md:text-2xl font-bold">¥{plan.price_cny.toLocaleString()}</p>
            <p className="text-xs text-slate-400 hidden sm:block">{plan.duration_days} days · Max {plan.max_group_size} people</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/chat?guide=${plan.guide_id}`}>
              <Button variant="outline" size="sm" className="gap-1">
                <MessageCircle className="w-4 h-4" /> <span className="hidden sm:inline">Chat</span>
              </Button>
            </Link>
            <Link href={`/orders/create?plan=${plan.id}`}>
              <Button size="sm" className="gap-1">
                <Calendar className="w-4 h-4" /> Book Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
