
-- Cards table for NFC memory portals
CREATE TABLE public.cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unique_id TEXT NOT NULL UNIQUE,
  student_name TEXT NOT NULL,
  photo_url TEXT,
  pin_hash TEXT,
  drive_url TEXT,
  spotify_url TEXT,
  video_url TEXT,
  is_first_time BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

-- Public can read basic non-sensitive info (we never expose pin_hash via select policy by using a view or column-level handling in server fns).
-- For simplicity, we keep RLS strict: no direct client reads. All access goes through server functions using service role.
-- No policies = no access from anon. Server functions use supabaseAdmin.

CREATE INDEX idx_cards_unique_id ON public.cards(unique_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER cards_set_updated_at
BEFORE UPDATE ON public.cards
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
