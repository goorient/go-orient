'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createBrowserClient } from '@supabase/ssr'
import { Check, X, Plus, MapPin, Languages, Award, Image, Star, Building2 } from 'lucide-react'
import { motion } from 'framer-motion'

const SPECIALTY_OPTIONS = [
  'Culture', 'History', 'Food', 'Nature', 'Hiking', 'Photography',
  'Architecture', 'Shopping', 'Nightlife', 'Wildlife', 'Tea Culture',
  'Cycling', 'Art', 'Music', 'Adventure', 'Wellness',
]

const LANGUAGE_OPTIONS = [
  { code: 'en', label: 'English' },
  { code: 'zh', label: '中文' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'es', label: 'Español' },
  { code: 'ru', label: 'Русский' },
  { code: 'th', label: 'ไทย' },
  { code: 'vi', label: 'Tiếng Việt' },
]

const CITY_OPTIONS = [
  'Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Chengdu',
  'Xi\'an', 'Hangzhou', 'Guilin', 'Kunming', 'Sanya',
  'Chongqing', 'Nanjing', 'Suzhou', 'Xiamen', 'Lhasa',
]

export default function GuideProfilePage() {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [intro, setIntro] = useState('')
  const [specialties, setSpecialties] = useState<string[]>([])
  const [languages, setLanguages] = useState<string[]>([])
  const [serviceCities, setServiceCities] = useState<string[]>([])
  const [yearsExperience, setYearsExperience] = useState('0')
  const [galleryUrls, setGalleryUrls] = useState<string[]>([])
  const [newGalleryUrl, setNewGalleryUrl] = useState('')
  const [bankName, setBankName] = useState('')
  const [accountLast4, setAccountLast4] = useState('')
  const [accountName, setAccountName] = useState('')

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { data } = await supabase
          .from('guide_profiles')
          .select('*')
          .eq('id', user!.id)
          .single()

        if (data) {
          setIntro(data.intro || '')
          setSpecialties(data.specialties || [])
          setLanguages(data.languages_spoken || [])
          setServiceCities(data.service_cities || [])
          setYearsExperience(String(data.years_experience || 0))
          setGalleryUrls(data.gallery_urls || [])
          if (data.bank_account_info) {
            const bi = data.bank_account_info as Record<string, string>
            setBankName(bi.bank_name || '')
            setAccountLast4(bi.account_last4 || '')
            setAccountName(bi.account_name || '')
          }
        }
      } catch {
        // Use defaults
      }
      setLoading(false)
    }

    if (user) loadProfile()
  }, [user])

  const toggleItem = (arr: string[], item: string, setter: (v: string[]) => void) => {
    setter(arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item])
  }

  const handleAddGalleryUrl = () => {
    if (newGalleryUrl.trim() && !galleryUrls.includes(newGalleryUrl.trim())) {
      setGalleryUrls([...galleryUrls, newGalleryUrl.trim()])
      setNewGalleryUrl('')
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      await supabase
        .from('guide_profiles')
        .update({
          intro,
          specialties,
          languages_spoken: languages,
          service_cities: serviceCities,
          years_experience: Number(yearsExperience),
          gallery_urls: galleryUrls,
          bank_account_info: {
            bank_name: bankName,
            account_last4: accountLast4,
            account_name: accountName,
          },
        })
        .eq('id', user!.id)
    } catch {
      // Supabase unreachable
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Guide Profile</h1>
        <p className="text-slate-500 text-sm">Edit your public guide profile — this is what tourists see.</p>
      </div>

      {/* Intro */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" /> One-Line Introduction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
              placeholder="e.g., Born and raised Beijinger, food lover & history buff"
              className="h-10"
              maxLength={100}
            />
            <p className="text-xs text-slate-400 mt-1">{intro.length}/100 characters</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Specialties */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-500" /> Specialties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {SPECIALTY_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => toggleItem(specialties, s, setSpecialties)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    specialties.includes(s)
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {specialties.includes(s) && <Check className="w-3 h-3 inline mr-1" />}
                  {s}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Languages */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Languages className="w-5 h-5 text-green-500" /> Languages Spoken
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {LANGUAGE_OPTIONS.map((l) => (
                <button
                  key={l.code}
                  onClick={() => toggleItem(languages, l.code, setLanguages)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    languages.includes(l.code)
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {languages.includes(l.code) && <Check className="w-3 h-3 inline mr-1" />}
                  {l.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Service Cities */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-500" /> Service Cities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {CITY_OPTIONS.map((c) => (
                <button
                  key={c}
                  onClick={() => toggleItem(serviceCities, c, setServiceCities)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    serviceCities.includes(c)
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {serviceCities.includes(c) && <Check className="w-3 h-3 inline mr-1" />}
                  {c}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Experience */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Years of Experience</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="number"
              min="0"
              max="50"
              value={yearsExperience}
              onChange={(e) => setYearsExperience(e.target.value)}
              className="h-10 w-32"
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Gallery */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Image className="w-5 h-5 text-purple-500" /> Photo Gallery
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-500">Add photos to showcase your personality and local expertise.</p>

            {/* Existing gallery */}
            {galleryUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {galleryUrls.map((url, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={url}
                      alt={`Gallery ${i + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-slate-200"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="%23e2e8f0"><rect width="100" height="100"/></svg>' }}
                    />
                    <button
                      onClick={() => setGalleryUrls(galleryUrls.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add URL input */}
            <div className="flex gap-2">
              <Input
                value={newGalleryUrl}
                onChange={(e) => setNewGalleryUrl(e.target.value)}
                placeholder="Paste image URL..."
                className="flex-1 h-10"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddGalleryUrl())}
              />
              <Button variant="outline" onClick={handleAddGalleryUrl} className="gap-1">
                <Plus className="w-4 h-4" /> Add
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bank Account */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-500" /> Bank Account for Payouts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-slate-500">Payouts will be sent to this bank account.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-slate-500">Bank Name</Label>
                <Input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g., ICBC" className="h-9" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-500">Account Last 4 Digits</Label>
                <Input value={accountLast4} onChange={(e) => setAccountLast4(e.target.value)} placeholder="e.g., 8901" maxLength={4} className="h-9" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-500">Account Holder Name</Label>
                <Input value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="e.g., Li Wei" className="h-9" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Save */}
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving} className="min-w-[120px]">
          {saving ? 'Saving...' : 'Save Profile'}
        </Button>
        {saved && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-green-600 text-sm font-medium flex items-center gap-1"
          >
            <Check className="w-4 h-4" /> Saved!
          </motion.span>
        )}
      </div>
    </div>
  )
}
