const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key);

async function checkTrustScoreCols() {
  console.log("Checking jobseekers trust_score...");
  const { data: js, error: jsErr } = await supabase.from('jobseekers').select('trust_score').limit(1);
  if (jsErr) console.log("jobseekers error:", jsErr.message);
  else console.log("jobseekers trust_score:", js);

  console.log("Checking recruiters trust_score...");
  const { data: rec, error: recErr } = await supabase.from('recruiters').select('trust_score').limit(1);
  if (recErr) console.log("recruiters error:", recErr.message);
  else console.log("recruiters trust_score:", rec);

  console.log("Checking employees trust_score...");
  const { data: emp, error: empErr } = await supabase.from('employees').select('trust_score').limit(1);
  if (empErr) console.log("employees error:", empErr.message);
  else console.log("employees trust_score:", emp);
}

checkTrustScoreCols();
