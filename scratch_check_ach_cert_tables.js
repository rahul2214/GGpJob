const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key);

async function inspectTables() {
  console.log("Checking jobseeker_achievements table...");
  const { data: achData, error: achErr } = await supabase.from('jobseeker_achievements').select('*').limit(1);
  if (achErr) console.log("jobseeker_achievements error:", achErr.message);
  else console.log("jobseeker_achievements sample row/cols:", achData);

  console.log("Checking jobseeker_certifications table...");
  const { data: certData, error: certErr } = await supabase.from('jobseeker_certifications').select('*').limit(1);
  if (certErr) console.log("jobseeker_certifications error:", certErr.message);
  else console.log("jobseeker_certifications sample row/cols:", certData);
}

inspectTables();
