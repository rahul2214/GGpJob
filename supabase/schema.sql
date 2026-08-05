-- SCHEMA FOR JOB PORTAL MIGRATION (PostgreSQL / Supabase)

-- 1. Metadata Tables
CREATE TABLE IF NOT EXISTS public.domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    country TEXT DEFAULT 'India',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.job_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.workplace_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Profiles (Linked to Auth.Users)
CREATE TABLE IF NOT EXISTS public.jobseekers (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    role TEXT CHECK (role IN ('Job Seeker', 'Recruiter', 'Employee', 'Admin', 'Super Admin')),
    
    -- Basic Profile Info
    headline TEXT,
    summary TEXT,
    location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
    domain_id UUID REFERENCES public.domains(id) ON DELETE SET NULL,
    resume_url TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    
    -- Personal Details
    gender TEXT,
    marital_status TEXT,
    date_of_birth DATE,
    category TEXT,
    
    -- Diversity & Inclusion
    disability_status TEXT,
    military_experience TEXT,
    career_break TEXT,
    
    -- Professional Info
    work_status TEXT CHECK (work_status IN ('Fresher', 'Experienced')),
    experience_years INTEGER DEFAULT 0,
    experience_months INTEGER DEFAULT 0,
    current_city TEXT,
    current_area TEXT,
    annual_salary INTEGER,
    salary_breakdown TEXT,
    notice_period TEXT,

    is_paid BOOLEAN DEFAULT FALSE,
    plan_type TEXT DEFAULT 'none',
    plan_expires_at TIMESTAMPTZ,
    talent_search_expires_at TIMESTAMPTZ,
    notification_last_viewed_at TIMESTAMPTZ,
    
    -- Extensible JSONB for varied profile fields (Education, Employment, etc.)
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Jobs Table
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    company_name TEXT,
    company_logo TEXT,
    
    -- Relationships
    domain_id UUID REFERENCES public.domains(id) ON DELETE SET NULL,
    job_type_id UUID REFERENCES public.job_types(id) ON DELETE SET NULL,
    workplace_type_id UUID REFERENCES public.workplace_types(id) ON DELETE SET NULL,
    
    location_ids UUID[] DEFAULT '{}', -- Supports multiple locations
    
    is_referral BOOLEAN DEFAULT FALSE,
    employee_linkedin TEXT,
    job_link TEXT,
    vacancies INTEGER DEFAULT 1,
    company_overview TEXT,
    company_website TEXT,
    address TEXT,
    
    skill_ids UUID[] DEFAULT '{}',
    sections JSONB DEFAULT '[]', -- Dynamic layout sections
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Applications Table
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.jobseekers(id) ON DELETE CASCADE,
    
    status_id INTEGER DEFAULT 1, -- 1: Applied, 2: Viewed, 3: Rejected, 4: Selected
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Coupons & Payments
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    discount_percent INTEGER NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    max_uses INTEGER DEFAULT 100,
    current_uses INTEGER DEFAULT 0,
    applicable_plan TEXT DEFAULT 'all',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.jobseekers(id),
    order_id TEXT UNIQUE NOT NULL,
    payment_id TEXT UNIQUE,
    amount INTEGER NOT NULL,
    plan_id TEXT NOT NULL,
    coupon_code TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security) - Basic Setup (Will be refined in Phase 2)
ALTER TABLE public.jobseekers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- 6. Trigger to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.jobseekers (id, name, email, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'name',
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'Job Seeker')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 7. Updated At Trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.jobseekers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 8. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.jobseekers(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    type TEXT,
    job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- 9. Functions & Procedures
CREATE OR REPLACE FUNCTION public.increment_coupon_usage(coupon_code TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE public.coupons
    SET current_uses = current_uses + 1
    WHERE code = coupon_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- 10. Portal Feedback Table
CREATE TABLE IF NOT EXISTS public.portal_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.jobseekers(id) ON DELETE SET NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.portal_feedback ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_portal_feedback_user_id ON public.portal_feedback(user_id);
