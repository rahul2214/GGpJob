-- ==============================================================================
-- JobsDart: Recruiter Screening Questions & Candidate Questionnaire System
-- Schema Definition: screening_questions_schema.sql
-- ==============================================================================

-- 1. Table: screening_question_types (System Metadata for Question Types)
CREATE TABLE IF NOT EXISTS public.screening_question_types (
  code TEXT NOT NULL,
  label TEXT NOT NULL,
  accepts_options BOOLEAN NOT NULL DEFAULT false,
  answer_json_type TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT screening_question_types_pkey PRIMARY KEY (code)
);

-- Seed screening_question_types
INSERT INTO public.screening_question_types (code, label, accepts_options, answer_json_type, is_active)
VALUES
  ('short_text', 'Short text', false, 'string', true),
  ('long_text', 'Long text', false, 'string', true),
  ('single_choice', 'Single choice', true, 'string', true),
  ('multiple_choice', 'Multiple choice', true, 'array', true),
  ('yes_no', 'Yes / No', false, 'boolean', true),
  ('numeric', 'Number', false, 'number', true),
  ('date', 'Date', false, 'string', true),
  ('dropdown', 'Dropdown', true, 'string', true),
  ('url', 'URL', false, 'string', true)
ON CONFLICT (code) DO UPDATE
SET
  label = EXCLUDED.label,
  accepts_options = EXCLUDED.accepts_options,
  answer_json_type = EXCLUDED.answer_json_type,
  is_active = EXCLUDED.is_active;

-- 2. Table: job_screening_questions (Recruiter Configured Screening Questions)
CREATE TABLE IF NOT EXISTS public.job_screening_questions (
  id BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
  job_pk BIGINT NOT NULL,
  question_text TEXT NOT NULL,
  description TEXT NULL,
  question_type TEXT NOT NULL,
  is_required BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  validation_rules JSONB NOT NULL DEFAULT '{}'::jsonb,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  archived_at TIMESTAMP WITH TIME ZONE NULL,
  CONSTRAINT job_screening_questions_pkey PRIMARY KEY (id),
  CONSTRAINT jsq_question_type_fkey FOREIGN KEY (question_type) REFERENCES public.screening_question_types (code),
  CONSTRAINT job_screening_questions_job_pk_fkey FOREIGN KEY (job_pk) REFERENCES public.jobs (id) ON DELETE CASCADE,
  CONSTRAINT jsq_text_len CHECK (
    (char_length(question_text) >= 1) AND (char_length(question_text) <= 500)
  ),
  CONSTRAINT jsq_options_array CHECK (jsonb_typeof(options) = 'array'::text),
  CONSTRAINT jsq_choice_needs_options CHECK (
    (question_type <> ALL (ARRAY['single_choice'::text, 'multiple_choice'::text]))
    OR (jsonb_array_length(options) >= 2)
  ),
  CONSTRAINT jsq_rules_object CHECK (jsonb_typeof(validation_rules) = 'object'::text)
);

CREATE INDEX IF NOT EXISTS idx_job_screening_questions_display_order
  ON public.job_screening_questions (job_pk, display_order);

CREATE INDEX IF NOT EXISTS idx_job_screening_questions_archived_at
  ON public.job_screening_questions (job_pk, archived_at);

-- 3. Table: job_application_answers (Immutable Candidate Answers)
CREATE TABLE IF NOT EXISTS public.job_application_answers (
  id BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
  application_id BIGINT NOT NULL,
  question_id BIGINT NULL,
  question_snapshot JSONB NOT NULL,
  answer_value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT job_application_answers_pkey PRIMARY KEY (id),
  CONSTRAINT uq_app_question UNIQUE (application_id, question_id),
  CONSTRAINT job_application_answers_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.applications (id) ON DELETE CASCADE,
  CONSTRAINT job_application_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.job_screening_questions (id) ON DELETE SET NULL,
  CONSTRAINT jaa_snapshot_object CHECK (jsonb_typeof(question_snapshot) = 'object'::text)
);

CREATE INDEX IF NOT EXISTS idx_job_application_answers_question_id
  ON public.job_application_answers (question_id);

CREATE INDEX IF NOT EXISTS idx_job_application_answers_application_id
  ON public.job_application_answers (application_id);

-- 4. Backward Compatibility Columns on existing tables
ALTER TABLE public.jobs 
  ADD COLUMN IF NOT EXISTS screening_questions JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.applications 
  ADD COLUMN IF NOT EXISTS screening_answers JSONB DEFAULT '[]'::jsonb;

-- 5. Row Level Security (RLS) Policies
ALTER TABLE public.screening_question_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_screening_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_application_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read for screening question types"
  ON public.screening_question_types
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public read for job screening questions"
  ON public.job_screening_questions
  FOR SELECT
  USING (archived_at IS NULL);

CREATE POLICY "Service role full access on screening questions"
  ON public.job_screening_questions
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access on application answers"
  ON public.job_application_answers
  FOR ALL
  USING (true)
  WITH CHECK (true);
