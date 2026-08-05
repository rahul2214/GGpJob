-- ============================================================
-- SUPPLEMENTAL TABLES: recruiters, employees, admins
-- Run this in Supabase SQL Editor
-- 
-- NOTE: These reference auth.users(id) directly, NOT jobseekers,
-- because recruiters/employees/admins won't have a jobseekers row.
-- The jobseekers table is for Job Seeker role only.
-- ============================================================

-- ── 1. RECRUITERS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.recruiters (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Basic Info (mirrored from auth for quick access)
    name                TEXT,
    email               TEXT,
    phone               TEXT,

    -- Company Details
    company_name        TEXT NOT NULL,
    company_logo        TEXT,
    company_website     TEXT,
    company_size        TEXT CHECK (company_size IN ('1-10', '11-50', '51-200', '201-500', '500+')),
    company_overview    TEXT,
    company_address     TEXT,
    company_domain_id   UUID REFERENCES public.domains(id) ON DELETE SET NULL,

    -- Recruiter Contact
    designation         TEXT,
    linkedin_url        TEXT,

    -- Subscription / Plan
    is_paid             BOOLEAN DEFAULT FALSE,
    plan_type           TEXT DEFAULT 'none'
                        CHECK (plan_type IN ('none', 'basic', 'premium', 'pro')),
    plan_expires_at     TIMESTAMPTZ,

    -- Plan Limits (set automatically based on plan_type)
    job_post_limit      INTEGER DEFAULT 1,    -- basic=1, premium=10, pro=50
    job_post_validity   INTEGER DEFAULT 30,   -- basic=30d, premium=30d, pro=90d
    app_access_days     INTEGER DEFAULT 30,   -- basic=30d, premium=90d, pro=180d

    -- Notification
    notification_last_viewed_at TIMESTAMPTZ,

    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.recruiters IS 'Profile and subscription data for users with role = Recruiter';

-- ── 2. EMPLOYEES ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Basic Info
    name                TEXT,
    email               TEXT,
    phone               TEXT,

    -- Company Details
    company_name        TEXT NOT NULL,
    company_logo        TEXT,
    company_website     TEXT,
    designation         TEXT,
    department          TEXT,
    employee_id_code    TEXT,
    linkedin_url        TEXT,

    -- Referral Stats
    referral_count      INTEGER DEFAULT 0,

    -- Notification
    notification_last_viewed_at TIMESTAMPTZ,

    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.employees IS 'Profile for users with role = Employee (internal referrers)';

-- ── 3. ADMINS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Basic Info
    name                TEXT,
    email               TEXT,
    phone               TEXT,

    -- Admin Details
    designation         TEXT DEFAULT 'Administrator',
    department          TEXT,

    -- Permissions
    can_manage_jobs     BOOLEAN DEFAULT TRUE,
    can_manage_users    BOOLEAN DEFAULT TRUE,
    can_manage_coupons  BOOLEAN DEFAULT TRUE,
    can_view_analytics  BOOLEAN DEFAULT TRUE,
    can_manage_admins   BOOLEAN DEFAULT FALSE,

    -- Super Admin flag
    is_super_admin      BOOLEAN DEFAULT FALSE,

    last_login_at       TIMESTAMPTZ,

    -- Notification
    notification_last_viewed_at TIMESTAMPTZ,

    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.admins IS 'Profile and permissions for users with role = Admin or Super Admin';

-- ── AUTO-UPDATED timestamps ────────────────────────────────────
CREATE TRIGGER update_recruiters_updated_at
    BEFORE UPDATE ON public.recruiters
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_employees_updated_at
    BEFORE UPDATE ON public.employees
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_admins_updated_at
    BEFORE UPDATE ON public.admins
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ── INDEXES ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_recruiters_plan_type      ON public.recruiters(plan_type);
CREATE INDEX IF NOT EXISTS idx_recruiters_company_domain ON public.recruiters(company_domain_id);
CREATE INDEX IF NOT EXISTS idx_recruiters_plan_expires   ON public.recruiters(plan_expires_at);

-- ── UPDATE signup trigger to route by role ─────────────────────
-- Replaces the existing handle_new_user() so new signups are
-- inserted into the correct table based on their chosen role.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_role TEXT;
    v_name TEXT;
    v_email TEXT;
    v_company TEXT;
BEGIN
    v_role    := COALESCE(NEW.raw_user_meta_data->>'role', 'Job Seeker');
    v_name    := NEW.raw_user_meta_data->>'name';
    v_email   := NEW.email;
    v_company := COALESCE(NEW.raw_user_meta_data->>'companyName', 'Unknown Company');

    IF v_role = 'Job Seeker' THEN
        INSERT INTO public.jobseekers (id, name, email, role)
        VALUES (NEW.id, v_name, v_email, v_role)
        ON CONFLICT (id) DO NOTHING;

    ELSIF v_role = 'Recruiter' THEN
        INSERT INTO public.recruiters (id, name, email, company_name)
        VALUES (NEW.id, v_name, v_email, v_company)
        ON CONFLICT (id) DO NOTHING;

    ELSIF v_role = 'Employee' THEN
        INSERT INTO public.employees (id, name, email, company_name)
        VALUES (NEW.id, v_name, v_email, v_company)
        ON CONFLICT (id) DO NOTHING;

    ELSIF v_role IN ('Admin', 'Super Admin') THEN
        INSERT INTO public.admins (id, name, email, is_super_admin)
        VALUES (NEW.id, v_name, v_email, v_role = 'Super Admin')
        ON CONFLICT (id) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── Reload schema cache ─────────────────────────────────────────
NOTIFY pgrst, 'reload schema';
