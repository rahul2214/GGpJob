const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testCurrencyId() {
  console.log("Checking if id column exists or can be queried in currencies...");
  const { data, error } = await supabaseAdmin.from('currencies').select('id, code, name, symbol').limit(3);
  console.log("Query with id:", data, "Error:", error ? error.message : "None");
}

testCurrencyId().catch(console.error);
