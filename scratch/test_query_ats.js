const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data, error } = await supabase.from('ats_analyses').select('user_id, score, result_json, analyzed_at').limit(1);
  if (error) {
    console.error("Query failed:", error.message, error.code);
  } else {
    console.log("Success! Columns exist and query returned:", data);
  }
}
test();
