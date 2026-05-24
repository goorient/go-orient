'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Navbar } from '@/components/layout/navbar'
import { TiltCard } from '@/components/cards/tilt-card'
import { Button } from '@/components/ui/button'
import { MapPin, Globe, Clock, Shield, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface GuideCardData {
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
}

const LANG_FLAGS: Record<string, string> = {
  en: '🇬🇧', zh: '🇨🇳', jp: '🇯🇵', ja: '🇯🇵', fr: '🇫🇷', de: '🇩🇪', ko: '🇰🇷', es: '🇪🇸',
}

const SPECIALTY_COLORS: Record<string, string> = {
  Culture: 'bg-purple-100 text-purple-700',
  History: 'bg-amber-100 text-amber-700',
  Food: 'bg-red-100 text-red-700',
  Nature: 'bg-green-100 text-green-700',
  Hiking: 'bg-emerald-100 text-emerald-700',
  Photography: 'bg-blue-100 text-blue-700',
  Architecture: 'bg-slate-100 text-slate-700',
  Shopping: 'bg-pink-100 text-pink-700',
  Nightlife: 'bg-indigo-100 text-indigo-700',
  Wildlife: 'bg-lime-100 text-lime-700',
  'Tea Culture': 'bg-teal-100 text-teal-700',
  Cycling: 'bg-cyan-100 text-cyan-700',
}

function getSpecialtyColor(s: string): string {
  return SPECIALTY_COLORS[s] || 'bg-slate-100 text-slate-700'
}

const DEMO_GUIDES: GuideCardData[] = [
  {
    id: 'demo-guide-1', display_name: 'Li Wei', avatar_url: null,
    bio: 'Born and raised in Beijing. I bring history to life through stories my grandmother told me as a child. Let me show you the real hutong life.',
    country: 'China', specialties: ['Culture', 'History', 'Food'],
    languages_spoken: ['en', 'zh'], service_cities: ['Beijing'],
    years_experience: 5, verification_status: 'verified',
    intro: 'Your storyteller in the heart of Beijing',
  },
  {
    id: 'demo-guide-2', display_name: 'Chen Yu', avatar_url: null,
    bio: "Professional photographer turned guide. I know every sunrise spot in Guilin and Yangshuo. My tours are designed around the best light.",
    country: 'China', specialties: ['Nature', 'Hiking', 'Photography'],
    languages_spoken: ['en', 'zh'], service_cities: ['Guilin', 'Yangshuo'],
    years_experience: 8, verification_status: 'verified',
    intro: 'Chasing light through karst mountains',
  },
  {
    id: 'demo-guide-3', display_name: 'Wang Fang', avatar_url: null,
    bio: "Xi'an is my hometown and the Terracotta Warriors are my passion. I've studied archaeology and can share details most guides miss.",
    country: 'China', specialties: ['History', 'Architecture'],
    languages_spoken: ['en', 'zh', 'jp'], service_cities: ["Xi'an"],
    years_experience: 6, verification_status: 'verified',
    intro: 'Unlock 3000 years of history',
  },
  {
    id: 'demo-guide-4', display_name: 'Zhang Mei', avatar_url: null,
    bio: "Shanghai insider who knows every hidden speakeasy, local market, and rooftop bar. I'll show you the city that never sleeps.",
    country: 'China', specialties: ['Food', 'Shopping', 'Nightlife'],
    languages_spoken: ['en', 'zh'], service_cities: ['Shanghai'],
    years_experience: 4, verification_status: 'verified',
    intro: 'Shanghai through a local lens',
  },
  {
    id: 'demo-guide-5', display_name: 'Liu Yang', avatar_url: null,
    bio: "Panda lover and certified tea sommelier. Let's explore Chengdu's bamboo forests, sip gaiwan tea, and taste real Sichuan flavors.",
    country: 'China', specialties: ['Wildlife', 'Food', 'Tea Culture'],
    languages_spoken: ['en', 'zh'], service_cities: ['Chengdu'],
    years_experience: 7, verification_status: 'verified',
    intro: 'Pandas, tea, and the taste of Sichuan',
  },
  {
    id: 'demo-guide-6', display_name: 'Zhao Ting', avatar_url: null,
    bio: "Cyclist and culture enthusiast. I lead bike tours around West Lake and through Hangzhou's ancient tea villages. Slow travel at its best.",
    country: 'China', specialties: ['Culture', 'Photography', 'Cycling'],
    languages_spoken: ['en', 'zh', 'fr'], service_cities: ['Hangzhou'],
    years_experience: 3, verification_status: 'verified',
    intro: 'Two wheels, one beautiful lake',
  },
]

export default function GuidesPage() {
  const [guides, setGuides] = useState<GuideCardData[]>([])
  const [loading, setLoading] = useState(true)
  const [usingDemo, setUsingDemo] = useState(false)
  const [cityFilter, setCityFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { data, error } = await supabase
          .from('guide_profiles')
          .select('*, profile:profiles(display_name, avatar_url, bio, country)')
          .eq('verification_status', 'verified')

        if (!error && data && data.length > 0) {
          const formatted = data.map((g: Record<string, unknown>) => ({
            id: g.id as string,
            display_name: (g.profile as Record<string, unknown>)?.display_name as string || 'Guide',
            avatar_url: (g.profile as Record<string, unknown>)?.avatar_url as string || null,
            bio: (g.profile as Record<string, unknown>)?.bio as string || null,
            country: (g.profile as Record<string, unknown>)?.country as string || null,
            specialties: (g.specialties as string[]) || [],
            languages_spoken: (g.languages_spoken as string[]) || [],
            service_cities: (g.service_cities as string[]) || [],
            years_experience: (g.years_experience as number) || 0,
            verification_status: (g.verification_status as string) || 'pending',
            intro: (g.intro as string) || null,
          }))
          setGuides(formatted)
          setUsingDemo(false)
        } else {
          throw new Error('no data')
        }
      } catch {
        setGuides(DEMO_GUIDES)
        setUsingDemo(true)
      }
      setLoading(false)
    }
    fetchGuides()
  }, [])

  // Filter guides
  const filteredGuides = guides.filter((guide) => {
    const matchesCity = cityFilter === 'All' || guide.service_cities.includes(cityFilter)
    const matchesSearch = !searchQuery ||
      guide.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (guide.bio && guide.bio.toLowerCase().includes(searchQuery.toLowerCase())) ||
      guide.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      guide.service_cities.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCity && matchesSearch
  })

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Local Guides</h1>
          <p className="text-slate-500">Connect with verified local guides for an authentic experience</p>
        </div>

        {/* Search + Filters */}
        <div className="space-y-3 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guides by name, specialty, or city..."
              className="pl-10 h-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {['All', 'Beijing', 'Shanghai', "Xi'an", 'Chengdu', 'Guilin', 'Hangzhou'].map((city) => (
              <Button key={city} variant={city === cityFilter ? 'default' : 'outline'} size="sm" className="shrink-0" onClick={() => setCityFilter(city)}>
                {city}
              </Button>
            ))}
          </div>
        </div>

        {usingDemo && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 mb-4 text-sm text-amber-700">
            Showing demo guides. Register as a guide to appear here.
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
          </div>
        ) : filteredGuides.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold mb-2">No matching guides</h3>
            <p className="text-slate-500 mb-4">Try a different search or filter.</p>
            <Button variant="outline" onClick={() => { setCityFilter('All'); setSearchQuery('') }}>Clear Filters</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGuides.map((guide) => (
              <Link key={guide.id} href={`/guides/${guide.id}`}>
                <TiltCard className="rounded-xl bg-white p-5 cursor-pointer h-full">
                  {/* Header: avatar + name + badge */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-xl font-bold shrink-0 overflow-hidden">
                      {guide.avatar_url ? (
                        <img src={guide.avatar_url} alt={guide.display_name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                      ) : (
                        <span>{guide.display_name?.[0] || '?'}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-lg truncate">{guide.display_name}</h3>
                        {guide.verification_status === 'verified' && (
                          <Shield className="w-4 h-4 text-blue-500 shrink-0" />
                        )}
                      </div>
                      {guide.intro && (
                        <p className="text-sm text-slate-500 truncate">{guide.intro}</p>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  {guide.bio && (
                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">{guide.bio}</p>
                  )}

                  {/* Specialties */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {guide.specialties.slice(0, 3).map((s) => (
                      <span key={s} className={`text-xs px-2 py-0.5 rounded-full font-medium ${getSpecialtyColor(s)}`}>
                        {s}
                      </span>
                    ))}
                  </div>

                  {/* Bottom info */}
                  <div className="flex items-center gap-3 text-xs text-slate-400 pt-3 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {guide.service_cities[0] || 'China'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Globe className="w-3 h-3" /> {guide.languages_spoken.map(l => LANG_FLAGS[l] || l).join(' ')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {guide.years_experience}yr
                    </span>
                  </div>
                </TiltCard>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
