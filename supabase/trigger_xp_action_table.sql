-- Migration: Drop Redundant Gamification Triggers
-- Gamification XP is natively handled in the Node.js API (src/lib/gamification-logic.ts).
-- Having these triggers in the database causes DOUBLE XP (e.g., 5 + 5 = 10 XP for job posting).
-- This migration ensures the redundant triggers are removed from the database.

-- Drop Job Creation Trigger & Function
DROP TRIGGER IF EXISTS trigger_job_creation_xp ON public.jobs;
DROP FUNCTION IF EXISTS public.fn_award_job_post_xp();

-- Drop Application Status Trigger & Function 
DROP TRIGGER IF EXISTS trigger_application_status_xp_credits ON public.applications;
DROP FUNCTION IF EXISTS public.fn_application_status_xp_credits();

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
