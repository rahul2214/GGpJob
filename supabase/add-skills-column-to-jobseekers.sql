-- 1. Add skill_ids column to jobseekers
ALTER TABLE public.jobseekers 
ADD COLUMN IF NOT EXISTS skill_ids UUID[] DEFAULT '{}';

-- 2. (Optional) Populate skill_ids from jobseeker_skills for existing data
-- This is a one-time migration to ensure consistent state
UPDATE public.jobseekers js
SET skill_ids = (
    SELECT array_agg(skill_id)
    FROM public.jobseeker_skills jks
    WHERE jks.jobseeker_id = js.id
)
WHERE EXISTS (
    SELECT 1 FROM public.jobseeker_skills jks WHERE jks.jobseeker_id = js.id
);

-- 3. Clear schema cache
NOTIFY pgrst, 'reload schema';
