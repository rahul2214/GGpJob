const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await supabase.from('jobs').select('is_consultancy').limit(1);
  if (error) {
    console.log("is_consultancy column query error:", error.message, "code:", error.code);
  } else {
    console.log("is_consultancy column EXISTS in jobs table.");
  }
}

check().catch(console.error);
