-- Drop the redundant and buggy gamification triggers
-- The gamification logic (awarding XP for job posts and application updates)
-- is already correctly implemented in the Next.js backend (src/lib/gamification-logic.ts).
-- These triggers were causing the "record 'new' has no field 'employer_id'" error.

DROP TRIGGER IF EXISTS trigger_job_creation_xp ON public.jobs;
DROP FUNCTION IF EXISTS public.fn_award_job_post_xp();

DROP TRIGGER IF EXISTS trigger_application_status_xp_credits ON public.applications;
DROP FUNCTION IF EXISTS public.fn_application_status_xp_credits();

-- Notify PostgREST to reload schema just in case
NOTIFY pgrst, 'reload schema';
