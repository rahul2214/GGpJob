const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function inspect() {
  const { data, error } = await supabase.from('jobs').select('*').limit(1);
  if (error) {
    console.error("Error fetching job:", error);
    return;
  }
  if (data && data.length > 0) {
    console.log("Existing columns in 'jobs' table:");
    console.log(Object.keys(data[0]));
  } else {
    console.log("Jobs table is empty, attempting to select columns via RPC/Metadata or inserting dummy...");
  }
}

inspect().catch(console.error);
