const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testSalaryJobCreation() {
  console.log("Testing salary min/max saving and retrieval...");

  const userId = "3c27dc06-b359-4d15-b38d-2affd32ef4b3";
  const { data: user } = await supabaseAdmin.from('recruiters').select('*').eq('uuid', userId).single();

  const data = {
    address: "old alwal",
    companyName: "Veltria",
    description: "Testing saving min and max salary for job posting.",
    jobId: "salary_test_1",
    jobTitle: "Salary Test Engineer",
    job_role: "Software Engineer",
    maxExperience: 5,
    minExperience: 2,
    salaryCurrency: "INR",
    salaryMax: 90000,
    salaryMin: 50000,
    title: "Salary Test Engineer",
    vacancies: 2
  };

  const now = new Date();
  const jobExpiry = new Date(Date.now() + 30 * 86400000);

  const jobToCreate = {
    title: data.title,
    job_id: data.jobId || null,
    description: data.description,
    company_name: data.companyName,
    job_type_pk: 1,
    workplace_type_pk: 1,
    job_role: data.job_role,
    salary_min_usd_cents: typeof data.salaryMin === 'number' ? data.salaryMin : null,
    salary_max_usd_cents: typeof data.salaryMax === 'number' ? data.salaryMax : null,
    salary_currency: data.salaryCurrency || 'INR',
    experience_min: data.minExperience,
    experience_max: data.maxExperience,
    recruiter_pk: user.id,
    posted_at: now.toISOString(),
    expires_at: jobExpiry.toISOString(),
    app_expires_at: jobExpiry.toISOString(),
    max_applies: 999999,
    vacancies: data.vacancies,
    status: 'active'
  };

  const { data: newJob, error: insertError } = await supabaseAdmin
    .from('jobs')
    .insert([jobToCreate])
    .select()
    .single();

  if (insertError) {
    console.error("Insert error:", insertError);
  } else {
    console.log("SUCCESSFULLY SAVED JOB WITH SALARY DATA!");
    console.log({
      id: newJob.id,
      title: newJob.title,
      salary_currency: newJob.salary_currency,
      salary_min_usd_cents: newJob.salary_min_usd_cents,
      salary_max_usd_cents: newJob.salary_max_usd_cents
    });

    // Cleanup
    await supabaseAdmin.from('jobs').delete().eq('id', newJob.id);
    console.log("Cleaned up test job.");
  }
}

testSalaryJobCreation().catch(console.error);
