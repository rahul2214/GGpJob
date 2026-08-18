-- ============================================
-- MIGRATION: SEPARATE TABLES FOR ACHIEVEMENTS & CERTIFICATIONS
-- ============================================

-- 1. JOBSEEKER ACHIEVEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.jobseeker_achievements (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    jobseeker_id bigint NULL REFERENCES public.jobseekers(id) ON DELETE CASCADE,
    jobseeker_uuid uuid NULL REFERENCES public.jobseekers(uuid) ON DELETE CASCADE,
    title text NOT NULL,
    description text NULL,
    issuer text NULL,
    date_achieved timestamptz NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_jobseeker_achievements_jobseeker_id ON public.jobseeker_achievements(jobseeker_id);
CREATE INDEX IF NOT EXISTS idx_jobseeker_achievements_jobseeker_uuid ON public.jobseeker_achievements(jobseeker_uuid);

-- 2. JOBSEEKER CERTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.jobseeker_certifications (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    jobseeker_id bigint NULL REFERENCES public.jobseekers(id) ON DELETE CASCADE,
    jobseeker_uuid uuid NULL REFERENCES public.jobseekers(uuid) ON DELETE CASCADE,
    name text NOT NULL,
    issuing_organization text NULL,
    issue_date timestamptz NULL,
    expiration_date timestamptz NULL,
    credential_id text NULL,
    credential_url text NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_jobseeker_certifications_jobseeker_id ON public.jobseeker_certifications(jobseeker_id);
CREATE INDEX IF NOT EXISTS idx_jobseeker_certifications_jobseeker_uuid ON public.jobseeker_certifications(jobseeker_uuid);
