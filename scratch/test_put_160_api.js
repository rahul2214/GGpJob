const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testPut160Api() {
  console.log("Testing job 160 resolution with currencies join...");
  
  const { data: job, error } = await supabaseAdmin
    .from('jobs')
    .select(`
      *,
      job_types!job_type_pk(uuid, name),
      workplace_types!workplace_type_pk(uuid, name),
      company_sizes!company_size_id(uuid, name),
      currencies!currency_id(id, code, symbol, name)
    `)
    .eq('id', 160)
    .single();

  if (error) {
    console.error("Select failed:", error);
  } else {
    console.log("Selected Job 160 with currencies:", {
      id: job.id,
      title: job.title,
      currency_id: job.currency_id,
      resolved_currency: job.currencies
    });
  }
}

testPut160Api().catch(console.error);
