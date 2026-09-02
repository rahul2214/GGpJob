-- SQL Migration: Create notice_periods table and add notice_period_id to jobseekers table
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- 1. Create table public.notice_periods
CREATE TABLE IF NOT EXISTS public.notice_periods (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  uuid uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  days integer NULL,
  display_order integer NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notice_periods ENABLE ROW LEVEL SECURITY;

-- Allow public read access to notice_periods
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'notice_periods' AND policyname = 'Allow public read notice_periods'
  ) THEN
    CREATE POLICY "Allow public read notice_periods" ON public.notice_periods FOR SELECT USING (true);
  END IF;
END $$;

-- Allow service_role full access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'notice_periods' AND policyname = 'Allow service_role full access notice_periods'
  ) THEN
    CREATE POLICY "Allow service_role full access notice_periods" ON public.notice_periods FOR ALL USING (true);
  END IF;
END $$;

-- 2. Seed standard notice period options
INSERT INTO public.notice_periods (name, days, display_order)
VALUES 
  ('Immediate / Available Now', 0, 1),
  ('15 Days or less', 15, 2),
  ('1 Month', 30, 3),
  ('2 Months', 60, 4),
  ('3 Months', 90, 5),
  ('More than 3 Months', 120, 6),
  ('Serving Notice Period', 0, 7)
ON CONFLICT (name) DO UPDATE 
SET days = EXCLUDED.days, display_order = EXCLUDED.display_order;

-- 3. Add notice_period_id to public.jobseekers
ALTER TABLE public.jobseekers 
ADD COLUMN IF NOT EXISTS notice_period_id bigint REFERENCES public.notice_periods(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_jobseekers_notice_period_id 
ON public.jobseekers USING btree (notice_period_id) TABLESPACE pg_default;

-- 4. Backfill existing jobseekers notice_period_id from text notice_period column
UPDATE public.jobseekers j
SET notice_period_id = np.id
FROM public.notice_periods np
WHERE (
  LOWER(TRIM(j.notice_period)) = LOWER(TRIM(np.name))
  OR (LOWER(j.notice_period) LIKE '%immediate%' AND LOWER(np.name) LIKE '%immediate%')
  OR (LOWER(j.notice_period) LIKE '%15%' AND LOWER(np.name) LIKE '%15%')
  OR (LOWER(j.notice_period) LIKE '%1 month%' AND np.name = '1 Month')
  OR (LOWER(j.notice_period) LIKE '%2 month%' AND np.name = '2 Months')
  OR (LOWER(j.notice_period) LIKE '%3 month%' AND np.name = '3 Months')
  OR (LOWER(j.notice_period) LIKE '%serving%' AND LOWER(np.name) LIKE '%serving%')
)
AND j.notice_period_id IS NULL;
