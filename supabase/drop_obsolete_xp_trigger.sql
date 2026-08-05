-- Fix: Drop obsolete gamification triggers that were blocking XP updates
-- Since we changed the gamification to reset XP to 0 for every level,
-- the old trigger `trigger_sync_employee_level` which expected cumulative XP
-- is now breaking the database updates and throwing errors.

-- 1. Drop the trigger that intercepts XP updates
DROP TRIGGER IF EXISTS trigger_sync_employee_level ON public.employees;

-- 2. Drop the trigger function itself
DROP FUNCTION IF EXISTS public.sync_employee_level();

-- 3. Just to be absolutely safe, drop the old calculation function again
DROP FUNCTION IF EXISTS public.calculate_employee_level(integer) CASCADE;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
