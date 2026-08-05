-- Migration: Add monthly job posting quota tracking columns to employees table
-- This allows precise tracking and monthly resetting of employee job postings.

ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS jobs_posted_this_month integer null default 0,
ADD COLUMN IF NOT EXISTS job_post_reset_at timestamp with time zone null default now();

-- Documentation comments
COMMENT ON COLUMN public.employees.jobs_posted_this_month IS 'Tracks number of jobs posted by the employee in the current calendar month';
COMMENT ON COLUMN public.employees.job_post_reset_at IS 'Timestamp when the monthly job posting quota was last reset';

-- Create an index to optimize monthly reset checks
CREATE INDEX IF NOT EXISTS idx_employees_job_post_reset ON public.employees USING btree (job_post_reset_at);
