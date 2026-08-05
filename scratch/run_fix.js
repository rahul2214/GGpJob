const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const sqlFile = path.join(__dirname, '..', 'supabase', 'fix_verification_status_constraint.sql');
  const sql = fs.readFileSync(sqlFile, 'utf8');

  console.log("Attempting to run migration via RPC exec_sql...");
  const { data, error } = await supabase.rpc('exec_sql', { sql_string: sql });
  
  if (error) {
    console.error("RPC failed. Please run the SQL in the Supabase Dashboard:");
    console.log(sql);
    console.error("Error details:", error);
  } else {
    console.log("Migration successful!");
  }
}
main();
