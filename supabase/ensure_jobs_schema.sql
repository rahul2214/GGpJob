-- ============================================================
-- SQL MIGRATION: Ensure Jobs Table Schema for Referrals
-- Purpose: Add missing PK columns for User roles and Referral links
-- ============================================================

-- 1. Ensure job_role exists (Standardizing from 'role' or adding new)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='jobs' AND column_name='role') THEN
        ALTER TABLE public.jobs RENAME COLUMN role TO job_role;
    ELSE
        ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS job_role TEXT;
    END IF;
END $$;

-- 2. Add numeric PK columns for Performance Joins (Hybrid ID System)
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS recruiter_pk BIGINT REFERENCES public.recruiters(id);
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS employee_pk BIGINT REFERENCES public.employees(id);

-- 3. Add Referral and Meta fields
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS job_link TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS vacancies INTEGER DEFAULT 1;

-- 4. Ensure array PK columns exist (From Phase 2 fallback)
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS location_pks BIGINT[] DEFAULT '{}';
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS skill_pks BIGINT[] DEFAULT '{}';
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS benefit_ids BIGINT[] DEFAULT '{}';

-- 5. Clear Supabase Schema Cache
NOTIFY pgrst, 'reload schema';

-- Output confirmation
SELECT 'Job schema ensured' AS status;
