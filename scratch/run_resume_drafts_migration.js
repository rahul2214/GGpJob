const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env' });

async function main() {
  const sqlFile = path.join(__dirname, '..', 'supabase', 'create_resume_drafts.sql');
  console.log("Reading SQL from:", sqlFile);
  const sql = fs.readFileSync(sqlFile, 'utf8');

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  // Try 1: exec_sql with { sql }
  try {
    console.log("Trying RPC 'exec_sql' with { sql }...");
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    if (!error) {
      console.log("Success with exec_sql(sql)!");
      return;
    }
    console.log("exec_sql(sql) failed:", error.message);
  } catch (e) {
    console.log("exec_sql(sql) error:", e);
  }

  // Try 2: execute_sql with { sql }
  try {
    console.log("Trying RPC 'execute_sql' with { sql }...");
    const { data, error } = await supabase.rpc('execute_sql', { sql });
    if (!error) {
      console.log("Success with execute_sql(sql)!");
      return;
    }
    console.log("execute_sql(sql) failed:", error.message);
  } catch (e) {
    console.log("execute_sql(sql) error:", e);
  }

  // Try 3: run_sql with { sql_query }
  try {
    console.log("Trying RPC 'run_sql' with { sql_query }...");
    const { data, error } = await supabase.rpc('run_sql', { sql_query: sql });
    if (!error) {
      console.log("Success with run_sql(sql_query)!");
      return;
    }
    console.log("run_sql(sql_query) failed:", error.message);
  } catch (e) {
    console.log("run_sql(sql_query) error:", e);
  }
}

main().catch(err => {
  console.error("Migration runner failed:", err);
  process.exit(1);
});
