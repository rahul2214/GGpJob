
-- ============================================================
-- FINAL FIX: BIGINT PK & UUID MAPPING FOR ROLE TABLES
-- ============================================================
-- This script fixes the "column id is of type bigint but expression is of type uuid" error
-- by correctly mapping the Auth UUID to the 'uuid' column in profile tables.

-- 1. Create a table to log signup errors for debugging (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.signup_errors (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id UUID,
    email TEXT,
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CREATE EMPLOYEES (if it doesn't exist, based on user's schema)
-- Note: We use the user's provided schema with BIGINT PK and UUID column.
CREATE TABLE IF NOT EXISTS public.employees (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    uuid UUID NOT NULL UNIQUE,
    name TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    company_name TEXT,
    company_logo TEXT,
    company_website TEXT,
    designation TEXT,
    department TEXT,
    employee_id_code TEXT,
    linkedin_url TEXT,
    referral_count INTEGER DEFAULT 0,
    notification_last_viewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    role_id SMALLINT,
    plan_type TEXT DEFAULT 'none',
    plan_expires_at TIMESTAMPTZ,
    is_paid BOOLEAN DEFAULT FALSE,
    talent_search_expires_at TIMESTAMPTZ,
    max_applies_limit INTEGER DEFAULT -1
);

-- 3. Robust handle_new_user() trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_role TEXT;
    v_name TEXT;
    v_email TEXT;
    v_phone TEXT;
    v_company TEXT;
BEGIN
    BEGIN
        -- Extract metadata with robust defaults
        v_role    := COALESCE(NEW.raw_user_meta_data->>'role', 'Job Seeker');
        v_name    := NEW.raw_user_meta_data->>'name';
        v_phone   := NEW.raw_user_meta_data->>'phone';
        v_email   := NEW.email;
        v_company := COALESCE(NEW.raw_user_meta_data->>'companyName', 'Unknown Company');

        -- Routing logic to correct tables using the 'uuid' column for auth linking
        IF v_role = 'Recruiter' THEN
            -- Handle Recruiters (assuming they also use the uuid column pattern)
            INSERT INTO public.recruiters (uuid, name, email, phone, company_name, role_id)
            VALUES (NEW.id, v_name, v_email, v_phone, v_company, 2)
            ON CONFLICT (uuid) DO NOTHING;

        ELSIF v_role = 'Employee' THEN
            -- Handle Employees (Complimentary access included)
            INSERT INTO public.employees (
                uuid, 
                name, 
                email, 
                phone, 
                company_name, 
                is_paid, 
                plan_type, 
                plan_expires_at,
                max_applies_limit,
                role_id
            )
            VALUES (
                NEW.id, 
                v_name, 
                v_email, 
                v_phone, 
                v_company, 
                TRUE, -- complimentary access
                'complimentary',
                (NOW() + INTERVAL '1 year'), -- 1 year validity
                1000, -- Higher limit for employees
                3
            )
            ON CONFLICT (uuid) DO NOTHING;

        ELSIF v_role IN ('Admin', 'Super Admin') THEN
            -- Handle Admins
            INSERT INTO public.admins (uuid, name, email, phone, is_super_admin, role_id)
            VALUES (NEW.id, v_name, v_email, v_phone, v_role = 'Super Admin', CASE WHEN v_role = 'Super Admin' THEN 5 ELSE 4 END)
            ON CONFLICT (uuid) DO NOTHING;

        ELSE 
            -- Default to Job Seeker
            INSERT INTO public.jobseekers (uuid, name, email, phone, role_id)
            VALUES (NEW.id, v_name, v_email, v_phone, 1)
            ON CONFLICT (uuid) DO NOTHING;
        END IF;

    EXCEPTION WHEN OTHERS THEN
        -- Log the error to our table but DO NOT stop the auth process
        INSERT INTO public.signup_errors (user_id, email, error_message, metadata)
        VALUES (NEW.id, NEW.email, SQLERRM, NEW.raw_user_meta_data);
    END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Re-attach trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RELOAD SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
