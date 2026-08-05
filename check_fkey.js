const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkFkey() {
  const query = `
    SELECT
        tc.table_schema, 
        tc.constraint_name, 
        tc.table_name, 
        kcu.column_name, 
        ccu.table_schema AS foreign_table_schema,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
    FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'employees';
  `;

  const { data, error } = await supabase.rpc('run_sql', { sql_query: query });
  
  if (error) {
    // If rpc is not available, try standard query or raw sql via API
    console.log('Error executing SQL:', error.message);
    
    // Let's try executing via a fetch or another RPC if we know it
    // Wait, let's search if there's any rpc function like "execute_sql" or "run_sql"
    const { data: rpcData, error: rpcErr } = await supabase.rpc('execute_sql', { sql: query });
    if (rpcErr) {
      console.log('Error execute_sql:', rpcErr.message);
    } else {
      console.log('Foreign keys:', rpcData);
    }
  } else {
    console.log('Foreign keys:', data);
  }
}

checkFkey();
