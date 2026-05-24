-- 006_storage_bucket.sql
-- Create guide-photos storage bucket with public read + guide-only upload

-- Insert the bucket (public = true for public read access)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'guide-photos',
  'guide-photos',
  true,
  5242880,  -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Policy: anyone can read (public bucket, but explicit policy needed for API)
CREATE POLICY "Public read guide photos" ON storage.objects FOR SELECT
  USING (bucket_id = 'guide-photos');

-- Policy: authenticated guides can upload to their own directory
CREATE POLICY "Guides upload own photos" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'guide-photos'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: guides can update their own photos
CREATE POLICY "Guides update own photos" ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'guide-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: guides can delete their own photos
CREATE POLICY "Guides delete own photos" ON storage.objects FOR DELETE
  USING (
    bucket_id = 'guide-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
