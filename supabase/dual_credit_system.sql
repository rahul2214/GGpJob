-- SQL Migration: Dual Credit System
-- Implements Subscription Credits (monthly reset) and Purchased Credits (top-up)

-- 1. Add new columns to jobseekers
ALTER TABLE public.jobseekers 
ADD COLUMN IF NOT EXISTS subscription_credits INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS purchased_credits INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS subscription_allowance INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS next_credit_reset_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '1 month';

-- 2. Migrate existing credits to subscription_credits as a starting point
UPDATE public.jobseekers 
SET subscription_credits = COALESCE(credits, 0),
    subscription_allowance = CASE 
        WHEN plan_type = 'jobseeker_pro' THEN 60
        WHEN plan_type = 'jobseeker_premium' THEN 20
        ELSE 0
    END;

-- 3. Function to consume credits in order: Subscription -> Purchased
CREATE OR REPLACE FUNCTION public.consume_credits(p_user_id BIGINT, p_amount INTEGER)
RETURNS JSON AS $$
DECLARE
    v_sub_credits INTEGER;
    v_pur_credits INTEGER;
    v_sub_to_consume INTEGER;
    v_pur_to_consume INTEGER;
BEGIN
    -- Get current credits
    SELECT subscription_credits, purchased_credits 
    INTO v_sub_credits, v_pur_credits
    FROM public.jobseekers
    WHERE id = p_user_id;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'User not found');
    END IF;

    -- Check if total credits are enough
    IF (COALESCE(v_sub_credits, 0) + COALESCE(v_pur_credits, 0)) < p_amount THEN
        RETURN json_build_object('success', false, 'error', 'Insufficient credits');
    END IF;

    -- Calculate consumption
    v_sub_to_consume := LEAST(COALESCE(v_sub_credits, 0), p_amount);
    v_pur_to_consume := p_amount - v_sub_to_consume;

    -- Update table
    UPDATE public.jobseekers
    SET subscription_credits = COALESCE(subscription_credits, 0) - v_sub_to_consume,
        purchased_credits = COALESCE(purchased_credits, 0) - v_pur_to_consume,
        updated_at = NOW()
    WHERE id = p_user_id;

    RETURN json_build_object(
        'success', true, 
        'consumed_subscription', v_sub_to_consume, 
        'consumed_purchased', v_pur_to_consume,
        'remaining_total', (v_sub_credits + v_pur_credits - p_amount)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Function to add purchased credits (Top-Up)
CREATE OR REPLACE FUNCTION public.add_purchased_credits(p_user_id BIGINT, p_amount INTEGER)
RETURNS void AS $$
BEGIN
    UPDATE public.jobseekers
    SET purchased_credits = COALESCE(purchased_credits, 0) + p_amount,
        updated_at = NOW()
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Function to reset/refill subscription credits
CREATE OR REPLACE FUNCTION public.reset_subscription_credits(p_user_id BIGINT)
RETURNS void AS $$
BEGIN
    UPDATE public.jobseekers
    SET subscription_credits = subscription_allowance,
        next_credit_reset_at = NOW() + INTERVAL '1 month',
        updated_at = NOW()
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Trigger-like helper or scheduled task could call this, but for now we'll handle it via backend check or RPC
-- We can also create a function to check and reset if expired
CREATE OR REPLACE FUNCTION public.check_and_reset_credits(p_user_id BIGINT)
RETURNS void AS $$
BEGIN
    UPDATE public.jobseekers
    SET subscription_credits = subscription_allowance,
        next_credit_reset_at = NOW() + INTERVAL '1 month',
        updated_at = NOW()
    WHERE id = p_user_id 
      AND (next_credit_reset_at IS NULL OR next_credit_reset_at <= NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Helper for Auth UUID reset
CREATE OR REPLACE FUNCTION public.check_and_reset_credits_by_uuid(p_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.jobseekers
    SET subscription_credits = subscription_allowance,
        next_credit_reset_at = NOW() + INTERVAL '1 month',
        updated_at = NOW()
    WHERE uuid = p_uuid 
      AND (next_credit_reset_at IS NULL OR next_credit_reset_at <= NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.consume_credits(BIGINT, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.add_purchased_credits(BIGINT, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.reset_subscription_credits(BIGINT) TO service_role;
GRANT EXECUTE ON FUNCTION public.check_and_reset_credits(BIGINT) TO service_role;
GRANT EXECUTE ON FUNCTION public.check_and_reset_credits_by_uuid(UUID) TO service_role;

NOTIFY pgrst, 'reload schema';
