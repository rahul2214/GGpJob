-- ============================================================
-- SQL MIGRATION: Remove is_consultancy column from jobs table
-- Purpose: Remove Consultancy Recruiter logic & DB column
-- ============================================================

ALTER TABLE public.jobs DROP COLUMN IF EXISTS is_consultancy;

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';

SELECT 'Column is_consultancy removed successfully' AS status;
