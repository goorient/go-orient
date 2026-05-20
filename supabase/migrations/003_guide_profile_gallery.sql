ALTER TABLE public.guide_profiles ADD COLUMN IF NOT EXISTS gallery_urls TEXT[] DEFAULT '{}';
ALTER TABLE public.guide_profiles ADD COLUMN IF NOT EXISTS intro TEXT;
