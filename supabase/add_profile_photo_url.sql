-- SQL script to add profile_photo_url to jobseekers, employees, and recruiters tables
ALTER TABLE public.jobseekers ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;
ALTER TABLE public.recruiters ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;

-- Reload Schema Cache
NOTIFY pgrst, 'reload schema';
