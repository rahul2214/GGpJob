const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testUpdateJobseekerCurrency() {
  console.log("Testing update on jobseeker with preferred_currency_id...");
  
  // Find a jobseeker ID
  const { data: seeker } = await supabaseAdmin.from('jobseekers').select('id, uuid').limit(1).single();
  console.log("Found jobseeker:", seeker);

  const { data, error } = await supabaseAdmin
    .from('jobseekers')
    .update({
      preferred_currency_id: 4, // INR
      updated_at: new Date().toISOString()
    })
    .eq('id', seeker.id)
    .select();

  if (error) {
    console.error("Update failed:", error);
  } else {
    console.log("Update SUCCESSFUL! Updated jobseeker preferred_currency_id:", data[0].preferred_currency_id);
  }
}

testUpdateJobseekerCurrency().catch(console.error);
