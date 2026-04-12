
-- ============================================================
-- FINAL FIX: UUID PRIMARY KEYS FOR ROLE TABLES
-- ============================================================
-- This script fixes the "column id is of type bigint but expression is of type uuid" error
-- by recreating the profile tables with correct UUID primary keys.

-- 1. DROP EXISTING TABLES (CAUTION: THIS DELETES DATA IN THESE TABLES)
DROP TABLE IF EXISTS public.employees CASCADE;
DROP TABLE IF EXISTS public.recruiters CASCADE;
DROP TABLE IF EXISTS public.admins CASCADE;

-- 2. CREATE RECRUITERS (UUID PK)
CREATE TABLE public.recruiters (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name                TEXT,
    email               TEXT,
    phone               TEXT,
    company_name        TEXT NOT NULL DEFAULT 'Unknown Company',
    company_logo        TEXT,
    company_website     TEXT,
    company_size        TEXT,
    company_overview    TEXT,
    company_address     TEXT,
    company_domain_id   UUID REFERENCES public.domains(id) ON DELETE SET NULL,
    designation         TEXT,
    linkedin_url        TEXT,
    is_paid             BOOLEAN DEFAULT FALSE,
    plan_type           TEXT DEFAULT 'none',
    plan_expires_at     TIMESTAMPTZ,
    job_post_limit      INTEGER DEFAULT 1,
    job_post_validity   INTEGER DEFAULT 30,
    app_access_days     INTEGER DEFAULT 30,
    notification_last_viewed_at TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CREATE EMPLOYEES (UUID PK)
CREATE TABLE public.employees (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name                TEXT,
    email               TEXT,
    phone               TEXT,
    company_name        TEXT NOT NULL DEFAULT 'Unknown Company',
    company_logo        TEXT,
    company_website     TEXT,
    designation         TEXT,
    department          TEXT,
    employee_id_code    TEXT,
    linkedin_url        TEXT,
    referral_count      INTEGER DEFAULT 0,
    notification_last_viewed_at TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CREATE ADMINS (UUID PK)
CREATE TABLE public.admins (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name                TEXT,
    email               TEXT,
    phone               TEXT,
    designation         TEXT DEFAULT 'Administrator',
    department          TEXT,
    can_manage_jobs     BOOLEAN DEFAULT TRUE,
    can_manage_users    BOOLEAN DEFAULT TRUE,
    can_manage_coupons  BOOLEAN DEFAULT TRUE,
    can_view_analytics  BOOLEAN DEFAULT TRUE,
    can_manage_admins   BOOLEAN DEFAULT FALSE,
    is_super_admin      BOOLEAN DEFAULT FALSE,
    last_login_at       TIMESTAMPTZ,
    notification_last_viewed_at TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ENSURE ROBUST TRIGGER FUNCTION
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
        -- Extract metadata
        v_role    := COALESCE(NEW.raw_user_meta_data->>'role', 'Job Seeker');
        v_name    := NEW.raw_user_meta_data->>'name';
        v_phone   := NEW.raw_user_meta_data->>'phone';
        v_email   := NEW.email;
        v_company := COALESCE(NEW.raw_user_meta_data->>'companyName', 'Unknown Company');

        -- Routing logic to correct tables (Now all using UUID PKs)
        IF v_role = 'Recruiter' THEN
            INSERT INTO public.recruiters (id, name, email, phone, company_name)
            VALUES (NEW.id, v_name, v_email, v_phone, v_company)
            ON CONFLICT (id) DO NOTHING;

        ELSIF v_role = 'Employee' THEN
            INSERT INTO public.employees (id, name, email, phone, company_name)
            VALUES (NEW.id, v_name, v_email, v_phone, v_company)
            ON CONFLICT (id) DO NOTHING;

        ELSIF v_role IN ('Admin', 'Super Admin') THEN
            INSERT INTO public.admins (id, name, email, phone, is_super_admin)
            VALUES (NEW.id, v_name, v_email, v_phone, v_role = 'Super Admin')
            ON CONFLICT (id) DO NOTHING;

        ELSE -- Default to Job Seeker
            INSERT INTO public.jobseekers (id, name, email, phone, role)
            VALUES (NEW.id, v_name, v_email, v_phone, v_role)
            ON CONFLICT (id) DO NOTHING;
        END IF;

    EXCEPTION WHEN OTHERS THEN
        -- Log the error to our table but DO NOT stop the process
        -- Ensure this table was created in the previous step
        INSERT INTO public.signup_errors (user_id, email, error_message, metadata)
        VALUES (NEW.id, NEW.email, SQLERRM, NEW.raw_user_meta_data);
    END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. RE-ATTACH TRIGGER
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RELOAD SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
