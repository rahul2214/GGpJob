const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function inspect() {
  const { data, error } = await supabase.from('jobseekers').select('*').limit(1).single();
  if (error) {
    console.error("Fetch error:", error);
    return;
  }
  console.log("Existing jobseekers columns:", Object.keys(data).sort());
}

inspect();
