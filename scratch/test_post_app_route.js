const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testPostAppRoute() {
  const jobId = "d503aa77-58a8-40c3-a209-3fffbb18cf4c";
  const userId = "83c6486f-2d90-49c0-9b8e-0179d2623067";

  console.log("Simulating fixed POST /api/applications for jobId:", jobId, "userId:", userId);

  // 1. Job query
  const isNumericJob = typeof jobId === 'string' ? /^\d+$/.test(jobId) : typeof jobId === 'number';
  let jobQuery = supabaseAdmin.from('jobs').select('id, uuid, app_expires_at, max_applies');
  if (isNumericJob) {
    jobQuery = jobQuery.or(`id.eq.${jobId},uuid.eq.${jobId},job_id.eq.${jobId}`);
  } else {
    jobQuery = jobQuery.or(`uuid.eq.${jobId},job_id.eq.${jobId}`);
  }

  const { data: job, error: jobError } = await jobQuery.maybeSingle();
  if (jobError || !job) {
    console.error("Job lookup failed:", jobError);
    return;
  }
  console.log("Job resolved successfully:", job);

  // 2. User query
  const isNumericUser = typeof userId === 'string' ? /^\d+$/.test(userId) : typeof userId === 'number';
  let userQuery = supabaseAdmin.from('jobseekers').select('id, uuid');
  if (isNumericUser) {
    userQuery = userQuery.or(`id.eq.${userId},uuid.eq.${userId}`);
  } else {
    userQuery = userQuery.eq('uuid', userId);
  }

  const { data: userProfile, error: userError } = await userQuery.maybeSingle();
  if (userError || !userProfile) {
    console.error("User lookup failed:", userError);
    return;
  }
  console.log("User resolved successfully:", userProfile);

  // 3. Existing application check
  const { data: existing, error: checkError } = await supabaseAdmin
    .from('applications')
    .select('id')
    .eq('job_pk', job.id)
    .eq('user_pk', userProfile.id)
    .maybeSingle();

  if (existing) {
    console.log("Existing application found (already applied):", existing);
  } else {
    console.log("No existing application found, ready to insert!");
  }
}

testPostAppRoute().catch(console.error);
