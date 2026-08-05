const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env' });

async function main() {
  const sqlFile = path.join(__dirname, '..', 'supabase', 'create_ats_analyses.sql');
  console.log("Reading SQL from:", sqlFile);
  const sql = fs.readFileSync(sqlFile, 'utf8');

  // We can execute SQL query by using postgres connection string or via RPC.
  // Let's connect via pg.
  const { Client } = require('pg');
  if (process.env.DATABASE_URL) {
    console.log("Found DATABASE_URL, executing migration...");
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    await client.query(sql);
    await client.end();
    console.log("Executed successfully via pg.");
  } else {
    console.error("No DATABASE_URL found. Checking RPC 'exec_sql'...");
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data, error } = await supabase.rpc('exec_sql', { sql_string: sql });
    if (error) {
      console.error("RPC exec_sql failed or not found:", error);
    } else {
      console.log("Executed successfully via RPC.");
    }
  }
}

main().catch(err => {
  console.error("Migration runner failed:", err);
  process.exit(1);
});
