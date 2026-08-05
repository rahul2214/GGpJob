
-- ============================================================
-- CONSOLIDATED FIX: ROLE TABLES & SIGNUP TRIGGER
-- ============================================================
-- Run this in your Supabase SQL Editor to ensure all tables exist
-- and the signup process routes users to the correct profile.

-- 1. Ensure RECRUITERS exists
CREATE TABLE IF NOT EXISTS public.recruiters (
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
    designation         TEXT,
    linkedin_url        TEXT,
    is_paid             BOOLEAN DEFAULT FALSE,
    plan_type           TEXT DEFAULT 'none',
    plan_expires_at     TIMESTAMPTZ,
    notification_last_viewed_at TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    role_id             SMALLINT DEFAULT 2
);

-- 2. Ensure EMPLOYEES exists
CREATE TABLE IF NOT EXISTS public.employees (
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
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    role_id             SMALLINT DEFAULT 3
);

-- 3. Ensure ADMINS exists
CREATE TABLE IF NOT EXISTS public.admins (
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
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    role_id             SMALLINT DEFAULT 4
);

-- 4. Unified handle_new_user() trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_role TEXT;
    v_name TEXT;
    v_email TEXT;
    v_phone TEXT;
    v_company TEXT;
BEGIN
    -- Extract metadata with robust defaults
    v_role    := COALESCE(NEW.raw_user_meta_data->>'role', 'Job Seeker');
    v_name    := NEW.raw_user_meta_data->>'name';
    v_phone   := NEW.raw_user_meta_data->>'phone';
    v_email   := NEW.email;
    v_company := COALESCE(NEW.raw_user_meta_data->>'companyName', 'Unknown Company');

    -- Routing logic to correct tables
    IF v_role = 'Recruiter' THEN
        INSERT INTO public.recruiters (id, name, email, phone, company_name, role_id)
        VALUES (NEW.id, v_name, v_email, v_phone, v_company, 2)
        ON CONFLICT (id) DO UPDATE SET role_id = EXCLUDED.role_id;

    ELSIF v_role = 'Employee' THEN
        INSERT INTO public.employees (id, name, email, phone, company_name, role_id)
        VALUES (NEW.id, v_name, v_email, v_phone, v_company, 3)
        ON CONFLICT (id) DO UPDATE SET role_id = EXCLUDED.role_id;

    ELSIF v_role IN ('Admin', 'Super Admin') THEN
        INSERT INTO public.admins (id, name, email, phone, is_super_admin, role_id)
        VALUES (NEW.id, v_name, v_email, v_phone, v_role = 'Super Admin', CASE WHEN v_role = 'Super Admin' THEN 5 ELSE 4 END)
        ON CONFLICT (id) DO UPDATE SET role_id = EXCLUDED.role_id;

    ELSE -- Default to Job Seeker
        INSERT INTO public.jobseekers (id, name, email, phone, role, role_id)
        VALUES (NEW.id, v_name, v_email, v_phone, v_role, 1)
        ON CONFLICT (id) DO UPDATE SET role_id = EXCLUDED.role_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Final setup for auth trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
