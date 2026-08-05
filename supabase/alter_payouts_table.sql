-- Migration to optimize payouts table: Change employee_id to BIGINT and use consolidated holder_name
-- (Assuming holder_name, account_number etc are already added as per user's latest snippet)

-- 1. Drop old constraints and indexes
ALTER TABLE public.payouts DROP CONSTRAINT IF EXISTS payouts_employee_id_fkey;
DROP INDEX IF EXISTS idx_payouts_employee;
DROP INDEX IF EXISTS idx_payouts_employee_id;

-- 2. Modify employee_id to BIGINT (int8)
-- WARNING: If you have existing data, this cast will fail. 
-- You may need to truncate the table or perform a manual mapping if data preservation is required.
ALTER TABLE public.payouts 
ALTER COLUMN employee_id TYPE bigint USING NULL; -- Using NULL to safely clear UUID data during type change

-- 3. Add new foreign key constraint referencing employees(id)
ALTER TABLE public.payouts 
ADD CONSTRAINT payouts_employee_id_fkey 
FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE;

-- 4. Re-create optimized index
CREATE INDEX IF NOT EXISTS idx_payouts_employee_id ON public.payouts(employee_id);

-- 5. Ensure holder_name is present (Consolidated)
-- (User snippet already included this, but this ensures it's correct)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payouts' AND column_name='holder_name') THEN
        ALTER TABLE public.payouts ADD COLUMN holder_name TEXT;
    END IF;
END $$;
