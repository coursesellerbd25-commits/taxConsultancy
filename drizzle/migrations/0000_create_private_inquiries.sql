CREATE TABLE public.inquiries (
 id uuid PRIMARY KEY,
 full_name text NOT NULL CHECK (char_length(full_name) BETWEEN 1 AND 100),
 email text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 255),
 phone text NOT NULL CHECK (char_length(phone) BETWEEN 7 AND 30),
 preferred_contact_method text NOT NULL CHECK (preferred_contact_method IN ('email','phone','whatsapp')),
 client_category text NOT NULL CHECK (client_category IN ('individual','business','other')),
 service_slug text NOT NULL CHECK (char_length(service_slug) BETWEEN 1 AND 100),
 preferred_time text CHECK (char_length(preferred_time) <= 100),
 message text NOT NULL CHECK (char_length(message) BETWEEN 10 AND 1500),
 preferred_language text NOT NULL CHECK (preferred_language IN ('bangla','english')),
 status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','in_progress','closed')),
 internal_notes text NOT NULL DEFAULT '',
 consent_at timestamptz NOT NULL DEFAULT now(),
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.inquiries TO service_role;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.inquiries IS 'Private consultation inquiries. No public or ordinary authenticated access. Admin policies added in Phase 3.';
CREATE INDEX inquiries_email_created_idx ON public.inquiries (email, created_at DESC);
CREATE FUNCTION public.submit_inquiry(payload jsonb) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE request_id uuid := (payload->>'id')::uuid;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtextextended(lower(payload->>'email'), 0));
 IF EXISTS (SELECT 1 FROM public.inquiries WHERE id = request_id) THEN RETURN request_id; END IF;
 IF (SELECT count(*) FROM public.inquiries WHERE email = lower(payload->>'email') AND created_at > now() - interval '1 hour') >= 3 THEN
 RAISE EXCEPTION 'INQUIRY_RATE_LIMIT' USING ERRCODE = 'P0001';
 END IF;
 INSERT INTO public.inquiries(id, full_name, email, phone, preferred_contact_method, client_category, service_slug, preferred_time, message, preferred_language)
 VALUES(request_id, payload->>'fullName', lower(payload->>'email'), payload->>'phone', payload->>'contactMethod', payload->>'clientCategory', payload->>'serviceSlug', nullif(payload->>'preferredTime',''), payload->>'message', payload->>'language');
 RETURN request_id;
END;
$$;
REVOKE ALL ON FUNCTION public.submit_inquiry(jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_inquiry(jsonb) TO service_role;