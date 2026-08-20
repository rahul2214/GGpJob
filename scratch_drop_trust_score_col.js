const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key);

async function testDropCol() {
  console.log("Checking if RPC or direct SQL drop is supported...");
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: 'ALTER TABLE public.jobseekers DROP COLUMN IF EXISTS trust_score;' });
  if (error) {
    console.log("RPC exec_sql error:", error.message);
  } else {
    console.log("Column trust_score dropped successfully via RPC!");
  }
}

testDropCol();
