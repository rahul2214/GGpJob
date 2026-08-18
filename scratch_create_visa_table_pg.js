const { Client } = require('pg');
require('dotenv').config({ path: '.env' });

async function createVisaTablePg() {
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
  console.log("Connection string present?:", !!connectionString);

  if (!connectionString) {
    console.log("No direct connection string in env. Let's check all env keys...");
    const keys = Object.keys(process.env).filter(k => k.includes('DB') || k.includes('POSTGRES') || k.includes('DATABASE') || k.includes('SUPABASE'));
    console.log("Relevant env keys:", keys);
    return;
  }

  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();
    console.log("Connected to PostgreSQL via pg!");

    await client.query(`
      CREATE TABLE IF NOT EXISTS public.visa_requirements (
        id bigint generated always as identity not null,
        name text not null,
        description text null,
        created_at timestamp with time zone not null default now(),
        constraint visa_requirements_pkey primary key (id),
        constraint visa_requirements_name_key unique (name)
      );
    `);
    console.log("Created table public.visa_requirements");

    await client.query(`
      INSERT INTO public.visa_requirements (name) VALUES
        ('No Visa Sponsorship Required'),
        ('Requires H1B Sponsorship'),
        ('Requires Green Card / PR'),
        ('Student Visa (OPT / CPT)'),
        ('Need Work Permit / Visa Sponsorship'),
        ('Authorized to Work Anywhere')
      ON CONFLICT (name) DO NOTHING;
    `);
    console.log("Inserted standard visa requirements!");

    await client.query(`
      ALTER TABLE public.jobseekers ADD COLUMN IF NOT EXISTS visa_requirement_id bigint NULL;
    `);
    console.log("Added visa_requirement_id column to jobseekers table!");

    await client.query(`
      DO $$
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
      END $$;
    `);
    console.log("Added foreign key constraint jobseekers_visa_requirement_id_fkey!");

    const res = await client.query('SELECT * FROM public.visa_requirements;');
    console.log("🎉 visa_requirements table rows:", res.rows);

  } catch (err) {
    console.error("❌ pg Connection / Query Error:", err);
  } finally {
    await client.end();
  }
}

createVisaTablePg();
