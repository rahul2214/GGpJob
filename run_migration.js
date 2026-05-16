const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const sqlFile = path.join(__dirname, 'supabase', 'add_job_application_counts.sql');
  const sql = fs.readFileSync(sqlFile, 'utf8');

  // Supabase JS doesn't have a direct execute SQL command from the client API
  // It requires the pg library or similar. 
  // Wait, I can just use psql if it's available, or I'll use the rpc 'exec_sql' if it exists.
  // Alternatively, I can use the postgres connection string if available.
  
  // Let's check if there is an exec_sql rpc
  const { data, error } = await supabase.rpc('exec_sql', { sql_string: sql });
  if (error) {
    console.log("RPC exec_sql failed or not found, trying raw connection...");
    // If not, we might need a pg connection. Let's see if we have postgres url
    const { Client } = require('pg');
    if (process.env.DATABASE_URL) {
      const client = new Client({ connectionString: process.env.DATABASE_URL });
      await client.connect();
      await client.query(sql);
      await client.end();
      console.log("Executed successfully via pg.");
    } else {
      console.error("No DATABASE_URL found. Cannot execute raw SQL without it.");
    }
  } else {
    console.log("Executed successfully via RPC.");
  }
}
main();
