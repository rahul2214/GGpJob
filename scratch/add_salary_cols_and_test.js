const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function addSalaryColsAndTest() {
  const minVal = 50000;
  const maxVal = 80000;
  const currency = "INR";

  const testJob = {
    title: "Test Salary Mapping Job",
    company_name: "Test Company",
    description: "Testing saving min and max salary to jobs table.",
    salary_currency: currency,
    salary_min_usd_cents: minVal,
    salary_max_usd_cents: maxVal,
    job_type_pk: 1,
    workplace_type_pk: 1,
    posted_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 86400000).toISOString(),
    app_expires_at: new Date(Date.now() + 86400000).toISOString(),
    max_applies: 100,
    status: 'active'
  };

  const { data: inserted, error } = await supabaseAdmin.from('jobs').insert([testJob]).select().single();
  if (error) {
    console.error("Error inserting test job with salary:", error);
  } else {
    console.log("SUCCESS inserting test job with salary!", {
      id: inserted.id,
      salary_currency: inserted.salary_currency,
      salary_min_usd_cents: inserted.salary_min_usd_cents,
      salary_max_usd_cents: inserted.salary_max_usd_cents
    });
    await supabaseAdmin.from('jobs').delete().eq('id', inserted.id);
  }
}

addSalaryColsAndTest().catch(console.error);
