CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
 role public.app_role NOT NULL,
 UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
 SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- The first account created becomes the administrator; later accounts get no access.
CREATE FUNCTION public.assign_first_admin() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 PERFORM pg_advisory_xact_lock(424242);
 IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
 END IF;
 RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.assign_first_admin() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER on_auth_user_created_assign_admin AFTER INSERT ON auth.users
 FOR EACH ROW EXECUTE FUNCTION public.assign_first_admin();

-- Inquiries: admins read all, update only status and notes.
GRANT SELECT ON public.inquiries TO authenticated;
GRANT UPDATE (status, internal_notes, updated_at) ON public.inquiries TO authenticated;
CREATE POLICY "Admins read inquiries" ON public.inquiries FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update inquiries" ON public.inquiries FOR UPDATE TO authenticated
 USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.site_settings (
 id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
 business_name text CHECK (char_length(business_name) <= 120),
 tagline text CHECK (char_length(tagline) <= 120),
 consultant_name text CHECK (char_length(consultant_name) <= 120),
 logo_url text CHECK (char_length(logo_url) <= 500),
 biography text CHECK (char_length(biography) <= 4000),
 contact_email text CHECK (char_length(contact_email) <= 255),
 contact_phone text CHECK (char_length(contact_phone) <= 30),
 whatsapp_number text CHECK (whatsapp_number ~ '^[0-9]{8,15}$'),
 whatsapp_message text CHECK (char_length(whatsapp_message) <= 300),
 office_address text CHECK (char_length(office_address) <= 300),
 business_hours text CHECK (char_length(business_hours) <= 200),
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT INSERT, UPDATE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins insert settings" ON public.site_settings FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update settings" ON public.site_settings FOR UPDATE TO authenticated
 USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
INSERT INTO public.site_settings (id, business_name, tagline, whatsapp_message)
 VALUES (1, '[Your Business Name]', 'Tax & VAT Consultancy · Bangladesh', 'Hello, I would like to ask about a tax consultation.');

CREATE TABLE public.services (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9-]{1,100}$'),
 title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 120),
 short_description text NOT NULL DEFAULT '' CHECK (char_length(short_description) <= 300),
 full_description text NOT NULL DEFAULT '' CHECK (char_length(full_description) <= 2000),
 who_needs text[] NOT NULL DEFAULT '{}',
 help_with text[] NOT NULL DEFAULT '{}',
 documents text[] NOT NULL DEFAULT '{}',
 enabled boolean NOT NULL DEFAULT true,
 display_order int NOT NULL DEFAULT 0,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.services TO anon, authenticated;
GRANT UPDATE (title, short_description, full_description, who_needs, help_with, documents, enabled, display_order, updated_at) ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads enabled services" ON public.services FOR SELECT TO anon, authenticated
 USING (enabled OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update services" ON public.services FOR UPDATE TO authenticated
 USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.services (slug, title, short_description, full_description, who_needs, help_with, documents, display_order) VALUES
('individual-income-tax','Individual Income Tax Assistance','Guidance on understanding your personal income tax obligations and organizing records.','General guidance for salaried individuals, professionals, and others who want help understanding their personal income tax responsibilities.',ARRAY['Salaried employees','Self-employed professionals','Individuals with multiple income sources'],ARRAY['Understanding which income sources may be relevant','Organizing income and investment records','Explaining general filing steps'],ARRAY['Salary or income statements','Records of investments or savings, if any','Previous tax records, if available'],1),
('business-tax-compliance','Business Tax Compliance','Support for businesses in understanding and organizing their tax compliance responsibilities.','Consultation for sole proprietors, partnerships, and companies seeking clarity on business tax compliance and record-keeping.',ARRAY['Sole proprietors','Partnerships','Small and medium companies'],ARRAY['Reviewing record-keeping practices','Explaining general compliance obligations','Preparing for discussions with your accountant'],ARRAY['Business registration documents','Financial statements or ledgers','Previous tax correspondence, if any'],2),
('vat-consultancy','VAT Consultancy','Practical guidance on VAT matters, registration questions, and ongoing compliance.','Consultation on VAT-related questions for businesses, including registration questions, record-keeping, and periodic compliance.',ARRAY['Businesses with VAT-related questions','New businesses unsure about VAT obligations'],ARRAY['Explaining general VAT concepts','Reviewing VAT record organization','Clarifying questions before filing'],ARRAY['Business registration details','Sales and purchase records','Existing VAT documentation, if any'],3),
('tax-return-preparation','Tax Return Preparation Assistance','Help organizing documents and information needed for your tax return.','Assistance with gathering and organizing the information typically needed when preparing a tax return.',ARRAY['First-time filers','Individuals who want organized documentation'],ARRAY['Preparing a document checklist','Organizing income and expense information','Reviewing completeness before submission'],ARRAY['Income records','Supporting documents for any claimed items','Previous return, if available'],4),
('tin-guidance','TIN-Related Guidance','General guidance on Taxpayer Identification Number questions.','General information about TIN-related questions. Registration itself is completed through official NBR channels.',ARRAY['Individuals or businesses with TIN questions'],ARRAY['Explaining the general TIN process','Pointing to official NBR resources'],ARRAY['Identification details as required by official channels'],5),
('tax-notice-assistance','Tax Notice and Documentation Assistance','Help understanding tax notices and organizing the documents they ask for.','Support in reading and understanding tax-related notices and organizing documentation in response.',ARRAY['Anyone who has received a tax-related notice'],ARRAY['Explaining what a notice is asking for','Organizing requested documents','Planning next steps'],ARRAY['A copy of the notice','Related tax records'],6),
('compliance-review','Tax Compliance Reviews','A structured review of your records to identify gaps and questions.','A review of your existing records and practices to help identify gaps and questions worth addressing.',ARRAY['Individuals and businesses wanting a check of their records'],ARRAY['Reviewing record completeness','Highlighting areas for clarification'],ARRAY['Recent tax records','Supporting financial records'],7),
('general-consultation','General Tax Consultation','A conversation about your tax questions to understand your situation.','A general consultation to discuss your questions and decide what kind of help, if any, you need.',ARRAY['Anyone with general tax questions'],ARRAY['Understanding your questions','Suggesting possible next steps'],ARRAY['Any documents relevant to your question'],8);