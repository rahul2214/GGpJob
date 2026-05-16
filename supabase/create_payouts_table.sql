-- Optimized Payouts Table Schema (Final State)
CREATE TABLE IF NOT EXISTS public.payouts (
  id BIGSERIAL NOT NULL,
  employee_id BIGINT NOT NULL, -- Optimized to int8
  amount NUMERIC(12, 2) NOT NULL,
  method TEXT NOT NULL,
  status TEXT NULL DEFAULT 'pending'::text,
  holder_name TEXT NULL,
  account_number TEXT NULL,
  ifsc_code TEXT NULL,
  bank_name TEXT NULL,
  upi_id TEXT NULL,
  admin_notes TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  
  CONSTRAINT payouts_pkey PRIMARY KEY (id),
  CONSTRAINT payouts_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE CASCADE,
  CONSTRAINT payouts_method_check CHECK ((method = ANY (ARRAY['bank'::text, 'upi'::text]))),
  CONSTRAINT payouts_status_check CHECK (
    (
      status = ANY (
        ARRAY[
          'pending'::text,
          'completed'::text,
          'rejected'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

-- Optimized Indexes
CREATE INDEX IF NOT EXISTS idx_payouts_employee_id ON public.payouts USING btree (employee_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_payouts_status ON public.payouts USING btree (status) TABLESPACE pg_default;
