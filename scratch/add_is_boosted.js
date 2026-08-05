const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const sql = `
    ALTER TABLE jobs ADD COLUMN IF NOT EXISTS is_boosted BOOLEAN DEFAULT false;
  `;
  
  const { data, error } = await supabase.rpc('exec_sql', { sql: sql });
  if (error) {
    console.error("RPC exec_sql failed:", error);
  } else {
    console.log("Executed successfully via RPC. Result:", data);
  }
}

run();
