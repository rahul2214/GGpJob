-- ============================================================
-- MIGRATION: Recruiter Subscription Expiry Flow
-- Adds subscription_status, grace_period_end to recruiters
-- Adds 'archived' to jobs status options
-- ============================================================

-- 1. Add subscription status and grace period columns to recruiters
ALTER TABLE public.recruiters 
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active' 
    CHECK (subscription_status IN ('active', 'expired', 'cancelled'));

ALTER TABLE public.recruiters 
  ADD COLUMN IF NOT EXISTS grace_period_end TIMESTAMPTZ;

-- 2. Ensure jobs has a status column with archived support
-- The status column already exists; we just need to ensure 'archived' is allowed
-- Drop existing constraint if any, then add new one
DO $$
BEGIN
  -- Drop old constraint if it exists
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
             WHERE constraint_name = 'jobs_status_check' AND table_name = 'jobs') THEN
    ALTER TABLE public.jobs DROP CONSTRAINT jobs_status_check;
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Ignore if constraint doesn't exist
  NULL;
END $$;

-- Add updated constraint supporting all statuses
ALTER TABLE public.jobs ADD CONSTRAINT jobs_status_check 
  CHECK (status IN ('active', 'draft', 'archived', 'closed', 'paused', 'expired'));

-- 3. Indexes for subscription expiry queries
CREATE INDEX IF NOT EXISTS idx_recruiters_sub_status ON public.recruiters(subscription_status);
CREATE INDEX IF NOT EXISTS idx_recruiters_grace_end ON public.recruiters(grace_period_end);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_recruiter_status ON public.jobs(recruiter_pk, status);

-- 4. Backfill: Set subscription_status based on existing plan data
UPDATE public.recruiters
SET subscription_status = CASE
  WHEN plan_type = 'none' OR plan_type IS NULL THEN 'expired'
  WHEN plan_expires_at IS NOT NULL AND plan_expires_at < NOW() THEN 'expired'
  ELSE 'active'
END
WHERE subscription_status IS NULL OR subscription_status = 'active';

-- 5. Set grace_period_end for already-expired recruiters
UPDATE public.recruiters
SET grace_period_end = plan_expires_at + INTERVAL '7 days'
WHERE subscription_status = 'expired' 
  AND plan_expires_at IS NOT NULL 
  AND grace_period_end IS NULL;

-- Reload schema cache
NOTIFY pgrst, 'reload schema';

SELECT 'Subscription expiry migration applied successfully' AS status;
