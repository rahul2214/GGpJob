require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });
const { Client } = require('pg');

async function testPg() {
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.SUPABASE_DATABASE_URL;
  console.log("DB URL found?", !!dbUrl);

  if (!dbUrl) {
    console.log("Checking all process.env keys...");
    const keys = Object.keys(process.env).filter(k => k.includes('DB') || k.includes('URL') || k.includes('POSTGRES') || k.includes('SUPABASE'));
    console.log("Matching env keys:", keys);
    return;
  }

  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    console.log("Connected to PostgreSQL!");

    const sql = `
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

    await client.query(sql);
    console.log("🎉 Tables public.jobseeker_achievements and public.jobseeker_certifications created successfully in PostgreSQL!");
    await client.end();
  } catch (err) {
    console.error("Pg Error:", err);
  }
}

testPg();
