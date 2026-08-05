const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
  
  // Try querying ats_analyses definition
  console.log("Checking if ats_analyses table exists...");
  const { data: selectData, error: selectErr } = await supabase
    .from('ats_analyses')
    .select('*')
    .limit(1);

  if (selectErr) {
    console.error("Error querying ats_analyses:", selectErr.message);
  } else {
    console.log("ats_analyses query result:", selectData);
  }

  // Try checking the table structure or running a test RPC
  console.log("Testing exec_sql RPC...");
  const { data: rpcData, error: rpcErr } = await supabase.rpc('exec_sql', {
    sql_string: 'SELECT current_user, current_database();'
  });

  if (rpcErr) {
    console.error("exec_sql RPC failed:", rpcErr.message);
  } else {
    console.log("exec_sql RPC succeeded:", rpcData);
  }
}

main();
