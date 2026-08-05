const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const sql = `
DROP TABLE IF EXISTS public.ats_analyses CASCADE;

CREATE TABLE public.ats_analyses (
  user_id bigint NOT NULL,
  score integer NOT NULL,
  result_json jsonb NOT NULL,
  analyzed_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT ats_analyses_pkey PRIMARY KEY (user_id),
  CONSTRAINT ats_analyses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.jobseekers (id) ON DELETE CASCADE
) TABLESPACE pg_default;

NOTIFY pgrst, 'reload schema';
`;

async function main() {
  console.log("Running migration SQL via run_sql RPC...");
  const { data, error } = await supabase.rpc('run_sql', { sql_query: sql });
  if (error) {
    console.error("run_sql failed with error:", error);
    console.log("trying execute_sql...");
    const { data: data2, error: error2 } = await supabase.rpc('execute_sql', { sql: sql });
    if (error2) {
      console.error("execute_sql failed:", error2);
    } else {
      console.log("Migration executed successfully via execute_sql. Data returned:", data2);
    }
  } else {
    console.log("Migration executed successfully via run_sql. Data returned:", data);
  }
}

main().catch(console.error);
