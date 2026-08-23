const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testCandidateProfileEndpoint() {
  console.log("Testing candidate profile fetch for application 77...");
  const { data: app, error: appErr } = await supabaseAdmin.from('applications').select('id, user_pk, is_unlocked').eq('id', 77).maybeSingle();
  if (appErr || !app) {
    console.error("App 77 not found:", appErr);
    return;
  }
  console.log("App 77:", app);

  const { data: seeker, error: seekerErr } = await supabaseAdmin.from('jobseekers').select('id, name, email, phone, resume_url').eq('id', app.user_pk).single();
  console.log("Candidate unmasked details:", seeker);
}

testCandidateProfileEndpoint().catch(console.error);
