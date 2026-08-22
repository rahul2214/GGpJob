const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testCleanRecruiterUpdate() {
  console.log("Testing clean recruiter plan update...");

  const { data: rec } = await supabase.from('recruiters').select('id, plan_type, plan_expires_at').limit(1).single();
  console.log("Before update:", rec);

  const now = new Date();
  const planExp = new Date();
  planExp.setDate(now.getDate() + 30);

  const updateData = {
    updated_at: now.toISOString(),
    is_paid: true,
    plan_type: 'basic',
    job_post_limit: 1,
    job_post_validity: 30,
    app_access_days: 30,
    max_applies_limit: 300,
    is_verified: true,
    plan_expires_at: planExp.toISOString()
  };

  const { data: updated, error } = await supabase
    .from('recruiters')
    .update(updateData)
    .eq('id', rec.id)
    .select('id, plan_type, plan_expires_at, is_paid')
    .single();

  if (error) {
    console.error("Clean update error:", error);
  } else {
    console.log("SUCCESSFULLY UPDATED RECRUITER PLAN!", updated);
  }
}

testCleanRecruiterUpdate().catch(console.error);
