const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectJobsColumns() {
  console.log("Fetching sample row from jobs to see exact column names...");
  const { data, error } = await supabaseAdmin.from('jobs').select('*').limit(1);
  if (error) {
    console.error("Error:", error);
    return;
  }
  if (data && data.length > 0) {
    console.log("Exact jobs table columns:", Object.keys(data[0]));
  }
}

inspectJobsColumns().catch(console.error);
