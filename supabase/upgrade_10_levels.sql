
-- Migration: Upgrade to 10-Level Gamification System
-- Updated with Scalable XP thresholds and milestone rewards

-- 1. Update the level calculation function with the 10-level thresholds
CREATE OR REPLACE FUNCTION public.calculate_employee_level(p_xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
    IF p_xp >= 20000 THEN RETURN 10;
    ELSIF p_xp >= 12000 THEN RETURN 9;
    ELSIF p_xp >= 8000 THEN RETURN 8;
    ELSIF p_xp >= 5000 THEN RETURN 7;
    ELSIF p_xp >= 3000 THEN RETURN 6;
    ELSIF p_xp >= 1500 THEN RETURN 5;
    ELSIF p_xp >= 700 THEN RETURN 4;
    ELSIF p_xp >= 300 THEN RETURN 3;
    ELSIF p_xp >= 100 THEN RETURN 2;
    ELSE RETURN 1;
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 2. Ensure all existing employees have their levels recalculated (Trigger will handle future ones)
UPDATE public.employees SET level = public.calculate_employee_level(COALESCE(xp, 0));

-- 3. Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
