const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectCurrenciesSchema() {
  console.log("Inspecting currencies table columns...");
  const { data, error } = await supabaseAdmin.from('currencies').select('*').limit(3);
  if (data && data.length > 0) {
    console.log("Existing columns:", Object.keys(data[0]));
    console.log("Sample rows:", data);
  } else {
    console.log("Error or empty:", error);
  }
}

inspectCurrenciesSchema().catch(console.error);
