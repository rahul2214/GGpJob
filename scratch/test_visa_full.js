const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testVisaFull() {
  console.log("Testing full POST and PUT flow for visa_sponsorship...");

  const userId = "3c27dc06-b359-4d15-b38d-2affd32ef4b3";
  const { data: user } = await supabaseAdmin.from('recruiters').select('*').eq('uuid', userId).single();

  const data = {
    address: "old alwal",
    companyName: "Veltria",
    description: "Testing visa_sponsorship full saving flow.",
    jobId: "visa_test_1",
    jobTitle: "Visa Test Engineer",
    job_role: "Software Engineer",
    maxExperience: 5,
    minExperience: 2,
    salaryCurrency: "INR",
    salaryMax: 90000,
    salaryMin: 50000,
    title: "Visa Test Engineer",
    vacancies: 2,
    visaSponsorship: true
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
    salary_min_usd_cents: data.salaryMin,
    salary_max_usd_cents: data.salaryMax,
    salary_currency: data.salaryCurrency,
    visa_sponsorship: !!data.visaSponsorship,
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

  // 1. Test POST
  const { data: newJob, error: postErr } = await supabaseAdmin.from('jobs').insert([jobToCreate]).select().single();
  if (postErr) {
    console.error("POST error:", postErr);
    return;
  }
  console.log("POST created job ID:", newJob.id, "visa_sponsorship:", newJob.visa_sponsorship);

  // 2. Test PUT update to false
  const updateBody = { visaSponsorship: false };
  const dataToUpdate = {
    visa_sponsorship: updateBody.visaSponsorship,
    updated_at: new Date().toISOString()
  };

  const { data: updatedJob, error: putErr } = await supabaseAdmin
    .from('jobs')
    .update(dataToUpdate)
    .eq('id', newJob.id)
    .select()
    .single();

  if (putErr) {
    console.error("PUT error:", putErr);
  } else {
    console.log("PUT updated job ID:", updatedJob.id, "visa_sponsorship:", updatedJob.visa_sponsorship);
  }

  // Cleanup
  await supabaseAdmin.from('jobs').delete().eq('id', newJob.id);
  console.log("Cleaned up test job.");
}

testVisaFull().catch(console.error);
