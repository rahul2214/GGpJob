-- SQL Migration: Add Database Performance Indexes for Scale
-- Execute this SQL script in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Indexing Jobs Table
CREATE INDEX IF NOT EXISTS idx_jobs_posted_at ON public.jobs(posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_remote_type ON public.jobs(remote_type);
CREATE INDEX IF NOT EXISTS idx_jobs_country ON public.jobs(country);
CREATE INDEX IF NOT EXISTS idx_jobs_state ON public.jobs(state);
CREATE INDEX IF NOT EXISTS idx_jobs_city ON public.jobs(city);
CREATE INDEX IF NOT EXISTS idx_jobs_recruiter_pk ON public.jobs(recruiter_pk);
CREATE INDEX IF NOT EXISTS idx_jobs_employee_pk ON public.jobs(employee_pk);
CREATE INDEX IF NOT EXISTS idx_jobs_company_verification ON public.jobs(company_verification);
CREATE INDEX IF NOT EXISTS idx_jobs_visa_sponsorship ON public.jobs(visa_sponsorship);
CREATE INDEX IF NOT EXISTS idx_jobs_salary_max ON public.jobs(salary_max DESC);

-- 2. Indexing Jobseekers Table
CREATE INDEX IF NOT EXISTS idx_jobseekers_uuid ON public.jobseekers(uuid);
CREATE INDEX IF NOT EXISTS idx_jobseekers_role_id ON public.jobseekers(role_id);

-- 3. Indexing Applications Table
CREATE INDEX IF NOT EXISTS idx_applications_jobseeker_uuid ON public.applications(jobseeker_uuid);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON public.applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status_id);
