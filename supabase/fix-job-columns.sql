-- ============================================================
-- SQL MIGRATION: Fix Job Columns Persistence
-- Purpose: Ensure the 'jobs' table has all necessary columns for 
--          vacancies, sections, salary ranges, and experience.
-- Run this in your Supabase SQL Editor.
-- ============================================================

-- 1. Add missing numeric and text columns
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS salary_min INTEGER,
ADD COLUMN IF NOT EXISTS salary_max INTEGER,
ADD COLUMN IF NOT EXISTS experience_min INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS experience_max INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS role TEXT,
ADD COLUMN IF NOT EXISTS vacancies INTEGER DEFAULT 1;

-- 2. Add array and JSONB columns
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS skill_ids UUID[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS sections JSONB DEFAULT '[]';

-- 3. Add Consultancy/Recruiter Profile Fields
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS company_size_id UUID, -- Note: Link manually if company_sizes table exists
ADD COLUMN IF NOT EXISTS company_linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS company_overview TEXT,
ADD COLUMN IF NOT EXISTS company_website TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS is_consultancy BOOLEAN DEFAULT FALSE;

-- 4. Set default for boolean column
ALTER TABLE public.jobs ALTER COLUMN is_consultancy SET DEFAULT FALSE;

-- 5. Clear Supabase Schema Cache
NOTIFY pgrst, 'reload schema';

-- Output confirmation
SELECT 'Job columns updated successfully' AS status;
