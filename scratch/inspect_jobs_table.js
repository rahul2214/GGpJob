const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectJobsTable() {
  console.log("Inspecting columns of jobs table...");
  const { data: job, error } = await supabase.from('jobs').select('*').limit(1).single();
  if (error) {
    console.error("Error querying jobs table:", error);
    return;
  }
  console.log("Jobs table existing columns:", Object.keys(job));
}

inspectJobsTable().catch(console.error);
