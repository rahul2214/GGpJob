-- SQL Migration: Fix Cascading Deletes for Job Portal
-- This script ensures that deleting a user from auth.users (or their role profile) 
-- will automatically clean up all associated records in secondary tables.

-- Function to safely drop all foreign keys on a specific column
CREATE OR REPLACE FUNCTION public.drop_fks_on_column(p_table TEXT, p_column TEXT)
RETURNS void AS $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tc.constraint_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
          ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_name = p_table 
          AND kcu.column_name = p_column
    ) LOOP
        EXECUTE 'ALTER TABLE public.' || quote_ident(p_table) || ' DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 1. Payments Table
SELECT public.drop_fks_on_column('payments', 'user_id');
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_user_id_fkey;
DELETE FROM public.payments WHERE user_id NOT IN (SELECT id FROM auth.users);
ALTER TABLE public.payments ADD CONSTRAINT payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


-- 2. Personal Details
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jobseeker_personal_details') THEN
        PERFORM public.drop_fks_on_column('jobseeker_personal_details', 'user_pk');
        ALTER TABLE public.jobseeker_personal_details DROP CONSTRAINT IF EXISTS jobseeker_personal_details_user_pk_fkey;
        DELETE FROM public.jobseeker_personal_details WHERE user_pk NOT IN (SELECT id FROM public.jobseekers);
        ALTER TABLE public.jobseeker_personal_details ADD CONSTRAINT jobseeker_personal_details_user_pk_fkey FOREIGN KEY (user_pk) REFERENCES public.jobseekers(id) ON DELETE CASCADE;
    END IF;
END $$;


-- 3. Education
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'education') THEN
        PERFORM public.drop_fks_on_column('education', 'user_pk');
        ALTER TABLE public.education DROP CONSTRAINT IF EXISTS education_user_pk_fkey;
        DELETE FROM public.education WHERE user_pk NOT IN (SELECT id FROM public.jobseekers);
        ALTER TABLE public.education ADD CONSTRAINT education_user_pk_fkey FOREIGN KEY (user_pk) REFERENCES public.jobseekers(id) ON DELETE CASCADE;
    END IF;
END $$;


-- 4. Experience
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'experience') THEN
        PERFORM public.drop_fks_on_column('experience', 'user_pk');
        ALTER TABLE public.experience DROP CONSTRAINT IF EXISTS experience_user_pk_fkey;
        DELETE FROM public.experience WHERE user_pk NOT IN (SELECT id FROM public.jobseekers);
        ALTER TABLE public.experience ADD CONSTRAINT experience_user_pk_fkey FOREIGN KEY (user_pk) REFERENCES public.jobseekers(id) ON DELETE CASCADE;
    END IF;
END $$;


-- 5. Projects
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects') THEN
        PERFORM public.drop_fks_on_column('projects', 'user_pk');
        ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_user_pk_fkey;
        DELETE FROM public.projects WHERE user_pk NOT IN (SELECT id FROM public.jobseekers);
        ALTER TABLE public.projects ADD CONSTRAINT projects_user_pk_fkey FOREIGN KEY (user_pk) REFERENCES public.jobseekers(id) ON DELETE CASCADE;
    END IF;
END $$;


-- 6. Languages
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'languages') THEN
        PERFORM public.drop_fks_on_column('languages', 'user_pk');
        ALTER TABLE public.languages DROP CONSTRAINT IF EXISTS languages_user_pk_fkey;
        DELETE FROM public.languages WHERE user_pk NOT IN (SELECT id FROM public.jobseekers);
        ALTER TABLE public.languages ADD CONSTRAINT languages_user_pk_fkey FOREIGN KEY (user_pk) REFERENCES public.jobseekers(id) ON DELETE CASCADE;
    END IF;
END $$;


-- 7. Jobseeker Skills
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jobseeker_skills') THEN
        PERFORM public.drop_fks_on_column('jobseeker_skills', 'user_pk');
        ALTER TABLE public.jobseeker_skills DROP CONSTRAINT IF EXISTS jobseeker_skills_user_pk_fkey;
        DELETE FROM public.jobseeker_skills WHERE user_pk NOT IN (SELECT id FROM public.jobseekers);
        ALTER TABLE public.jobseeker_skills ADD CONSTRAINT jobseeker_skills_user_pk_fkey FOREIGN KEY (user_pk) REFERENCES public.jobseekers(id) ON DELETE CASCADE;
    END IF;
END $$;


-- 8. Portal Feedback
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'portal_feedback') THEN
        PERFORM public.drop_fks_on_column('portal_feedback', 'user_id');
        ALTER TABLE public.portal_feedback DROP CONSTRAINT IF EXISTS portal_feedback_user_id_fkey;
        DELETE FROM public.portal_feedback WHERE user_id NOT IN (SELECT id FROM auth.users);
        ALTER TABLE public.portal_feedback ADD CONSTRAINT portal_feedback_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;


-- 9. Applications Table
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'applications') THEN
        PERFORM public.drop_fks_on_column('applications', 'user_pk');
        PERFORM public.drop_fks_on_column('applications', 'job_id');
        
        ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS applications_user_pk_fkey;
        ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS applications_job_id_fkey;
        
        DELETE FROM public.applications WHERE user_pk NOT IN (SELECT id FROM public.jobseekers);

        ALTER TABLE public.applications ADD CONSTRAINT applications_user_pk_fkey FOREIGN KEY (user_pk) REFERENCES public.jobseekers(id) ON DELETE CASCADE;
        ALTER TABLE public.applications ADD CONSTRAINT applications_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;
    END IF;
END $$;


-- 10. Jobs Table (Recruiters & Employees)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jobs') THEN
        -- Fix recruiter_id (UUID)
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'recruiter_id') THEN
            PERFORM public.drop_fks_on_column('jobs', 'recruiter_id');
            ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_recruiter_id_fkey;
            ALTER TABLE public.jobs ADD CONSTRAINT jobs_recruiter_id_fkey FOREIGN KEY (recruiter_id) REFERENCES public.recruiters(uuid) ON DELETE CASCADE;
        END IF;

        -- Fix recruiter_pk (BIGINT)
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'recruiter_pk') THEN
            PERFORM public.drop_fks_on_column('jobs', 'recruiter_pk');
            ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_recruiter_pk_fkey;
            ALTER TABLE public.jobs ADD CONSTRAINT jobs_recruiter_pk_fkey FOREIGN KEY (recruiter_pk) REFERENCES public.recruiters(id) ON DELETE CASCADE;
        END IF;

        -- Fix employee_pk (BIGINT)
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'employee_pk') THEN
            PERFORM public.drop_fks_on_column('jobs', 'employee_pk');
            ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_employee_pk_fkey;
            ALTER TABLE public.jobs ADD CONSTRAINT jobs_employee_pk_fkey FOREIGN KEY (employee_pk) REFERENCES public.employees(id) ON DELETE CASCADE;
        END IF;
    END IF;
END $$;


-- 11. Role Tables (Ensuring they cascade from auth.users)
DO $$ BEGIN
    -- jobseekers
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jobseekers') THEN
        PERFORM public.drop_fks_on_column('jobseekers', 'uuid');
        ALTER TABLE public.jobseekers DROP CONSTRAINT IF EXISTS jobseekers_uuid_fkey;
        ALTER TABLE public.jobseekers ADD CONSTRAINT jobseekers_uuid_fkey FOREIGN KEY (uuid) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    -- recruiters
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'recruiters') THEN
        PERFORM public.drop_fks_on_column('recruiters', 'uuid');
        ALTER TABLE public.recruiters DROP CONSTRAINT IF EXISTS recruiters_uuid_fkey;
        ALTER TABLE public.recruiters ADD CONSTRAINT recruiters_uuid_fkey FOREIGN KEY (uuid) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    -- employees
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'employees') THEN
        PERFORM public.drop_fks_on_column('employees', 'uuid');
        ALTER TABLE public.employees DROP CONSTRAINT IF EXISTS employees_uuid_fkey;
        ALTER TABLE public.employees ADD CONSTRAINT employees_uuid_fkey FOREIGN KEY (uuid) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    -- admins
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admins') THEN
        PERFORM public.drop_fks_on_column('admins', 'uuid');
        ALTER TABLE public.admins DROP CONSTRAINT IF EXISTS admins_uuid_fkey;
        ALTER TABLE public.admins ADD CONSTRAINT admins_uuid_fkey FOREIGN KEY (uuid) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

DROP FUNCTION IF EXISTS public.drop_fks_on_column(TEXT, TEXT);

NOTIFY pgrst, 'reload schema';
