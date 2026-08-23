const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testCreateApplication() {
  const jobId = "d503aa77-58a8-40c3-a209-3fffbb18cf4c";
  const userId = "83c6486f-2d90-49c0-9b8e-0179d2623067";

  console.log("1. Finding job...");
  const { data: job, error: jErr } = await supabaseAdmin.from('jobs').select('id, uuid').eq('uuid', jobId).maybeSingle();
  console.log("Job PK:", job ? job.id : null, jErr);

  console.log("2. Finding user...");
  const { data: user, error: uErr } = await supabaseAdmin.from('jobseekers').select('id, uuid').eq('uuid', userId).maybeSingle();
  console.log("User PK:", user ? user.id : null, uErr);

  if (job && user) {
    console.log("3. Testing insertion into applications table...");
    const newApp = {
      job_pk: job.id,
      user_pk: user.id,
      status_id: 1,
      applied_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: created, error } = await supabaseAdmin
      .from('applications')
      .insert(newApp)
      .select();

    if (error) {
      console.error("Insert error:", error);
    } else {
      console.log("Successfully created application:", created[0]);
    }
  }
}

testCreateApplication().catch(console.error);
