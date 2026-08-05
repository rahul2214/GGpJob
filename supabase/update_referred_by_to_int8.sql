-- Migration: Change referred_by column to BIGINT (int8) referencing jobseekers(id)
-- Drop the existing referred_by column and any dependent constraints cascade
ALTER TABLE public.jobseekers DROP COLUMN IF EXISTS referred_by CASCADE;

-- Re-add referred_by as BIGINT referencing public.jobseekers(id)
ALTER TABLE public.jobseekers ADD COLUMN referred_by BIGINT REFERENCES public.jobseekers(id);

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
