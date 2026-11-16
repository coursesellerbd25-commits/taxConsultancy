
-- Allow public visitors and authenticated users to submit enquiries
GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT INSERT ON TABLE public.inquiries
TO anon, authenticated;

-- Allow authenticated administrators to manage enquiries
GRANT SELECT, UPDATE, DELETE
ON TABLE public.inquiries
TO authenticated;
