const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testPaymentVerify() {
  const userId = "3c27dc06-b359-4d15-b38d-2affd32ef4b3";
  const planId = "basic";
  console.log("Simulating payment verify for recruiter UUID:", userId);

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
  let targetTable = 'jobseekers';
  let profileId = null;

  const [
    { data: jobseeker },
    { data: recruiter },
    { data: employee }
  ] = await Promise.all([
    supabaseAdmin.from('jobseekers').select('id, uuid').eq(isUUID ? 'uuid' : 'id', isUUID ? userId : parseInt(userId, 10)).maybeSingle(),
    supabaseAdmin.from('recruiters').select('id, uuid').eq(isUUID ? 'uuid' : 'id', isUUID ? userId : parseInt(userId, 10)).maybeSingle(),
    supabaseAdmin.from('employees').select('id, uuid').eq(isUUID ? 'uuid' : 'id', isUUID ? userId : parseInt(userId, 10)).maybeSingle()
  ]);

  if (jobseeker) {
    profileId = jobseeker.id;
    targetTable = 'jobseekers';
  } else if (recruiter) {
    profileId = recruiter.id;
    targetTable = 'recruiters';
  } else if (employee) {
    profileId = employee.id;
    targetTable = 'employees';
  }

  console.log("Found profileId:", profileId, "targetTable:", targetTable);

  if (!profileId) {
    throw new Error(`Profile not found for user ${userId}`);
  }

  const now = new Date();
  const planExp = new Date();
  planExp.setDate(now.getDate() + 30);

  const updateData = {
    updated_at: now.toISOString(),
    is_paid: true,
    plan_type: planId,
    job_post_limit: 1,
    job_post_validity: 30,
    app_access_days: 30,
    max_applies_limit: 300,
    is_verified: true,
    plan_expires_at: planExp.toISOString()
  };

  const { data: updated, error: updateError } = await supabaseAdmin
    .from(targetTable)
    .update(updateData)
    .eq('id', profileId)
    .select('id, plan_type, plan_expires_at, is_paid')
    .single();

  if (updateError) {
    console.error("Update error:", updateError);
  } else {
    console.log("VERIFICATION & UPDATE SUCCESSFUL! Recruiter updated:", updated);
  }
}

testPaymentVerify().catch(console.error);
