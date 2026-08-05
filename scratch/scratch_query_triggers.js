const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function inspectTriggers() {
  const sql = `
    SELECT 
        tgname AS trigger_name,
        relname AS table_name,
        proname AS function_name,
        prosrc AS function_source
    FROM pg_trigger
    JOIN pg_class ON pg_class.oid = tgrelid
    JOIN pg_proc ON pg_proc.oid = tgfoid
    WHERE relname IN ('jobseekers', 'users') OR tgname LIKE '%referral%' OR proname LIKE '%referral%';
  `;
  
  const { data, error } = await supabase.rpc('exec_sql', { sql_string: sql });
  if (error) {
    console.error('Error querying triggers:', error);
  } else {
    console.log('Found triggers/functions related to jobseekers or referrals:');
    data.forEach(t => {
      console.log(`- Trigger: ${t.trigger_name} on Table: ${t.table_name}`);
      console.log(`  Function: ${t.function_name}`);
      console.log(`  Source:\n${t.function_source}\n`);
    });
  }
}

inspectTriggers();
