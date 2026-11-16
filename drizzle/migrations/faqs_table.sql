
CREATE TABLE IF NOT EXISTS public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  display_order INTEGER NOT NULL DEFAULT 0,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS faqs_display_order_idx
ON public.faqs (display_order);

CREATE INDEX IF NOT EXISTS faqs_enabled_idx
ON public.faqs (enabled);

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- Public visitors can read published FAQs only.
CREATE POLICY "Public can view published FAQs"
ON public.faqs
FOR SELECT
TO anon, authenticated
USING (enabled = TRUE);
