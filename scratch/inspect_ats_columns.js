const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function inspect() {
  const { data, error } = await supabase.from('ats_analyses').select('*').limit(1);
  if (error) {
    console.error("Error inspecting table:", error.message, error.code);
  } else {
    console.log("Success! Columns / Data:", data);
  }
}
inspect();
