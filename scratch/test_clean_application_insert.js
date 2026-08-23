const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testCleanApplicationInsert() {
  const jobId = "d503aa77-58a8-40c3-a209-3fffbb18cf4c";
  const userId = "83c6486f-2d90-49c0-9b8e-0179d2623067";

  console.log("1. Finding job...");
  const { data: job } = await supabaseAdmin.from('jobs').select('id, uuid').eq('uuid', jobId).single();

  console.log("2. Finding user...");
  const { data: user } = await supabaseAdmin.from('jobseekers').select('id, uuid').eq('uuid', userId).single();

  console.log("3. Testing clean application insertion (no referral columns)...");
  const newApp = {
    job_pk: job.id,
    user_pk: user.id,
    status_id: 1,
    applied_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { data: created, error } = await supabaseAdmin
    .from('applications')
    .insert([newApp])
    .select()
    .single();

  if (error) {
    console.error("Insert failed with error:", error);
  } else {
    console.log("SUCCESSFULLY inserted clean application:", created);
  }
}

testCleanApplicationInsert().catch(console.error);
