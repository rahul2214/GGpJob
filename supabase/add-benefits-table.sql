-- ============================================================
-- SQL MIGRATION: Add Benefits Table & Persistence
-- Purpose: Create a master Benefits table and link it to Jobs.
-- Run this in your Supabase SQL Editor.
-- ============================================================

-- 1. Create Benefits Master Table
CREATE TABLE IF NOT EXISTS public.benefits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    icon TEXT, -- Lucide icon name or emoji
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add benefit_ids column to the Jobs table
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS benefit_ids UUID[] DEFAULT '{}';

-- 3. Seed some initial benefits
INSERT INTO public.benefits (name, icon) 
VALUES 
    ('Health Insurance', 'CheckCircle2'),
    ('Remote Work', 'MapPin'),
    ('Flexible Hours', 'Clock'),
    ('Stock Options', 'BadgeDollarSign'),
    ('Paid Time Off', 'Calendar'),
    ('Gym Membership', 'Award'),
    ('Free Meals', 'Utensils'),
    ('Learning Stipend', 'BookOpen')
ON CONFLICT (name) DO NOTHING;

-- 4. Set up RLS for the benefits table
ALTER TABLE public.benefits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to benefits" 
ON public.benefits FOR SELECT USING (true);

-- 5. Clear Supabase Schema Cache
NOTIFY pgrst, 'reload schema';

SELECT 'Benefits table and column added successfully' AS status;
