ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS country text NOT NULL DEFAULT 'Bangladesh';
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS preferred_date date;
UPDATE public.site_settings SET business_name = 'Tax Compass' WHERE id = 1 AND (business_name IS NULL OR business_name LIKE '[%');
CREATE OR REPLACE FUNCTION public.submit_inquiry(payload jsonb)
 RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE request_id uuid := (payload->>'id')::uuid;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtextextended(lower(payload->>'email'), 0));
 IF EXISTS (SELECT 1 FROM public.inquiries WHERE id = request_id) THEN RETURN request_id; END IF;
 IF (SELECT count(*) FROM public.inquiries WHERE email = lower(payload->>'email') AND created_at > now() - interval '1 hour') >= 3 THEN
 RAISE EXCEPTION 'INQUIRY_RATE_LIMIT' USING ERRCODE = 'P0001';
 END IF;
 INSERT INTO public.inquiries(id, full_name, email, phone, preferred_contact_method, client_category, service_slug, preferred_time, message, preferred_language, country, preferred_date)
 VALUES(request_id, payload->>'fullName', lower(payload->>'email'), payload->>'phone', payload->>'contactMethod', payload->>'clientCategory', payload->>'serviceSlug', nullif(payload->>'preferredTime',''), payload->>'message', coalesce(nullif(payload->>'language',''),'english'), coalesce(nullif(payload->>'country',''),'Bangladesh'), nullif(payload->>'preferredDate','')::date);
 RETURN request_id;
END;
$function$;
REVOKE ALL ON FUNCTION public.submit_inquiry(jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_inquiry(jsonb) TO service_role;