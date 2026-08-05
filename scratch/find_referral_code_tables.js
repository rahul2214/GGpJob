require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const query = `
    SELECT table_name, column_name 
    FROM information_schema.columns 
    WHERE column_name = 'referral_code' 
    AND table_schema = 'public';
  `;
  const { data, error } = await supabase.rpc('exec_sql', { sql: query });
  if (error) {
    console.error("Error executing RPC:", error);
    // Let's try to query manually if possible, or search lists
  } else {
    console.log("Tables with referral_code:", data);
  }
}

run();
