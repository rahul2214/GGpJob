const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  console.log("--- Querying one row from jobseekers ---");
  const { data: jsData, error: jsErr } = await supabase.from('jobseekers').select('*').limit(1);
  if (jsErr) {
    console.error("Error querying jobseekers:", jsErr);
  } else if (jsData && jsData.length > 0) {
    console.log("Jobseekers row keys and values:");
    console.log(jsData[0]);
  } else {
    console.log("Jobseekers table is empty.");
  }

  console.log("\n--- Querying one row from ats_analyses ---");
  const { data: atsData, error: atsErr } = await supabase.from('ats_analyses').select('*').limit(1);
  if (atsErr) {
    console.error("Error querying ats_analyses:", atsErr);
  } else if (atsData && atsData.length > 0) {
    console.log("Ats_analyses row keys and values:");
    console.log(atsData[0]);
  } else {
    console.log("Ats_analyses table is empty or doesn't exist.");
  }
}

main().catch(console.error);
