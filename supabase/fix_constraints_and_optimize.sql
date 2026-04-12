-- =============================================================================
-- DATA CLEANUP & OPTIMIZATION: company_sizes, recruiters, benefits
-- Purpose: Fix existing data that violates constraints and apply optimizations.
-- Covers: Cleanup, RLS, Indexes, Constraints & Data Integrity
-- =============================================================================

BEGIN;

-- =============================================================================
-- SECTION 0: DATA CLEANUP (Fix violations before adding constraints)
-- =============================================================================

-- 1. Fix recruiter websites: prepend https:// if missing
UPDATE public.recruiters
SET company_website = 'https://' || company_website
WHERE company_website IS NOT NULL 
  AND company_website !~ '^https?://'
  AND company_website <> '';

-- 2. Fix recruiter linkedin URLs: 
-- Prepend https:// if protocol is missing, and handle various formats
UPDATE public.recruiters
SET company_linkedin_url = 'https://' || company_linkedin_url
WHERE company_linkedin_url IS NOT NULL 
  AND company_linkedin_url !~ '^https?://'
  AND company_linkedin_url <> '';

-- Ensure it starts with the correct base if it's just a handle or partial URL (optional, but let's be safe)
-- However, localized domains like in.linkedin.com are common, so we skip aggressive handle-fixing to avoid data loss.


-- 3. Fix recruiter phone formats: remove common invalid characters (brackets)
UPDATE public.recruiters
SET phone = regexp_replace(phone, '[\(\)]', '', 'g')
WHERE phone IS NOT NULL AND phone ~ '[\(\)]';

-- 4. Trim whitespace for master tables
UPDATE public.benefits SET name = trim(name) WHERE name IS NOT NULL;

-- Create company_sizes if it doesn't exist (it seems the user transitioned to this)
CREATE TABLE IF NOT EXISTS public.company_sizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed company_sizes if table is empty
INSERT INTO public.company_sizes (name)
SELECT unnest(ARRAY['1-10', '11-50', '51-200', '201-500', '500+'])
WHERE NOT EXISTS (SELECT 1 FROM public.company_sizes)
ON CONFLICT (name) DO NOTHING;

UPDATE public.company_sizes SET name = trim(name) WHERE name IS NOT NULL;


-- =============================================================================
-- SECTION 1: CONSTRAINTS & DATA INTEGRITY
-- =============================================================================

-- ── company_sizes ─────────────────────────────────────────────────────────────
ALTER TABLE public.company_sizes DROP CONSTRAINT IF EXISTS company_sizes_name_not_empty;
ALTER TABLE public.company_sizes
  ADD CONSTRAINT company_sizes_name_not_empty
    CHECK (trim(name) <> '');

-- ── benefits ──────────────────────────────────────────────────────────────────
ALTER TABLE public.benefits DROP CONSTRAINT IF EXISTS benefits_name_not_empty;
ALTER TABLE public.benefits
  ADD CONSTRAINT benefits_name_not_empty
    CHECK (trim(name) <> '');

-- ── recruiters ────────────────────────────────────────────────────────────────
ALTER TABLE public.recruiters DROP CONSTRAINT IF EXISTS recruiters_phone_format;
ALTER TABLE public.recruiters
  ADD CONSTRAINT recruiters_phone_format
    CHECK (phone IS NULL OR phone ~ '^\+?[0-9\s\-]{7,15}$');

ALTER TABLE public.recruiters DROP CONSTRAINT IF EXISTS recruiters_website_format;
ALTER TABLE public.recruiters
  ADD CONSTRAINT recruiters_website_format
    CHECK (company_website IS NULL OR company_website ~ '^https?://');

ALTER TABLE public.recruiters DROP CONSTRAINT IF EXISTS recruiters_linkedin_format;
ALTER TABLE public.recruiters
  ADD CONSTRAINT recruiters_linkedin_format
    CHECK (company_linkedin_url IS NULL OR company_linkedin_url ~ '^https?://([a-z0-9]+\.)?linkedin\.com/');


ALTER TABLE public.recruiters DROP CONSTRAINT IF EXISTS recruiters_job_post_limit_positive;
ALTER TABLE public.recruiters
  ADD CONSTRAINT recruiters_job_post_limit_positive
    CHECK (job_post_limit > 0);

ALTER TABLE public.recruiters DROP CONSTRAINT IF EXISTS recruiters_job_post_validity_positive;
ALTER TABLE public.recruiters
  ADD CONSTRAINT recruiters_job_post_validity_positive
    CHECK (job_post_validity > 0);

ALTER TABLE public.recruiters DROP CONSTRAINT IF EXISTS recruiters_app_access_days_positive;
ALTER TABLE public.recruiters
  ADD CONSTRAINT recruiters_app_access_days_positive
    CHECK (app_access_days > 0);

ALTER TABLE public.recruiters DROP CONSTRAINT IF EXISTS recruiters_max_applies_nonneg;
ALTER TABLE public.recruiters
  ADD CONSTRAINT recruiters_max_applies_nonneg
    CHECK (max_applies_limit >= 0);

ALTER TABLE public.recruiters DROP CONSTRAINT IF EXISTS recruiters_plan_type_consistency;
ALTER TABLE public.recruiters
  ADD CONSTRAINT recruiters_plan_type_consistency
    CHECK (
      plan_type = 'none' OR is_paid = true
    );

ALTER TABLE public.recruiters DROP CONSTRAINT IF EXISTS recruiters_email_format;
ALTER TABLE public.recruiters
  ADD CONSTRAINT recruiters_email_format
    CHECK (email IS NULL OR email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$');


-- =============================================================================
-- SECTION 2: INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_company_sizes_name_lower ON public.company_sizes (lower(name));
CREATE INDEX IF NOT EXISTS idx_benefits_name_lower ON public.benefits (lower(name));
CREATE INDEX IF NOT EXISTS idx_recruiters_plan_expires_at ON public.recruiters (plan_expires_at) WHERE plan_expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_recruiters_talent_search_expires_at ON public.recruiters (talent_search_expires_at) WHERE talent_search_expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_recruiters_company_size_id ON public.recruiters (company_size_id) WHERE company_size_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_recruiters_company_domain_id ON public.recruiters (company_domain_id) WHERE company_domain_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_recruiters_plan_type ON public.recruiters (plan_type);
CREATE INDEX IF NOT EXISTS idx_recruiters_email_lower ON public.recruiters (lower(email)) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_recruiters_created_at ON public.recruiters (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recruiters_paid_active ON public.recruiters (is_paid, plan_type, plan_expires_at) WHERE is_paid = true AND plan_type <> 'none';


-- =============================================================================
-- SECTION 3: ROW LEVEL SECURITY (RLS)
-- =============================================================================

ALTER TABLE public.company_sizes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS company_sizes_read_all  ON public.company_sizes;
DROP POLICY IF EXISTS company_sizes_admin_all ON public.company_sizes;
CREATE POLICY company_sizes_read_all ON public.company_sizes FOR SELECT USING (true);
CREATE POLICY company_sizes_admin_all ON public.company_sizes FOR ALL USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.id = auth.uid()));

ALTER TABLE public.benefits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS benefits_read_all  ON public.benefits;
DROP POLICY IF EXISTS benefits_admin_all ON public.benefits;
CREATE POLICY benefits_read_all ON public.benefits FOR SELECT USING (true);
CREATE POLICY benefits_admin_all ON public.benefits FOR ALL USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.id = auth.uid()));

ALTER TABLE public.recruiters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS recruiters_select_own       ON public.recruiters;
DROP POLICY IF EXISTS recruiters_update_own       ON public.recruiters;
DROP POLICY IF EXISTS recruiters_select_jobseeker ON public.recruiters;
DROP POLICY IF EXISTS recruiters_admin_all        ON public.recruiters;
DROP POLICY IF EXISTS recruiters_insert_own       ON public.recruiters;

CREATE POLICY recruiters_select_own ON public.recruiters FOR SELECT USING (id = auth.uid());
CREATE POLICY recruiters_update_own ON public.recruiters FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY recruiters_insert_own ON public.recruiters FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY recruiters_select_jobseeker ON public.recruiters FOR SELECT USING (
  is_verified = true AND EXISTS (SELECT 1 FROM public.jobseekers js WHERE js.id = auth.uid())
);

CREATE POLICY recruiters_select_employee ON public.recruiters FOR SELECT USING (
  is_verified = true AND EXISTS (SELECT 1 FROM public.employees e WHERE e.id = auth.uid())
);

CREATE POLICY recruiters_admin_all ON public.recruiters FOR ALL USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.id = auth.uid()));


-- =============================================================================
-- SECTION 4: SAFE PUBLIC VIEW
-- =============================================================================

CREATE OR REPLACE VIEW public.recruiter_public_profile AS
SELECT
  r.id,
  r.name,
  r.company_name,
  r.company_logo,
  r.company_website,
  r.company_overview,
  r.company_address,
  r.company_linkedin_url,
  r.designation,
  r.is_verified,
  cs.name AS company_size,
  r.created_at
FROM public.recruiters r
LEFT JOIN public.company_sizes cs ON cs.id = r.company_size_id
WHERE r.is_verified = true;

GRANT SELECT ON public.recruiter_public_profile TO authenticated;


-- =============================================================================
-- SECTION 5: PLAN EXPIRY AUTO-RESET TRIGGER
-- =============================================================================

CREATE OR REPLACE FUNCTION public.reset_expired_recruiter_plan()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.plan_expires_at IS NOT NULL AND NEW.plan_expires_at < now() THEN
    NEW.is_paid          := false;
    NEW.plan_type        := 'none';
    NEW.plan_expires_at  := NULL;
    NEW.job_post_limit   := 1;
    NEW.max_applies_limit := 0;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_recruiters_plan_expiry ON public.recruiters;
CREATE TRIGGER trg_recruiters_plan_expiry
  BEFORE INSERT OR UPDATE ON public.recruiters
  FOR EACH ROW
  EXECUTE FUNCTION public.reset_expired_recruiter_plan();

COMMIT;

SELECT 'Optimizations and cleanup applied successfully' AS status;
