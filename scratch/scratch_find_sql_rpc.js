const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function findRpc() {
  const query = "SELECT 1 as val;";
  
  // Try 1: run_sql (sql_query)
  try {
    const { data, error } = await supabase.rpc('run_sql', { sql_query: query });
    if (!error) { console.log("Success with run_sql(sql_query)!", data); return; }
    else { console.log("run_sql(sql_query) failed:", error.message); }
  } catch(e) { console.log("run_sql threw:", e.message); }

  // Try 2: execute_sql (sql)
  try {
    const { data, error } = await supabase.rpc('execute_sql', { sql: query });
    if (!error) { console.log("Success with execute_sql(sql)!", data); return; }
    else { console.log("execute_sql(sql) failed:", error.message); }
  } catch(e) { console.log("execute_sql threw:", e.message); }

  // Try 3: exec_sql (sql)
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: query });
    if (!error) { console.log("Success with exec_sql(sql)!", data); return; }
    else { console.log("exec_sql(sql) failed:", error.message); }
  } catch(e) { console.log("exec_sql threw:", e.message); }

  // Try 4: exec_sql (sql_string)
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_string: query });
    if (!error) { console.log("Success with exec_sql(sql_string)!", data); return; }
    else { console.log("exec_sql(sql_string) failed:", error.message); }
  } catch(e) { console.log("exec_sql(sql_string) threw:", e.message); }
}

findRpc();
