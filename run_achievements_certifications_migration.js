const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function migrateAchievementsAndCertifications() {
  let envFile = '';
  try {
    envFile = fs.readFileSync('.env.local', 'utf8');
  } catch(e) {
    envFile = fs.readFileSync('.env', 'utf8');
  }

  const lines = envFile.split('\n');
  let url, key;
  for (const line of lines) {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1].trim();
    if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) key = line.split('=')[1].trim();
  }

  const supabase = createClient(url, key);

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

  console.log("Executing achievements & certifications migration via exec_sql RPC...");
  const { data, error } = await supabase.rpc('exec_sql', { sql });
  if (error) {
    console.error("Migration RPC error:", error);
  } else {
    console.log("🎉 Migration executed successfully!", data);
  }
}

migrateAchievementsAndCertifications();
