CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE public.profiles (
  id            UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email         TEXT NOT NULL,
  display_name  TEXT NOT NULL DEFAULT '',
  avatar_url    TEXT,
  phone         TEXT,
  role          TEXT NOT NULL DEFAULT 'tourist'
                CHECK (role IN ('tourist', 'guide', 'admin')),
  bio           TEXT,
  country       TEXT,
  language      TEXT[] DEFAULT '{"en"}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'tourist')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE public.guide_profiles (
  id                    UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  certification_type    TEXT NOT NULL CHECK (certification_type IN ('individual', 'enterprise')),
  real_name             TEXT,
  passport_number       TEXT,
  guide_cert_number     TEXT,
  guide_cert_url        TEXT,
  company_name          TEXT,
  business_license      TEXT,
  business_license_url  TEXT,
  specialties           TEXT[] DEFAULT '{}',
  languages_spoken      TEXT[] DEFAULT '{}',
  service_cities        TEXT[] DEFAULT '{}',
  years_experience      INT DEFAULT 0,
  verification_status   TEXT NOT NULL DEFAULT 'pending'
                          CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  rating_avg            NUMERIC(3,2) DEFAULT 0.00,
  review_count          INT DEFAULT 0,
  bank_account_info     JSONB,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER guide_profiles_updated_at
  BEFORE UPDATE ON public.guide_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE public.tour_plans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id        UUID NOT NULL REFERENCES public.guide_profiles(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  subtitle        TEXT,
  description     TEXT NOT NULL,
  cover_image_url TEXT NOT NULL,
  gallery_urls    TEXT[] DEFAULT '{}',
  destinations    JSONB NOT NULL DEFAULT '[]',
  itinerary       JSONB NOT NULL DEFAULT '[]',
  duration_days   INT NOT NULL,
  max_group_size  INT DEFAULT 10,
  price_cny       INTEGER NOT NULL,
  currency        TEXT DEFAULT 'CNY',
  price_breakdown JSONB DEFAULT '{}',
  includes        TEXT[] DEFAULT '{}',
  excludes        TEXT[] DEFAULT '{}',
  highlights      TEXT[] DEFAULT '{}',
  tags            TEXT[] DEFAULT '{}',
  difficulty      TEXT CHECK (difficulty IN ('easy', 'moderate', 'challenging')),
  status          TEXT NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft', 'published', 'archived')),
  view_count      INT DEFAULT 0,
  booking_count   INT DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tour_plans_guide ON public.tour_plans(guide_id);
CREATE INDEX idx_tour_plans_status ON public.tour_plans(status);
CREATE INDEX idx_tour_plans_tags ON public.tour_plans USING gin(tags);

CREATE TRIGGER tour_plans_updated_at
  BEFORE UPDATE ON public.tour_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE public.posts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_type       TEXT NOT NULL DEFAULT 'image'
                  CHECK (post_type IN ('image', 'video', 'carousel')),
  title           TEXT NOT NULL,
  description     TEXT,
  media_urls      TEXT[] NOT NULL DEFAULT '{}',
  video_url       TEXT,
  thumbnail_url   TEXT,
  linked_plan_id  UUID REFERENCES public.tour_plans(id) ON DELETE SET NULL,
  tags            TEXT[] DEFAULT '{}',
  destination     TEXT,
  likes_count     INT DEFAULT 0,
  comments_count  INT DEFAULT 0,
  favorites_count INT DEFAULT 0,
  shares_count    INT DEFAULT 0,
  view_count      INT DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'published'
                  CHECK (status IN ('draft', 'published', 'hidden')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_posts_author ON public.posts(author_id);
CREATE INDEX idx_posts_destination ON public.posts(destination);
CREATE INDEX idx_posts_tags ON public.posts USING gin(tags);
CREATE INDEX idx_posts_created ON public.posts(created_at DESC);

CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE public.orders (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number          TEXT NOT NULL UNIQUE,
  tourist_id            UUID NOT NULL REFERENCES public.profiles(id),
  guide_id              UUID NOT NULL REFERENCES public.guide_profiles(id),
  plan_id               UUID NOT NULL REFERENCES public.tour_plans(id),
  plan_snapshot         JSONB NOT NULL,
  custom_requests       TEXT,
  agreed_price_cny      INTEGER NOT NULL,
  currency              TEXT DEFAULT 'CNY',
  travel_start_date     DATE NOT NULL,
  travel_end_date       DATE NOT NULL,
  group_size            INT NOT NULL DEFAULT 1,
  payment_method        TEXT,
  payment_id            TEXT,
  paid_at               TIMESTAMPTZ,
  escrow_status         TEXT NOT NULL DEFAULT 'pending_payment'
                        CHECK (escrow_status IN (
                          'pending_payment',
                          'paid_to_escrow',
                          'guide_accepted',
                          'service_in_progress',
                          'service_completed',
                          'tourist_confirmed',
                          'funds_released',
                          'disputed',
                          'refunded',
                          'cancelled'
                        )),
  emergency_contact_name  TEXT,
  emergency_contact_phone TEXT,
  trip_share_token      TEXT UNIQUE,
  guide_accepted_at     TIMESTAMPTZ,
  service_started_at    TIMESTAMPTZ,
  service_ended_at      TIMESTAMPTZ,
  tourist_confirmed_at  TIMESTAMPTZ,
  funds_released_at     TIMESTAMPTZ,
  cancelled_at          TIMESTAMPTZ,
  dispute_reason        TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_tourist ON public.orders(tourist_id);
CREATE INDEX idx_orders_guide ON public.orders(guide_id);
CREATE INDEX idx_orders_status ON public.orders(escrow_status);

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE public.chat_conversations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_a       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  participant_b       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  related_plan_id     UUID REFERENCES public.tour_plans(id) ON DELETE SET NULL,
  related_order_id    UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  last_message_at     TIMESTAMPTZ DEFAULT NOW(),
  last_message_preview TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(participant_a, participant_b, related_plan_id)
);

CREATE INDEX idx_conv_participant_a ON public.chat_conversations(participant_a);
CREATE INDEX idx_conv_participant_b ON public.chat_conversations(participant_b);

CREATE TABLE public.chat_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content         TEXT NOT NULL,
  message_type    TEXT NOT NULL DEFAULT 'text'
                  CHECK (message_type IN ('text', 'image', 'plan_card', 'order_card', 'system')),
  metadata        JSONB DEFAULT '{}',
  is_read         BOOLEAN NOT NULL DEFAULT FALSE,
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_conv ON public.chat_messages(conversation_id, created_at);

ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

CREATE TABLE public.visa_applications (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_type        TEXT NOT NULL CHECK (service_type IN (
                        'l_visa', 'transit_exemption', 'e_visa', 'other'
                      )),
  nationality         TEXT NOT NULL,
  passport_number     TEXT NOT NULL,
  passport_expiry     DATE NOT NULL,
  intended_entry_date DATE NOT NULL,
  intended_stay_days  INT NOT NULL,
  entry_city          TEXT,
  purpose             TEXT NOT NULL,
  personal_info       JSONB NOT NULL DEFAULT '{}',
  uploaded_docs       TEXT[] DEFAULT '{}',
  quoted_price_cny    INTEGER,
  payment_status      TEXT DEFAULT 'unpaid'
                      CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  application_status  TEXT NOT NULL DEFAULT 'submitted'
                      CHECK (application_status IN (
                        'submitted', 'under_review',
                        'additional_info_needed', 'quoted',
                        'processing', 'approved', 'rejected'
                      )),
  staff_notes         TEXT,
  result_doc_url      TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_visa_user ON public.visa_applications(user_id);
CREATE INDEX idx_visa_status ON public.visa_applications(application_status);

CREATE TABLE public.reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
  tourist_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  guide_id    UUID NOT NULL REFERENCES public.guide_profiles(id) ON DELETE CASCADE,
  rating      INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  content     TEXT,
  images      TEXT[] DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_guide ON public.reviews(guide_id);

CREATE TABLE public.favorites (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'plan', 'guide')),
  target_id   UUID NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, target_type, target_id)
);

CREATE INDEX idx_favorites_user ON public.favorites(user_id);

CREATE TABLE public.comments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_comments_post ON public.comments(post_id);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tour_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visa_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles readable by all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Guide profiles readable by all" ON public.guide_profiles FOR SELECT USING (true);
CREATE POLICY "Guides insert own profile" ON public.guide_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Guides update own profile" ON public.guide_profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Published plans readable" ON public.tour_plans FOR SELECT USING (true);
CREATE POLICY "Guides create plans" ON public.tour_plans FOR INSERT WITH CHECK (true);
CREATE POLICY "Guides update own plans" ON public.tour_plans FOR UPDATE USING (true);

CREATE POLICY "Posts readable by all" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Users create posts" ON public.posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Users update own posts" ON public.posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users delete own posts" ON public.posts FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "Orders viewable by parties" ON public.orders FOR SELECT
  USING (auth.uid() = tourist_id OR auth.uid() = guide_id);
CREATE POLICY "Tourists create orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Parties update orders" ON public.orders FOR UPDATE
  USING (auth.uid() = tourist_id OR auth.uid() = guide_id);

CREATE POLICY "Conversations viewable by participants" ON public.chat_conversations FOR SELECT
  USING (auth.uid() = participant_a OR auth.uid() = participant_b);
CREATE POLICY "Users create conversations" ON public.chat_conversations FOR INSERT WITH CHECK (true);

CREATE POLICY "Messages viewable by participants" ON public.chat_messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.chat_conversations c
    WHERE c.id = chat_messages.conversation_id
    AND (c.participant_a = auth.uid() OR c.participant_b = auth.uid())
  ));
CREATE POLICY "Users send messages" ON public.chat_messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Users view own visa" ON public.visa_applications FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users create visa" ON public.visa_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users update own visa" ON public.visa_applications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Reviews readable by all" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Tourists create reviews" ON public.reviews FOR INSERT WITH CHECK (true);

CREATE POLICY "Users view own favorites" ON public.favorites FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users manage favorites" ON public.favorites FOR INSERT WITH CHECK (true);
CREATE POLICY "Users delete favorites" ON public.favorites FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Comments readable by all" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Users create comments" ON public.comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Users delete own comments" ON public.comments FOR DELETE
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.increment_view(table_name TEXT, row_id UUID)
RETURNS VOID AS $$
BEGIN
  EXECUTE format('UPDATE public.%I SET view_count = view_count + 1 WHERE id = $1', table_name)
  USING row_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.toggle_favorite(user_uuid UUID, tgt_type TEXT, tgt_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  exists_flag BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM public.favorites
    WHERE user_id = user_uuid AND target_type = tgt_type AND target_id = tgt_id
  ) INTO exists_flag;

  IF exists_flag THEN
    DELETE FROM public.favorites
    WHERE user_id = user_uuid AND target_type = tgt_type AND target_id = tgt_id;

    IF tgt_type = 'post' THEN
      UPDATE public.posts SET favorites_count = favorites_count - 1 WHERE id = tgt_id;
    END IF;
    RETURN FALSE;
  ELSE
    INSERT INTO public.favorites (user_id, target_type, target_id)
    VALUES (user_uuid, tgt_type, tgt_id);

    IF tgt_type = 'post' THEN
      UPDATE public.posts SET favorites_count = favorites_count + 1 WHERE id = tgt_id;
    END IF;
    RETURN TRUE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'GO-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(SUBSTRING(gen_random_uuid()::text, 1, 6));
END;
$$ LANGUAGE plpgsql;
