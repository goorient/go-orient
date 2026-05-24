'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Map, Plus, Clock, DollarSign, Eye, Edit2, Trash2, Image, Check, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { createBrowserClient } from '@supabase/ssr'

interface ItineraryDay {
  day: number
  title: string
  description: string
  spots: string[]
  meals: string
}

interface TourPlan {
  id: string
  title: string
  city: string
  duration_days: number
  price: number
  status: 'draft' | 'active' | 'paused'
  bookings: number
  description?: string
  cover_image_url?: string
  gallery_urls?: string[]
  itinerary?: ItineraryDay[]
  includes?: string[]
  excludes?: string[]
  highlights?: string[]
  max_group_size?: number
  difficulty?: string
}

const DEMO_PLANS: TourPlan[] = [
  {
    id: 'plan-1', title: 'Classic Beijing 3-Day Tour', city: 'Beijing', duration_days: 3, price: 3800, status: 'active', bookings: 12,
    description: 'Experience the best of Beijing in 3 days.',
    cover_image_url: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&h=500&fit=crop',
    itinerary: [
      { day: 1, title: 'Imperial Beijing', description: 'Explore Forbidden City and Tiananmen Square.', spots: ['Tiananmen Square', 'Forbidden City'], meals: 'Lunch, Dinner' },
      { day: 2, title: 'The Great Wall', description: 'Visit Mutianyu Great Wall section.', spots: ['Great Wall (Mutianyu)'], meals: 'Breakfast, Lunch' },
      { day: 3, title: 'Culture & Departure', description: 'Temple of Heaven and hutong walk.', spots: ['Temple of Heaven'], meals: 'Breakfast, Lunch' },
    ],
    includes: ['English-speaking guide', 'Hotel (2 nights)', 'All tickets', 'Meals'],
    excludes: ['Flights', 'Personal expenses'],
    highlights: ['Watch sunrise at the Great Wall', 'Authentic Peking Duck dinner'],
    max_group_size: 8, difficulty: 'easy',
  },
  { id: 'plan-2', title: 'Hidden Gems of Beijing', city: 'Beijing', duration_days: 2, price: 2400, status: 'draft', bookings: 0 },
  { id: 'plan-3', title: 'Great Wall Sunset Experience', city: 'Beijing', duration_days: 1, price: 800, status: 'active', bookings: 8 },
]

export default function DashboardPlansPage() {
  const { user } = useAuthStore()
  const [plans, setPlans] = useState<TourPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editingPlan, setEditingPlan] = useState<TourPlan | null>(null)
  const [createStep, setCreateStep] = useState(1)
  const [saving, setSaving] = useState(false)

  // Form state
  const [formTitle, setFormTitle] = useState('')
  const [formCity, setFormCity] = useState('')
  const [formDuration, setFormDuration] = useState('3')
  const [formPrice, setFormPrice] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formCoverUrl, setFormCoverUrl] = useState('')
  const [formMaxGroup, setFormMaxGroup] = useState('8')
  const [formDifficulty, setFormDifficulty] = useState('easy')
  const [formItinerary, setFormItinerary] = useState<ItineraryDay[]>([])
  const [formIncludes, setFormIncludes] = useState<string[]>([])
  const [formExcludes, setFormExcludes] = useState<string[]>([])
  const [formHighlights, setFormHighlights] = useState<string[]>([])
  const [formNewInclude, setFormNewInclude] = useState('')
  const [formNewExclude, setFormNewExclude] = useState('')
  const [formNewHighlight, setFormNewHighlight] = useState('')
  const [formGalleryUrls, setFormGalleryUrls] = useState<string[]>([])
  const [formNewGalleryUrl, setFormNewGalleryUrl] = useState('')

  // Load plans from Supabase
  useEffect(() => {
    if (!user) return
    const loadPlans = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { data } = await supabase
          .from('tour_plans')
          .select('*')
          .eq('guide_id', user!.id)
          .order('created_at', { ascending: false })

        if (data && data.length > 0) {
          const mapped = data.map((p: Record<string, unknown>) => ({
            id: p.id as string,
            title: p.title as string,
            city: (p.destinations as { city: string }[])?.[0]?.city || '',
            duration_days: p.duration_days as number,
            price: p.price_cny as number,
            status: (p.status === 'published' ? 'active' : p.status === 'archived' ? 'paused' : 'draft') as TourPlan['status'],
            bookings: (p.booking_count as number) || 0,
            description: p.description as string,
            cover_image_url: p.cover_image_url as string,
            gallery_urls: p.gallery_urls as string[],
            itinerary: p.itinerary as ItineraryDay[],
            includes: p.includes as string[],
            excludes: p.excludes as string[],
            highlights: p.highlights as string[],
            max_group_size: p.max_group_size as number,
            difficulty: p.difficulty as string,
          }))
          setPlans(mapped)
        } else {
          setPlans(DEMO_PLANS)
        }
      } catch {
        setPlans(DEMO_PLANS)
      }
      setLoading(false)
    }
    loadPlans()
  }, [user])

  const resetForm = () => {
    setFormTitle(''); setFormCity(''); setFormDuration('3'); setFormPrice('')
    setFormDesc(''); setFormCoverUrl(''); setFormMaxGroup('8'); setFormDifficulty('easy')
    setFormItinerary([]); setFormIncludes([]); setFormExcludes([]); setFormHighlights([])
    setFormNewInclude(''); setFormNewExclude(''); setFormNewHighlight('')
    setFormGalleryUrls([]); setFormNewGalleryUrl('')
    setCreateStep(1)
  }

  const startEdit = (plan: TourPlan) => {
    setEditingPlan(plan)
    setFormTitle(plan.title); setFormCity(plan.city); setFormDuration(String(plan.duration_days))
    setFormPrice(String(plan.price)); setFormDesc(plan.description || '')
    setFormCoverUrl(plan.cover_image_url || ''); setFormMaxGroup(String(plan.max_group_size || 8))
    setFormDifficulty(plan.difficulty || 'easy')
    setFormItinerary(plan.itinerary || [])
    setFormIncludes(plan.includes || []); setFormExcludes(plan.excludes || [])
    setFormHighlights(plan.highlights || [])
    setFormGalleryUrls(plan.gallery_urls || [])
    setCreateStep(1)
    setShowCreate(true)
  }

  const handleCreate = async () => {
    if (!formTitle || !formCity || !user) return
    setSaving(true)

    const planData = {
      title: formTitle,
      subtitle: `${formCity} · ${formDuration} Days`,
      description: formDesc || formTitle,
      cover_image_url: formCoverUrl || 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&h=500&fit=crop',
      gallery_urls: formGalleryUrls,
      destinations: [{ city: formCity, spots: formItinerary.flatMap(d => d.spots) }],
      itinerary: formItinerary,
      duration_days: Number(formDuration),
      max_group_size: Number(formMaxGroup),
      price_cny: Number(formPrice) || 0,
      includes: formIncludes,
      excludes: formExcludes,
      highlights: formHighlights,
      tags: [formCity, ...formHighlights.slice(0, 2)],
      difficulty: formDifficulty,
      status: 'draft' as const,
    }

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      if (editingPlan && !editingPlan.id.startsWith('plan-')) {
        // Update existing
        await supabase
          .from('tour_plans')
          .update(planData)
          .eq('id', editingPlan.id)
      } else {
        // Insert new
        await supabase
          .from('tour_plans')
          .insert({ ...planData, guide_id: user.id })
      }
    } catch {
      // Supabase unreachable — keep local only
    }

    // Update local state
    const localPlan: TourPlan = {
      id: editingPlan?.id || `plan-${Date.now()}`,
      title: formTitle,
      city: formCity,
      duration_days: Number(formDuration),
      price: Number(formPrice) || 0,
      status: 'draft',
      bookings: 0,
      description: formDesc,
      cover_image_url: formCoverUrl,
      itinerary: formItinerary,
      includes: formIncludes,
      excludes: formExcludes,
      highlights: formHighlights,
      gallery_urls: formGalleryUrls,
      max_group_size: Number(formMaxGroup),
      difficulty: formDifficulty,
    }

    if (editingPlan) {
      setPlans(prev => prev.map(p => p.id === editingPlan.id ? localPlan : p))
    } else {
      setPlans(prev => [localPlan, ...prev])
    }

    setShowCreate(false)
    setEditingPlan(null)
    resetForm()
    setSaving(false)
  }

  const togglePublish = async (plan: TourPlan) => {
    const newStatus = plan.status === 'active' ? 'draft' : 'active'
    const dbStatus = newStatus === 'active' ? 'published' : 'draft'

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      await supabase.from('tour_plans').update({ status: dbStatus }).eq('id', plan.id)
    } catch {
      // Supabase unreachable
    }

    setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, status: newStatus } : p))
  }

  // Itinerary helpers
  const addItineraryDay = () => {
    setFormItinerary([...formItinerary, {
      day: formItinerary.length + 1,
      title: '',
      description: '',
      spots: [],
      meals: '',
    }])
  }

  const updateItineraryDay = (index: number, field: keyof ItineraryDay, value: string | string[]) => {
    const updated = [...formItinerary]
    updated[index] = { ...updated[index], [field]: value }
    setFormItinerary(updated)
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
          <h1 className="text-2xl font-bold">Tour Plans</h1>
          <p className="text-slate-500 text-sm">Manage your tour offerings.</p>
        </div>
        {!showCreate && (
          <Button onClick={() => { resetForm(); setEditingPlan(null); setShowCreate(true) }} className="gap-1">
            <Plus className="w-4 h-4" /> New Plan
          </Button>
        )}
      </div>

      {/* Create / Edit Form */}
      {showCreate && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="mb-6">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold">{editingPlan ? 'Edit Plan' : 'Create New Tour Plan'}</h3>
                <Button variant="ghost" size="sm" onClick={() => { setShowCreate(false); setEditingPlan(null); resetForm() }}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Progress */}
              <div className="flex items-center gap-2 mb-6">
                {[
                  { n: 1, label: 'Basic Info' },
                  { n: 2, label: 'Itinerary' },
                  { n: 3, label: 'Details & Publish' },
                ].map((s, i) => (
                  <div key={s.n} className="flex items-center gap-2 flex-1">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      createStep >= s.n ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-500'
                    }`}>{s.n}</div>
                    <span className={`text-xs ${createStep >= s.n ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>{s.label}</span>
                    {i < 2 && <div className="flex-1 h-px bg-slate-200" />}
                  </div>
                ))}
              </div>

              {/* Step 1: Basic Info */}
              {createStep === 1 && (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-semibold">Plan Title *</Label>
                      <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="e.g., Classic Beijing 3-Day Tour" className="h-10" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-semibold">City *</Label>
                      <Input value={formCity} onChange={(e) => setFormCity(e.target.value)} placeholder="e.g., Beijing" className="h-10" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-semibold">Duration (days) *</Label>
                      <Input type="number" min="1" value={formDuration} onChange={(e) => setFormDuration(e.target.value)} className="h-10" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-semibold">Price per person (CNY)</Label>
                      <Input type="number" min="0" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} placeholder="3800" className="h-10" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-semibold">Max Group Size</Label>
                      <Input type="number" min="1" value={formMaxGroup} onChange={(e) => setFormMaxGroup(e.target.value)} className="h-10" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-semibold">Difficulty</Label>
                      <select
                        value={formDifficulty}
                        onChange={(e) => setFormDifficulty(e.target.value)}
                        className="w-full h-10 rounded-md border border-slate-300 px-3 text-sm"
                      >
                        <option value="easy">Easy</option>
                        <option value="moderate">Moderate</option>
                        <option value="challenging">Challenging</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-semibold">Description</Label>
                    <textarea
                      value={formDesc}
                      onChange={(e) => setFormDesc(e.target.value)}
                      placeholder="Describe the tour experience..."
                      rows={3}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-semibold">Cover Image URL</Label>
                    <Input value={formCoverUrl} onChange={(e) => setFormCoverUrl(e.target.value)} placeholder="https://..." className="h-10" />
                    {formCoverUrl && (
                      <img src={formCoverUrl} alt="Cover preview" className="w-full h-32 object-cover rounded-lg border border-slate-200" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    )}
                  </div>
                  <Button onClick={() => setCreateStep(2)} disabled={!formTitle || !formCity} className="w-full">Next: Itinerary</Button>
                </div>
              )}

              {/* Step 2: Itinerary */}
              {createStep === 2 && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-500">Add the day-by-day itinerary for your tour.</p>
                  {formItinerary.map((day, i) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-bold text-sm">Day {day.day}</span>
                          <Button variant="ghost" size="sm" onClick={() => setFormItinerary(formItinerary.filter((_, j) => j !== i))}>
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </Button>
                        </div>
                        <div className="grid md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs text-slate-500">Title</Label>
                            <Input value={day.title} onChange={(e) => updateItineraryDay(i, 'title', e.target.value)} placeholder="e.g., The Great Wall" className="h-9 text-sm" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-slate-500">Meals</Label>
                            <Input value={day.meals} onChange={(e) => updateItineraryDay(i, 'meals', e.target.value)} placeholder="Breakfast, Lunch" className="h-9 text-sm" />
                          </div>
                        </div>
                        <div className="space-y-1 mt-2">
                          <Label className="text-xs text-slate-500">Description</Label>
                          <Input value={day.description} onChange={(e) => updateItineraryDay(i, 'description', e.target.value)} placeholder="What will tourists do today?" className="h-9 text-sm" />
                        </div>
                        <div className="space-y-1 mt-2">
                          <Label className="text-xs text-slate-500">Spots (comma-separated)</Label>
                          <Input
                            value={day.spots.join(', ')}
                            onChange={(e) => updateItineraryDay(i, 'spots', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                            placeholder="Forbidden City, Tiananmen Square"
                            className="h-9 text-sm"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <Button variant="outline" onClick={addItineraryDay} className="w-full gap-1">
                    <Plus className="w-4 h-4" /> Add Day {formItinerary.length + 1}
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setCreateStep(1)} className="flex-1">Back</Button>
                    <Button onClick={() => setCreateStep(3)} className="flex-1">Next: Details</Button>
                  </div>
                </div>
              )}

              {/* Step 3: Details & Publish */}
              {createStep === 3 && (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-semibold">Includes</Label>
                      {formIncludes.map((item, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-green-500 shrink-0" />
                          <span className="text-sm flex-1">{item}</span>
                          <button onClick={() => setFormIncludes(formIncludes.filter((_, j) => j !== i))}><X className="w-3 h-3 text-slate-400" /></button>
                        </div>
                      ))}
                      <div className="flex gap-1">
                        <Input value={formNewInclude} onChange={(e) => setFormNewInclude(e.target.value)} placeholder="Add item..." className="h-9 text-sm" onKeyDown={(e) => { if (e.key === 'Enter' && formNewInclude.trim()) { setFormIncludes([...formIncludes, formNewInclude.trim()]); setFormNewInclude('') } }} />
                        <Button variant="outline" size="sm" onClick={() => { if (formNewInclude.trim()) { setFormIncludes([...formIncludes, formNewInclude.trim()]); setFormNewInclude('') } }}><Plus className="w-3.5 h-3.5" /></Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-semibold">Excludes</Label>
                      {formExcludes.map((item, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <X className="w-3.5 h-3.5 text-red-400 shrink-0" />
                          <span className="text-sm flex-1">{item}</span>
                          <button onClick={() => setFormExcludes(formExcludes.filter((_, j) => j !== i))}><X className="w-3 h-3 text-slate-400" /></button>
                        </div>
                      ))}
                      <div className="flex gap-1">
                        <Input value={formNewExclude} onChange={(e) => setFormNewExclude(e.target.value)} placeholder="Add item..." className="h-9 text-sm" onKeyDown={(e) => { if (e.key === 'Enter' && formNewExclude.trim()) { setFormExcludes([...formExcludes, formNewExclude.trim()]); setFormNewExclude('') } }} />
                        <Button variant="outline" size="sm" onClick={() => { if (formNewExclude.trim()) { setFormExcludes([...formExcludes, formNewExclude.trim()]); setFormNewExclude('') } }}><Plus className="w-3.5 h-3.5" /></Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-700 font-semibold">Highlights</Label>
                    <div className="flex flex-wrap gap-1">
                      {formHighlights.map((h, i) => (
                        <span key={i} className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
                          {h}
                          <button onClick={() => setFormHighlights(formHighlights.filter((_, j) => j !== i))}><X className="w-3 h-3" /></button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-1">
                      <Input value={formNewHighlight} onChange={(e) => setFormNewHighlight(e.target.value)} placeholder="Add highlight..." className="h-9 text-sm" onKeyDown={(e) => { if (e.key === 'Enter' && formNewHighlight.trim()) { setFormHighlights([...formHighlights, formNewHighlight.trim()]); setFormNewHighlight('') } }} />
                      <Button variant="outline" size="sm" onClick={() => { if (formNewHighlight.trim()) { setFormHighlights([...formHighlights, formNewHighlight.trim()]); setFormNewHighlight('') } }}><Plus className="w-3.5 h-3.5" /></Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-700 font-semibold">Gallery Images</Label>
                    {formGalleryUrls.length > 0 && (
                      <div className="grid grid-cols-4 gap-2">
                        {formGalleryUrls.map((url, i) => (
                          <div key={i} className="relative group">
                            <img src={url} alt="" className="w-full h-16 object-cover rounded-lg border" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                            <button onClick={() => setFormGalleryUrls(formGalleryUrls.filter((_, j) => j !== i))} className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-2.5 h-2.5" /></button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-1">
                      <Input value={formNewGalleryUrl} onChange={(e) => setFormNewGalleryUrl(e.target.value)} placeholder="Paste image URL..." className="h-9 text-sm" onKeyDown={(e) => { if (e.key === 'Enter' && formNewGalleryUrl.trim()) { setFormGalleryUrls([...formGalleryUrls, formNewGalleryUrl.trim()]); setFormNewGalleryUrl('') } }} />
                      <Button variant="outline" size="sm" onClick={() => { if (formNewGalleryUrl.trim()) { setFormGalleryUrls([...formGalleryUrls, formNewGalleryUrl.trim()]); setFormNewGalleryUrl('') } }}><Plus className="w-3.5 h-3.5" /></Button>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" onClick={() => setCreateStep(2)} className="flex-1">Back</Button>
                    <Button onClick={handleCreate} disabled={saving} className="flex-1">
                      {saving ? 'Saving...' : editingPlan ? 'Save Changes' : 'Create Draft'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Plans List */}
      {!showCreate && (
        plans.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Map className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold mb-1">No tour plans yet</h3>
              <p className="text-slate-500 text-sm mb-4">Create your first tour plan to start receiving bookings.</p>
              <Button onClick={() => { resetForm(); setShowCreate(true) }} className="gap-1">
                <Plus className="w-4 h-4" /> Create Plan
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {plan.cover_image_url ? (
                        <img src={plan.cover_image_url} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0 border" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                          <Map className="w-5 h-5 text-slate-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm truncate">{plan.title}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                            plan.status === 'active' ? 'bg-green-100 text-green-700' :
                            plan.status === 'paused' ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-100 text-slate-500'
                          }`}>{plan.status}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><Map className="w-3 h-3" />{plan.city}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{plan.duration_days} days</span>
                          <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />¥{plan.price.toLocaleString()}</span>
                          <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{plan.bookings} bookings</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`text-xs ${plan.status === 'active' ? 'text-amber-600' : 'text-green-600'}`}
                          onClick={() => togglePublish(plan)}
                        >
                          {plan.status === 'active' ? 'Unpublish' : 'Publish'}
                        </Button>
                        <Button variant="ghost" size="sm" className="shrink-0" onClick={() => startEdit(plan)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
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
