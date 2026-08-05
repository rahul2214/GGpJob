-- SQL Migration: Add International Profile Columns to jobseekers Table
-- Execute this SQL script in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

ALTER TABLE public.jobseekers ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE public.jobseekers ADD COLUMN IF NOT EXISTS state text;
ALTER TABLE public.jobseekers ADD COLUMN IF NOT EXISTS current_city text;
ALTER TABLE public.jobseekers ADD COLUMN IF NOT EXISTS preferred_job_titles text[] DEFAULT '{}';
ALTER TABLE public.jobseekers ADD COLUMN IF NOT EXISTS preferred_salary_min numeric;
ALTER TABLE public.jobseekers ADD COLUMN IF NOT EXISTS preferred_salary_max numeric;
ALTER TABLE public.jobseekers ADD COLUMN IF NOT EXISTS preferred_currency varchar(10) DEFAULT 'INR';
ALTER TABLE public.jobseekers ADD COLUMN IF NOT EXISTS remote_preference varchar(20) DEFAULT 'any';
ALTER TABLE public.jobseekers ADD COLUMN IF NOT EXISTS employment_types text[] DEFAULT '{}';
ALTER TABLE public.jobseekers ADD COLUMN IF NOT EXISTS preferred_industries text[] DEFAULT '{}';
ALTER TABLE public.jobseekers ADD COLUMN IF NOT EXISTS open_to_relocate boolean DEFAULT false;
ALTER TABLE public.jobseekers ADD COLUMN IF NOT EXISTS open_worldwide boolean DEFAULT false;
ALTER TABLE public.jobseekers ADD COLUMN IF NOT EXISTS work_authorization text[] DEFAULT '{}';
ALTER TABLE public.jobseekers ADD COLUMN IF NOT EXISTS visa_requirement text;
ALTER TABLE public.jobseekers ADD COLUMN IF NOT EXISTS preferred_languages text[] DEFAULT '{}';
