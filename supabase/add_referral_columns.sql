-- Add referral columns to jobseekers table
ALTER TABLE public.jobseekers ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE public.jobseekers ADD COLUMN IF NOT EXISTS referred_by BIGINT REFERENCES public.jobseekers(id);
ALTER TABLE public.jobseekers ADD COLUMN IF NOT EXISTS referral_count INTEGER DEFAULT 0;

-- Populate existing jobseekers with unique referral codes
UPDATE public.jobseekers
SET referral_code = 'JD' || upper(substring(md5(id::text || random()::text) from 1 for 6))
WHERE referral_code IS NULL;

-- Backfill referral counts for existing accounts
UPDATE public.jobseekers js
SET referral_count = (
    SELECT COUNT(*)
    FROM public.jobseekers referred
    WHERE referred.referred_by = js.uuid
);

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
