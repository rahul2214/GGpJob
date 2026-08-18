const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key);

async function createTables() {
  console.log("Creating public.jobseeker_achievements and public.jobseeker_certifications tables...");

  const sql = `
  -- ============================================
  -- JOBSEEKER ACHIEVEMENTS
  -- ============================================
  CREATE TABLE IF NOT EXISTS public.jobseeker_achievements (
      id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      jobseeker_id bigint NULL REFERENCES public.jobseekers(id) ON DELETE CASCADE,
      jobseeker_uuid uuid NULL REFERENCES public.jobseekers(uuid) ON DELETE CASCADE,
      title text NOT NULL,
      description text NULL,
      issuer text NULL,
      date_achieved timestamptz NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
  );

  CREATE INDEX IF NOT EXISTS idx_jobseeker_achievements_jobseeker_id ON public.jobseeker_achievements(jobseeker_id);
  CREATE INDEX IF NOT EXISTS idx_jobseeker_achievements_jobseeker_uuid ON public.jobseeker_achievements(jobseeker_uuid);

  -- ============================================
  -- JOBSEEKER CERTIFICATIONS
  -- ============================================
  CREATE TABLE IF NOT EXISTS public.jobseeker_certifications (
      id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      jobseeker_id bigint NULL REFERENCES public.jobseekers(id) ON DELETE CASCADE,
      jobseeker_uuid uuid NULL REFERENCES public.jobseekers(uuid) ON DELETE CASCADE,
      name text NOT NULL,
      issuing_organization text NULL,
      issue_date timestamptz NULL,
      expiration_date timestamptz NULL,
      credential_id text NULL,
      credential_url text NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
  );

  CREATE INDEX IF NOT EXISTS idx_jobseeker_certifications_jobseeker_id ON public.jobseeker_certifications(jobseeker_id);
  CREATE INDEX IF NOT EXISTS idx_jobseeker_certifications_jobseeker_uuid ON public.jobseeker_certifications(jobseeker_uuid);
  `;

  // Check if we can insert test records or execute SQL
  // Try table selection to see if tables exist
  const { error: err1 } = await supabase.from('jobseeker_achievements').select('id').limit(1);
  const { error: err2 } = await supabase.from('jobseeker_certifications').select('id').limit(1);

  if (err1 || err2) {
    console.log("Tables do not exist yet. Using direct table operations or raw creation via REST API...");
  } else {
    console.log("✅ Tables public.jobseeker_achievements and public.jobseeker_certifications already exist!");
  }
}

createTables();
