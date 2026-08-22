const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testPreferredCurrencyEndpoint() {
  console.log("Testing updating jobseeker currency preference via preferred_currency_id...");
  
  const { data: seeker } = await supabaseAdmin.from('jobseekers').select('id, uuid').limit(1).single();

  const { data, error } = await supabaseAdmin
    .from('jobseekers')
    .update({
      preferred_currency_id: 1, // USD
      updated_at: new Date().toISOString()
    })
    .eq('id', seeker.id)
    .select(`
      *,
      currencies!preferred_currency_id(id, code, symbol, name)
    `);

  if (error) {
    console.error("Update failed:", error);
  } else {
    console.log("SUCCESS! Seeker preferred currency resolved:", {
      id: data[0].id,
      preferred_currency_id: data[0].preferred_currency_id,
      currency: data[0].currencies
    });
  }
}

testPreferredCurrencyEndpoint().catch(console.error);
