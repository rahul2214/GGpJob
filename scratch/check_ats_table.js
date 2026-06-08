const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await supabase.from('ats_analyses').select('count', { count: 'exact', head: true });
  if (error) {
    console.error("Error checking table:", error.message, error.code);
  } else {
    console.log("Table exists! Row count:", data);
  }
}
check();
