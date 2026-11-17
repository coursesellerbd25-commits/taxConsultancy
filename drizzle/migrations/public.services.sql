
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    short_description TEXT DEFAULT '',
    full_description TEXT DEFAULT '',
    who_needs TEXT[] DEFAULT '{}',
    help_with TEXT[] DEFAULT '{}',
    documents TEXT[] DEFAULT '{}',
    display_order INTEGER DEFAULT 0,
    enabled BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view enabled services"
ON public.services;

DROP POLICY IF EXISTS "Admins can insert services"
ON public.services;

DROP POLICY IF EXISTS "Admins can update services"
ON public.services;

DROP POLICY IF EXISTS "Admins can delete services"
ON public.services;

CREATE POLICY "Public can view enabled services"
ON public.services
FOR SELECT
TO anon, authenticated
USING (
    enabled = TRUE
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admins can insert services"
ON public.services
FOR INSERT
TO authenticated
WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admins can update services"
ON public.services
FOR UPDATE
TO authenticated
USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
)
WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admins can delete services"
ON public.services
FOR DELETE
TO authenticated
USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
);

GRANT SELECT ON public.services TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.services TO authenticated;

NOTIFY pgrst, 'reload schema';
