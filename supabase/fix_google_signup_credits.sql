-- ============================================================
-- FIX: GOOGLE SIGN-IN / SIGN-UP 2 CREDITS & 2 ALLOWANCE
-- ============================================================
-- Ensures all new Job Seekers (including Google OAuth signups)
-- receive 2 subscription_credits and 2 subscription_allowance.

-- 1. Update Column Defaults on jobseekers table
ALTER TABLE public.jobseekers 
ALTER COLUMN subscription_credits SET DEFAULT 2,
ALTER COLUMN subscription_allowance SET DEFAULT 2,
ALTER COLUMN purchased_credits SET DEFAULT 0;

-- 2. Backfill existing Job Seekers who have 0/NULL credits on free tier
UPDATE public.jobseekers
SET subscription_credits = 2,
    subscription_allowance = 2
WHERE (subscription_credits IS NULL OR (subscription_credits = 0 AND (subscription_allowance IS NULL OR subscription_allowance = 0)))
  AND (plan_type IS NULL OR plan_type = 'none')
  AND (is_paid IS NULL OR is_paid = FALSE);

-- 3. Update the handle_new_user() trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_role TEXT;
    v_name TEXT;
    v_email TEXT;
    v_phone TEXT;
    v_company TEXT;
    v_role_id INT;
    v_referral_code TEXT;
BEGIN
    BEGIN
        -- Extract metadata with robust defaults
        v_role    := COALESCE(NEW.raw_user_meta_data->>'role', 'Job Seeker');
        v_name    := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
        v_phone   := COALESCE(NEW.raw_user_meta_data->>'phone', '');
        v_email   := NEW.email;
        v_company := COALESCE(NEW.raw_user_meta_data->>'companyName', 'Unknown Company');
        v_referral_code := 'JD' || upper(substring(md5(NEW.id::text || random()::text) from 1 for 6));

        -- Determine role mapping
        CASE v_role
            WHEN 'Job Seeker' THEN v_role_id := 1;
            WHEN 'Recruiter'  THEN v_role_id := 2;
            WHEN 'Employee'   THEN v_role_id := 3;
            WHEN 'Admin'      THEN v_role_id := 4;
            WHEN 'Super Admin' THEN v_role_id := 4;
            ELSE v_role_id := 1;
        END CASE;

        -- Route to specific table using 'uuid'
        IF v_role = 'Recruiter' THEN
            INSERT INTO public.recruiters (uuid, name, email, phone, company_name, role_id)
            VALUES (NEW.id, v_name, v_email, v_phone, v_company, v_role_id)
            ON CONFLICT (uuid) DO NOTHING;

        ELSIF v_role = 'Employee' THEN
            INSERT INTO public.employees (uuid, name, email, phone, company_name, role_id)
            VALUES (NEW.id, v_name, v_email, v_phone, v_company, v_role_id)
            ON CONFLICT (uuid) DO NOTHING;

        ELSIF v_role IN ('Admin', 'Super Admin') THEN
            INSERT INTO public.admins (uuid, name, email, phone, is_super_admin, role_id)
            VALUES (NEW.id, v_name, v_email, v_phone, v_role = 'Super Admin', v_role_id)
            ON CONFLICT (uuid) DO NOTHING;

        ELSE 
            -- Default to Job Seeker with 2 Credits and 2 Allowance
            INSERT INTO public.jobseekers (
                uuid, 
                name, 
                email, 
                phone, 
                role_id,
                subscription_credits,
                subscription_allowance,
                purchased_credits,
                referral_code,
                referral_count
            )
            VALUES (
                NEW.id, 
                v_name, 
                v_email, 
                v_phone, 
                v_role_id,
                2,
                2,
                0,
                v_referral_code,
                0
            )
            ON CONFLICT (uuid) DO UPDATE
            SET subscription_credits = CASE 
                    WHEN jobseekers.subscription_credits IS NULL OR (jobseekers.subscription_credits = 0 AND (jobseekers.subscription_allowance IS NULL OR jobseekers.subscription_allowance = 0)) THEN 2 
                    ELSE jobseekers.subscription_credits 
                END,
                subscription_allowance = CASE 
                    WHEN jobseekers.subscription_allowance IS NULL OR jobseekers.subscription_allowance = 0 THEN 2 
                    ELSE jobseekers.subscription_allowance 
                END;
        END IF;

    EXCEPTION WHEN OTHERS THEN
        -- Gracefully catch any issue so the sign-up succeeds natively
        INSERT INTO public.signup_errors (user_id, email, error_message, metadata)
        VALUES (NEW.id, NEW.email, SQLERRM, NEW.raw_user_meta_data);
    END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Re-attach the trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Update credit reset RPC to never overwrite free allowance with 0
CREATE OR REPLACE FUNCTION public.check_and_reset_credits_by_uuid(p_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.jobseekers
    SET subscription_credits = GREATEST(2, COALESCE(subscription_allowance, 2)),
        subscription_allowance = GREATEST(2, COALESCE(subscription_allowance, 2)),
        next_credit_reset_at = NOW() + INTERVAL '1 month',
        updated_at = NOW()
    WHERE uuid = p_uuid 
      AND (next_credit_reset_at IS NULL OR next_credit_reset_at <= NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reload Schema Cache
NOTIFY pgrst, 'reload schema';
