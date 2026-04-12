-- =============================================================================
-- SQL MIGRATION: Fix Company Size Persistence
-- Purpose: Add 'company_size_id' (UUID) to recruiters and employees tables,
--          and migrate existing text data.
-- =============================================================

BEGIN;

-- 1. Add company_size_id to recruiters if it doesn't exist
ALTER TABLE public.recruiters 
ADD COLUMN IF NOT EXISTS company_size_id UUID REFERENCES public.company_sizes(id) ON DELETE SET NULL;

-- 2. Add company_size_id to employees if it doesn't exist
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS company_size_id UUID REFERENCES public.company_sizes(id) ON DELETE SET NULL;

-- 3. Migrate existing data from 'company_size' (text) to 'company_size_id' (UUID)
-- This matches the text strings defined in our check constraint to the new table IDs
UPDATE public.recruiters r
SET company_size_id = cs.id
FROM public.company_sizes cs
WHERE r.company_size = cs.name
  AND r.company_size_id IS NULL;

-- 4. Update the recruiter public profile view to use the new join
CREATE OR REPLACE VIEW public.recruiter_public_profile AS
SELECT
  r.id,
  r.uuid,
  r.name,
  r.company_name,
  r.company_logo,
  r.company_website,
  r.company_overview,
  r.company_address,
  r.company_linkedin_url,
  r.designation,
  r.is_verified,
  cs.name AS company_size,
  r.created_at
FROM public.recruiters r
LEFT JOIN public.company_sizes cs ON cs.id = r.company_size_id
WHERE r.is_verified = true;

-- 5. Clear Schema Cache
NOTIFY pgrst, 'reload schema';

COMMIT;

SELECT 'Company Size columns and migration completed successfully' AS status;
