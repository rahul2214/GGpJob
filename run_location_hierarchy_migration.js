const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function migrateLocationHierarchy() {
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
  -- EXTENSIONS
  CREATE EXTENSION IF NOT EXISTS pg_trgm;

  -- COUNTRIES
  CREATE TABLE IF NOT EXISTS public.countries (
      id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      name        text NOT NULL,
      code        varchar(2) NOT NULL,
      phone_code  text NULL,
      is_active   boolean NOT NULL DEFAULT true,
      created_at  timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT countries_name_key UNIQUE (name),
      CONSTRAINT countries_code_key UNIQUE (code)
  );

  -- STATES / PROVINCES
  CREATE TABLE IF NOT EXISTS public.states_provinces (
      id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      country_id  bigint NOT NULL,
      name        text NOT NULL,
      code        text NULL,
      is_active   boolean NOT NULL DEFAULT true,
      created_at  timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT states_provinces_country_fk
          FOREIGN KEY (country_id)
          REFERENCES public.countries(id)
          ON DELETE CASCADE,
      CONSTRAINT states_provinces_unique_name
          UNIQUE (country_id, name)
  );

  CREATE INDEX IF NOT EXISTS idx_states_provinces_country_id ON public.states_provinces(country_id);

  -- CITIES
  CREATE TABLE IF NOT EXISTS public.cities (
      id                  bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      state_province_id   bigint NOT NULL,
      name                text NOT NULL,
      is_featured         boolean NOT NULL DEFAULT false,
      is_active           boolean NOT NULL DEFAULT true,
      created_at          timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT cities_state_province_fk
          FOREIGN KEY (state_province_id)
          REFERENCES public.states_provinces(id)
          ON DELETE CASCADE,
      CONSTRAINT cities_unique_name
          UNIQUE (state_province_id, name)
  );

  CREATE INDEX IF NOT EXISTS idx_cities_state_province_id ON public.cities(state_province_id);
  CREATE INDEX IF NOT EXISTS idx_cities_name_trgm ON public.cities USING gin (name gin_trgm_ops);
  CREATE INDEX IF NOT EXISTS idx_cities_featured ON public.cities(state_province_id, is_featured) WHERE is_active = true;

  -- ADD REFERENCES TO USER TABLES
  ALTER TABLE public.jobseekers ADD COLUMN IF NOT EXISTS country_id bigint NULL;
  ALTER TABLE public.jobseekers ADD COLUMN IF NOT EXISTS state_id bigint NULL;
  ALTER TABLE public.jobseekers ADD COLUMN IF NOT EXISTS city_id bigint NULL;

  ALTER TABLE public.recruiters ADD COLUMN IF NOT EXISTS state text NULL;
  ALTER TABLE public.recruiters ADD COLUMN IF NOT EXISTS city text NULL;
  ALTER TABLE public.recruiters ADD COLUMN IF NOT EXISTS country_id bigint NULL;
  ALTER TABLE public.recruiters ADD COLUMN IF NOT EXISTS state_id bigint NULL;
  ALTER TABLE public.recruiters ADD COLUMN IF NOT EXISTS city_id bigint NULL;

  ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS country_id bigint NULL;
  ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS state_id bigint NULL;
  ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS city_id bigint NULL;
  `;

  console.log("Executing location hierarchy migration...");
  const { data, error } = await supabase.rpc('exec_sql', { sql });
  if (error) {
    console.error("Migration error:", error);
  } else {
    console.log("Migration executed successfully!", data);
  }
}

migrateLocationHierarchy();
