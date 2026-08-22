const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectRecruiterColumns() {
  console.log("Inspecting columns of recruiters table...");
  const { data: rec, error } = await supabase.from('recruiters').select('*').limit(1).single();
  if (error) {
    console.error("Error querying recruiters:", error);
    return;
  }
  console.log("Recruiter table existing columns:", Object.keys(rec));
}

inspectRecruiterColumns().catch(console.error);
