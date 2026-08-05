-- Referral Business Logic Updates
-- Standardizing statuses and adding business-critical columns

-- 1. Job enhancements
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS credits_required INTEGER DEFAULT 5;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS referral_strength TEXT DEFAULT 'Basic' CHECK (referral_strength IN ('Basic', 'Strong', 'Direct HR'));
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS referral_capacity INTEGER;

-- 2. Application enhancements for unlocking and proof
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS is_unlocked BOOLEAN DEFAULT FALSE;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS unlock_confirmed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS proof_url TEXT; 
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS internal_referral_id TEXT;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS proof_uploaded_at TIMESTAMP WITH TIME ZONE;

-- 3. Update Seeker Credits logic: ensure default 10 for new seekers
ALTER TABLE public.jobseekers ALTER COLUMN credits SET DEFAULT 10;

-- 4. Clear Schema Cache
NOTIFY pgrst, 'reload schema';
