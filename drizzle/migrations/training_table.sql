
CREATE TABLE IF NOT EXISTS public.training_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  learning_objectives TEXT[] NOT NULL DEFAULT '{}',
  duration TEXT NOT NULL DEFAULT '',
  fee TEXT NOT NULL DEFAULT '',
  schedule TEXT NOT NULL DEFAULT '',
  enrollment_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS training_programs_display_order_idx
ON public.training_programs (display_order);

CREATE INDEX IF NOT EXISTS training_programs_enabled_idx
ON public.training_programs (enabled);

CREATE TABLE IF NOT EXISTS public.training_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES public.training_programs(id)
    ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'General',
  file_url TEXT,
  file_name TEXT,
  external_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS training_materials_program_id_idx
ON public.training_materials (program_id);

CREATE INDEX IF NOT EXISTS training_materials_display_order_idx
ON public.training_materials (display_order);

ALTER TABLE public.training_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published training programs"
ON public.training_programs
FOR SELECT
TO anon, authenticated
USING (enabled = TRUE);

CREATE POLICY "Public can view published training materials"
ON public.training_materials
FOR SELECT
TO anon, authenticated
USING (enabled = TRUE);
