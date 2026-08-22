const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testJob160() {
  const { data: job, error } = await supabaseAdmin
    .from('jobs')
    .select('id, title, visa_sponsorship')
    .eq('id', 160)
    .single();

  console.log("Job 160 DB Data:", job, "Error:", error);
}

testJob160().catch(console.error);
