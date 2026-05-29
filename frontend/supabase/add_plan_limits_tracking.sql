-- ============================================================
-- SQL MIGRATION: Add tracking for Jobseeker Plan Limits
-- Purpose: Add unlocked_at timestamp to track monthly referral unlocks
-- ============================================================

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='unlocked_at') THEN
        ALTER TABLE public.applications ADD COLUMN unlocked_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Clear Supabase Schema Cache
NOTIFY pgrst, 'reload schema';

SELECT 'Plan limits tracking fields added successfully' AS status;
