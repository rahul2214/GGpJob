const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectSalaryData() {
  console.log("Inspecting existing jobs table rows for salary fields...");
  const { data: jobs, error } = await supabaseAdmin
    .from('jobs')
    .select('id, title, salary_currency, salary_min_usd_cents, salary_max_usd_cents')
    .limit(10);

  if (error) {
    console.error("Error selecting salary fields:", error);
  } else {
    console.log("Jobs salary data:", jobs);
  }
}

inspectSalaryData().catch(console.error);
