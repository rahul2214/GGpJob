const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testJobCreationFull() {
  console.log("Testing full job creation + relational inserts...");

  const now = new Date();
  const jobExpiry = new Date();
  jobExpiry.setDate(now.getDate() + 30);

  const jobToCreate = {
    title: "Test Full Post Job",
    description: "SJyiwuefiuwefiuef u uy uy fugfuegfiuf ihvyv i ifugwiufwfiu fuw gg uggvig vugvigivuggi ugig u i ugugiugiugiiug iug  u ug  guygu vgjj  vubvsvbsdvuy h u dv dvuysvuyv.",
    company_name: "Veltria",
    job_type_pk: 1,
    workplace_type_pk: 1,
    job_role: "Software Engineer",
    experience_min: 2,
    experience_max: 5,
    posted_at: now.toISOString(),
    expires_at: jobExpiry.toISOString(),
    app_expires_at: jobExpiry.toISOString(),
    max_applies: 999999,
    plan_type_at_posting: "basic",
    vacancies: 11,
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
    return;
  }

  console.log("Job created successfully. ID:", newJob.id);

  // Relational inserts using try / catch
  try {
    await supabaseAdmin.from('job_skills').insert([{ job_pk: newJob.id, skill_pk: 1 }]);
    console.log("job_skills inserted successfully.");
  } catch (e) {
    console.error("job_skills error:", e);
  }

  try {
    await supabaseAdmin.from('job_benefits').insert([{ job_pk: newJob.id, benefit_pk: 1 }]);
    console.log("job_benefits inserted successfully.");
  } catch (e) {
    console.error("job_benefits error:", e);
  }

  try {
    await supabaseAdmin.from('job_locations').insert([{ job_id: newJob.id, country_id: 1, city_id: 1, is_primary: true }]);
    console.log("job_locations inserted successfully.");
  } catch (e) {
    console.error("job_locations error:", e);
  }

  // Cleanup
  await supabaseAdmin.from('job_skills').delete().eq('job_pk', newJob.id);
  await supabaseAdmin.from('job_benefits').delete().eq('job_pk', newJob.id);
  await supabaseAdmin.from('job_locations').delete().eq('job_id', newJob.id);
  await supabaseAdmin.from('jobs').delete().eq('id', newJob.id);
  console.log("All test rows cleaned up successfully.");
}

testJobCreationFull().catch(console.error);
