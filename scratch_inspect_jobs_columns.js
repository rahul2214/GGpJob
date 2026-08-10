const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key);

async function inspectJobsColumns() {
  const { data, error } = await supabase.from('jobs').select('*').limit(1);
  if (error) {
    console.error("Error fetching jobs table sample:", error);
    return;
  }
  if (data && data.length > 0) {
    console.log("JOBS TABLE COLUMNS:", Object.keys(data[0]));
  } else {
    console.log("Jobs table is empty, attempting to select column names from information_schema...");
    const { data: schemaData, error: schemaErr } = await supabase.rpc('get_jobs_schema_info');
    console.log("Schema data:", schemaData, schemaErr);
  }
}

inspectJobsColumns();
