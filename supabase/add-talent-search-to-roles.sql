-- 1. Add talent_search_expires_at to recruiters
ALTER TABLE public.recruiters 
ADD COLUMN IF NOT EXISTS talent_search_expires_at TIMESTAMPTZ;

-- 2. Add talent_search_expires_at to employees (optional, but good for consistency)
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS talent_search_expires_at TIMESTAMPTZ;

-- 3. Clear schema cache
NOTIFY pgrst, 'reload schema';
