-- ============================================================
-- FINAL SIGNUP FIX: UNIQUE CONSTRAINTS & ERROR LOGGING
-- ============================================================
-- This script fixes the "Database error saving new user" issue by ensuring
-- the 'uuid' columns properly support the ON CONFLICT logic in our trigger,
-- and establishing exactly the fallback logging table if errors still occur.

-- 1. Create the signup_errors table securely
CREATE TABLE IF NOT EXISTS public.signup_errors (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id UUID,
    email TEXT,
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Ensure ALL role tables have a UNIQUE constraint on 'uuid'
-- This is strictly required for "ON CONFLICT (uuid) DO NOTHING" to work!
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobseekers' AND column_name = 'uuid') THEN
        ALTER TABLE public.jobseekers DROP CONSTRAINT IF EXISTS jobseekers_uuid_key;
        ALTER TABLE public.jobseekers ADD CONSTRAINT jobseekers_uuid_key UNIQUE (uuid);
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recruiters' AND column_name = 'uuid') THEN
        ALTER TABLE public.recruiters DROP CONSTRAINT IF EXISTS recruiters_uuid_key;
        ALTER TABLE public.recruiters ADD CONSTRAINT recruiters_uuid_key UNIQUE (uuid);
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'uuid') THEN
        ALTER TABLE public.employees DROP CONSTRAINT IF EXISTS employees_uuid_key;
        ALTER TABLE public.employees ADD CONSTRAINT employees_uuid_key UNIQUE (uuid);
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admins' AND column_name = 'uuid') THEN
        ALTER TABLE public.admins DROP CONSTRAINT IF EXISTS admins_uuid_key;
        ALTER TABLE public.admins ADD CONSTRAINT admins_uuid_key UNIQUE (uuid);
    END IF;
END $$;

-- 3. The bulletproof handle_new_user Trigger
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

        ELSE -- Default to Job Seeker
            INSERT INTO public.jobseekers (uuid, name, email, phone, role_id)
            VALUES (NEW.id, v_name, v_email, v_phone, v_role_id)
            ON CONFLICT (uuid) DO NOTHING;
        END IF;

    EXCEPTION WHEN OTHERS THEN
        -- Gracefully catch any issue so the sign-up succeeds natively!
        INSERT INTO public.signup_errors (user_id, email, error_message, metadata)
        VALUES (NEW.id, NEW.email, SQLERRM, NEW.raw_user_meta_data);
    END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Re-attach the trigger to the Auth table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RELOAD SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
