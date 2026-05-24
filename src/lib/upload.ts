import { createBrowserClient } from '@supabase/ssr'

const BUCKET = 'guide-photos'

function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

function getPublicUrl(path: string): string {
  const supabase = getSupabase()
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

function getExt(file: File): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  }
  return map[file.type] || 'jpg'
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const supabase = getSupabase()
  const ext = getExt(file)
  const path = `${userId}/avatar/${Date.now()}.${ext}`

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type,
  })

  if (error) throw error

  return getPublicUrl(path)
}

export async function uploadGalleryPhoto(userId: string, file: File): Promise<string> {
  const supabase = getSupabase()
  const ext = getExt(file)
  const path = `${userId}/gallery/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
  })

  if (error) throw error

  return getPublicUrl(path)
}

export async function deletePhoto(url: string): Promise<void> {
  // Extract path from public URL
  // URL format: https://{project}.supabase.co/storage/v1/object/public/guide-photos/{path}
  try {
    const supabase = getSupabase()
    const urlObj = new URL(url)
    const parts = urlObj.pathname.split('/')
    const bucketIndex = parts.indexOf(BUCKET)
    if (bucketIndex === -1) return
    const filePath = parts.slice(bucketIndex + 1).join('/')

    await supabase.storage.from(BUCKET).remove([filePath])
  } catch {
    // Not a storage URL or deletion failed — ignore
  }
}
