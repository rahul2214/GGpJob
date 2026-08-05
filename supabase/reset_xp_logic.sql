-- Migration: Reset Cumulative XP to Relative XP
-- Because we changed the logic so that XP resets to 0 at every level,
-- we must drop any triggers that try to auto-calculate the level from cumulative XP.
-- We also recalculate current employee XP so they don't have thousands of XP 
-- for a level that only requires 500 XP.

-- 1. Drop the old function that assumed cumulative XP
DROP FUNCTION IF EXISTS public.calculate_employee_level(integer) CASCADE;

-- 2. Convert cumulative XP into relative XP for all current employees
-- We do this by iterating backwards from the highest level and subtracting the threshold
-- This safely ensures that users are on the correct level and their XP is what is left over.
UPDATE public.employees
SET 
  level = CASE
    WHEN xp >= 20000 THEN 10
    WHEN xp >= 12000 THEN 9
    WHEN xp >= 8000 THEN 8
    WHEN xp >= 5000 THEN 7
    WHEN xp >= 3000 THEN 6
    WHEN xp >= 1500 THEN 5
    WHEN xp >= 1000 THEN 4
    WHEN xp >= 500 THEN 3
    WHEN xp >= 200 THEN 2
    ELSE 1
  END,
  xp = CASE
    WHEN xp >= 20000 THEN xp - 20000
    WHEN xp >= 12000 THEN xp - 12000
    WHEN xp >= 8000 THEN xp - 8000
    WHEN xp >= 5000 THEN xp - 5000
    WHEN xp >= 3000 THEN xp - 3000
    WHEN xp >= 1500 THEN xp - 1500
    WHEN xp >= 1000 THEN xp - 1000
    WHEN xp >= 500 THEN xp - 500
    WHEN xp >= 200 THEN xp - 200
    ELSE xp
  END
WHERE xp > 200; -- Only modify those who have more than 200 XP

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
