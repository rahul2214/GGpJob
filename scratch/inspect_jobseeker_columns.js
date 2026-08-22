const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectJobseekerColumns() {
  console.log("Fetching sample row from jobseekers to see exact columns...");
  const { data, error } = await supabaseAdmin.from('jobseekers').select('*').limit(1);
  if (error) {
    console.error("Error:", error);
    return;
  }
  if (data && data.length > 0) {
    console.log("Exact jobseekers table columns:", Object.keys(data[0]));
    console.log("preferred_currency:", data[0].preferred_currency);
    console.log("preferred_currency_id:", data[0].preferred_currency_id);
  }
}

inspectJobseekerColumns().catch(console.error);
