const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key);

async function checkCols() {
  console.log("Checking jobseeker_achievements schema...");
  const { error: achErr } = await supabase.from('jobseeker_achievements').insert({ invalid_col: 1 });
  if (achErr) console.log("jobseeker_achievements error hint:", achErr.message);

  console.log("Checking jobseeker_certifications schema...");
  const { error: certErr } = await supabase.from('jobseeker_certifications').insert({ invalid_col: 1 });
  if (certErr) console.log("jobseeker_certifications error hint:", certErr.message);
}

checkCols();
