const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testRecruiterUpdate() {
  console.log("Testing recruiter plan update in Supabase...");

  // 1. Get a sample recruiter
  const { data: rec, error: recErr } = await supabase.from('recruiters').select('*').limit(1).single();
  if (recErr || !rec) {
    console.error("No recruiter found:", recErr);
    return;
  }

  console.log("Found recruiter ID:", rec.id, "UUID:", rec.uuid, "Current plan_type:", rec.plan_type, "Current plan_expires_at:", rec.plan_expires_at);

  // 2. Test updating with updateData as done in verify/route.ts
  const now = new Date();
  const planExp = new Date();
  planExp.setDate(now.getDate() + 30);

  const updateData = {
    updated_at: now.toISOString(),
    job_post_limit: 1,
    job_post_validity: 30,
    app_access_days: 30,
    max_applies_limit: 300,
    is_verified: true,
    plan_expires_at: planExp.toISOString(),
    subscription_status: 'active',
    grace_period_end: null,
    plan_type: 'basic'
  };

  console.log("Attempting updateData on recruiters table:", updateData);

  const { data: updated, error: updateErr } = await supabase
    .from('recruiters')
    .update(updateData)
    .eq('id', rec.id)
    .select('*')
    .single();

  if (updateErr) {
    console.error("FAILED to update recruiters table! Error:", updateErr);
  } else {
    console.log("SUCCESSFULLY updated recruiter! New plan_expires_at:", updated.plan_expires_at);
  }
}

testRecruiterUpdate().catch(console.error);
