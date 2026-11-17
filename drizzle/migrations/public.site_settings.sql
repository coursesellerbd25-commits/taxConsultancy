
-- Create the website settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),

    business_name TEXT NOT NULL DEFAULT 'Corporate Tax Bangladesh',
    tagline TEXT DEFAULT '',
    consultant_name TEXT DEFAULT '',

    contact_email TEXT DEFAULT '',
    contact_phone TEXT DEFAULT '',
    whatsapp_number TEXT DEFAULT '',
    whatsapp_message TEXT DEFAULT '',

    office_address TEXT DEFAULT '',
    business_hours TEXT DEFAULT '',
    biography TEXT DEFAULT '',

    logo_url TEXT DEFAULT '',

    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read public website settings
DROP POLICY IF EXISTS "Public can view website settings"
ON public.site_settings;

CREATE POLICY "Public can view website settings"
ON public.site_settings
FOR SELECT
TO anon, authenticated
USING (true);

-- Only administrators can update website settings
DROP POLICY IF EXISTS "Admins can update website settings"
ON public.site_settings;

CREATE POLICY "Admins can update website settings"
ON public.site_settings
FOR UPDATE
TO authenticated
USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
)
WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Grant database permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT ON public.site_settings TO anon, authenticated;

GRANT UPDATE ON public.site_settings TO authenticated;

-- Insert the default settings row
INSERT INTO public.site_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- Refresh Supabase API schema cache
NOTIFY pgrst, 'reload schema';
