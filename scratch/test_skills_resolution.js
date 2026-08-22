const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testSkillsResolution() {
  console.log("Testing skills resolution from job_skills join table...");

  const { data: jobs } = await supabaseAdmin.from('jobs').select('id, title').limit(5);
  const jobPks = jobs.map(j => j.id);

  console.log("Job IDs:", jobPks);

  const { data: jobSkills, error: jsErr } = await supabaseAdmin
    .from('job_skills')
    .select('job_pk, skills:skill_pk(id, uuid, name)')
    .in('job_pk', jobPks);

  if (jsErr) {
    console.error("Error querying job_skills:", jsErr);
  } else {
    console.log("Raw job_skills join data:", jobSkills);
  }
}

testSkillsResolution().catch(console.error);
