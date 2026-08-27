-- ====================================================================
-- JobsDart: Comprehensive Row Level Security (RLS) Migration
-- Run this SQL in your Supabase SQL Editor to secure all database tables
-- ====================================================================

-- 1. Enable Row Level Security (RLS) on all public tables
ALTER TABLE IF EXISTS public.jobseekers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.recruiters ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.plan_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.jobseeker_personal_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.jobseeker_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.education ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.jobseeker_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.jobseeker_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.jobseeker_preferred_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.job_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.workplace_types ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to prevent naming collisions
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
    END LOOP;
END $$;

-- 3. Public Read-Only Lookup Tables Policies
CREATE POLICY "Public can read domains" ON public.domains FOR SELECT USING (true);
CREATE POLICY "Public can read locations" ON public.locations FOR SELECT USING (true);
CREATE POLICY "Public can read skills" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Public can read job_types" ON public.job_types FOR SELECT USING (true);
CREATE POLICY "Public can read workplace_types" ON public.workplace_types FOR SELECT USING (true);
CREATE POLICY "Public can read plan_prices" ON public.plan_prices FOR SELECT USING (true);

-- 4. Jobs Policies: Public can read active jobs; Recruiters/Employees can manage their own
CREATE POLICY "Public can view active jobs" ON public.jobs 
    FOR SELECT USING (status = 'active' OR is_deleted = false);

CREATE POLICY "Recruiters and Employees can insert jobs" ON public.jobs 
    FOR INSERT TO authenticated 
    WITH CHECK (true);

CREATE POLICY "Job owners can update their jobs" ON public.jobs 
    FOR UPDATE TO authenticated 
    USING (
        auth.uid()::text = (SELECT uuid FROM public.recruiters WHERE id = recruiter_pk)::text OR
        auth.uid()::text = (SELECT uuid FROM public.employees WHERE id = employee_pk)::text
    );

-- 5. Jobseekers Profile Policies
CREATE POLICY "Jobseekers can view own profile" ON public.jobseekers 
    FOR SELECT TO authenticated 
    USING (auth.uid() = uuid);

CREATE POLICY "Jobseekers can update own profile" ON public.jobseekers 
    FOR UPDATE TO authenticated 
    USING (auth.uid() = uuid);

-- 6. Recruiters Profile Policies
CREATE POLICY "Recruiters can view own profile" ON public.recruiters 
    FOR SELECT TO authenticated 
    USING (auth.uid() = uuid);

CREATE POLICY "Recruiters can update own profile" ON public.recruiters 
    FOR UPDATE TO authenticated 
    USING (auth.uid() = uuid);

-- 7. Employees Profile Policies
CREATE POLICY "Employees can view own profile" ON public.employees 
    FOR SELECT TO authenticated 
    USING (auth.uid() = uuid);

CREATE POLICY "Employees can update own profile" ON public.employees 
    FOR UPDATE TO authenticated 
    USING (auth.uid() = uuid);

-- 8. Admins Table: No public or standard user access. Service role only.
CREATE POLICY "Admins viewable by admins" ON public.admins 
    FOR SELECT TO authenticated 
    USING (auth.uid() = uuid);

-- 9. Applications Policies: Candidate can view/create own applications; Job poster can view applications
CREATE POLICY "Jobseekers can view own applications" ON public.applications 
    FOR SELECT TO authenticated 
    USING (
        auth.uid()::text = (SELECT uuid FROM public.jobseekers WHERE id = user_pk)::text
    );

CREATE POLICY "Job posters can view applications for their jobs" ON public.applications 
    FOR SELECT TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.jobs j
            WHERE j.id = job_pk AND (
                auth.uid()::text = (SELECT uuid FROM public.recruiters WHERE id = j.recruiter_pk)::text OR
                auth.uid()::text = (SELECT uuid FROM public.employees WHERE id = j.employee_pk)::text
            )
        )
    );

CREATE POLICY "Jobseekers can submit applications" ON public.applications 
    FOR INSERT TO authenticated 
    WITH CHECK (
        auth.uid()::text = (SELECT uuid FROM public.jobseekers WHERE id = user_pk)::text
    );

-- 10. Payments Policies: Users can view their own payment transactions
CREATE POLICY "Users can view own payments" ON public.payments 
    FOR SELECT TO authenticated 
    USING (auth.uid()::text = user_id::text);

-- 11. Notifications Policies: Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON public.notifications 
    FOR SELECT TO authenticated 
    USING (
        auth.uid()::text = (SELECT uuid FROM public.jobseekers WHERE id = user_pk)::text OR
        auth.uid()::text = (SELECT uuid FROM public.recruiters WHERE id = user_pk)::text OR
        auth.uid()::text = (SELECT uuid FROM public.employees WHERE id = user_pk)::text
    );

CREATE POLICY "Users can update own notifications" ON public.notifications 
    FOR UPDATE TO authenticated 
    USING (
        auth.uid()::text = (SELECT uuid FROM public.jobseekers WHERE id = user_pk)::text OR
        auth.uid()::text = (SELECT uuid FROM public.recruiters WHERE id = user_pk)::text OR
        auth.uid()::text = (SELECT uuid FROM public.employees WHERE id = user_pk)::text
    );

-- 12. Profile Sub-tables Policies (Education, Experience, Projects, Skills, etc.)
CREATE POLICY "Jobseekers can manage own education" ON public.education 
    FOR ALL TO authenticated 
    USING (auth.uid()::text = (SELECT uuid FROM public.jobseekers WHERE id = user_pk)::text);

CREATE POLICY "Jobseekers can manage own experience" ON public.experience 
    FOR ALL TO authenticated 
    USING (auth.uid()::text = (SELECT uuid FROM public.jobseekers WHERE id = user_pk)::text);

CREATE POLICY "Jobseekers can manage own projects" ON public.projects 
    FOR ALL TO authenticated 
    USING (auth.uid()::text = (SELECT uuid FROM public.jobseekers WHERE id = user_pk)::text);

CREATE POLICY "Jobseekers can manage own languages" ON public.languages 
    FOR ALL TO authenticated 
    USING (auth.uid()::text = (SELECT uuid FROM public.jobseekers WHERE id = user_pk)::text);

CREATE POLICY "Jobseekers can manage own skills" ON public.jobseeker_skills 
    FOR ALL TO authenticated 
    USING (auth.uid()::text = (SELECT uuid FROM public.jobseekers WHERE id = user_pk)::text);

CREATE POLICY "Jobseekers can manage own personal details" ON public.jobseeker_personal_details 
    FOR ALL TO authenticated 
    USING (auth.uid()::text = (SELECT uuid FROM public.jobseekers WHERE id = user_pk)::text);
