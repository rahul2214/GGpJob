require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: jobseekers, error: err } = await supabase
    .from('jobseekers')
    .select('id, uuid, name, email, referral_code')
    .limit(10);
    
  if (err) {
    console.error("Error:", err);
  } else {
    console.log("Jobseekers:", jobseekers);
  }
}

run();
