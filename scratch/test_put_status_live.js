const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testPutStatusLive() {
  const appId = 77;
  const statusId = 3;
  const requesterRole = "Recruiter";

  console.log(`Simulating PUT /api/applications/${appId}/status with statusId: ${statusId}, requesterRole: ${requesterRole}`);

  const updatePayload = {
    status_id: statusId,
    updated_at: new Date().toISOString()
  };

  const { data: app, error: updateError } = await supabaseAdmin
    .from('applications')
    .update(updatePayload)
    .eq('id', appId)
    .select('*, jobs(title, recruiter_pk), jobseekers(id, name, email)')
    .single();

  if (updateError) {
    console.error("Status update error:", updateError);
    return;
  }

  console.log("Status update SUCCESSFUL! Updated Application:", app);
}

testPutStatusLive().catch(console.error);
