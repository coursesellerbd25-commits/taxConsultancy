
CREATE TABLE IF NOT EXISTS public.business_solutions (
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

ALTER TABLE public.business_solutions ENABLE ROW LEVEL SECURITY;

-- Public visitors can see published business solutions
CREATE POLICY "Public can view enabled business solutions"
ON public.business_solutions
FOR SELECT
TO anon, authenticated
USING (
    enabled = TRUE
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Administrators can create business solutions
CREATE POLICY "Admins can insert business solutions"
ON public.business_solutions
FOR INSERT
TO authenticated
WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Administrators can update business solutions
CREATE POLICY "Admins can update business solutions"
ON public.business_solutions
FOR UPDATE
TO authenticated
USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
)
WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Administrators can delete business solutions
CREATE POLICY "Admins can delete business solutions"
ON public.business_solutions
FOR DELETE
TO authenticated
USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
);

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.business_solutions TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.business_solutions TO authenticated;

NOTIFY pgrst, 'reload schema';
