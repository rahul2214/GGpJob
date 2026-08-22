const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testJobInsert() {
  console.log("Testing job insert without benefit_ids/location_pks/skill_pks...");

  const now = new Date();
  const jobExpiry = new Date();
  jobExpiry.setDate(now.getDate() + 30);
  const appExpiry = new Date();
  appExpiry.setDate(now.getDate() + 30);

  const jobToCreate = {
    title: "Test Software Engineer",
    description: "This is a test job description with sufficient length to pass validation requirements.",
    company_name: "Dhruv Compusoft",
    job_type_pk: 1,
    workplace_type_pk: 1,
    job_role: "Software Engineer",
    experience_min: 1,
    experience_max: 5,
    posted_at: now.toISOString(),
    expires_at: jobExpiry.toISOString(),
    app_expires_at: appExpiry.toISOString(),
    max_applies: 100,
    plan_type_at_posting: "basic",
    vacancies: 1,
    sections: [],
    status: 'active'
  };

  const { data: newJob, error: insertError } = await supabaseAdmin
    .from('jobs')
    .insert([jobToCreate])
    .select()
    .single();

  if (insertError) {
    console.error("Job insert failed:", insertError);
  } else {
    console.log("JOB INSERT SUCCESSFUL! Created job ID:", newJob.id, "UUID:", newJob.uuid);
    // Cleanup test job
    await supabaseAdmin.from('jobs').delete().eq('id', newJob.id);
    console.log("Cleaned up test job.");
  }
}

testJobInsert().catch(console.error);
