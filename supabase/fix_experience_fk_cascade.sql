-- ==============================================================================
-- Migration: Add ON DELETE CASCADE to Experience & Jobseeker Child Tables
-- ==============================================================================
-- This script fixes foreign key constraint errors when deleting jobseekers 
-- by ensuring all related child tables automatically cascade upon row deletion.

-- 1. Experience Table
ALTER TABLE public.experience 
DROP CONSTRAINT IF EXISTS experience_user_pk_fkey;

ALTER TABLE public.experience 
ADD CONSTRAINT experience_user_pk_fkey 
FOREIGN KEY (user_pk) 
REFERENCES public.jobseekers(id) 
ON DELETE CASCADE;


-- 2. Education Table
ALTER TABLE public.education 
DROP CONSTRAINT IF EXISTS education_user_pk_fkey;

ALTER TABLE public.education 
ADD CONSTRAINT education_user_pk_fkey 
FOREIGN KEY (user_pk) 
REFERENCES public.jobseekers(id) 
ON DELETE CASCADE;


-- 3. Projects Table
ALTER TABLE public.projects 
DROP CONSTRAINT IF EXISTS projects_user_pk_fkey;

ALTER TABLE public.projects 
ADD CONSTRAINT projects_user_pk_fkey 
FOREIGN KEY (user_pk) 
REFERENCES public.jobseekers(id) 
ON DELETE CASCADE;


-- 4. Jobseeker Skills Table
ALTER TABLE public.jobseeker_skills 
DROP CONSTRAINT IF EXISTS jobseeker_skills_user_pk_fkey;

ALTER TABLE public.jobseeker_skills 
ADD CONSTRAINT jobseeker_skills_user_pk_fkey 
FOREIGN KEY (user_pk) 
REFERENCES public.jobseekers(id) 
ON DELETE CASCADE;


-- 5. Languages Table
ALTER TABLE public.languages 
DROP CONSTRAINT IF EXISTS languages_user_pk_fkey;

ALTER TABLE public.languages 
ADD CONSTRAINT languages_user_pk_fkey 
FOREIGN KEY (user_pk) 
REFERENCES public.jobseekers(id) 
ON DELETE CASCADE;


-- 6. Jobseeker Personal Details (if table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jobseeker_personal_details') THEN
        ALTER TABLE public.jobseeker_personal_details 
        DROP CONSTRAINT IF EXISTS jobseeker_personal_details_user_pk_fkey;

        ALTER TABLE public.jobseeker_personal_details 
        ADD CONSTRAINT jobseeker_personal_details_user_pk_fkey 
        FOREIGN KEY (user_pk) 
        REFERENCES public.jobseekers(id) 
        ON DELETE CASCADE;
    END IF;
END $$;


-- 7. Certifications & Achievements (if tables exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'certifications') THEN
        ALTER TABLE public.certifications 
        DROP CONSTRAINT IF EXISTS certifications_user_pk_fkey;

        ALTER TABLE public.certifications 
        ADD CONSTRAINT certifications_user_pk_fkey 
        FOREIGN KEY (user_pk) 
        REFERENCES public.jobseekers(id) 
        ON DELETE CASCADE;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'achievements') THEN
        ALTER TABLE public.achievements 
        DROP CONSTRAINT IF EXISTS achievements_user_pk_fkey;

        ALTER TABLE public.achievements 
        ADD CONSTRAINT achievements_user_pk_fkey 
        FOREIGN KEY (user_pk) 
        REFERENCES public.jobseekers(id) 
        ON DELETE CASCADE;
    END IF;
END $$;


-- 8. Applications Table
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'applications') THEN
        ALTER TABLE public.applications 
        DROP CONSTRAINT IF EXISTS applications_user_pk_fkey;

        ALTER TABLE public.applications 
        ADD CONSTRAINT applications_user_pk_fkey 
        FOREIGN KEY (user_pk) 
        REFERENCES public.jobseekers(id) 
        ON DELETE CASCADE;
    END IF;
END $$;


-- 9. Saved Jobs Table
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'saved_jobs') THEN
        ALTER TABLE public.saved_jobs 
        DROP CONSTRAINT IF EXISTS saved_jobs_user_pk_fkey;

        ALTER TABLE public.saved_jobs 
        ADD CONSTRAINT saved_jobs_user_pk_fkey 
        FOREIGN KEY (user_pk) 
        REFERENCES public.jobseekers(id) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- 10. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
