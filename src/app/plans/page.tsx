'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Navbar } from '@/components/layout/navbar'
import { TiltCard } from '@/components/cards/tilt-card'
import { Button } from '@/components/ui/button'
import { Clock, Users, MapPin, Star, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import type { TourPlan } from '@/types/database'

const CITIES = ['All', 'Beijing', 'Shanghai', "Xi'an", 'Chengdu', 'Guilin', 'Hangzhou']

const DEMO_PLANS: TourPlan[] = [
  {
    id: 'demo-plan-1', guide_id: 'demo', title: 'Classic Beijing 3-Day Tour', subtitle: 'Great Wall · Forbidden City · Temple of Heaven',
    description: 'Experience the best of Beijing in 3 days. Walk the Great Wall at Mutianyu, explore the imperial Forbidden City, and visit the iconic Temple of Heaven. Includes authentic Peking duck dinner.',
    cover_image_url: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&h=500&fit=crop',
    gallery_urls: ['https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&h=500&fit=crop', 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=800&h=500&fit=crop'],
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
    guide: { id: 'demo', certification_type: 'individual', real_name: null, passport_number: null, guide_cert_number: null, guide_cert_url: null, company_name: null, business_license: null, business_license_url: null, specialties: ['Culture', 'History'], languages_spoken: ['en', 'zh'], service_cities: ['Beijing'], years_experience: 5, verification_status: 'verified', rating_avg: 4.9, review_count: 127 },
  },
  {
    id: 'demo-plan-2', guide_id: 'demo', title: 'Guilin & Yangshuo 4-Day Adventure', subtitle: 'Li River Cruise · Karst Peaks · Rice Terraces',
    description: 'Discover the ethereal landscapes of Guilin. Cruise the Li River, cycle through Yangshuo countryside, and hike the Dragon\'s Backbone rice terraces.',
    cover_image_url: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&h=500&fit=crop',
    gallery_urls: [],
    destinations: [{ city: 'Guilin', spots: ['Li River', 'Yangshuo', 'Longji Terraces', 'Reed Flute Cave'] }],
    itinerary: [
      { day: 1, title: 'Arrive in Guilin', description: 'Explore Reed Flute Cave and Elephant Trunk Hill.', spots: ['Reed Flute Cave', 'Elephant Trunk Hill'], meals: 'Dinner' },
      { day: 2, title: 'Li River Cruise', description: 'Full-day cruise down the Li River to Yangshuo. Evening at West Street.', spots: ['Li River', 'West Street'], meals: 'Breakfast, Lunch' },
      { day: 3, title: 'Yangshuo Countryside', description: 'Bicycle tour through karst countryside, bamboo rafting on Yulong River.', spots: ['Yulong River', 'Moon Hill'], meals: 'Breakfast, Lunch, Dinner' },
      { day: 4, title: 'Dragon\'s Backbone', description: 'Hike the Longji Rice Terraces, visit Zhuang minority village.', spots: ['Longji Terraces'], meals: 'Breakfast, Lunch' },
    ],
    duration_days: 4, max_group_size: 6, price_cny: 4200, currency: 'CNY',
    price_breakdown: { 'Accommodation': 1600, 'Li River Cruise': 500, 'Transport': 600, 'Meals': 900, 'Guide fee': 600 },
    includes: ['English-speaking guide', 'Hotel (3 nights)', 'Li River cruise ticket', 'Bicycle rental', 'Meals as listed'],
    excludes: ['Flights', 'Bamboo rafting (optional)', 'Personal expenses'],
    highlights: ['Li River cruise on a bamboo raft', 'Sunrise at Longji Rice Terraces', 'Cycling through karst valleys', 'Authentic Yao minority dinner'],
    tags: ['Guilin', 'Yangshuo', 'Nature', 'Adventure'], difficulty: 'moderate',
    status: 'published', view_count: 980, booking_count: 32, created_at: '2026-05-09T08:00:00Z', updated_at: '2026-05-09T08:00:00Z',
    guide: { id: 'demo', certification_type: 'individual', real_name: null, passport_number: null, guide_cert_number: null, guide_cert_url: null, company_name: null, business_license: null, business_license_url: null, specialties: ['Nature', 'Hiking'], languages_spoken: ['en', 'zh'], service_cities: ['Guilin'], years_experience: 8, verification_status: 'verified', rating_avg: 4.8, review_count: 89 },
  },
  {
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
    guide: { id: 'demo', certification_type: 'individual', real_name: null, passport_number: null, guide_cert_number: null, guide_cert_url: null, company_name: null, business_license: null, business_license_url: null, specialties: ['Food', 'Culture'], languages_spoken: ['en', 'zh'], service_cities: ['Chengdu'], years_experience: 4, verification_status: 'verified', rating_avg: 4.9, review_count: 156 },
  },
]

export default function PlansPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
      </div>
    }>
      <PlansContent />
    </Suspense>
  )
}

function PlansContent() {
  const [plans, setPlans] = useState<TourPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [usingDemo, setUsingDemo] = useState(false)
  const [cityFilter, setCityFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const searchParams = useSearchParams()

  // Read search from URL on mount
  useEffect(() => {
    const q = searchParams.get('search')
    if (q) setSearchQuery(q)
  }, [searchParams])

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { data, error } = await supabase
          .from('tour_plans')
          .select('*, guide:profiles(display_name, avatar_url)')
          .eq('status', 'published')
          .order('created_at', { ascending: false })

        if (!error && data && data.length > 0) {
          setPlans(data as unknown as TourPlan[])
          setUsingDemo(false)
        } else {
          throw new Error('no data')
        }
      } catch {
        setPlans(DEMO_PLANS)
        setUsingDemo(true)
      }
      setLoading(false)
    }
    fetchPlans()
  }, [])

  // Filter plans
  const filteredPlans = plans.filter((plan) => {
    const matchesCity = cityFilter === 'All' ||
      (plan.destinations && Array.isArray(plan.destinations) &&
        (plan.destinations as unknown as Record<string, string>[]).some(d => d.city === cityFilter))
    const matchesSearch = !searchQuery ||
      plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (plan.subtitle && plan.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (plan.tags && plan.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())))
    return matchesCity && matchesSearch
  })

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Tour Plans</h1>
          <p className="text-slate-500">Curated itineraries by verified local guides</p>
        </div>

        {/* Search + Filters */}
        <div className="space-y-3 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search plans by name, tag, or city..."
              className="pl-10 h-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CITIES.map((city) => (
              <Button
                key={city}
                variant={city === cityFilter ? 'default' : 'outline'}
                size="sm"
                className="shrink-0"
                onClick={() => setCityFilter(city)}
              >
                {city}
              </Button>
            ))}
          </div>
        </div>

        {usingDemo && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 mb-4 text-sm text-amber-700">
            Showing demo plans. Register as a guide and publish plans to see real content here.
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold mb-2">No matching plans</h3>
            <p className="text-slate-500 mb-4">Try a different search or filter.</p>
            <Button variant="outline" onClick={() => { setCityFilter('All'); setSearchQuery('') }}>Clear Filters</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlans.map((plan) => (
              <Link key={plan.id} href={`/plans/${plan.id}`}>
                <TiltCard className="rounded-xl overflow-hidden bg-white cursor-pointer h-full">
                  <div className="relative aspect-[16/10] bg-slate-100">
                    {plan.cover_image_url && (
                      <img
                        src={plan.cover_image_url}
                        alt={plan.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => { e.currentTarget.style.display = 'none' }}
                      />
                    )}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-sm font-bold text-slate-900">
                      ¥{plan.price_cny?.toLocaleString()}
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1 line-clamp-1">{plan.title}</h3>
                    {plan.subtitle && (
                      <p className="text-slate-500 text-sm mb-3 line-clamp-1">{plan.subtitle}</p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {plan.duration_days}d
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> Max {plan.max_group_size}
                      </span>
                      {plan.destinations && Array.isArray(plan.destinations) && (plan.destinations as unknown as Record<string, string>[]).length > 0 && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> {(plan.destinations as unknown as Record<string, string>[])[0]?.city || 'China'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium">
                          {plan.guide && typeof plan.guide === 'object' && 'display_name' in plan.guide
                            ? (plan.guide as { display_name: string }).display_name?.[0] || '?'
                            : '?'}
                        </div>
                        <span className="text-sm text-slate-600">
                          {plan.guide && typeof plan.guide === 'object' && 'display_name' in plan.guide
                            ? (plan.guide as { display_name: string }).display_name || 'Guide'
                            : 'Local Guide'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-medium">
                          {plan.guide && typeof plan.guide === 'object' && 'rating_avg' in plan.guide
                            ? (plan.guide as { rating_avg: number }).rating_avg.toFixed(1)
                            : '5.0'}
                        </span>
                      </div>
                    </div>
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
