const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key);

async function setupVisaRequirements() {
  console.log("Setting up public.visa_requirements table and jobseekers.visa_requirement_id column...");

  const sqlStatements = [
    `CREATE TABLE IF NOT EXISTS public.visa_requirements (
      id bigint generated always as identity not null,
      name text not null,
      description text null,
      created_at timestamp with time zone not null default now(),
      constraint visa_requirements_pkey primary key (id),
      constraint visa_requirements_name_key unique (name)
    );`,
    
    `INSERT INTO public.visa_requirements (name) VALUES
      ('No Visa Sponsorship Required'),
      ('Requires H1B Sponsorship'),
      ('Requires Green Card / PR'),
      ('Student Visa (OPT / CPT)'),
      ('Need Work Permit / Visa Sponsorship'),
      ('Authorized to Work Anywhere')
    ON CONFLICT (name) DO NOTHING;`,

    `ALTER TABLE public.jobseekers ADD COLUMN IF NOT EXISTS visa_requirement_id bigint NULL;`,

    `DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'jobseekers_visa_requirement_id_fkey'
      ) THEN
        ALTER TABLE public.jobseekers
        ADD CONSTRAINT jobseekers_visa_requirement_id_fkey
        FOREIGN KEY (visa_requirement_id)
        REFERENCES public.visa_requirements (id)
        ON DELETE SET NULL;
      END IF;
    END $$;`
  ];

  for (const sql of sqlStatements) {
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
    if (error) {
      console.log("RPC exec_sql error (trying query fallback):", error.message);
    }
  }

  // Let's verify if visa_requirements exists now
  const { data: rows, error: selectErr } = await supabase.from('visa_requirements').select('*');
  if (selectErr) {
    console.error("❌ Select visa_requirements error:", selectErr.message);
  } else {
    console.log("🎉 visa_requirements table contains:", rows);
  }
}

setupVisaRequirements();
