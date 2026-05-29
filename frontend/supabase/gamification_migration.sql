
-- Migration: Add Gamification Features to Employees
-- Add XP, Levels, and Milestone tracking

ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS verified_referrals_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS interviews_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS offers_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hires_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS rewards_balance DECIMAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS milestones_achieved JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS badge_ids JSONB DEFAULT '[]';

-- Helper function to calculate level from XP
CREATE OR REPLACE FUNCTION public.calculate_employee_level(p_xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
    IF p_xp >= 2000 THEN RETURN 4;
    ELSIF p_xp >= 500 THEN RETURN 3;
    ELSIF p_xp >= 100 THEN RETURN 2;
    ELSE RETURN 1;
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger to auto-update level when XP changes
CREATE OR REPLACE FUNCTION public.sync_employee_level()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.xp <> OLD.xp THEN
        NEW.level := public.calculate_employee_level(NEW.xp);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_employee_level ON public.employees;
CREATE TRIGGER trigger_sync_employee_level
BEFORE UPDATE ON public.employees
FOR EACH ROW EXECUTE PROCEDURE public.sync_employee_level();

-- Helper to update numerical fields safely
CREATE OR REPLACE FUNCTION public.increment(amount integer)
RETURNS integer AS $$
  -- This is a generic helper, though usually we'd target a table.
  -- But PostgREST uses them for atomic increments.
  SELECT amount + 1; -- Traditional Supabase increment is often done on client, but we can provide specialized ones.
$$ LANGUAGE sql;

-- Actually better to provide table-specific atomic helpers if needed, 
-- but we'll use standard SQL updates in our logic for now.

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
