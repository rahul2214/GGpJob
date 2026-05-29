
-- ============================================================
-- FIX: EMPLOYEE ALLOWANCE AND LIMITS
-- ============================================================

-- 1. Add job_post_limit to employees table if it doesn't exist
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS job_post_limit INTEGER DEFAULT 10;

-- 2. Update the trigger function to handle employee limits
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_role TEXT;
    v_name TEXT;
    v_email TEXT;
    v_phone TEXT;
    v_company TEXT;
    v_role_id INT;
BEGIN
    BEGIN
        -- Extract metadata with robust defaults
        v_role    := COALESCE(NEW.raw_user_meta_data->>'role', 'Job Seeker');
        v_name    := NEW.raw_user_meta_data->>'name';
        v_phone   := NEW.raw_user_meta_data->>'phone';
        v_email   := NEW.email;
        v_company := COALESCE(NEW.raw_user_meta_data->>'companyName', 'Unknown Company');

        -- Determine appropriate role_id
        CASE v_role
            WHEN 'Job Seeker'  THEN v_role_id := 1;
            WHEN 'Recruiter'   THEN v_role_id := 2;
            WHEN 'Employee'    THEN v_role_id := 3;
            WHEN 'Admin'       THEN v_role_id := 4;
            WHEN 'Super Admin' THEN v_role_id := 4;
            ELSE v_role_id := 1;
        END CASE;

        -- Route to the correct table using the 'uuid' column for NEW.id
        IF v_role = 'Recruiter' THEN
            INSERT INTO public.recruiters (uuid, name, email, phone, company_name, role_id)
            VALUES (NEW.id, v_name, v_email, v_phone, v_company, v_role_id)
            ON CONFLICT (uuid) DO NOTHING;

        ELSIF v_role = 'Employee' THEN
            -- CUSTOM EMPLOYEE LOGIC: Give complimentary access and limits
            INSERT INTO public.employees (
                uuid, name, email, phone, company_name, role_id, 
                is_paid, plan_type, plan_expires_at, 
                job_post_limit, max_applies_limit
            )
            VALUES (
                NEW.id, v_name, v_email, v_phone, v_company, v_role_id, 
                TRUE, 'employee_complimentary', (NOW() + INTERVAL '10 years'), 
                10, 100
            )
            ON CONFLICT (uuid) DO NOTHING;

        ELSIF v_role IN ('Admin', 'Super Admin') THEN
            INSERT INTO public.admins (uuid, name, email, phone, is_super_admin, role_id)
            VALUES (NEW.id, v_name, v_email, v_phone, v_role = 'Super Admin', v_role_id)
            ON CONFLICT (uuid) DO NOTHING;

        ELSE -- Default to Job Seeker
            INSERT INTO public.jobseekers (uuid, name, email, phone, role, role_id)
            VALUES (NEW.id, v_name, v_email, v_phone, v_role, v_role_id)
            ON CONFLICT (uuid) DO NOTHING;
        END IF;

    EXCEPTION WHEN OTHERS THEN
        -- Log any unexpected errors, but DO NOT fail the auth signup
        INSERT INTO public.signup_errors (user_id, email, error_message, metadata)
        VALUES (NEW.id, NEW.email, SQLERRM, NEW.raw_user_meta_data);
    END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-attach trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
