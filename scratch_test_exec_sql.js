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
  
  const { data, error } = await supabase.rpc('exec_sql', { sql });
  if (error) {
    console.error('Error running SQL:', error);
  } else {
    console.log('SQL success! Tables:', data.map(r => r.table_name));
  }
}

checkSql();
