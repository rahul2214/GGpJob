-- Fraud Prevention and Payout Protection Migration (FIXED)

-- 1. Update employees table defaults and constraints
ALTER TABLE public.employees 
ALTER COLUMN trust_score SET DEFAULT 50;

-- Normalize existing scores
UPDATE public.employees SET trust_score = 100 WHERE trust_score > 100;
UPDATE public.employees SET trust_score = 0 WHERE trust_score < 0;
UPDATE public.employees SET trust_score = 50 WHERE trust_score IS NULL;

-- Add range constraint
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_trust_score_range') THEN
        ALTER TABLE public.employees ADD CONSTRAINT check_trust_score_range CHECK (trust_score >= 0 AND trust_score <= 100);
    END IF;
END $$;

-- 2. Trust Score History Table
CREATE TABLE IF NOT EXISTS public.trust_score_history (
    id bigint generated always as identity primary key,
    employee_id bigint REFERENCES public.employees(id) ON DELETE CASCADE,
    delta integer NOT NULL,
    new_score integer NOT NULL,
    reason text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- 3. Payouts Table
CREATE TABLE IF NOT EXISTS public.payouts (
    id bigint generated always as identity primary key,
    application_id bigint REFERENCES public.applications(id) ON DELETE CASCADE,
    employee_id bigint REFERENCES public.employees(id) ON DELETE CASCADE,
    amount numeric NOT NULL DEFAULT 0,
    status text NOT NULL DEFAULT 'pending', -- pending, delayed, held, blocked, completed
    trust_score_at_time integer,
    review_notes text,
    processed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);

-- Indexing
CREATE INDEX IF NOT EXISTS idx_trust_history_employee ON public.trust_score_history(employee_id);
CREATE INDEX IF NOT EXISTS idx_payouts_employee ON public.payouts(employee_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON public.payouts(status);

-- RLS
ALTER TABLE public.trust_score_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Employees can view own trust history') THEN
        CREATE POLICY "Employees can view own trust history" ON public.trust_score_history
            FOR SELECT USING (employee_id IN (SELECT id FROM public.employees WHERE uuid = auth.uid()));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Employees can view own payouts') THEN
        CREATE POLICY "Employees can view own payouts" ON public.payouts
            FOR SELECT USING (employee_id IN (SELECT id FROM public.employees WHERE uuid = auth.uid()));
    END IF;
END $$;
