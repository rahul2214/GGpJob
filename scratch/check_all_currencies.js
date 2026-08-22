const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkAllCurrencies() {
  console.log("Checking all currencies in DB...");
  const { data: currencies, error } = await supabaseAdmin
    .from('currencies')
    .select('*');
  console.log("Currencies count:", currencies ? currencies.length : 0, "Data:", currencies);
}

checkAllCurrencies().catch(console.error);
