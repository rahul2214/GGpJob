require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing supabase env keys");
  process.exit(1);
}

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
  const { data, error } = await supabase.from('jobs').select('*').limit(1);
  if (error) {
    console.error("Error fetching jobs:", error);
  } else if (data && data.length > 0) {
    console.log("Job columns:", Object.keys(data[0]));
  } else {
    console.log("No jobs found in table.");
  }
}

inspect();
