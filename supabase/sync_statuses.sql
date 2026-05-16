-- Synchronize Application Statuses to match API expectations
-- This ensures status IDs 1-12 exist and have correct labels

CREATE TABLE IF NOT EXISTS public.application_statuses (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure the foreign key exists on applications table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'applications_status_id_fkey') THEN
        ALTER TABLE public.applications 
        ADD CONSTRAINT applications_status_id_fkey 
        FOREIGN KEY (status_id) REFERENCES public.application_statuses(id);
    END IF;
END $$;

-- Populate or Update Statuses
INSERT INTO public.application_statuses (id, name) VALUES
(1, 'Applied'),
(2, 'Under Review'),
(3, 'Accepted'),
(4, 'Referral Unlocked'),
(5, 'Referred'),
(6, 'Interviewing'),
(7, 'Offer Received'),
(8, 'Pending Confirmation'),
(9, 'Joined Company'),
(10, 'Completed'),
(11, 'Disputed'),
(12, 'Rejected')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- Clear Schema Cache
NOTIFY pgrst, 'reload schema';
