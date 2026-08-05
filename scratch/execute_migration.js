const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const sqlFile = path.join(__dirname, '..', 'migration_multi_currency.sql');
  const sql = fs.readFileSync(sqlFile, 'utf8');

  console.log("Attempting migration execution via Supabase RPCs...");

  // Try 1: exec_sql (sql_string)
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_string: sql });
    if (!error) {
      console.log("Success! Migration executed via exec_sql(sql_string).");
      return;
    }
    console.log("exec_sql(sql_string) failed:", error.message);
  } catch (e) {
    console.log("exec_sql(sql_string) error:", e.message);
  }

  // Try 2: exec_sql (sql)
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    if (!error) {
      console.log("Success! Migration executed via exec_sql(sql).");
      return;
    }
    console.log("exec_sql(sql) failed:", error.message);
  } catch (e) {
    console.log("exec_sql(sql) error:", e.message);
  }

  // Try 3: execute_sql (sql)
  try {
    const { data, error } = await supabase.rpc('execute_sql', { sql });
    if (!error) {
      console.log("Success! Migration executed via execute_sql(sql).");
      return;
    }
    console.log("execute_sql(sql) failed:", error.message);
  } catch (e) {
    console.log("execute_sql(sql) error:", e.message);
  }

  // Try 4: run_sql (sql_query)
  try {
    const { data, error } = await supabase.rpc('run_sql', { sql_query: sql });
    if (!error) {
      console.log("Success! Migration executed via run_sql(sql_query).");
      return;
    }
    console.log("run_sql(sql_query) failed:", error.message);
  } catch (e) {
    console.log("run_sql(sql_query) error:", e.message);
  }

  console.log("\n[NOTICE] All RPC methods failed. The SQL must be executed manually in the Supabase Dashboard SQL Editor.");
}

main().catch(console.error);
