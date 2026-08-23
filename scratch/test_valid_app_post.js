const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testValidAppPost() {
  const jobId = "d503aa77-58a8-40c3-a209-3fffbb18cf4c";
  const userId = "83c6486f-2d90-49c0-9b8e-0179d2623067";

  console.log("1. Finding job without employee_pk / is_referral...");
  const isNumericJob = typeof jobId === 'string' ? /^\d+$/.test(jobId) : typeof jobId === 'number';
  let jobQuery = supabaseAdmin.from('jobs').select('id, uuid, app_expires_at, max_applies');
  if (isNumericJob) {
    jobQuery = jobQuery.or(`id.eq.${jobId},uuid.eq.${jobId},job_id.eq.${jobId}`);
  } else {
    jobQuery = jobQuery.or(`uuid.eq.${jobId},job_id.eq.${jobId}`);
  }
  const { data: job, error: jobErr } = await jobQuery.maybeSingle();
  console.log("Job result:", job, jobErr);

  console.log("2. Finding user without plan_type...");
  const isNumericUser = typeof userId === 'string' ? /^\d+$/.test(userId) : typeof userId === 'number';
  let userQuery = supabaseAdmin.from('jobseekers').select('id, uuid');
  if (isNumericUser) {
    userQuery = userQuery.or(`id.eq.${userId},uuid.eq.${userId}`);
  } else {
    userQuery = userQuery.eq('uuid', userId);
  }
  const { data: userProfile, error: userErr } = await userQuery.maybeSingle();
  console.log("User result:", userProfile, userErr);
}

testValidAppPost().catch(console.error);
