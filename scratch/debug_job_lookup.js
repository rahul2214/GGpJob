const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function debugJobLookup() {
  const targetId = 'd503aa77-58a8-40c3-a209-3fffbb18cf4c';
  console.log("Searching for job with target ID:", targetId);

  // 1. By uuid
  const { data: byUuid, error: errUuid } = await supabaseAdmin.from('jobs').select('id, uuid, job_id, title').eq('uuid', targetId).maybeSingle();
  console.log("Lookup by uuid:", byUuid, errUuid);

  // 2. By job_id
  const { data: byJobId, error: errJobId } = await supabaseAdmin.from('jobs').select('id, uuid, job_id, title').eq('job_id', targetId).maybeSingle();
  console.log("Lookup by job_id:", byJobId, errJobId);

  // 3. Let's list a few jobs from database to see their uuid and job_id format
  const { data: allJobs } = await supabaseAdmin.from('jobs').select('id, uuid, job_id, title').limit(5);
  console.log("Sample jobs in DB:", allJobs);
}

debugJobLookup().catch(console.error);
