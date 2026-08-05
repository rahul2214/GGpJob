-- SQL Migration: Add increment_credits function
-- This function allows for atomic increments of the credits column in the jobseekers table.

CREATE OR REPLACE FUNCTION public.increment_credits(user_id BIGINT, amount INTEGER)
RETURNS void AS $$
BEGIN
    UPDATE public.jobseekers
    SET credits = COALESCE(credits, 0) + amount,
        updated_at = NOW()
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to authenticated users (via service role/backend)
GRANT EXECUTE ON FUNCTION public.increment_credits(BIGINT, INTEGER) TO service_role;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
