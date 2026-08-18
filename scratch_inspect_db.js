const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key);

async function inspectDb() {
  console.log("Checking if visa_requirements table exists...");
  const { data, error } = await supabase.from('visa_requirements').select('*').limit(5);
  if (error) {
    console.log("Table 'visa_requirements' does not exist yet:", error.message);
  } else {
    console.log("Table 'visa_requirements' already exists! Current rows:", data);
  }

  // Check columns of jobseekers table
  const { data: jsData, error: jsErr } = await supabase.from('jobseekers').select('*').limit(1);
  if (jsData && jsData.length > 0) {
    console.log("jobseekers columns:", Object.keys(jsData[0]));
  }
}

inspectDb();
