-- SQL Migration: Add International Refactored Columns to jobs Table
-- Execute this SQL script in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS state text;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS latitude numeric;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS longitude numeric;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS remote_type varchar(20) DEFAULT 'onsite';
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS employment_type varchar(50) DEFAULT 'Full-time';
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS salary_min numeric;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS salary_max numeric;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS salary_currency varchar(10) DEFAULT 'INR';
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS experience_min numeric DEFAULT 0;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS experience_max numeric DEFAULT 30;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS required_skills text[] DEFAULT '{}';
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS industry text;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS job_function text;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS visa_sponsorship boolean DEFAULT false;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS work_authorization_requirement text[] DEFAULT '{}';
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS languages text[] DEFAULT '{}';
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS posted_at timestamptz DEFAULT now();
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS expires_at timestamptz;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS company_verification boolean DEFAULT false;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS company_rating numeric DEFAULT 5.0;
