const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkSalaryCols() {
  console.log("Checking salary column names on jobs table...");
  const { data: job } = await supabaseAdmin.from('jobs').select('*').limit(1).single();
  const keys = Object.keys(job || {});
  const salaryKeys = keys.filter(k => k.toLowerCase().includes('salary'));
  console.log("Salary related columns on jobs table:", salaryKeys);

  // Let's test trying to insert with salary_min, salary_max, salary_currency
  const testJob = {
    title: "Test Salary Job",
    description: "Testing salary fields insert on jobs table in Supabase.",
    salary_min: 50000,
    salary_max: 80000,
    salary_currency: "INR"
  };

  // Test selecting salary_min and salary_max
  const { error: selErr } = await supabaseAdmin.from('jobs').select('id, salary_min, salary_max, salary_currency, salary_min_usd_cents, salary_max_usd_cents').limit(1);
  console.log("Select salary_min error:", selErr);
}

checkSalaryCols().catch(console.error);
