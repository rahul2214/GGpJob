-- ====================================================================
-- JobsDart: Soft Delete & Scheduled Permanent Deletion Migration
-- Execute this SQL in your Supabase SQL Editor / Postgres database
-- ====================================================================

-- 1. Add soft delete columns to jobseekers table
ALTER TABLE public.jobseekers
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS delete_requested_at TIMESTAMPTZ NULL,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL,
ADD COLUMN IF NOT EXISTS scheduled_delete_at TIMESTAMPTZ NULL;

-- 2. Add soft delete columns to recruiters table
ALTER TABLE public.recruiters
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS delete_requested_at TIMESTAMPTZ NULL,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL,
ADD COLUMN IF NOT EXISTS scheduled_delete_at TIMESTAMPTZ NULL;

-- 3. Add soft delete columns to employees table
ALTER TABLE public.employees
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS delete_requested_at TIMESTAMPTZ NULL,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL,
ADD COLUMN IF NOT EXISTS scheduled_delete_at TIMESTAMPTZ NULL;

-- 4. Add soft delete columns to admins table
ALTER TABLE public.admins
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS delete_requested_at TIMESTAMPTZ NULL,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL,
ADD COLUMN IF NOT EXISTS scheduled_delete_at TIMESTAMPTZ NULL;

-- 5. Add soft delete columns to users table (if unified users table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='users') THEN
        ALTER TABLE public.users
        ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active',
        ADD COLUMN IF NOT EXISTS delete_requested_at TIMESTAMPTZ NULL,
        ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL,
        ADD COLUMN IF NOT EXISTS scheduled_delete_at TIMESTAMPTZ NULL;
    END IF;
END $$;

-- 6. Create performance indexes for fast soft-delete filtering & cron execution
CREATE INDEX IF NOT EXISTS idx_jobseekers_is_deleted ON public.jobseekers(is_deleted);
CREATE INDEX IF NOT EXISTS idx_jobseekers_scheduled_delete ON public.jobseekers(scheduled_delete_at) WHERE is_deleted = TRUE;

CREATE INDEX IF NOT EXISTS idx_recruiters_is_deleted ON public.recruiters(is_deleted);
CREATE INDEX IF NOT EXISTS idx_recruiters_scheduled_delete ON public.recruiters(scheduled_delete_at) WHERE is_deleted = TRUE;

CREATE INDEX IF NOT EXISTS idx_employees_is_deleted ON public.employees(is_deleted);
CREATE INDEX IF NOT EXISTS idx_employees_scheduled_delete ON public.employees(scheduled_delete_at) WHERE is_deleted = TRUE;

CREATE INDEX IF NOT EXISTS idx_admins_is_deleted ON public.admins(is_deleted);
CREATE INDEX IF NOT EXISTS idx_admins_scheduled_delete ON public.admins(scheduled_delete_at) WHERE is_deleted = TRUE;
