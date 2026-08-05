-- ====================================================================
-- JobsDart: International Currency & Multi-Payment System Migration
-- ====================================================================

-- 1. Add international preference columns to jobseekers
ALTER TABLE public.jobseekers
ADD COLUMN IF NOT EXISTS preferred_currency VARCHAR(10) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS country VARCHAR(10) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT NULL;

-- 2. Add international preference columns to recruiters
ALTER TABLE public.recruiters
ADD COLUMN IF NOT EXISTS preferred_currency VARCHAR(10) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS country VARCHAR(10) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT NULL;

-- 3. Add international preference columns to employees
ALTER TABLE public.employees
ADD COLUMN IF NOT EXISTS preferred_currency VARCHAR(10) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS country VARCHAR(10) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT NULL;

-- 4. Add international preference columns to admins
ALTER TABLE public.admins
ADD COLUMN IF NOT EXISTS preferred_currency VARCHAR(10) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS country VARCHAR(10) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT NULL;

-- 5. Add international preference columns to users (if unified users table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='users') THEN
        ALTER TABLE public.users
        ADD COLUMN IF NOT EXISTS preferred_currency VARCHAR(10) DEFAULT NULL,
        ADD COLUMN IF NOT EXISTS country VARCHAR(10) DEFAULT NULL,
        ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT NULL,
        ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT NULL;
    END IF;
END $$;

-- 6. Add gateway and conversion columns to payments table
ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS gateway VARCHAR(50) DEFAULT 'razorpay',
ADD COLUMN IF NOT EXISTS country VARCHAR(10) DEFAULT 'IN',
ADD COLUMN IF NOT EXISTS base_amount NUMERIC DEFAULT NULL,
ADD COLUMN IF NOT EXISTS base_currency VARCHAR(10) DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS paid_amount NUMERIC DEFAULT NULL,
ADD COLUMN IF NOT EXISTS paid_currency VARCHAR(10) DEFAULT 'INR',
ADD COLUMN IF NOT EXISTS exchange_rate NUMERIC DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'Completed',
ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(255) DEFAULT NULL;

-- 7. Create exchange_rates cache table
CREATE TABLE IF NOT EXISTS public.exchange_rates (
    id SERIAL PRIMARY KEY,
    base_currency VARCHAR(10) DEFAULT 'USD',
    rates JSONB NOT NULL,
    fetched_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexing for quick user-country searches
CREATE INDEX IF NOT EXISTS idx_jobseekers_country ON public.jobseekers(country);
CREATE INDEX IF NOT EXISTS idx_recruiters_country ON public.recruiters(country);
