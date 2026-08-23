const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testAppStatusUpdate() {
  const appId = 77;
  console.log("Testing status update on application", appId);

  const updatePayload = {
    status_id: 3,
    updated_at: new Date().toISOString()
  };

  const { data: app, error: updateError } = await supabaseAdmin
    .from('applications')
    .update(updatePayload)
    .eq('id', appId)
    .select('*, jobs(id, title, recruiter_pk), jobseekers(id, name, email)')
    .single();

  if (updateError) {
    console.error("Update error:", updateError);
  } else {
    console.log("SUCCESSFULLY updated application status:", app);
  }
}

testAppStatusUpdate().catch(console.error);
