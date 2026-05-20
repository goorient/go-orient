CREATE TABLE public.payout_requests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id      UUID NOT NULL REFERENCES public.guide_profiles(id) ON DELETE CASCADE,
  amount_cny    INTEGER NOT NULL CHECK (amount_cny > 0),
  bank_info     JSONB NOT NULL DEFAULT '{}',
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
  requested_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at  TIMESTAMPTZ,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payout_guide ON public.payout_requests(guide_id);
CREATE INDEX idx_payout_status ON public.payout_requests(status);

CREATE TRIGGER payout_requests_updated_at
  BEFORE UPDATE ON public.payout_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guides view own payouts" ON public.payout_requests FOR SELECT
  USING (auth.uid() = guide_id);
CREATE POLICY "Guides create payouts" ON public.payout_requests FOR INSERT
  WITH CHECK (true);
