-- Migration: Rename job_post_reset_at to next_jobs_reset_at and update index

ALTER TABLE public.employees 
RENAME COLUMN job_post_reset_at TO next_jobs_reset_at;

-- Update column comment
COMMENT ON COLUMN public.employees.next_jobs_reset_at IS 'Timestamp (1st of next month) when the monthly job posting quota will reset to 0';

-- Rename the index if supported or drop/recreate
DROP INDEX IF EXISTS idx_employees_job_post_reset;
CREATE INDEX IF NOT EXISTS idx_employees_next_jobs_reset ON public.employees USING btree (next_jobs_reset_at);

-- Initialize next_jobs_reset_at for existing records to 1st of next month
UPDATE public.employees 
SET next_jobs_reset_at = date_trunc('month', now() + interval '1 month')
WHERE next_jobs_reset_at <= now() OR next_jobs_reset_at IS NULL;
