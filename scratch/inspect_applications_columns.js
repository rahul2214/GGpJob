const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectApplicationsColumns() {
  console.log("Fetching sample row from applications to see exact columns...");
  const { data, error } = await supabaseAdmin.from('applications').select('*').limit(1);
  if (error) {
    console.error("Error:", error);
    return;
  }
  if (data && data.length > 0) {
    console.log("Exact applications table columns:", Object.keys(data[0]));
  }
}

inspectApplicationsColumns().catch(console.error);
