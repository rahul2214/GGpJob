const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function inspect() {
  const tables = ['employees', 'applications', 'application_statuses'];
  
  for (const table of tables) {
    console.log(`\n--- COLUMNS FOR TABLE: ${table} ---`);
    const { data, error } = await supabase.rpc('get_table_columns_info', { table_name: table });
    if (error) {
      // Fallback: query via SQL execution or standard select limit 1
      const { data: cols, error: err2 } = await supabase.from(table).select('*').limit(1);
      if (err2) {
        console.error(`Error selecting from ${table}:`, err2.message);
      } else {
        console.log(`Columns available:`, Object.keys(cols[0] || {}));
      }
    } else {
      console.log(data);
    }
  }

  // Also query the application_statuses rows
  const { data: statuses, error: statusErr } = await supabase.from('application_statuses').select('*').order('id');
  console.log('\n--- APPLICATION STATUSES ---');
  if (statusErr) console.error(statusErr);
  else console.log(statuses);
}

inspect();
