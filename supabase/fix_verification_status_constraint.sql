-- Fix verification_status check constraint to allow granular pending statuses
ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS applications_verification_status_check;

ALTER TABLE public.applications ADD CONSTRAINT applications_verification_status_check 
CHECK (verification_status IN ('none', 'pending', 'pending_jobseeker', 'pending_employee', 'verified', 'disputed'));

-- Sync any existing 'pending' to 'none' if they were accidentally left in a bad state (optional)
-- UPDATE public.applications SET verification_status = 'none' WHERE verification_status IS NULL;

-- Clear Schema Cache
NOTIFY pgrst, 'reload schema';
