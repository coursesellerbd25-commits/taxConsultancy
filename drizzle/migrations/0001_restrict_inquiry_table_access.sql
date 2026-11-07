REVOKE ALL ON TABLE public.inquiries FROM anon, authenticated;
GRANT ALL ON TABLE public.inquiries TO service_role;