const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testJobUpdate160() {
  console.log("Testing PUT update on job 160 without salary_currency...");
  
  const { data, error } = await supabaseAdmin
    .from('jobs')
    .update({
      title: 'testing',
      currency_id: 4, // INR
      updated_at: new Date().toISOString()
    })
    .eq('id', 160)
    .select();

  if (error) {
    console.error("Update failed:", error);
  } else {
    console.log("Update SUCCESSFUL! Updated row:", data[0].id, data[0].title, "currency_id:", data[0].currency_id);
  }
}

testJobUpdate160().catch(console.error);
