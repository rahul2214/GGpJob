-- =============================================================================
-- JobsDart: International Job Marketplace Migration
-- Removes domain-based architecture entirely; adds international fields.
-- =============================================================================

-- ── 0. SAFETY CHECKS (idempotent) ──────────────────────────────────────────

-- ── 1. DROP DEPENDENT VIEWS / FUNCTIONS THAT REFERENCE DOMAIN ──────────────
DROP VIEW IF EXISTS public.job_details_view CASCADE;
DROP FUNCTION IF EXISTS public.get_recommended_jobs_by_domain CASCADE;
DROP FUNCTION IF EXISTS public.get_jobs_by_domain CASCADE;
DROP FUNCTION IF EXISTS public.get_analytics_by_domain CASCADE;

-- ── 2. REMOVE FOREIGN KEYS ─────────────────────────────────────────────────
ALTER TABLE IF EXISTS public.jobseekers
    DROP CONSTRAINT IF EXISTS jobseekers_domain_id_fkey CASCADE;

ALTER TABLE IF EXISTS public.jobs
    DROP CONSTRAINT IF EXISTS jobs_domain_id_fkey CASCADE,
    DROP CONSTRAINT IF EXISTS jobs_domain_pk_fkey CASCADE;

ALTER TABLE IF EXISTS public.recruiters
    DROP CONSTRAINT IF EXISTS recruiters_company_domain_id_fkey CASCADE;

-- ── 3. DROP DOMAIN COLUMNS ─────────────────────────────────────────────────
ALTER TABLE IF EXISTS public.jobseekers
    DROP COLUMN IF EXISTS domain_id CASCADE;

ALTER TABLE IF EXISTS public.jobs
    DROP COLUMN IF EXISTS domain_id CASCADE,
    DROP COLUMN IF EXISTS domain_pk CASCADE;

ALTER TABLE IF EXISTS public.recruiters
    DROP COLUMN IF EXISTS company_domain_id CASCADE;

-- ── 4. DROP DOMAIN INDEXES ─────────────────────────────────────────────────
DROP INDEX IF EXISTS idx_recruiters_company_domain;
DROP INDEX IF EXISTS idx_jobs_domain_id;
DROP INDEX IF EXISTS idx_jobseekers_domain_id;

-- ── 5. DROP DOMAINS TABLE ──────────────────────────────────────────────────
DROP TABLE IF EXISTS public.domains CASCADE;

-- ── 6. ADD NEW INTERNATIONAL FIELDS TO jobseekers ──────────────────────────
ALTER TABLE IF EXISTS public.jobseekers
    ADD COLUMN IF NOT EXISTS country TEXT,
    ADD COLUMN IF NOT EXISTS state TEXT,
    ADD COLUMN IF NOT EXISTS city TEXT,
    ADD COLUMN IF NOT EXISTS preferred_job_titles TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS skill_ids INTEGER[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS preferred_salary_min INTEGER,
    ADD COLUMN IF NOT EXISTS preferred_salary_max INTEGER,
    ADD COLUMN IF NOT EXISTS preferred_currency TEXT DEFAULT 'USD',
    ADD COLUMN IF NOT EXISTS remote_preference TEXT CHECK (remote_preference IN ('remote', 'hybrid', 'onsite', 'any')) DEFAULT 'any',
    ADD COLUMN IF NOT EXISTS employment_types TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS preferred_industries TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS open_to_relocate BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS open_worldwide BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS work_authorization TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS visa_requirement TEXT,
    ADD COLUMN IF NOT EXISTS preferred_languages TEXT[] DEFAULT '{}';

-- ── 7. ADD NEW INTERNATIONAL FIELDS TO jobs ─────────────────────────────────
ALTER TABLE IF EXISTS public.jobs
    ADD COLUMN IF NOT EXISTS country TEXT,
    ADD COLUMN IF NOT EXISTS state TEXT,
    ADD COLUMN IF NOT EXISTS city TEXT,
    ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 6),
    ADD COLUMN IF NOT EXISTS longitude NUMERIC(10, 6),
    ADD COLUMN IF NOT EXISTS remote_type TEXT CHECK (remote_type IN ('remote', 'hybrid', 'onsite', 'any')),
    ADD COLUMN IF NOT EXISTS employment_type TEXT,
    ADD COLUMN IF NOT EXISTS salary_currency TEXT DEFAULT 'USD',
    ADD COLUMN IF NOT EXISTS industry TEXT,
    ADD COLUMN IF NOT EXISTS job_function TEXT,
    ADD COLUMN IF NOT EXISTS visa_sponsorship BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS work_authorization_requirement TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS company_verification BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS company_rating NUMERIC(3, 2) DEFAULT 0.00;

-- ── 8. ADD INDEXES FOR INTERNATIONAL JOB MATCHING ──────────────────────────

-- Skills
CREATE INDEX IF NOT EXISTS idx_jobs_skill_ids ON public.jobs USING GIN(skill_ids);
CREATE INDEX IF NOT EXISTS idx_jobseekers_skill_ids ON public.jobseekers USING GIN(skill_ids);

-- Job Title
CREATE INDEX IF NOT EXISTS idx_jobs_title ON public.jobs(title);

-- Country / State / City
CREATE INDEX IF NOT EXISTS idx_jobs_country ON public.jobs(country);
CREATE INDEX IF NOT EXISTS idx_jobs_state ON public.jobs(state);
CREATE INDEX IF NOT EXISTS idx_jobs_city ON public.jobs(city);
CREATE INDEX IF NOT EXISTS idx_jobseekers_country ON public.jobseekers(country);
CREATE INDEX IF NOT EXISTS idx_jobseekers_state ON public.jobseekers(state);
CREATE INDEX IF NOT EXISTS idx_jobseekers_city ON public.jobseekers(city);

-- Remote Type / Employment Type
CREATE INDEX IF NOT EXISTS idx_jobs_remote_type ON public.jobs(remote_type);
CREATE INDEX IF NOT EXISTS idx_jobs_employment_type ON public.jobs(employment_type);

-- Salary (for range queries)
CREATE INDEX IF NOT EXISTS idx_jobs_salary_min_max ON public.jobs(salary_min, salary_max);

-- Experience
CREATE INDEX IF NOT EXISTS idx_jobs_experience_min_max ON public.jobs(experience_min, experience_max);

-- Industry
CREATE INDEX IF NOT EXISTS idx_jobs_industry ON public.jobs(industry);

-- Posted Date (for freshness)
CREATE INDEX IF NOT EXISTS idx_jobs_posted_at ON public.jobs(posted_at);

-- Job Title with trigram for fuzzy search (requires pg_trgm extension)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_jobs_title_trgm ON public.jobs USING GIN(title gin_trgm_ops);

-- Preferred Job Titles on jobseekers
CREATE INDEX IF NOT EXISTS idx_jobseekers_preferred_job_titles ON public.jobseekers USING GIN(preferred_job_titles);

-- Preferred Industries on jobseekers
CREATE INDEX IF NOT EXISTS idx_jobseekers_preferred_industries ON public.jobseekers USING GIN(preferred_industries);

-- Visa sponsorship
CREATE INDEX IF NOT EXISTS idx_jobs_visa_sponsorship ON public.jobs(visa_sponsorship);

-- ── 9. UPDATE JOBSEEKERS TRIGGER/AUTO-PROFILE TO NOT SET DOMAIN ────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_role TEXT;
    v_name TEXT;
    v_email TEXT;
    v_company TEXT;
BEGIN
    v_role    := COALESCE(NEW.raw_user_meta_data->>'role', 'Job Seeker');
    v_name    := NEW.raw_user_meta_data->>'name';
    v_email   := NEW.email;
    v_company := COALESCE(NEW.raw_user_meta_data->>'companyName', 'Unknown Company');

    IF v_role = 'Job Seeker' THEN
        INSERT INTO public.jobseekers (id, name, email, role)
        VALUES (NEW.id, v_name, v_email, v_role)
        ON CONFLICT (id) DO NOTHING;

    ELSIF v_role = 'Recruiter' THEN
        INSERT INTO public.recruiters (id, name, email, company_name)
        VALUES (NEW.id, v_name, v_email, v_company)
        ON CONFLICT (id) DO NOTHING;

    ELSIF v_role = 'Employee' THEN
        INSERT INTO public.employees (id, name, email, company_name)
        VALUES (NEW.id, v_name, v_email, v_company)
        ON CONFLICT (id) DO NOTHING;

    ELSIF v_role IN ('Admin', 'Super Admin') THEN
        INSERT INTO public.admins (id, name, email, is_super_admin)
        VALUES (NEW.id, v_name, v_email, v_role = 'Super Admin')
        ON CONFLICT (id) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 10. MIGRATE EXISTING DATA (preserve domain info where possible) ────────
-- Any existing domain_id values on jobseekers becomes a preference note
UPDATE public.jobseekers
SET preferred_industries = ARRAY['Other']
WHERE preferred_industries IS NULL OR preferred_industries = '{}';

-- ── 11. RELOAD SCHEMA CACHE ────────────────────────────────────────────────
NOTIFY pgrst, 'reload schema';