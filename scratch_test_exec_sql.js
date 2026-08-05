const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSql() {
  const sql = `
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `;
  
  console.log("Trying execute_sql RPC...");
  const { data: data1, error: error1 } = await supabase.rpc('execute_sql', { sql });
  if (!error1) {
    console.log('execute_sql Success! Tables:', data1.map(r => r.table_name));
    return;
  }
  console.error('execute_sql Error:', error1.message);

  console.log("Trying run_sql RPC...");
  const { data: data2, error: error2 } = await supabase.rpc('run_sql', { sql_query: sql });
  if (!error2) {
    console.log('run_sql Success! Tables:', data2);
    return;
  }
  console.error('run_sql Error:', error2.message);
}

checkSql();
