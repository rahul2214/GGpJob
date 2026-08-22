const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectCurrencyColumns() {
  console.log("Inspecting jobs and jobseekers currency columns...");
  
  // Inspect jobs table sample
  const { data: jobSample } = await supabaseAdmin.from('jobs').select('*').limit(1);
  if (jobSample && jobSample.length > 0) {
    console.log("jobs table keys:", Object.keys(jobSample[0]).filter(k => k.includes('currency') || k.includes('code') || k.includes('salary')));
    console.log("jobs sample currency data:", {
      salary_currency: jobSample[0].salary_currency,
      currency_code: jobSample[0].currency_code,
      currency: jobSample[0].currency
    });
  }

  // Inspect jobseekers table sample
  const { data: seekerSample } = await supabaseAdmin.from('jobseekers').select('*').limit(1);
  if (seekerSample && seekerSample.length > 0) {
    console.log("jobseekers table keys:", Object.keys(seekerSample[0]).filter(k => k.includes('currency') || k.includes('code') || k.includes('preferred')));
    console.log("jobseekers sample currency data:", {
      preferred_currency: seekerSample[0].preferred_currency,
      currency_code: seekerSample[0].currency_code,
      salary_currency: seekerSample[0].salary_currency,
      currency: seekerSample[0].currency
    });
  }

  // Check if currencies table exists
  const { data: currencies, error: currErr } = await supabaseAdmin.from('currencies').select('*').limit(5);
  console.log("currencies table query error:", currErr ? currErr.message : "None", "sample:", currencies);
}

inspectCurrencyColumns().catch(console.error);
