const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing SUPABASE credentials in .env");
  process.exit(1);
}

const supabase = createClient(url, key);

async function run() {
  const sql = fs.readFileSync(path.join(__dirname, 'migration_jobseeker_international.sql'), 'utf8');
  console.log("Running migration via RPC exec_sql...");
  const { data, error } = await supabase.rpc('exec_sql', { sql });
  if (error) {
    console.error("RPC exec_sql error:", error);
  } else {
    console.log("Migration executed successfully!", data);
  }
}

run();
