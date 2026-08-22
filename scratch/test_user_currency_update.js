const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testUserCurrencyUpdate() {
  console.log("1. Finding jobseeker to test...");
  const { data: seeker } = await supabaseAdmin.from('jobseekers').select('id, uuid').limit(1).single();

  console.log("2. Testing update of preferred_currency_id to 2 (EUR)...");
  const { data, error } = await supabaseAdmin
    .from('jobseekers')
    .update({
      preferred_currency_id: 2,
      updated_at: new Date().toISOString()
    })
    .eq('id', seeker.id)
    .select(`
      id,
      preferred_currency_id,
      currencies:preferred_currency_id(id, code, symbol, name)
    `);

  if (error) {
    console.error("DB update error:", error);
  } else {
    console.log("DB update SUCCESS:", data[0]);
  }
}

testUserCurrencyUpdate().catch(console.error);
