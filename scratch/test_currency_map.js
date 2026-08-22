const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testCurrencyMap() {
  const { data: currencies } = await supabaseAdmin.from('currencies').select('id, code');
  console.log("Currencies ID map count:", currencies ? currencies.length : 0);
  console.log("Sample currencies:", currencies ? currencies.slice(0, 5) : []);
}

testCurrencyMap().catch(console.error);
