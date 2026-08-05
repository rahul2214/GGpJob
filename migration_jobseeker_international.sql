-- Migration: Add International Profile Columns to Jobseekers Table

ALTER TABLE jobseekers ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE jobseekers ADD COLUMN IF NOT EXISTS state text;
ALTER TABLE jobseekers ADD COLUMN IF NOT EXISTS current_city text;
ALTER TABLE jobseekers ADD COLUMN IF NOT EXISTS preferred_job_titles text[] DEFAULT '{}';
ALTER TABLE jobseekers ADD COLUMN IF NOT EXISTS preferred_salary_min numeric;
ALTER TABLE jobseekers ADD COLUMN IF NOT EXISTS preferred_salary_max numeric;
ALTER TABLE jobseekers ADD COLUMN IF NOT EXISTS preferred_currency varchar(10) DEFAULT 'INR';
ALTER TABLE jobseekers ADD COLUMN IF NOT EXISTS remote_preference varchar(20) DEFAULT 'any';
ALTER TABLE jobseekers ADD COLUMN IF NOT EXISTS employment_types text[] DEFAULT '{}';
ALTER TABLE jobseekers ADD COLUMN IF NOT EXISTS preferred_industries text[] DEFAULT '{}';
ALTER TABLE jobseekers ADD COLUMN IF NOT EXISTS open_to_relocate boolean DEFAULT false;
ALTER TABLE jobseekers ADD COLUMN IF NOT EXISTS open_worldwide boolean DEFAULT false;
ALTER TABLE jobseekers ADD COLUMN IF NOT EXISTS work_authorization text[] DEFAULT '{}';
ALTER TABLE jobseekers ADD COLUMN IF NOT EXISTS visa_requirement text;
ALTER TABLE jobseekers ADD COLUMN IF NOT EXISTS preferred_languages text[] DEFAULT '{}';
